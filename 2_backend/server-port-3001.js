// Test server on port 3001 to avoid conflicts
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // Different port

console.log('🔧 Starting server on port 3001...');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../1_frontend')));

app.get('/api', (req, res) => {
    console.log('✅ /api endpoint hit on port 3001!');
    res.json({ message: 'SERVER ON PORT 3001 WORKING!', time: new Date() });
});

app.get('/admin/pending-verifications', (req, res) => {
    console.log('✅ /admin/pending-verifications endpoint hit on port 3001!');
    res.json([
        { 
            cif_number: '12345', 
            customer_first_name: 'Test', 
            customer_last_name: 'User', 
            customer_status: 'Pending Verification',
            created_at: new Date().toISOString(),
            customer_type: 'Individual',
            email: 'test@example.com'
        }
    ]);
});

// Admin Login endpoint
app.post('/admin/login', (req, res) => {
    console.log('🔐 Admin login attempt on port 3001:', req.body);
    
    const { employee_username, employee_password } = req.body;
    
    // Simple test authentication
    if (employee_username === 'admin' && employee_password === 'Admin123!') {
        res.json({ 
            message: 'Login successful', 
            employee_id: 1,
            employee_position: 'System Administrator',
            employee_name: 'System Administrator'
        });
        console.log('✅ Login successful for admin');
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
        console.log('❌ Login failed for:', employee_username);
    }
});

// Dashboard stats for testing
app.get('/admin/dashboard-stats', (req, res) => {
    console.log('📊 Dashboard stats requested on port 3001');
    res.json({
        totalCustomers: 150,
        verifiedCustomers: 120,
        pendingVerifications: 1,
        newAccounts: 5,
        rejectedApplications: 3,
        pendingApprovals: 2,
        monthlyStats: [
            { month: 1, registrations: 10 },
            { month: 2, registrations: 15 },
            { month: 3, registrations: 20 },
            { month: 6, registrations: 25 }
        ]
    });
});

// Customer details endpoint
app.get('/admin/customer/:cif_number/details', (req, res) => {
    const { cif_number } = req.params;
    console.log(`👤 Customer details requested for CIF: ${cif_number}`);
    
    // Mock customer data
    const mockCustomerData = {
        customer: {
            cif_number: cif_number,
            customer_type: 'Individual',
            customer_first_name: 'Test',
            customer_last_name: 'User',
            customer_middle_name: 'Middle',
            customer_suffix_name: null,
            customer_status: 'Pending Verification',
            birth_date: '1990-01-01',
            gender: 'Male',
            birth_country: 'Philippines',
            citizenship: 'Filipino',
            civil_status_description: 'Single'
        },
        addresses: [
            {
                address_type_code: 'AD01',
                address_unit: '123',
                address_building: 'Test Building',
                address_street: 'Test Street',
                address_subdivision: 'Test Subdivision',
                address_barangay: 'Test Barangay',
                address_city: 'Test City',
                address_province: 'Test Province',
                address_country: 'Philippines',
                address_zip_code: '1234'
            }
        ],
        contacts: [
            {
                contact_type_code: 'CT01',
                contact_type_description: 'Email',
                contact_value: 'test@example.com'
            },
            {
                contact_type_code: 'CT02',
                contact_type_description: 'Mobile',
                contact_value: '+63-123-456-7890'
            }
        ],
        employment: [
            {
                employer_business_name: 'Test Company',
                job_title: 'Software Developer',
                income_monthly_gross: 50000
            }
        ],
        ids: [],
        fundSources: [
            {
                fund_source: 'Employment'
            }
        ],
        workNature: [],
        aliases: []
    };
    
    res.json(mockCustomerData);
});

// Customer verification endpoint
app.post('/admin/customer/:cif_number/verify', (req, res) => {
    const { cif_number } = req.params;
    const { action, employee_id } = req.body;
    console.log(`✅ Customer verification: ${action} for CIF ${cif_number} by employee ${employee_id}`);
    
    if (action === 'approve') {
        res.json({ message: 'Customer verified and approved successfully' });
    } else if (action === 'reject') {
        res.json({ message: 'Customer verification rejected' });
    } else {
        res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }
});

// Close requests endpoint
app.get('/admin/close-requests', (req, res) => {
    console.log('📋 Close requests requested');
    res.json([
        {
            cif_number: '54321',
            customer_type: 'Individual',
            customer_first_name: 'Jane',
            customer_last_name: 'Smith',
            customer_middle_name: 'A',
            customer_suffix_name: null,
            request_date: new Date().toISOString(),
            request_status: 'Pending'
        }
    ]);
});

// Process close request endpoint
app.post('/admin/close-request/:cif_number/process', (req, res) => {
    const { cif_number } = req.params;
    const { action, employee_id } = req.body;
    console.log(`✅ Close request processed: ${action} for CIF ${cif_number} by employee ${employee_id}`);
    
    if (action === 'approve') {
        res.json({ message: 'Close request approved and account closed' });
    } else if (action === 'reject') {
        res.json({ message: 'Close request rejected' });
    } else {
        res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>SERVER RUNNING ON PORT 3001</h1>
        <p>If you see this, the server is working on port 3001!</p>
        <ul>
            <li><a href="/api">Test API</a></li>
            <li><a href="/admin/pending-verifications">Test Pending Verifications</a></li>
            <li><a href="/Dashboard-Admin/admin-review-queue.html">Admin Review Queue</a></li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 SERVER running on http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api`);
    console.log(`Test: http://localhost:${PORT}/admin/pending-verifications`);
    console.log(`Admin Review Queue: http://localhost:${PORT}/Dashboard-Admin/admin-review-queue.html`);
});
