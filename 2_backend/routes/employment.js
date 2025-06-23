const express = require('express');
const router = express.Router();

// Get employment info for customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT cei.*, ep.employment_type, ep.job_title, wnt.nature_description
            FROM customer_employment_information cei
            LEFT JOIN employment_position ep ON cei.position_code = ep.position_code
            LEFT JOIN work_nature_type wnt ON cei.work_nature_code = wnt.work_nature_code
            WHERE cei.customer_id = ?
        `, [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add employment information
router.post('/', async (req, res) => {
    try {
        const {
            customer_id, position_code, work_nature_code, company_name,
            company_address, company_phone, length_of_service,
            gross_monthly_income, net_monthly_income
        } = req.body;

        const [result] = await req.db.query(`
            INSERT INTO customer_employment_information (
                customer_id, position_code, work_nature_code, company_name,
                company_address, company_phone, length_of_service,
                gross_monthly_income, net_monthly_income
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [customer_id, position_code, work_nature_code, company_name,
           company_address, company_phone, length_of_service,
           gross_monthly_income, net_monthly_income]);

        res.status(201).json({ 
            message: 'Employment information added successfully',
            employment_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update employment information
router.put('/:id', async (req, res) => {
    try {
        const {
            position_code, work_nature_code, company_name, company_address,
            company_phone, length_of_service, gross_monthly_income, net_monthly_income
        } = req.body;

        const [result] = await req.db.query(`
            UPDATE customer_employment_information 
            SET position_code = ?, work_nature_code = ?, company_name = ?,
                company_address = ?, company_phone = ?, length_of_service = ?,
                gross_monthly_income = ?, net_monthly_income = ?
            WHERE employment_id = ?
        `, [position_code, work_nature_code, company_name, company_address,
           company_phone, length_of_service, gross_monthly_income, 
           net_monthly_income, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employment record not found' });
        }

        res.json({ message: 'Employment information updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
