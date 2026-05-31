/**
 * Digital Clock with Multiple Time Zones
 * Displays current time in different time zones
 */

class DigitalClock {
  constructor(timeZones = []) {
    this.timeZones = timeZones.length > 0 ? timeZones : [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Dubai',
      'Australia/Sydney'
    ];
    this.updateInterval = null;
  }

  /**
   * Format time for a specific timezone
   * @param {string} timeZone - IANA timezone string
   * @returns {string} Formatted time string
   */
  getTimeInZone(timeZone) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return formatter.format(now);
    } catch (error) {
      return 'Invalid TZ';
    }
  }

  /**
   * Get timezone offset from UTC
   * @param {string} timeZone - IANA timezone string
   * @returns {string} UTC offset (e.g., "+05:30", "-08:00")
   */
  getTimezoneOffset(timeZone) {
    try {
      const now = new Date();
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timeZone }));
      const offset = (tzDate - utcDate) / (1000 * 60);
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Display all clocks in console
   */
  displayClocks() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          DIGITAL CLOCK - WORLD TIME ZONES                  ║');
    console.log('║                  ' + new Date().toLocaleString() + '                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    this.timeZones.forEach((tz, index) => {
      const time = this.getTimeInZone(tz);
      const offset = this.getTimezoneOffset(tz);
      const tzName = tz.split('/')[1] || tz;
      
      console.log(`${String(index + 1).padStart(2, ' ')}. ${tzName.padEnd(20, ' ')} │ ${time} │ UTC ${offset}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Press Ctrl+C to stop                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }

  /**
   * Start the clock - updates display every second
   */
  start() {
    this.displayClocks();
    this.updateInterval = setInterval(() => {
      this.displayClocks();
    }, 1000);
  }

  /**
   * Stop the clock
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      console.log('Clock stopped.');
    }
  }

  /**
   * Add a timezone to the display
   * @param {string} timeZone - IANA timezone string
   */
  addTimeZone(timeZone) {
    if (!this.timeZones.includes(timeZone)) {
      this.timeZones.push(timeZone);
    }
  }

  /**
   * Remove a timezone from the display
   * @param {string} timeZone - IANA timezone string
   */
  removeTimeZone(timeZone) {
    this.timeZones = this.timeZones.filter(tz => tz !== timeZone);
  }

  /**
   * Get list of available timezones
   * @returns {string[]} Array of IANA timezone strings
   */
  static getAvailableTimeZones() {
    return Intl.supportedValuesOf('timeZone');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DigitalClock;
}

// Example usage (uncomment to run):
/*
const clock = new DigitalClock();
clock.start();

// Stop with Ctrl+C or call:
// clock.stop();

// Add custom timezone
// clock.addTimeZone('Asia/Bangkok');
// clock.addTimeZone('Africa/Cairo');
*/
