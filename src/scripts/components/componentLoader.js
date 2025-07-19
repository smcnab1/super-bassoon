// Component Loader Utility
// Shared functions for dynamically loading components across pages

function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    fetch('../../../components/Navbar.html')
      .then(response => response.text())
      .then(html => {
        navbarContainer.innerHTML = html;
        // Dynamically load Navbar JS if needed
        const script = document.createElement('script');
        script.src = '../../../scripts/components/Navbar.js';
        script.onload = function() {
          if (window.initNavbar) window.initNavbar();
        };
        document.body.appendChild(script);
      });
  }
}

function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    fetch('../../../components/Footer.html')
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
      });
  }
}

function loadToast() {
  const toastContainer = document.getElementById('toastContainer');
  if (toastContainer) {
    fetch('../../../components/Toast.html')
      .then(response => response.text())
      .then(html => {
        toastContainer.innerHTML = html;
      });
  }
}

function loadPageTools() {
  const pageToolsContainer = document.getElementById('pageToolsContainer');
  if (pageToolsContainer) {
    fetch('../../../components/PageTools.html')
      .then(response => response.text())
      .then(html => {
        pageToolsContainer.innerHTML = html;
        // Initialize page tools with auto-detection, hidden by default
        if (typeof initPageTools === 'function') {
          initPageTools({ show: false });
        }
      });
  }
}

// Make functions globally available
window.loadNavbar = loadNavbar;
window.loadFooter = loadFooter;
window.loadToast = loadToast;
window.loadPageTools = loadPageTools; 