const express = require('express');
const router = express.Router();

// Get addresses for customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT ca.*, at.address_type 
            FROM customer_address ca 
            LEFT JOIN address_type at ON ca.address_type_code = at.address_type_code
            WHERE ca.customer_id = ?
        `, [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add address for customer
router.post('/', async (req, res) => {
    try {
        const {
            customer_id, address_type_code, unit_number, building_number,
            lot_number, block_number, street, subdivision, barangay,
            city_municipality, province, postal_code, country
        } = req.body;

        const [result] = await req.db.query(`
            INSERT INTO customer_address (
                customer_id, address_type_code, unit_number, building_number,
                lot_number, block_number, street, subdivision, barangay,
                city_municipality, province, postal_code, country
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [customer_id, address_type_code, unit_number, building_number,
           lot_number, block_number, street, subdivision, barangay,
           city_municipality, province, postal_code, country]);

        res.status(201).json({ 
            message: 'Address added successfully',
            address_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update address
router.put('/:id', async (req, res) => {
    try {
        const {
            address_type_code, unit_number, building_number, lot_number,
            block_number, street, subdivision, barangay, city_municipality,
            province, postal_code, country
        } = req.body;

        const [result] = await req.db.query(`
            UPDATE customer_address 
            SET address_type_code = ?, unit_number = ?, building_number = ?,
                lot_number = ?, block_number = ?, street = ?, subdivision = ?,
                barangay = ?, city_municipality = ?, province = ?, 
                postal_code = ?, country = ?
            WHERE address_id = ?
        `, [address_type_code, unit_number, building_number, lot_number,
           block_number, street, subdivision, barangay, city_municipality,
           province, postal_code, country, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
