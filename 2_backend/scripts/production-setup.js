#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

console.log('🚀 UniVault Production Setup Script');
console.log('====================================\n');

class ProductionSetup {
    constructor() {
        this.config = this.loadConfiguration();
        this.setupSteps = [
            { name: 'Environment Validation', fn: this.validateEnvironment },
            { name: 'Database Setup', fn: this.setupDatabase },
            { name: 'Security Configuration', fn: this.setupSecurity },
            { name: 'SSL/TLS Setup', fn: this.setupSSL },
            { name: 'Logging Setup', fn: this.setupLogging },
            { name: 'Monitoring Setup', fn: this.setupMonitoring },
            { name: 'Service Configuration', fn: this.setupServices },
            { name: 'Performance Optimization', fn: this.optimizePerformance },
            { name: 'Health Checks', fn: this.setupHealthChecks },
            { name: 'Final Validation', fn: this.finalValidation }
        ];
    }

    loadConfiguration() {
        try {
            require('dotenv').config({ path: '.env.production' });
            return process.env;
        } catch (error) {
            console.error('❌ Failed to load production configuration:', error.message);
            process.exit(1);
        }
    }

    async run() {
        console.log('🔧 Starting production setup...\n');
        
        for (const step of this.setupSteps) {
            try {
                console.log(`🔄 ${step.name}...`);
                await step.fn.call(this);
                console.log(`✅ ${step.name} completed\n`);
            } catch (error) {
                console.error(`❌ ${step.name} failed:`, error.message);
                console.log('⚠️ Setup aborted due to error\n');
                process.exit(1);
            }
        }

        console.log('🎉 Production setup completed successfully!');
        this.displayFinalInstructions();
    }

