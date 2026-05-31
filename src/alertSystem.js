/**
 * Alert System
 * Manages security alerts and notifications
 */

const Utils = require('./utils');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertSubscribers = new Map();
    this.nextAlertId = 1;
    this.alertLevels = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL'
    };
    this.alertTypes = {
      UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
      SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
      DATA_BREACH: 'DATA_BREACH',
      SYSTEM_FAILURE: 'SYSTEM_FAILURE',
      POLICY_VIOLATION: 'POLICY_VIOLATION',
      MALWARE_DETECTED: 'MALWARE_DETECTED'
    };
  }

  /**
   * Create a new alert
   * @param {string} type - Alert type
   * @param {string} level - Alert level (LOW, MEDIUM, HIGH, CRITICAL)
   * @param {string} message - Alert message
   * @param {object} metadata - Additional metadata
   * @returns {object} Created alert
   */
  createAlert(type, level, message, metadata = {}) {
    if (!this.alertTypes[type]) {
      Utils.log(`Invalid alert type: ${type}`, 'warn');
      return { success: false, message: 'Invalid alert type' };
    }

    if (!this.alertLevels[level]) {
      Utils.log(`Invalid alert level: ${level}`, 'warn');
      return { success: false, message: 'Invalid alert level' };
    }

    const alert = {
      id: this.nextAlertId++,
      type: type,
      level: level,
      message: message,
      metadata: metadata,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null
    };

    this.alerts.push(alert);

    // Notify subscribers
    this.notifySubscribers(alert);

    // Log based on severity
    const logLevel = level === 'CRITICAL' ? 'error' : level === 'HIGH' ? 'warn' : 'info';
    Utils.log(`[${type}] ${message}`, logLevel);

    return { success: true, alert: alert };
  }

  /**
   * Get all alerts
   * @param {object} filters - Filter options
   * @returns {array} Filtered alerts
   */
  getAlerts(filters = {}) {
    let filtered = [...this.alerts];

    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    if (filters.level) {
      filtered = filtered.filter(a => a.level === filters.level);
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.endDate));
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Acknowledge an alert
   * @param {number} alertId - Alert ID
   * @param {string} userId - User ID
   * @returns {object} Result
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.find(a => a.id === alertId);

    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();

    Utils.log(`Alert #${alertId} acknowledged by user ${userId}`, 'info');

    return { success: true, message: 'Alert acknowledged', alert: alert };
  }

  /**
   * Resolve an alert
   * @param {number} alertId - Alert ID
   * @param {string} resolution - Resolution description
   * @returns {object} Result
   */
  resolveAlert(alertId, resolution) {
    const alert = this.alerts.find(a => a.id === alertId);

    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    alert.metadata.resolution = resolution;

    Utils.log(`Alert #${alertId} resolved`, 'info');

    return { success: true, message: 'Alert resolved', alert: alert };
  }

  /**
   * Subscribe to alerts
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function
   */
  subscribe(userId, callback) {
    if (!this.alertSubscribers.has(userId)) {
      this.alertSubscribers.set(userId, []);
    }
    this.alertSubscribers.get(userId).push(callback);
  }

  /**
   * Unsubscribe from alerts
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function
   */
  unsubscribe(userId, callback) {
    if (this.alertSubscribers.has(userId)) {
      const callbacks = this.alertSubscribers.get(userId);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all subscribers of new alert
   * @param {object} alert - Alert object
   */
  notifySubscribers(alert) {
    this.alertSubscribers.forEach((callbacks, userId) => {
      callbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          Utils.log(`Subscriber notification error: ${error.message}`, 'error');
        }
      });
    });
  }

  /**
   * Get alert statistics
   * @returns {object} Alert statistics
   */
  getStatistics() {
    const stats = {
      total: this.alerts.length,
      byLevel: {},
      byType: {},
      byStatus: {},
      criticalCount: 0,
      unacknowledgedCount: 0
    };

    this.alerts.forEach(alert => {
      // Count by level
      stats.byLevel[alert.level] = (stats.byLevel[alert.level] || 0) + 1;
      if (alert.level === 'CRITICAL') stats.criticalCount++;

      // Count by type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;

      // Count by status
      stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
      if (alert.status === 'ACTIVE') stats.unacknowledgedCount++;
    });

    return stats;
  }

  /**
   * Display alert dashboard
   */
  displayDashboard() {
    const stats = this.getStatistics();
    const recentAlerts = this.getAlerts().slice(0, 5);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ALERT DASHBOARD                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Statistics:');
    console.log(`   Total Alerts: ${stats.total}`);
    console.log(`   🔴 Critical: ${stats.criticalCount}`);
    console.log(`   ⚠️  Unacknowledged: ${stats.unacknowledgedCount}`);
    console.log('\n📈 By Level:');
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      console.log(`   ${level}: ${count}`);
    });

    console.log('\n🚨 Recent Alerts:');
    recentAlerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. [${alert.level}] ${alert.type}: ${alert.message}`);
      console.log(`      Created: ${Utils.timeAgo(alert.createdAt)}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗\n');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlertSystem;
}
