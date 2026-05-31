/**
 * Utilities Module
 * Helper functions and utilities for CyberShield America
 */

class Utils {
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format bytes to readable size
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted size
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format timestamp to readable date
   * @param {number|string} timestamp - Unix timestamp or date string
   * @returns {string} Formatted date
   */
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Calculate time difference from now
   * @param {number|string} timestamp - Unix timestamp or date string
   * @returns {string} Relative time (e.g., "2 hours ago")
   */
  static timeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Strength report
   */
  static validatePassword(password) {
    const strength = {
      score: 0,
      feedback: [],
      level: 'Weak'
    };

    if (password.length >= 8) strength.score++;
    else strength.feedback.push('At least 8 characters');

    if (password.length >= 12) strength.score++;
    else strength.feedback.push('Consider 12+ characters');

    if (/[a-z]/.test(password)) strength.score++;
    else strength.feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) strength.score++;
    else strength.feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) strength.score++;
    else strength.feedback.push('Add numbers');

    if (/[!@#$%^&*]/.test(password)) strength.score++;
    else strength.feedback.push('Add special characters');

    if (strength.score <= 2) strength.level = 'Weak';
    else if (strength.score <= 4) strength.level = 'Fair';
    else if (strength.score <= 5) strength.level = 'Good';
    else strength.level = 'Strong';

    return strength;
  }

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} Random string
   */
  static generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate UUID v4
   * @returns {string} UUID v4 string
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Deep clone object
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   * @param {...object} objects - Objects to merge
   * @returns {object} Merged object
   */
  static mergeObjects(...objects) {
    return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retries (default: 3)
   * @param {number} delayMs - Initial delay in ms (default: 1000)
   * @returns {Promise} Result of function
   */
  static async retry(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(delayMs * Math.pow(2, i));
      }
    }
  }

  /**
   * Log with timestamp
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌'
    };
    console.log(`${icons[level]} [${timestamp}] ${message}`);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
