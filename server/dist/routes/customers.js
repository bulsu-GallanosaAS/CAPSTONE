"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Get all customers with pagination
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];
        // Search functionality
        if (search) {
            whereConditions.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR customer_code LIKE ? OR phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }
        // Status filter
        if (status !== 'all') {
            whereConditions.push('is_active = ?');
            queryParams.push(status === 'active' ? 1 : 0);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
        const [countResult] = await database_1.pool.execute(countQuery, queryParams);
        const total = countResult[0].total;
        // Get customers with pagination
        const query = `
      SELECT id, customer_code, first_name, last_name, email, phone, 
             date_of_birth, address, city, country, is_active, 
             created_at, updated_at
      FROM customers 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
        queryParams.push(limit, offset);
        const [customers] = await database_1.pool.execute(query, queryParams);
        const response = {
            success: true,
            message: 'Customers retrieved successfully',
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
            error: error.message
        });
    }
});
// Get customer by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT id, customer_code, first_name, last_name, email, phone, 
             date_of_birth, address, city, country, is_active, 
             created_at, updated_at
      FROM customers 
      WHERE id = ?
    `;
        const [customers] = await database_1.pool.execute(query, [id]);
        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        const response = {
            success: true,
            message: 'Customer retrieved successfully',
            data: customers[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer',
            error: error.message
        });
    }
});
// Create new customer
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { first_name, last_name, email, phone, date_of_birth, address, city, country } = req.body;
        // Validate required fields
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'First name and last name are required'
            });
        }
        // Generate customer code
        const codeQuery = 'SELECT COUNT(*) as count FROM customers';
        const [codeResult] = await database_1.pool.execute(codeQuery);
        const customerCount = codeResult[0].count;
        const customer_code = `CUST${String(customerCount + 1).padStart(4, '0')}`;
        // Check if email already exists (if provided)
        if (email) {
            const emailQuery = 'SELECT id FROM customers WHERE email = ?';
            const [emailResult] = await database_1.pool.execute(emailQuery, [email]);
            if (emailResult.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }
        const query = `
      INSERT INTO customers (
        customer_code, first_name, last_name, email, phone, 
        date_of_birth, address, city, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const [result] = await database_1.pool.execute(query, [
            customer_code,
            first_name,
            last_name,
            email || null,
            phone || null,
            date_of_birth || null,
            address || null,
            city || null,
            country || null
        ]);
        const response = {
            success: true,
            message: 'Customer created successfully',
            data: { id: result.insertId, customer_code }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create customer',
            error: error.message
        });
    }
});
// Update customer
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, date_of_birth, address, city, country, is_active } = req.body;
        // Check if customer exists
        const checkQuery = 'SELECT id FROM customers WHERE id = ?';
        const [checkResult] = await database_1.pool.execute(checkQuery, [id]);
        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        // Check if email already exists (if provided and different from current)
        if (email) {
            const emailQuery = 'SELECT id FROM customers WHERE email = ? AND id != ?';
            const [emailResult] = await database_1.pool.execute(emailQuery, [email, id]);
            if (emailResult.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }
        const query = `
      UPDATE customers SET 
        first_name = ?, last_name = ?, email = ?, phone = ?, 
        date_of_birth = ?, address = ?, city = ?, country = ?, 
        is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        await database_1.pool.execute(query, [
            first_name,
            last_name,
            email || null,
            phone || null,
            date_of_birth || null,
            address || null,
            city || null,
            country || null,
            is_active !== undefined ? is_active : true,
            id
        ]);
        const response = {
            success: true,
            message: 'Customer updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update customer',
            error: error.message
        });
    }
});
// Delete customer
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if customer exists
        const checkQuery = 'SELECT id FROM customers WHERE id = ?';
        const [checkResult] = await database_1.pool.execute(checkQuery, [id]);
        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        // Check if customer has any orders or reservations
        const ordersQuery = 'SELECT COUNT(*) as count FROM orders WHERE customer_id = ?';
        const [ordersResult] = await database_1.pool.execute(ordersQuery, [id]);
        const reservationsQuery = 'SELECT COUNT(*) as count FROM reservations WHERE customer_id = ?';
        const [reservationsResult] = await database_1.pool.execute(reservationsQuery, [id]);
        if (ordersResult[0].count > 0 || reservationsResult[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete customer with existing orders or reservations'
            });
        }
        const query = 'DELETE FROM customers WHERE id = ?';
        await database_1.pool.execute(query, [id]);
        const response = {
            success: true,
            message: 'Customer deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete customer',
            error: error.message
        });
    }
});
// Get customer statistics
router.get('/stats/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        // Total customers
        const totalQuery = 'SELECT COUNT(*) as total FROM customers';
        const [totalResult] = await database_1.pool.execute(totalQuery);
        // Active customers
        const activeQuery = 'SELECT COUNT(*) as active FROM customers WHERE is_active = 1';
        const [activeResult] = await database_1.pool.execute(activeQuery);
        // New customers this month
        const thisMonthQuery = `
      SELECT COUNT(*) as new_this_month 
      FROM customers 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `;
        const [thisMonthResult] = await database_1.pool.execute(thisMonthQuery);
        // Customers with orders
        const withOrdersQuery = `
      SELECT COUNT(DISTINCT customer_id) as with_orders 
      FROM orders 
      WHERE customer_id IS NOT NULL
    `;
        const [withOrdersResult] = await database_1.pool.execute(withOrdersQuery);
        const response = {
            success: true,
            message: 'Customer statistics retrieved successfully',
            data: {
                total_customers: totalResult[0].total,
                active_customers: activeResult[0].active,
                new_this_month: thisMonthResult[0].new_this_month,
                customers_with_orders: withOrdersResult[0].with_orders
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching customer statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer statistics',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map