    async validateEnvironment() {
        const requiredVars = [
            'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
            'JWT_SECRET', 'JWT_REFRESH_SECRET'
        ];

        const missing = requiredVars.filter(varName => !this.config[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validate JWT secrets strength
        if (this.config.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }

        if (this.config.JWT_REFRESH_SECRET.length < 32) {
            throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
        }

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`);
        }

        console.log('  ✓ Environment variables validated');
        console.log('  ✓ JWT secrets validated');
        console.log(`  ✓ Node.js version ${nodeVersion} is supported`);
    }

    async setupDatabase() {
        let connection;
        
        try {
            // Test database connection
            connection = await mysql.createConnection({
                host: this.config.DB_HOST,
                user: this.config.DB_USER,
                password: this.config.DB_PASSWORD,
                database: this.config.DB_NAME,
                ssl: this.config.DB_SSL_ENABLED === 'true' ? {
                    rejectUnauthorized: false
                } : false
            });

            console.log('  ✓ Database connection established');

            // Run production migrations
            await this.runMigrations(connection);
            
            // Setup database optimizations
            await this.optimizeDatabase(connection);
            
            // Create production indexes
            await this.createProductionIndexes(connection);
            
            console.log('  ✓ Database setup completed');

        } catch (error) {
            throw new Error(`Database setup failed: ${error.message}`);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    async runMigrations(connection) {
        const migrationFiles = [
            'migrations/002_simple_session_tables.sql',
            'migrations/003_performance_optimization.sql'
        ];

        for (const file of migrationFiles) {
            const migrationPath = path.join(__dirname, '../../3_database', file);
            
            if (fs.existsSync(migrationPath)) {
                console.log(`    Running migration: ${file}`);
                const migration = fs.readFileSync(migrationPath, 'utf8');
                await connection.execute(migration);
            }
        }
    }

    async optimizeDatabase(connection) {
        // Production database optimizations
        const optimizations = [
            'SET GLOBAL innodb_buffer_pool_size = 1073741824',
            'SET GLOBAL query_cache_size = 268435456',
            'SET GLOBAL max_connections = 200',
            'SET GLOBAL innodb_log_file_size = 268435456'
        ];

        for (const optimization of optimizations) {
            try {
                await connection.execute(optimization);
            } catch (error) {
                console.log(`    Warning: Could not apply optimization: ${optimization}`);
            }
        }
    }

    async createProductionIndexes(connection) {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_customer_performance ON CUSTOMER(customer_status, registration_date)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_performance ON user_sessions(expires_at, status, last_activity)',
            'CREATE INDEX IF NOT EXISTS idx_security_performance ON security_events(created_at, severity, event_type)'
        ];

        for (const index of indexes) {
            try {
                await connection.execute(index);
            } catch (error) {
                console.log(`    Warning: Could not create index: ${error.message}`);
            }
        }
    }

    async setupSecurity() {
        // Create security directories
        const securityDirs = [
            '/var/log/univault/security',
            '/var/backups/univault',
            '/etc/univault/ssl'
        ];

        for (const dir of securityDirs) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true, mode: 0o750 });
                }
            } catch (error) {
                console.log(`    Warning: Could not create directory ${dir}: ${error.message}`);
            }
        }

        // Setup file permissions
        try {
            fs.chmodSync('.env.production', 0o600);
            console.log('  ✓ Production environment file permissions set');
        } catch (error) {
            console.log('    Warning: Could not set environment file permissions');
        }

        // Generate additional security files if needed
        await this.generateSecurityFiles();
        
        console.log('  ✓ Security configuration completed');
    }

    async generateSecurityFiles() {
        // Generate CSRF token secret if not exists
        const csrfSecretPath = path.join(__dirname, '../config/csrf-secret.key');
        if (!fs.existsSync(csrfSecretPath)) {
            const csrfSecret = require('crypto').randomBytes(64).toString('hex');
            fs.writeFileSync(csrfSecretPath, csrfSecret, { mode: 0o600 });
        }

        // Generate session encryption key if not exists
        const sessionKeyPath = path.join(__dirname, '../config/session-key.key');
        if (!fs.existsSync(sessionKeyPath)) {
            const sessionKey = require('crypto').randomBytes(32).toString('hex');
            fs.writeFileSync(sessionKeyPath, sessionKey, { mode: 0o600 });
        }
    }

    async setupSSL() {
        if (this.config.SSL_ENABLED !== 'true') {
            console.log('  ⚠️ SSL is disabled - not recommended for production');
            return;
        }

        const certPath = this.config.SSL_CERT_PATH;
        const keyPath = this.config.SSL_KEY_PATH;

        if (!certPath || !keyPath) {
            throw new Error('SSL_CERT_PATH and SSL_KEY_PATH must be specified when SSL is enabled');
        }

        if (!fs.existsSync(certPath)) {
            throw new Error(`SSL certificate not found at: ${certPath}`);
        }

        if (!fs.existsSync(keyPath)) {
            throw new Error(`SSL private key not found at: ${keyPath}`);
        }

        // Validate certificate permissions
        const certStats = fs.statSync(certPath);
        const keyStats = fs.statSync(keyPath);

        if ((certStats.mode & 0o077) !== 0) {
            console.log('    Warning: SSL certificate has overly permissive permissions');
        }

        if ((keyStats.mode & 0o077) !== 0) {
            console.log('    Warning: SSL private key has overly permissive permissions');
        }

        console.log('  ✓ SSL configuration validated');
    }

    async setupLogging() {
        const logDir = this.config.LOG_DIR || '/var/log/univault';
        
        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true, mode: 0o755 });
            }

            // Create log subdirectories
            const logSubdirs = ['access', 'error', 'security', 'performance'];
            for (const subdir of logSubdirs) {
                const subdirPath = path.join(logDir, subdir);
                if (!fs.existsSync(subdirPath)) {
                    fs.mkdirSync(subdirPath, { mode: 0o755 });
                }
            }

            // Create logrotate configuration
            await this.createLogrotateConfig(logDir);
            
            console.log('  ✓ Logging directories created');
            console.log('  ✓ Log rotation configured');
            
        } catch (error) {
            throw new Error(`Logging setup failed: ${error.message}`);
        }
    }

    async createLogrotateConfig(logDir) {
        const logrotateConfig = `
${logDir}/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    create 0644 root root
}

${logDir}/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    create 0644 root root
}
`;

        const configPath = '/etc/logrotate.d/univault';
        try {
            fs.writeFileSync(configPath, logrotateConfig);
        } catch (error) {
            console.log('    Warning: Could not create logrotate configuration');
        }
    }

    async setupMonitoring() {
        if (this.config.MONITORING_ENABLED !== 'true') {
            console.log('  ⚠️ Monitoring is disabled');
            return;
        }

        // Create monitoring directories
        const monitoringDir = '/var/lib/univault/monitoring';
        try {
            if (!fs.existsSync(monitoringDir)) {
                fs.mkdirSync(monitoringDir, { recursive: true, mode: 0o755 });
            }
        } catch (error) {
            console.log('    Warning: Could not create monitoring directory');
        }

        // Setup monitoring configuration
        const monitoringConfig = {
            enabled: true,
            interval: parseInt(this.config.MONITORING_INTERVAL_MS) || 60000,
            thresholds: {
                cpu: parseInt(this.config.ALERT_CPU_THRESHOLD) || 80,
                memory: parseInt(this.config.ALERT_MEMORY_THRESHOLD) || 85,
                disk: parseInt(this.config.ALERT_DISK_THRESHOLD) || 90
            }
        };

        const configPath = path.join(monitoringDir, 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(monitoringConfig, null, 2));

        console.log('  ✓ Monitoring configuration created');
    }

    async setupServices() {
        // Create systemd service file for production deployment
        const serviceFile = `
[Unit]
Description=UniVault Banking System
Documentation=https://github.com/your-org/univault
After=network.target

[Service]
Type=simple
User=univault
WorkingDirectory=/opt/univault
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=univault
Environment=NODE_ENV=production
EnvironmentFile=/opt/univault/.env.production

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/log/univault /var/lib/univault

[Install]
WantedBy=multi-user.target
`;

        try {
            fs.writeFileSync('/etc/systemd/system/univault.service', serviceFile);
            console.log('  ✓ Systemd service file created');
        } catch (error) {
            console.log('    Warning: Could not create systemd service file');
        }

        // Create backup script
        await this.createBackupScript();
    }

    async createBackupScript() {
        const backupScript = `#!/bin/bash
# UniVault Database Backup Script

BACKUP_DIR="/var/backups/univault"
DB_HOST="${this.config.DB_HOST}"
DB_USER="${this.config.DB_USER}"
DB_PASSWORD="${this.config.DB_PASSWORD}"
DB_NAME="${this.config.DB_NAME}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/univault_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "univault_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
`;

        const scriptPath = '/opt/univault/scripts/backup.sh';
        try {
            fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
            fs.writeFileSync(scriptPath, backupScript, { mode: 0o755 });
            console.log('  ✓ Backup script created');
        } catch (error) {
            console.log('    Warning: Could not create backup script');
        }
    }

    async optimizePerformance() {
        // Create PM2 ecosystem file for production
        const pm2Config = {
            apps: [{
                name: 'univault',
                script: 'server.js',
                instances: 'max',
                exec_mode: 'cluster',
                env_production: {
                    NODE_ENV: 'production',
                    PORT: this.config.PORT || 3000
                },
                error_file: '/var/log/univault/pm2-error.log',
                out_file: '/var/log/univault/pm2-out.log',
                log_file: '/var/log/univault/pm2-combined.log',
                time: true,
                max_memory_restart: '1G',
                node_args: '--max-old-space-size=1024'
            }]
        };

        const pm2ConfigPath = path.join(__dirname, '../ecosystem.config.js');
        const pm2ConfigContent = `module.exports = ${JSON.stringify(pm2Config, null, 2)};`;
        fs.writeFileSync(pm2ConfigPath, pm2ConfigContent);

        console.log('  ✓ PM2 configuration created');
        console.log('  ✓ Performance optimization completed');
    }

    async setupHealthChecks() {
        // Create health check script
        const healthCheckScript = `#!/bin/bash
# UniVault Health Check Script

HEALTH_URL="http://localhost:${this.config.PORT || 3000}/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$RESPONSE" = "200" ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed with status: $RESPONSE"
    exit 1
fi
`;

        const scriptPath = '/opt/univault/scripts/health-check.sh';
        try {
            fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
            fs.writeFileSync(scriptPath, healthCheckScript, { mode: 0o755 });
            console.log('  ✓ Health check script created');
        } catch (error) {
            console.log('    Warning: Could not create health check script');
        }
    }

    async finalValidation() {
        const validations = [
            { name: 'Configuration file exists', test: () => fs.existsSync('.env.production') },
            { name: 'JWT secrets configured', test: () => this.config.JWT_SECRET && this.config.JWT_REFRESH_SECRET },
            { name: 'Database configuration', test: () => this.config.DB_HOST && this.config.DB_USER && this.config.DB_NAME },
            { name: 'Security settings', test: () => this.config.BCRYPT_ROUNDS >= 12 },
            { name: 'Production mode', test: () => this.config.NODE_ENV === 'production' }
        ];

        for (const validation of validations) {
            if (validation.test()) {
                console.log(`  ✓ ${validation.name}`);
            } else {
                throw new Error(`Validation failed: ${validation.name}`);
            }
        }
    }

    displayFinalInstructions() {
        console.log('\n📋 Production Deployment Instructions');
        console.log('======================================\n');
        
        console.log('1. Install dependencies:');
        console.log('   npm ci --only=production\n');
        
        console.log('2. Start the application with PM2:');
        console.log('   pm2 start ecosystem.config.js --env production\n');
        
        console.log('3. Enable systemd service:');
        console.log('   sudo systemctl enable univault');
        console.log('   sudo systemctl start univault\n');
        
        console.log('4. Setup log rotation:');
        console.log('   sudo logrotate -f /etc/logrotate.d/univault\n');
        
        console.log('5. Schedule database backups:');
        console.log('   Add to crontab: 0 2 * * * /opt/univault/scripts/backup.sh\n');
        
        console.log('6. Monitor the application:');
        console.log('   pm2 monit');
        console.log('   tail -f /var/log/univault/error.log\n');
        
        console.log('7. Health check URL:');
        console.log(`   http://localhost:${this.config.PORT || 3000}/api/health\n`);
        
        console.log('⚠️  Security Checklist:');
        console.log('- Update all default passwords');
        console.log('- Configure firewall rules');
        console.log('- Setup SSL/TLS certificates');
        console.log('- Enable security monitoring');
        console.log('- Review and update CORS settings');
        console.log('- Implement intrusion detection\n');
        
        console.log('🎯 Production deployment is ready!');
    }
}

// Run the setup
if (require.main === module) {
    const setup = new ProductionSetup();
    setup.run().catch(error => {
        console.error('❌ Production setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = ProductionSetup;
