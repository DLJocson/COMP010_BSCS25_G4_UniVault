const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from current directory
app.use(express.static(__dirname));

// Handle all routes and serve index.html for the registration system
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404s by redirecting to main index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎉 UniVault Registration Server running at:`);
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://192.168.1.100:${PORT} (if accessible)`);
    console.log(`\n🚀 Registration Flow:`);
    console.log(`   1. Landing page: http://localhost:${PORT}`);
    console.log(`   2. Start registration: http://localhost:${PORT}/registration1.html`);
    console.log(`   3. Review & submit: http://localhost:${PORT}/review.html`);
    console.log(`   4. Confirmation: http://localhost:${PORT}/confirmation.html`);
    console.log(`\n📝 To get started:`);
    console.log(`   - Open your browser to http://localhost:${PORT}`);
    console.log(`   - Click "Start Registration" to begin the process`);
    console.log(`\n🛑 Press Ctrl+C to stop the server`);
});
