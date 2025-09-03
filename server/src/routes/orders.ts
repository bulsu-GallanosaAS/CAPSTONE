import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/debug-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [ordersStatus] = await connection.execute("SHOW CREATE TABLE orders") as any;
      const [orderItemsStatus] = await connection.execute("SHOW CREATE TABLE order_items") as any;
      
      const [maxOrderId] = await connection.execute('SELECT MAX(id) as max_id FROM orders') as any;
      const [maxOrderItemId] = await connection.execute('SELECT MAX(id) as max_id FROM order_items') as any;
      const [maxTransactionId] = await connection.execute('SELECT MAX(id) as max_id FROM transactions') as any;
      const [maxReceiptId] = await connection.execute('SELECT MAX(id) as max_id FROM receipts') as any;
      
      const [ordersWithZero] = await connection.execute('SELECT COUNT(*) as count FROM orders WHERE id = 0') as any;
      const [orderItemsWithZero] = await connection.execute('SELECT COUNT(*) as count FROM order_items WHERE order_id = 0') as any;
      
      const [latestOrder] = await connection.execute('SELECT id, order_code, created_at FROM orders ORDER BY id DESC LIMIT 5') as any;
      
      const [tableStatus] = await connection.execute("SELECT table_name, auto_increment FROM information_schema.tables WHERE table_schema = 'siszum_pos' AND table_name IN ('orders', 'order_items', 'transactions', 'receipts')") as any;
      
      const autoIncrements: any = {};
      tableStatus.forEach((table: any) => {
        autoIncrements[table.table_name] = table.auto_increment;
      });
      
      res.json({
        success: true,
        autoIncrementStatus: autoIncrements,
        maxIds: {
          orders: maxOrderId[0]?.max_id || 0,
          order_items: maxOrderItemId[0]?.max_id || 0,
          transactions: maxTransactionId[0]?.max_id || 0,
          receipts: maxReceiptId[0]?.max_id || 0
        },
        corruptedData: {
          ordersWithZero: ordersWithZero[0]?.count || 0,
          orderItemsWithZero: orderItemsWithZero[0]?.count || 0
        },
        latestOrders: latestOrder || [],
        tableStructures: {
          orders: ordersStatus[0]['Create Table'],
          order_items: orderItemsStatus[0]['Create Table']
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to debug database',
      message: (error as Error).message
    });
  }
});

