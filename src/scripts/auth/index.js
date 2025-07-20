// Authentication System for MScSimEd Tools
// This script provides password protection for all pages

// SHA-256 hash of the correct password
const CORRECT_PASSWORD_HASH = '3b3526806e720ba5d506ac710c4e59f8fd9412ed8b5d84cd2942911dbb95ecd1';

// SHA-256 hashing function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Determine the correct path to index.html based on current page location
function getIndexPath() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/assessments/brief/')) {
    return '../../pages/index.html';
  } else if (currentPath.includes('/assessments/overview/')) {
    return '../../pages/index.html';
  } else if (currentPath.includes('/module-overview/')) {
    return '../../pages/index.html';
  } else if (currentPath.includes('/module-team/')) {
    return '../../pages/index.html';
  } else if (currentPath.includes('/timetable /')) {
    return '../../pages/index.html';
  } else {
    return '../../pages/index.html';
  }
}

// Check if user is authenticated
function checkAuth() {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  // Only redirect if NOT on the login page
  const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (!isAuthenticated && !isLoginPage) {
    // Redirect to login page
    window.location.href = getIndexPath();
    return false;
  }
  return true;
}

// Logout function
function logout() {
  // Remove only the authenticated flag
  localStorage.removeItem('authenticated');
  // Clear all local storage except theme preference
  const currentTheme = localStorage.getItem('theme');
  // Optionally clear other app-specific keys here if needed
  localStorage.clear();
  if (currentTheme) {
    localStorage.setItem('theme', currentTheme);
  }
  window.location.href = '../../pages/index.html';
}

// --- Additions for login page authentication ---

// Show login screen (for login page only)
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('password').focus();
  // Only hide overlay after login screen is visible
  if (typeof window.hideLoadingOverlay === 'function') window.hideLoadingOverlay();
  // Do NOT load footer here
}

// Show main application (for login page only)
function showMainApp() {
  // Show loading overlay for transition
  if (typeof window.showLoadingOverlay === 'function') window.showLoadingOverlay();
  // Hide login screen
  document.getElementById('loginScreen').style.display = 'none';
  // Wait a short moment for overlay to be visible
  setTimeout(function() {
    document.getElementById('mainApp').style.display = 'block';
    if (typeof initTheme === 'function') {
      initTheme();
    }
    // Load navbar and footer if functions exist
    if (typeof window.loadNavbar === 'function') window.loadNavbar();
    if (typeof window.loadFooter === 'function') window.loadFooter();
    // Hide overlay after main app is ready
    if (typeof window.hideLoadingOverlay === 'function') window.hideLoadingOverlay();
  }, 400); // 400ms for smooth transition
}

// Authenticate user (for login page only)
async function authenticate(event) {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  try {
    if (!password) {
      errorDiv.textContent = '❌ Incorrect password. Please try again.';
      errorDiv.style.display = 'block';
      document.getElementById('password').focus();
      return;
    }
    const passwordHash = await sha256(password);
    if (passwordHash === (typeof CONFIG !== 'undefined' ? CONFIG.PASSWORD_HASH : CORRECT_PASSWORD_HASH)) {
      localStorage.setItem('authenticated', 'true');
      showMainApp();
      errorDiv.style.display = 'none';
      document.getElementById('password').value = '';
    } else {
      errorDiv.textContent = '❌ Incorrect password. Please try again.';
      errorDiv.style.display = 'block';
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    errorDiv.textContent = '❌ Incorrect password. Please try again.';
    errorDiv.style.display = 'block';
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
  }
}

// Expose functions for login page usage
window.authenticate = authenticate;
window.showLoginScreen = showLoginScreen;
window.showMainApp = showMainApp;
window.sha256 = sha256;
// Attach navbar/footer loaders to window if defined globally
if (typeof loadNavbar === 'function') window.loadNavbar = loadNavbar;
if (typeof loadFooter === 'function') window.loadFooter = loadFooter;

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication on page load
  if (!checkAuth()) {
    return;
  }

  // If on the login page, show the correct screen based on authentication
  const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (isLoginPage) {
    if (localStorage.getItem('authenticated') === 'true') {
      showMainApp();
    } else {
      showLoginScreen();
    }
  } else {
    if (typeof window.hideLoadingOverlay === 'function') window.hideLoadingOverlay();
  }

  // Password visibility toggle for login form
  var passwordInput = document.getElementById('password');
  var togglePasswordBtn = document.getElementById('togglePassword');
  var togglePasswordIcon = document.getElementById('togglePasswordIcon');
  if (passwordInput && togglePasswordBtn && togglePasswordIcon) {
    passwordInput.type = 'password';
    togglePasswordIcon.className = 'fa fa-eye';
    togglePasswordBtn.setAttribute('aria-label', 'Show password');
    togglePasswordBtn.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordIcon.className = isPassword ? 'fa fa-eye-slash' : 'fa fa-eye';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  // Add logout button to navbar if it doesn't exist
  const navbarLinks = document.querySelector('.navbar-links');
  if (navbarLinks && !document.querySelector('.logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.onclick = logout;
    logoutBtn.title = 'Logout';
    logoutBtn.innerHTML = '🚪';
    navbarLinks.appendChild(logoutBtn);
  }
});

// Add logout button styles if not already present
if (!document.querySelector('#auth-styles')) {
  const style = document.createElement('style');
  style.id = 'auth-styles';
  style.textContent = `
    .logout-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `;
  document.head.appendChild(style);
} 