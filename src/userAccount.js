/**
 * User Account Management System
 * Handles user registration, authentication, and profile management
 */

const Utils = require('./utils');

class UserAccount {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.nextUserId = 1;
  }

  /**
   * Register a new user account
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {object} Registration result
   */
  register(email, password, username) {
    // Validate inputs
    if (!Utils.isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (this.users.get(email)) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordStrength = Utils.validatePassword(password);
    if (passwordStrength.level === 'Weak') {
      return { 
        success: false, 
        message: 'Password too weak',
        feedback: passwordStrength.feedback
      };
    }

    // Create new user
    const userId = this.nextUserId++;
    const user = {
      id: userId,
      email: email,
      username: username,
      passwordHash: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLogin: null,
      accountStatus: 'active',
      twoFactorEnabled: false,
      profile: {
        firstName: '',
        lastName: '',
        phone: '',
        organization: ''
      }
    };

    this.users.set(email, user);
    
    Utils.log(`New user registered: ${username}`, 'info');
    
    return { 
      success: true, 
      message: 'User registered successfully',
      userId: userId
    };
  }

  /**
   * Authenticate user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Authentication result
   */
  login(email, password) {
    const user = this.users.get(email);

    if (!user) {
      Utils.log(`Login failed: User not found (${email})`, 'warn');
      return { success: false, message: 'Invalid credentials' };
    }

    if (!this.verifyPassword(password, user.passwordHash)) {
      Utils.log(`Login failed: Wrong password (${email})`, 'warn');
      return { success: false, message: 'Invalid credentials' };
    }

    if (user.accountStatus !== 'active') {
      return { success: false, message: 'Account is not active' };
    }

    // Create session
    const sessionToken = Utils.generateUUID();
    const session = {
      userId: user.id,
      email: email,
      token: sessionToken,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.sessions.set(sessionToken, session);
    user.lastLogin = new Date().toISOString();

    Utils.log(`User logged in: ${email}`, 'info');

    return { 
      success: true, 
      message: 'Login successful',
      sessionToken: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }

  /**
   * Logout user
   * @param {string} sessionToken - Session token
   * @returns {object} Logout result
   */
  logout(sessionToken) {
    if (this.sessions.has(sessionToken)) {
      const session = this.sessions.get(sessionToken);
      this.sessions.delete(sessionToken);
      Utils.log(`User logged out: ${session.email}`, 'info');
      return { success: true, message: 'Logged out successfully' };
    }
    return { success: false, message: 'Invalid session' };
  }

  /**
   * Validate session token
   * @param {string} sessionToken - Session token
   * @returns {boolean} True if valid
   */
  validateSession(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (!session) return false;

    const expiresAt = new Date(session.expiresAt);
    return expiresAt > new Date();
  }

  /**
   * Get user profile
   * @param {string} sessionToken - Session token
   * @returns {object} User profile
   */
  getUserProfile(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return { success: false, message: 'Invalid session' };
    }

    const user = this.users.get(session.email);
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile: user.profile
      }
    };
  }

  /**
   * Update user profile
   * @param {string} sessionToken - Session token
   * @param {object} profileData - Profile data to update
   * @returns {object} Update result
   */
  updateProfile(sessionToken, profileData) {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return { success: false, message: 'Invalid session' };
    }

    const user = this.users.get(session.email);
    user.profile = Utils.mergeObjects(user.profile, profileData);

    Utils.log(`Profile updated: ${user.email}`, 'info');

    return { 
      success: true, 
      message: 'Profile updated successfully',
      profile: user.profile
    };
  }

  /**
   * Simple password hashing (in production, use bcrypt)
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    // NOTE: This is simplified for demo. Use bcrypt in production!
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verify password
   * @param {string} password - Password to verify
   * @param {string} hash - Password hash
   * @returns {boolean} True if matches
   */
  verifyPassword(password, hash) {
    return Buffer.from(password).toString('base64') === hash;
  }

  /**
   * Get all users (admin only)
   * @returns {array} List of users
   */
  getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      accountStatus: user.accountStatus
    }));
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserAccount;
}
