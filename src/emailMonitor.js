/**
 * Email Monitoring System
 * Handles email parsing, monitoring, and notifications
 */

const Utils = require('./utils');

class EmailMonitor {
  constructor() {
    this.emails = [];
    this.filters = [];
    this.nextEmailId = 1;
    this.subscribers = new Map();
  }

  /**
   * Add an email to monitor
   * @param {string} from - Sender email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {object} metadata - Additional metadata
   * @returns {object} Result
   */
  addEmail(from, to, subject, body, metadata = {}) {
    const email = {
      id: this.nextEmailId++,
      from: from,
      to: to,
      subject: subject,
      body: body,
      metadata: metadata,
      receivedAt: new Date().toISOString(),
      flagged: false,
      priority: 'NORMAL',
      status: 'UNREAD',
      tags: []
    };

    this.emails.push(email);
    this.notifySubscribers(email);

    Utils.log(`Email received from ${from}`, 'info');

    return { success: true, email: email };
  }

  /**
   * Parse email for suspicious content
   * @param {string} emailBody - Email body text
   * @returns {object} Analysis result
   */
  analyzeSuspiciousContent(emailBody) {
    const analysis = {
      isSuspicious: false,
      risks: [],
      score: 0
    };

    const suspiciousPatterns = {
      phishing: [
        /verify.*account/i,
        /confirm.*identity/i,
        /update.*password/i,
        /click.*link.*immediately/i,
        /urgent.*action.*required/i
      ],
      malware: [
        /execute.*script/i,
        /download.*attachment/i,
        /enable.*macros/i,
        /run.*installer/i
      ],
      spam: [
        /congratulations.*won/i,
        /claim.*prize/i,
        /urgent.*money/i,
        /nigerian.*prince/i
      ]
    };

    Object.entries(suspiciousPatterns).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(emailBody)) {
          analysis.risks.push(type.toUpperCase());
          analysis.score += 25;
        }
      });
    });

    analysis.isSuspicious = analysis.score > 25;
    return analysis;
  }

  /**
   * Get emails with filters
   * @param {object} filters - Filter options
   * @returns {array} Filtered emails
   */
  getEmails(filters = {}) {
    let filtered = [...this.emails];

    if (filters.from) {
      filtered = filtered.filter(e => e.from.includes(filters.from));
    }

    if (filters.to) {
      filtered = filtered.filter(e => e.to.includes(filters.to));
    }

    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.flagged !== undefined) {
      filtered = filtered.filter(e => e.flagged === filters.flagged);
    }

    if (filters.startDate) {
      filtered = filtered.filter(e => new Date(e.receivedAt) >= new Date(filters.startDate));
    }

    return filtered.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  }

  /**
   * Mark email as read
   * @param {number} emailId - Email ID
   * @returns {object} Result
   */
  markAsRead(emailId) {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      email.status = 'READ';
      return { success: true, message: 'Email marked as read' };
    }
    return { success: false, message: 'Email not found' };
  }

  /**
   * Flag email for review
   * @param {number} emailId - Email ID
   * @param {string} reason - Reason for flagging
   * @returns {object} Result
   */
  flagEmail(emailId, reason = '') {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      email.flagged = true;
      if (reason) email.tags.push(`flagged: ${reason}`);
      Utils.log(`Email #${emailId} flagged: ${reason}`, 'warn');
      return { success: true, message: 'Email flagged' };
    }
    return { success: false, message: 'Email not found' };
  }

  /**
   * Add filter rule
   * @param {object} rule - Filter rule
   * @returns {object} Result
   */
  addFilter(rule) {
    this.filters.push({
      id: Utils.generateUUID(),
      ...rule,
      createdAt: new Date().toISOString()
    });
    return { success: true, message: 'Filter added' };
  }

  /**
   * Subscribe to email notifications
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function
   */
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }
    this.subscribers.get(userId).push(callback);
  }

  /**
   * Notify subscribers of new email
   * @param {object} email - Email object
   */
  notifySubscribers(email) {
    this.subscribers.forEach((callbacks) => {
      callbacks.forEach(callback => {
        try {
          callback(email);
        } catch (error) {
          Utils.log(`Email notification error: ${error.message}`, 'error');
        }
      });
    });
  }

  /**
   * Get email statistics
   * @returns {object} Statistics
   */
  getStatistics() {
    return {
      total: this.emails.length,
      unread: this.emails.filter(e => e.status === 'UNREAD').length,
      flagged: this.emails.filter(e => e.flagged).length,
      suspicious: this.emails.filter(e => {
        const analysis = this.analyzeSuspiciousContent(e.body);
        return analysis.isSuspicious;
      }).length
    };
  }

  /**
   * Display email dashboard
   */
  displayDashboard() {
    const stats = this.getStatistics();
    const recentEmails = this.getEmails().slice(0, 5);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                EMAIL MONITORING DASHBOARD                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Statistics:');
    console.log(`   Total Emails: ${stats.total}`);
    console.log(`   📨 Unread: ${stats.unread}`);
    console.log(`   🚩 Flagged: ${stats.flagged}`);
    console.log(`   ⚠️  Suspicious: ${stats.suspicious}`);

    console.log('\n📬 Recent Emails:');
    recentEmails.forEach((email, index) => {
      const flag = email.flagged ? '🚩' : '  ';
      console.log(`   ${flag} ${index + 1}. [${email.status}] From: ${email.from}`);
      console.log(`      Subject: ${email.subject}`);
      console.log(`      Received: ${Utils.timeAgo(email.receivedAt)}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗\n');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailMonitor;
}
