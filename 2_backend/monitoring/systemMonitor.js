const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { createEnhancedErrorSystem } = require('../middleware/enhancedErrorHandler');

// ============================================================================
// COMPREHENSIVE SYSTEM MONITORING
// ============================================================================

class SystemMonitor {
    constructor(db, options = {}) {
        this.db = db;
        this.logger = options.logger || console;
        this.alertThresholds = {
            cpuUsage: options.cpuThreshold || 80,
            memoryUsage: options.memoryThreshold || 85,
            diskUsage: options.diskThreshold || 90,
            responseTime: options.responseTimeThreshold || 5000,
            errorRate: options.errorRateThreshold || 5,
            activeConnections: options.connectionThreshold || 100,
            ...options.thresholds
        };
        
        this.metrics = {
            requests: { total: 0, errors: 0, avgResponseTime: 0 },
            system: { cpu: 0, memory: 0, disk: 0 },
            database: { connections: 0, queries: 0, errors: 0 },
            security: { loginAttempts: 0, failedLogins: 0, blockedIPs: 0 }
        };
        
        this.alerts = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
    }

    // ============================
    // SYSTEM METRICS COLLECTION
    // ============================

    async collectSystemMetrics() {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                system: await this.getSystemMetrics(),
                process: await this.getProcessMetrics(),
                database: await this.getDatabaseMetrics(),
                application: await this.getApplicationMetrics(),
                security: await this.getSecurityMetrics()
            };

            // Check thresholds and generate alerts
            await this.checkThresholds(metrics);
            
            // Store metrics in database
            await this.storeMetrics(metrics);
            
