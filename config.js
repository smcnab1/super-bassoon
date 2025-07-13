// Configuration file for MScSimEd Tools
// Change the password hash here to secure your application

const CONFIG = {
  // SHA-256 hash of the password (MScSimEd2025)
  // To change password: 
  // 1. Generate new hash at https://emn178.github.io/online-tools/sha256.html
  // 2. Replace the hash below
  PASSWORD_HASH: '3b3526806e720ba5d506ac710c4e59f8fd9412ed8b5d84cd2942911dbb95ecd1',
  
  // Session timeout in minutes (0 = no timeout)
  SESSION_TIMEOUT: 0,
  
  // Application settings
  APP_NAME: 'MScSimEd Tools',
  APP_VERSION: '1.0.0'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 