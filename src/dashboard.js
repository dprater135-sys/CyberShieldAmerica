/**
 * Dashboard Module
 * Displays key metrics and system information
 */

const Utils = require('./utils');

class Dashboard {
  constructor() {
    this.metrics = {
      activeUsers: 0,
      totalAlerts: 0,
      criticalAlerts: 0,
      systemHealth: 100,
      uptime: 0,
      dataProcessed: 0,
      lastUpdated: new Date().toISOString()
    };
    this.updateInterval = null;
  }

  /**
   * Update metrics
   * @param {object} newMetrics - New metric values
   */
  updateMetrics(newMetrics) {
    this.metrics = Utils.mergeObjects(this.metrics, newMetrics);
    this.metrics.lastUpdated = new Date().toISOString();
  }

  /**
   * Calculate system health
   * @returns {number} Health percentage (0-100)
   */
  calculateSystemHealth() {
    let health = 100;

    // Reduce health based on critical alerts
    if (this.metrics.criticalAlerts > 0) {
      health -= Math.min(this.metrics.criticalAlerts * 5, 30);
    }

    // Reduce health if many total alerts
    if (this.metrics.totalAlerts > 50) {
      health -= Math.min((this.metrics.totalAlerts - 50) * 0.5, 20);
    }

    return Math.max(health, 0);
  }

  /**
   * Get system status
   * @returns {string} Status indicator
   */
  getSystemStatus() {
    const health = this.calculateSystemHealth();
    
    if (health >= 80) return '🟢 Healthy';
    if (health >= 50) return '🟡 Warning';
    if (health >= 20) return '🟠 Critical';
    return '🔴 Failure';
  }

  /**
   * Display main dashboard
   */
  displayMainDashboard() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          CyberShield America - Main Dashboard             ║');
    console.log('║                     ' + new Date().toLocaleString() + '                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const health = this.calculateSystemHealth();
    console.log('📊 System Overview:');
    console.log(`   Status: ${this.getSystemStatus()}`);
    console.log(`   Health: ${health}%`);
    console.log(`   Uptime: ${this.formatUptime(this.metrics.uptime)}`);

    console.log('\n👥 Users & Activity:');
    console.log(`   Active Users: ${this.metrics.activeUsers}`);
    console.log(`   Data Processed: ${Utils.formatBytes(this.metrics.dataProcessed)}`);

    console.log('\n🚨 Alerts:');
    console.log(`   Total: ${this.metrics.totalAlerts}`);
    console.log(`   Critical: ${this.metrics.criticalAlerts}`);
    console.log(`   Critical Percentage: ${((this.metrics.criticalAlerts / Math.max(this.metrics.totalAlerts, 1)) * 100).toFixed(2)}%`);

    console.log('\n⏰ Last Updated: ' + Utils.timeAgo(this.metrics.lastUpdated));
    console.log('\n╔════════════════════════════════════════════════════════════╗\n');
  }

  /**
   * Display metrics in table format
   */
  displayMetricsTable() {
    console.log('\n📈 Detailed Metrics:');
    console.log('┌─────────────────────────┬──────────────────────┐');
    console.log('│ Metric                  │ Value                │');
    console.log('├─────────────────────────┼──────────────────────┤');
    
    const metrics = [
      ['Active Users', this.metrics.activeUsers.toString()],
      ['Total Alerts', this.metrics.totalAlerts.toString()],
      ['Critical Alerts', this.metrics.criticalAlerts.toString()],
      ['System Health', `${this.calculateSystemHealth()}%`],
      ['Uptime', this.formatUptime(this.metrics.uptime)],
      ['Data Processed', Utils.formatBytes(this.metrics.dataProcessed)],
      ['Last Updated', Utils.timeAgo(this.metrics.lastUpdated)]
    ];

    metrics.forEach(([metric, value]) => {
      console.log(`│ ${metric.padEnd(23, ' ')} │ ${value.padEnd(20, ' ')} │`);
    });

    console.log('└─────────────────────────┴──────────────────────┘\n');
  }

  /**
   * Format uptime
   * @param {number} seconds - Uptime in seconds
   * @returns {string} Formatted uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Get health color for visualization
   * @returns {string} Color code
   */
  getHealthColor() {
    const health = this.calculateSystemHealth();
    if (health >= 80) return '🟢';
    if (health >= 50) return '🟡';
    if (health >= 20) return '🟠';
    return '🔴';
  }

  /**
   * Display health gauge
   */
  displayHealthGauge() {
    const health = this.calculateSystemHealth();
    const barLength = 30;
    const filled = Math.round((health / 100) * barLength);
    const empty = barLength - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`\n🏥 System Health: ${bar} ${health}%`);
  }

  /**
   * Generate report
   * @returns {object} Dashboard report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      status: this.getSystemStatus(),
      health: this.calculateSystemHealth(),
      metrics: this.metrics,
      summary: {
        uptime: this.formatUptime(this.metrics.uptime),
        alertRate: (this.metrics.totalAlerts / Math.max(this.metrics.activeUsers, 1)).toFixed(2),
        criticalPercentage: ((this.metrics.criticalAlerts / Math.max(this.metrics.totalAlerts, 1)) * 100).toFixed(2)
      }
    };
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}
