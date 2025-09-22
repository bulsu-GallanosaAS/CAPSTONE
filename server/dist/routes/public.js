"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Public endpoint to create a reservation from the customer site
router.post('/reservations', [
    (0, express_validator_1.body)('name').isLength({ min: 2 }).withMessage('Name is required'),
    (0, express_validator_1.body)('phone').isLength({ min: 7 }).withMessage('Valid phone is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('guests').isInt({ min: 1 }).withMessage('Guests must be at least 1'),
    (0, express_validator_1.body)('year').isInt({ min: 2000 }).withMessage('Year is required'),
    (0, express_validator_1.body)('month').isString().withMessage('Month is required'),
    (0, express_validator_1.body)('selectedDate').isInt({ min: 1, max: 31 }).withMessage('Day is required'),
    (0, express_validator_1.body)('selectedTime').isString().withMessage('Time slot is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }
        const { name, phone, email, specialOccasion, guests, year, month, selectedDate, selectedTime, notes } = req.body;
        // Convert month name to month index (1-12)
        const monthNames = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        const monthIndex = monthNames.indexOf(String(month).toUpperCase());
        if (monthIndex < 0) {
            return res.status(400).json({ success: false, message: 'Invalid month' });
        }
        // Build reservation_date as YYYY-MM-DD
        const two = (n) => (n < 10 ? `0${n}` : `${n}`);
        const reservation_date = `${year}-${two(monthIndex + 1)}-${two(selectedDate)}`;
        // Map selectedTime slot to a start time like 'HH:MM:SS'
        const timeSlotMap = {
            '5:00 PM - 6:30 PM': '17:00:00',
            '6:30 PM - 8:00 PM': '18:30:00',
            '8:00 PM - 9:30 PM': '20:00:00'
        };
        const reservation_time = timeSlotMap[selectedTime] || '18:00:00';
        const reservation_code = `RES${Date.now()}`;
        const insertSql = `
      INSERT INTO reservations (
        reservation_code, customer_name, phone, email, table_id, occasion,
        number_of_guests, reservation_date, reservation_time, duration_hours,
        payment_amount, status, notes
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, 2, 0, 'pending', ?)
    `;
        const result = await (0, database_1.executeQuery)(insertSql, [
            reservation_code,
            name,
            phone,
            email || null,
            specialOccasion || null,
            guests,
            reservation_date,
            reservation_time,
            notes || null
        ]);
        // Notify admins via socket if available
        try {
            const io = req.app.get('io');
            if (io) {
                io.to('admin').emit('reservation:created', {
                    id: result?.insertId,
                    reservation_code,
                    customer_name: name,
                    phone,
                    email,
                    number_of_guests: guests,
                    reservation_date,
                    reservation_time,
                    status: 'pending'
                });
            }
        }
        catch { }
        return res.status(201).json({
            success: true,
            message: 'Reservation submitted successfully',
            data: { id: result?.insertId, reservation_code }
        });
    }
    catch (error) {
        console.error('Public reservation error:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit reservation' });
    }
});
exports.default = router;
// Public endpoint to create a customer from the customer site signup
router.post('/customers', [
    (0, express_validator_1.body)('first_name').isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('last_name').isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }
        const { first_name, last_name, email, phone } = req.body;
        // Prevent duplicate emails if provided
        if (email) {
            const existing = await (0, database_1.executeQuery)('SELECT id FROM customers WHERE email = ? LIMIT 1', [email]);
            if (Array.isArray(existing) && existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }
        // Generate a customer code roughly similar to admin route
        const countRows = await (0, database_1.executeQuery)('SELECT COUNT(*) as count FROM customers');
        const count = countRows[0]?.count ?? 0;
        const customer_code = `CUST${String(Number(count) + 1).padStart(4, '0')}`;
        const insertSql = `
      INSERT INTO customers (customer_code, first_name, last_name, email, phone)
      VALUES (?, ?, ?, ?, ?)
    `;
        const result = await (0, database_1.executeQuery)(insertSql, [customer_code, first_name, last_name, email || null, phone || null]);
        // Notify admins via socket
        try {
            const io = req.app.get('io');
            if (io) {
                io.to('admin').emit('customer:created', {
                    id: result?.insertId,
                    customer_code,
                    first_name,
                    last_name,
                    email,
                    phone,
                });
            }
        }
        catch { }
        return res.status(201).json({ success: true, message: 'Customer created successfully', data: { id: result?.insertId, customer_code } });
    }
    catch (error) {
        console.error('Public customer create error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create customer' });
    }
});
//# sourceMappingURL=public.js.map