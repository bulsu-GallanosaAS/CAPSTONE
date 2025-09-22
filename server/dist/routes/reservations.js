"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const reservations = await (0, database_1.executeQuery)(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `);
        const response = {
            success: true,
            message: 'Reservations retrieved successfully',
            data: reservations
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const reservations = await (0, database_1.executeQuery)(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.id = ?
    `, [id]);
        if (reservations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        const response = {
            success: true,
            message: 'Reservation retrieved successfully',
            data: reservations[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservation'
        });
    }
});
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('customer_name').isLength({ min: 2 }).withMessage('Customer name is required'),
    (0, express_validator_1.body)('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('table_id').isInt().withMessage('Table ID is required'),
    (0, express_validator_1.body)('number_of_guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
    (0, express_validator_1.body)('reservation_date').isDate().withMessage('Valid reservation date is required'),
    (0, express_validator_1.body)('reservation_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { customer_name, phone, email, table_id, occasion, number_of_guests, reservation_date, reservation_time, duration_hours = 2, payment_amount = 0, notes } = req.body;
        const reservation_code = `RES${Date.now()}`;
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO reservations (
        reservation_code, customer_name, phone, email, table_id, occasion,
        number_of_guests, reservation_date, reservation_time, duration_hours,
        payment_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            reservation_code, customer_name, phone, email, table_id, occasion,
            number_of_guests, reservation_date, reservation_time, duration_hours,
            payment_amount, notes
        ]);
        const response = {
            success: true,
            message: 'Reservation created successfully',
            data: { id: result.insertId, reservation_code }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create reservation'
        });
    }
});
router.put('/:id/status', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const { status } = req.body;
        await (0, database_1.executeQuery)('UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        const response = {
            success: true,
            message: 'Reservation status updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reservation status'
        });
    }
});
router.put('/:id', [
    (0, express_validator_1.body)('customer_name').optional().isLength({ min: 2 }),
    (0, express_validator_1.body)('phone').optional().isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits'),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('table_id').optional().isInt(),
    (0, express_validator_1.body)('number_of_guests').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('reservation_date').optional().isISO8601().withMessage('Valid date format required'),
    (0, express_validator_1.body)('reservation_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid time format required (HH:MM or HH:MM:SS)')
], async (req, res) => {
    try {
        console.log('🔧 DEBUG: Reservation update called with ID:', req.params.id);
        console.log('🔧 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('🔧 DEBUG: Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const updates = req.body;
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        console.log('🔧 DEBUG: Update query:', `UPDATE reservations SET ${setClause}, updated_at = NOW() WHERE id = ?`);
        console.log('🔧 DEBUG: Values:', [...values, id]);
        await (0, database_1.executeQuery)(`UPDATE reservations SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        console.log('🔧 DEBUG: Reservation updated successfully');
        const response = {
            success: true,
            message: 'Reservation updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('🔧 ERROR: Error updating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reservation'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await (0, database_1.executeQuery)('DELETE FROM reservations WHERE id = ?', [id]);
        const response = {
            success: true,
            message: 'Reservation deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reservation'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reservations.js.map