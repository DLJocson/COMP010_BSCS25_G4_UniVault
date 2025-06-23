const { runMigrations } = require('../migrate-db');

// Enhanced migration script that can be called via npm
async function main() {
    console.log('🔧 UniVault Database Migration Tool');
    console.log('====================================\n');

    try {
        await runMigrations();
        console.log('\n✨ Migration completed successfully!');
        console.log('You can now start the UniVault server.');
    } catch (error) {
        console.error('\n💥 Migration failed:', error.message);
        console.error('Please check your database configuration and try again.');
        process.exit(1);
    }
}

main();