            return metrics;
        } catch (error) {
            this.logger.error('Failed to collect system metrics:', error);
            return null;
        }
    }

    async getSystemMetrics() {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        // Calculate CPU usage (simplified)
        const cpuUsage = await this.getCPUUsage();
        
        // Get disk usage
        const diskUsage = await this.getDiskUsage();
        
        return {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            uptime: os.uptime(),
            loadAverage: os.loadavg(),
            cpu: {
                count: cpus.length,
                model: cpus[0]?.model || 'Unknown',
                usage: cpuUsage
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usagePercent: (usedMem / totalMem) * 100
            },
            disk: diskUsage
        };
    }

    async getProcessMetrics() {
        const memUsage = process.memoryUsage();
        
        return {
            pid: process.pid,
            uptime: process.uptime(),
            nodeVersion: process.version,
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external,
                heapUsagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100
            },
            cpu: process.cpuUsage(),
            activeHandles: process._getActiveHandles().length,
            activeRequests: process._getActiveRequests().length
        };
    }

    async getDatabaseMetrics() {
        try {
            // Get connection count
            const [connections] = await this.db.query('SHOW STATUS LIKE "Threads_connected"');
            const [maxConnections] = await this.db.query('SHOW VARIABLES LIKE "max_connections"');
            
            // Get query statistics
            const [queries] = await this.db.query('SHOW STATUS LIKE "Questions"');
            const [slowQueries] = await this.db.query('SHOW STATUS LIKE "Slow_queries"');
            
            // Get database size
            const [dbSize] = await this.db.query(`
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS db_size_mb
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            `);

            // Recent error count
            const [recentErrors] = await this.db.query(`
                SELECT COUNT(*) as error_count 
                FROM security_events 
                WHERE event_type LIKE '%error%' 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            return {
                connections: {
                    current: parseInt(connections[0]?.Value || 0),
                    max: parseInt(maxConnections[0]?.Value || 0)
                },
                queries: {
                    total: parseInt(queries[0]?.Value || 0),
                    slow: parseInt(slowQueries[0]?.Value || 0)
                },
                size: {
                    sizeMB: parseFloat(dbSize[0]?.db_size_mb || 0)
                },
                errors: {
                    recentCount: parseInt(recentErrors[0]?.error_count || 0)
                }
            };
        } catch (error) {
            this.logger.error('Failed to get database metrics:', error);
            return {
                connections: { current: 0, max: 0 },
                queries: { total: 0, slow: 0 },
                size: { sizeMB: 0 },
                errors: { recentCount: 0 }
            };
        }
    }

    async getApplicationMetrics() {
        try {
            // Get active sessions
            const [activeSessions] = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM user_sessions 
                WHERE status = 'active' AND expires_at > NOW()
            `);

            // Get recent registrations
            const [recentRegistrations] = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM registration_sessions 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            // Get API metrics from logs (simplified)
            const apiMetrics = await this.getAPIMetrics();

            return {
                sessions: {
                    active: parseInt(activeSessions[0]?.count || 0)
                },
                registrations: {
                    recentCount: parseInt(recentRegistrations[0]?.count || 0)
                },
                api: apiMetrics
            };
        } catch (error) {
            this.logger.error('Failed to get application metrics:', error);
            return {
                sessions: { active: 0 },
                registrations: { recentCount: 0 },
                api: { requests: 0, errors: 0, avgResponseTime: 0 }
            };
        }
    }

    async getSecurityMetrics() {
        try {
            // Failed login attempts in last hour
            const [failedLogins] = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM login_attempts 
                WHERE success = FALSE AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            // Suspicious activities in last hour
            const [suspiciousActivities] = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM security_events 
                WHERE event_type = 'suspicious_activity' 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            // Active account lockouts
            const [activeLockouts] = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM account_lockouts 
                WHERE is_active = TRUE
            `);

            // Blocked IPs (from rate limiting)
            const [blockedIPs] = await this.db.query(`
                SELECT COUNT(DISTINCT identifier) as count 
                FROM rate_limit_tracking 
                WHERE is_blocked = TRUE AND block_expires_at > NOW()
            `);

            return {
                failedLogins: parseInt(failedLogins[0]?.count || 0),
                suspiciousActivities: parseInt(suspiciousActivities[0]?.count || 0),
                activeLockouts: parseInt(activeLockouts[0]?.count || 0),
                blockedIPs: parseInt(blockedIPs[0]?.count || 0)
            };
        } catch (error) {
            this.logger.error('Failed to get security metrics:', error);
            return {
                failedLogins: 0,
                suspiciousActivities: 0,
                activeLockouts: 0,
                blockedIPs: 0
            };
        }
    }

    async getCPUUsage() {
        return new Promise((resolve) => {
            const startMeasure = process.cpuUsage();
            
            setTimeout(() => {
                const endMeasure = process.cpuUsage(startMeasure);
                const totalUsage = (endMeasure.user + endMeasure.system) / 1000000; // Convert to seconds
                const percentage = (totalUsage / 0.1) * 100; // 100ms measurement period
                resolve(Math.min(percentage, 100));
            }, 100);
        });
    }

    async getDiskUsage() {
        try {
            const stats = await fs.stat(process.cwd());
            // This is a simplified implementation
            // In production, you'd want to use a more accurate disk usage calculation
            return {
                total: 0,
                used: 0,
                free: 0,
                usagePercent: 0
            };
        } catch (error) {
            return {
                total: 0,
                used: 0,
                free: 0,
                usagePercent: 0
            };
        }
    }

    async getAPIMetrics() {
        // This would be populated by middleware that tracks API calls
        return {
            requests: this.metrics.requests.total,
            errors: this.metrics.requests.errors,
            avgResponseTime: this.metrics.requests.avgResponseTime
        };
    }

    // ============================
    // ALERTING SYSTEM
    // ============================

    async checkThresholds(metrics) {
        const alerts = [];

        // CPU usage alert
        if (metrics.system.cpu.usage > this.alertThresholds.cpuUsage) {
            alerts.push({
                type: 'cpu_high',
                severity: 'warning',
                message: `High CPU usage: ${metrics.system.cpu.usage.toFixed(2)}%`,
                value: metrics.system.cpu.usage,
                threshold: this.alertThresholds.cpuUsage
            });
        }

        // Memory usage alert
        if (metrics.system.memory.usagePercent > this.alertThresholds.memoryUsage) {
            alerts.push({
                type: 'memory_high',
                severity: 'warning',
                message: `High memory usage: ${metrics.system.memory.usagePercent.toFixed(2)}%`,
                value: metrics.system.memory.usagePercent,
                threshold: this.alertThresholds.memoryUsage
            });
        }

        // Database connection alert
        const dbConnectionPercent = (metrics.database.connections.current / metrics.database.connections.max) * 100;
        if (dbConnectionPercent > this.alertThresholds.activeConnections) {
            alerts.push({
                type: 'db_connections_high',
                severity: 'critical',
                message: `High database connections: ${metrics.database.connections.current}/${metrics.database.connections.max}`,
                value: dbConnectionPercent,
                threshold: this.alertThresholds.activeConnections
            });
        }

        // Security alerts
        if (metrics.security.failedLogins > 10) {
            alerts.push({
                type: 'security_failed_logins',
                severity: 'high',
                message: `High number of failed logins: ${metrics.security.failedLogins} in last hour`,
                value: metrics.security.failedLogins,
                threshold: 10
            });
        }

        if (metrics.security.suspiciousActivities > 5) {
            alerts.push({
                type: 'security_suspicious',
                severity: 'critical',
                message: `Suspicious activities detected: ${metrics.security.suspiciousActivities} in last hour`,
                value: metrics.security.suspiciousActivities,
                threshold: 5
            });
        }

        // Process alerts for new alerts
        for (const alert of alerts) {
            await this.processAlert(alert);
        }

        return alerts;
    }

    async processAlert(alert) {
        // Add timestamp and ID
        alert.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        alert.timestamp = new Date().toISOString();

        // Store alert
        this.alerts.push(alert);
        
        // Log alert
        this.logger.warn(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`, alert);

        // Store in database
        try {
            await this.db.query(`
                INSERT INTO security_events (
                    event_type, severity, details, created_at
                ) VALUES ('system_alert', ?, ?, NOW())
            `, [alert.severity, JSON.stringify(alert)]);
        } catch (error) {
            this.logger.error('Failed to store alert in database:', error);
        }

        // Send notification (implement based on your notification system)
        await this.sendAlert(alert);

        // Keep only last 100 alerts in memory
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }

    async sendAlert(alert) {
        // Implement your notification system here
        // Examples: email, Slack, SMS, webhook, etc.
        
        if (alert.severity === 'critical') {
            // Send immediate notification for critical alerts
            console.log(`🚨 CRITICAL ALERT: ${alert.message}`);
        }
    }

    // ============================
    // METRICS STORAGE
    // ============================

    async storeMetrics(metrics) {
        try {
            // Store in a metrics table (create if needed)
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metrics_data JSON NOT NULL,
                    
                    INDEX idx_metrics_timestamp (timestamp)
                )
            `);

            await this.db.query(`
                INSERT INTO system_metrics (metrics_data) VALUES (?)
            `, [JSON.stringify(metrics)]);

            // Clean up old metrics (keep last 30 days)
            await this.db.query(`
                DELETE FROM system_metrics 
                WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

        } catch (error) {
            this.logger.error('Failed to store metrics:', error);
        }
    }

    // ============================
    // MONITORING CONTROL
    // ============================

    startMonitoring(intervalMs = 60000) {
        if (this.isMonitoring) {
            this.logger.warn('Monitoring is already running');
            return;
        }

        this.isMonitoring = true;
        this.logger.info(`Starting system monitoring with ${intervalMs}ms interval`);

        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectSystemMetrics();
            } catch (error) {
                this.logger.error('Error during monitoring cycle:', error);
            }
        }, intervalMs);

        // Initial collection
        this.collectSystemMetrics();
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.isMonitoring = false;
        this.logger.info('System monitoring stopped');
    }

    // ============================
    // REPORTING
    // ============================

    async generateReport(timeRange = '1h') {
        try {
            const interval = this.parseTimeRange(timeRange);
            
            const [metrics] = await this.db.query(`
                SELECT metrics_data, timestamp 
                FROM system_metrics 
                WHERE timestamp > DATE_SUB(NOW(), INTERVAL ${interval})
                ORDER BY timestamp DESC
            `);

            if (metrics.length === 0) {
                return { error: 'No metrics data available for the specified time range' };
            }

            // Aggregate metrics
            const report = this.aggregateMetrics(metrics);
            
            return {
                timeRange,
                period: `${metrics[metrics.length - 1].timestamp} to ${metrics[0].timestamp}`,
                dataPoints: metrics.length,
                summary: report.summary,
                trends: report.trends,
                alerts: this.alerts.filter(a => 
                    new Date(a.timestamp) > new Date(Date.now() - this.parseTimeRangeMs(timeRange))
                )
            };

        } catch (error) {
            this.logger.error('Failed to generate report:', error);
            return { error: 'Failed to generate report' };
        }
    }

    aggregateMetrics(metrics) {
        const summary = {
            cpu: { avg: 0, max: 0, min: 100 },
            memory: { avg: 0, max: 0, min: 100 },
            database: { avgConnections: 0, maxConnections: 0 },
            security: { totalFailedLogins: 0, totalSuspiciousActivities: 0 }
        };

        let validMetrics = 0;

        for (const metric of metrics) {
            try {
                const data = JSON.parse(metric.metrics_data);
                
                if (data.system?.cpu?.usage !== undefined) {
                    summary.cpu.avg += data.system.cpu.usage;
                    summary.cpu.max = Math.max(summary.cpu.max, data.system.cpu.usage);
                    summary.cpu.min = Math.min(summary.cpu.min, data.system.cpu.usage);
                }

                if (data.system?.memory?.usagePercent !== undefined) {
                    summary.memory.avg += data.system.memory.usagePercent;
                    summary.memory.max = Math.max(summary.memory.max, data.system.memory.usagePercent);
                    summary.memory.min = Math.min(summary.memory.min, data.system.memory.usagePercent);
                }

                if (data.database?.connections?.current !== undefined) {
                    summary.database.avgConnections += data.database.connections.current;
                    summary.database.maxConnections = Math.max(summary.database.maxConnections, data.database.connections.current);
                }

                if (data.security?.failedLogins !== undefined) {
                    summary.security.totalFailedLogins += data.security.failedLogins;
                }

                if (data.security?.suspiciousActivities !== undefined) {
                    summary.security.totalSuspiciousActivities += data.security.suspiciousActivities;
                }

                validMetrics++;
            } catch (error) {
                this.logger.warn('Invalid metrics data:', error);
            }
        }

        if (validMetrics > 0) {
            summary.cpu.avg /= validMetrics;
            summary.memory.avg /= validMetrics;
            summary.database.avgConnections /= validMetrics;
        }

        return {
            summary,
            trends: this.calculateTrends(metrics)
        };
    }

    calculateTrends(metrics) {
        // Simple trend calculation (could be more sophisticated)
        if (metrics.length < 2) return {};

        const recent = JSON.parse(metrics[0].metrics_data);
        const older = JSON.parse(metrics[Math.floor(metrics.length / 2)].metrics_data);

        return {
            cpu: this.calculateTrend(older.system?.cpu?.usage, recent.system?.cpu?.usage),
            memory: this.calculateTrend(older.system?.memory?.usagePercent, recent.system?.memory?.usagePercent),
            database: this.calculateTrend(older.database?.connections?.current, recent.database?.connections?.current)
        };
    }

    calculateTrend(oldValue, newValue) {
        if (oldValue === undefined || newValue === undefined) return 'unknown';
        
        const change = ((newValue - oldValue) / oldValue) * 100;
        
        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }

    parseTimeRange(timeRange) {
        const ranges = {
            '1h': '1 HOUR',
            '6h': '6 HOUR',
            '12h': '12 HOUR',
            '1d': '1 DAY',
            '1w': '1 WEEK',
            '1m': '1 MONTH'
        };
        
        return ranges[timeRange] || '1 HOUR';
    }

    parseTimeRangeMs(timeRange) {
        const ranges = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '12h': 12 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1m': 30 * 24 * 60 * 60 * 1000
        };
        
        return ranges[timeRange] || 60 * 60 * 1000;
    }

    // ============================
    // PUBLIC API
    // ============================

    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            alertCount: this.alerts.length,
            lastMetrics: this.metrics,
            thresholds: this.alertThresholds
        };
    }

    getRecentAlerts(limit = 10) {
        return this.alerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    updateThresholds(newThresholds) {
        this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
        this.logger.info('Alert thresholds updated:', newThresholds);
    }

    // Middleware to track API metrics
    createMetricsMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Track request
            this.metrics.requests.total++;
            
            // Override res.end to capture response time
            const originalEnd = res.end;
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                
                // Update average response time
                this.metrics.requests.avgResponseTime = 
                    (this.metrics.requests.avgResponseTime + responseTime) / 2;
                
                // Track errors
                if (res.statusCode >= 400) {
                    this.metrics.requests.errors++;
                }
                
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }
}

module.exports = { SystemMonitor };
