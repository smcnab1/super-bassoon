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
  
  if (currentPath.includes('/timetable/preset/')) {
    return '../../index.html';
  } else if (currentPath.includes('/timetable/')) {
    return '../index.html';
  } else {
    return 'index.html';
  }
}

// Check if user is authenticated
function checkAuth() {
  const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = getIndexPath();
    return false;
  }
  return true;
}

// Logout function
function logout() {
  // Clear all session storage
  sessionStorage.clear();
  
  // Clear all local storage except theme preference
  const currentTheme = localStorage.getItem('theme');
  localStorage.clear();
  if (currentTheme) {
    localStorage.setItem('theme', currentTheme);
  }
  
  window.location.href = '/index.html';
}

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication on page load
  if (!checkAuth()) {
    return;
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