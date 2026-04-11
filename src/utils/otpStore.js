/**
 * Simple In-Memory OTP Store
 * Since we are not using a database (per requirement), 
 * we use a JS Map with automatic cleanup logic.
 */

const otpStore = new Map();

/**
 * Saves an OTP for a specific email
 */
const saveOTP = (email, otpData) => {
  otpStore.set(email.toLowerCase(), {
    ...otpData,
    createdAt: Date.now()
  });
};

/**
 * Retrieves an OTP for a specific email
 */
const getOTP = (email) => {
  return otpStore.get(email.toLowerCase());
};

/**
 * Deletes an OTP after use or expiry
 */
const deleteOTP = (email) => {
  otpStore.delete(email.toLowerCase());
};

module.exports = { saveOTP, getOTP, deleteOTP };