router.post('/fix-database', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      console.log('Starting comprehensive database fix...');
      
      console.log('Cleaning up corrupted data...');
      await connection.execute('DELETE FROM order_items WHERE order_id = 0');
      await connection.execute('DELETE FROM transactions WHERE order_id = 0');
      await connection.execute('DELETE FROM receipts WHERE order_id = 0');
      await connection.execute('DELETE FROM orders WHERE id = 0');
      
      const [orderRows] = await connection.execute('SELECT MAX(id) as max_id FROM orders') as any;
      const [itemRows] = await connection.execute('SELECT MAX(id) as max_id FROM order_items') as any;
      const [transactionRows] = await connection.execute('SELECT MAX(id) as max_id FROM transactions') as any;
      const [receiptRows] = await connection.execute('SELECT MAX(id) as max_id FROM receipts') as any;
      
      const nextOrderId = (orderRows[0]?.max_id || 0) + 1;
      const nextItemId = (itemRows[0]?.max_id || 0) + 1;
      const nextTransactionId = (transactionRows[0]?.max_id || 0) + 1;
      const nextReceiptId = (receiptRows[0]?.max_id || 0) + 1;
      
      console.log(`Current max IDs: orders=${orderRows[0]?.max_id}, order_items=${itemRows[0]?.max_id}, transactions=${transactionRows[0]?.max_id}, receipts=${receiptRows[0]?.max_id}`);
      
      console.log('Recreating auto-increment columns...');
      
      // For orders table
      await connection.execute('ALTER TABLE orders MODIFY COLUMN id INT NOT NULL');
      await connection.execute('ALTER TABLE orders DROP PRIMARY KEY');
      await connection.execute('ALTER TABLE orders MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      await connection.execute(`ALTER TABLE orders AUTO_INCREMENT = ${nextOrderId}`);
      
      // For order_items table  
      await connection.execute('ALTER TABLE order_items MODIFY COLUMN id INT NOT NULL');
      await connection.execute('ALTER TABLE order_items DROP PRIMARY KEY');
      await connection.execute('ALTER TABLE order_items MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      await connection.execute(`ALTER TABLE order_items AUTO_INCREMENT = ${nextItemId}`);
      
      await connection.execute('ALTER TABLE transactions MODIFY COLUMN id INT NOT NULL');
      await connection.execute('ALTER TABLE transactions DROP PRIMARY KEY');
      await connection.execute('ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      await connection.execute(`ALTER TABLE transactions AUTO_INCREMENT = ${nextTransactionId}`);
      
      await connection.execute('ALTER TABLE receipts MODIFY COLUMN id INT NOT NULL');
      await connection.execute('ALTER TABLE receipts DROP PRIMARY KEY');
      await connection.execute('ALTER TABLE receipts MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      await connection.execute(`ALTER TABLE receipts AUTO_INCREMENT = ${nextReceiptId}`);
      
      console.log(`Auto-increment values recreated: orders=${nextOrderId}, order_items=${nextItemId}, transactions=${nextTransactionId}, receipts=${nextReceiptId}`);
      
      await connection.commit();
      
      res.json({ 
        success: true, 
        message: 'Database auto-increment values fixed and recreated successfully',
        autoIncrements: {
          orders: nextOrderId,
          order_items: nextItemId,
          transactions: nextTransactionId,
          receipts: nextReceiptId
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fixing database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix database',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Orders API called with params:', req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    
    console.log('Parsed params:', { page, limit, search, status });
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams: any[] = [];
    
    if (search) {
      whereConditions.push(`(o.order_code LIKE ? OR o.customer_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status !== 'all') {
      whereConditions.push(`o.status = ?`);
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_code,
        o.customer_id,
        o.customer_name,
        o.order_type,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.total_amount,
        o.status,
        o.payment_status,
        o.order_date,
        o.order_time,
        o.completed_at,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count,
        rt.table_number as table_no,
        rt.table_code,
        SUM(oi.quantity) as quantity
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    const [ordersResult] = await pool.execute<RowDataPacket[]>(ordersQuery, queryParams);
    
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: ordersResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get orders statistics
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('Stats API called');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() AND status = 'completed' THEN total_amount ELSE 0 END), 0) as today_revenue
      FROM orders
    `;
    
    const [statsResult] = await pool.execute<RowDataPacket[]>(statsQuery);
    
    res.json({
      success: true,
      message: 'Orders statistics retrieved successfully',
      data: statsResult[0]
    });

  } catch (error) {
    console.error('Error fetching orders statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get order items for a specific order
router.get('/:id/items', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        mi.name as item_name,
        mi.description
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `;
    
    const [itemsResult] = await pool.execute<RowDataPacket[]>(itemsQuery, [orderId]);
    
    res.json({
      success: true,
      message: 'Order items retrieved successfully',
      data: itemsResult
    });

  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order items',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      customer_name,
      customer_id,
      table_id,
      order_type,
      items,
      subtotal,
      service_charge,
      additional_fees,
      discount,
      total_amount,
      payment_method,
      status = 'pending'
    } = req.body;

    console.log('Creating order with data:', {
      customer_name,
      customer_id,
      table_id,
      order_type,
      items: items?.length || 0,
      subtotal,
      service_charge,
      additional_fees,
      discount,
      total_amount,
      payment_method,
      status
    });

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_name and items are required'
      });
    }

    for (const item of items) {
      if (!item.item_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item data: item_id, quantity, and unit_price are required for each item'
        });
      }
    }

    const orderCodeQuery = 'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()';
    const [codeResult] = await pool.execute<RowDataPacket[]>(orderCodeQuery);
    const dailyCount = codeResult[0].count;
    const orderCode = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(dailyCount + 1).padStart(3, '0')}`;

    await connection.beginTransaction();

    try {
      const orderQuery = `
        INSERT INTO orders (
          id, order_code, customer_id, customer_name, table_id, order_type,
          subtotal, discount_amount, tax_amount, total_amount, status,
          payment_status, order_date, order_time, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?)
      `;

      const [maxOrderResult] = await connection.execute('SELECT MAX(id) as max_id FROM orders') as any;
      const nextOrderId = (maxOrderResult[0]?.max_id || 0) + 1;

      const tax_amount = service_charge || 0;
      const discount_amount = discount || 0;
      const payment_status = status === 'completed' ? 'paid' : 'pending';

      console.log('Inserting order with manual ID:', {
        id: nextOrderId,
        orderCode,
        customer_id: customer_id || null,
        customer_name,
        table_id: table_id || null,
        order_type: order_type || 'dine_in',
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        status,
        payment_status
      });

      const [orderResult] = await connection.execute(orderQuery, [
        nextOrderId,
        orderCode,
        customer_id || null,
        customer_name,
        table_id || null,
        order_type || 'dine_in',
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        status,
        payment_status,
        1 
      ]);

      const orderId = nextOrderId; 
      console.log('Order inserted with manual ID:', orderId);

      if (!orderId || orderId === 0) {
        throw new Error('Failed to get valid order ID after insertion');
      }

      for (const item of items) {
        const [maxItemResult] = await connection.execute('SELECT MAX(id) as max_id FROM order_items') as any;
        const nextItemId = (maxItemResult[0]?.max_id || 0) + 1;
        
        const itemQuery = `
          INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(itemQuery, [
          nextItemId,
          orderId,
          item.item_id,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);

        const menuItemQuery = `
          SELECT is_unlimited, quantity_in_stock 
          FROM menu_items 
          WHERE id = ?
        `;
        
        const [menuItemResult] = await connection.execute<RowDataPacket[]>(menuItemQuery, [item.item_id]);
        
        if (menuItemResult.length > 0) {
          const menuItem = menuItemResult[0];
          
          if (!menuItem.is_unlimited) {
            const updateInventoryQuery = `
              UPDATE menu_items 
              SET quantity_in_stock = quantity_in_stock - ? 
              WHERE id = ? AND quantity_in_stock >= ?
            `;
            
            await connection.execute(updateInventoryQuery, [
              item.quantity,
              item.item_id,
              item.quantity
            ]);
          }
        }
      }

      if (status === 'completed' && payment_method) {
        const [maxTransactionResult] = await connection.execute('SELECT MAX(id) as max_id FROM transactions') as any;
        const nextTransactionId = (maxTransactionResult[0]?.max_id || 0) + 1;
        
        const transactionCode = `TXN${orderCode.slice(3)}`;
        const transactionQuery = `
          INSERT INTO transactions (
            id, transaction_code, order_id, customer_id, payment_method,
            amount, status, reference_number, payment_date, payment_time, processed_by
          ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, CURDATE(), CURTIME(), ?)
        `;

        await connection.execute(transactionQuery, [
          nextTransactionId,
          transactionCode,
          orderId,
          customer_id || null,
          payment_method,
          total_amount,
          `${payment_method.toUpperCase()}${String(Date.now()).slice(-6)}`,
          1 
        ]);

        const [maxReceiptResult] = await connection.execute('SELECT MAX(id) as max_id FROM receipts') as any;
        const nextReceiptId = (maxReceiptResult[0]?.max_id || 0) + 1;
        
        const receiptNumber = `RCP${orderCode.slice(3)}`;
        const receiptQuery = `
          INSERT INTO receipts (
            id, receipt_number, order_id, transaction_id, customer_name,
            subtotal, discount_amount, tax_amount, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(receiptQuery, [
          nextReceiptId,
          receiptNumber,
          orderId,
          nextTransactionId,
          customer_name,
          subtotal,
          discount_amount,
          tax_amount,
          total_amount
        ]);
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: orderId,
          order_code: orderCode,
          status: status
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const query = `
      SELECT 
        o.id,
        o.order_code,
        o.customer_id,
        o.customer_name,
        o.order_type,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.total_amount,
        o.status,
        o.payment_status,
        o.order_date,
        o.order_time,
        o.completed_at,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [customerId]);

    res.json({
      success: true,
      message: 'Customer orders retrieved successfully',
      data: rows
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.put('/:id', async (req, res) => {
  console.log('🚨 DEBUG: PUT /:id route called with orderId:', req.params.id);
  console.log('🚨 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const orderId = parseInt(req.params.id);
    const {
      customer_name,
      customer_id,
      table_id,
      order_type,
      items,
      subtotal,
      service_charge,
      additional_fees,
      discount,
      total_amount,
      status,
      payment_status,
      payment_method,
      notes
    } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    if (items && Array.isArray(items)) {
      const orderUpdateQuery = `
        UPDATE orders 
        SET customer_name = ?, customer_id = ?, table_id = ?, order_type = ?,
            subtotal = ?, discount_amount = ?, tax_amount = ?, total_amount = ?,
            status = ?, payment_status = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await connection.execute(orderUpdateQuery, [
        customer_name || null,
        customer_id || null,
        table_id || null,
        order_type || 'dine_in',
        subtotal || 0,
        discount || 0,
        service_charge || 0,
        total_amount || 0,
        status || 'pending',
        payment_status || 'pending',
        notes || null,
        orderId
      ]);

      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);

      if (items.length > 0) {
        const [maxItemResult] = await connection.execute('SELECT MAX(id) as max_id FROM order_items') as any;
        let nextItemId = (maxItemResult[0]?.max_id || 0) + 1;
        
        for (const item of items) {
          console.log('🐛 DEBUG: Inserting order item with manual ID assignment');
          const itemInsertQuery = `
            INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          console.log('🐛 DEBUG: Query:', itemInsertQuery);
          console.log('🐛 DEBUG: Values:', [nextItemId, orderId, item.item_id, item.quantity, item.unit_price, item.total_price]);

          await connection.execute(itemInsertQuery, [
            nextItemId,
            orderId,
            item.item_id,
            item.quantity,
            item.unit_price,
            item.total_price
          ]);
          
          nextItemId++;
        }
      }
    } else {
      let updateFields = [];
      let queryParams = [];

      if (status) {
        updateFields.push('status = ?');
        queryParams.push(status);
      }

      if (payment_status) {
        updateFields.push('payment_status = ?');
        queryParams.push(payment_status);
      }

      if (notes !== undefined) {
        updateFields.push('notes = ?');
        queryParams.push(notes);
      }

      if (status === 'completed') {
        updateFields.push('completed_at = NOW()');
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const updateQuery = `
        UPDATE orders 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ?
      `;

      queryParams.push(orderId);
      await connection.execute(updateQuery, queryParams);
    }

    if (payment_status === 'paid' && payment_method) {
      const [orderResult] = await connection.execute<RowDataPacket[]>(
        'SELECT order_code, customer_id, total_amount FROM orders WHERE id = ?',
        [orderId]
      );

      if (orderResult.length > 0) {
        const order = orderResult[0];
        const transactionCode = `TXN${order.order_code.slice(3)}`;
        
        const [maxTransactionResult] = await connection.execute('SELECT MAX(id) as max_id FROM transactions') as any;
        const nextTransactionId = (maxTransactionResult[0]?.max_id || 0) + 1;
        
        const transactionQuery = `
          INSERT INTO transactions (
            id, transaction_code, order_id, customer_id, payment_method,
            amount, status, reference_number, payment_date, payment_time, processed_by
          ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, CURDATE(), CURTIME(), ?)
        `;

        await connection.execute(transactionQuery, [
          nextTransactionId,
          transactionCode,
          orderId,
          order.customer_id,
          payment_method,
          order.total_amount,
          `${payment_method.toUpperCase()}${String(Date.now()).slice(-6)}`,
          1 
        ]);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    connection.release();
  }
});

export default router;
