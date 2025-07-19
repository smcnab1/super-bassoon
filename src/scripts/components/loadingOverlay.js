let loadingOverlayShownAt = Date.now();
let overlayHidden = false;

function hideLoadingOverlay() {
  if (overlayHidden) return;
  overlayHidden = true;
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const minVisible = 1000; // ms (increased for visibility)
    const elapsed = Date.now() - loadingOverlayShownAt;
    const delay = Math.max(0, minVisible - elapsed);
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 500); // matches CSS transition
    }, delay);
  }
}
window.hideLoadingOverlay = hideLoadingOverlay;

function showLoadingOverlay() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    // Re-inject the overlay HTML synchronously
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../../components/LoadingOverlay.html', false);
    xhr.send(null);
    if (xhr.status === 200) {
      var temp = document.createElement('div');
      temp.innerHTML = xhr.responseText;
      overlay = temp.firstElementChild;
      document.body.insertBefore(overlay, document.body.firstChild);
    }
  } else {
    overlay.classList.remove('fade-out');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
  }
  loadingOverlayShownAt = Date.now();
  overlayHidden = false;
}
window.showLoadingOverlay = showLoadingOverlay;

// Dynamic Loading Overlay Component
function initLoadingOverlay() {
  // Get the current page path to determine relative paths
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');
  
  // Use absolute path from root for logo
  const logoPath = '/public/';

  // Update the loading overlay HTML with correct path
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <img src="${logoPath}images/logo.png" alt="ModuMate Logo" style="width: 64px; height: 64px; object-fit: contain;" />
        <div style="font-size: 1.4rem; font-weight: 700; color: #4a90e2; letter-spacing: -1px;">ModuMate</div>
        <div class="loader"></div>
      </div>
    `;
  }
}

// Initialize loading overlay when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initLoadingOverlay();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initLoadingOverlay };
} 