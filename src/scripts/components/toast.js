/**
 * Toast Notification Component
 * Provides a reusable toast notification system across the application
 */

/**
 * Loads the Toast component into the specified container (or body if not found).
 * @param {string} targetSelector - The selector for the container to inject the component into. Defaults to #toastContainer.
 */
export function loadToast(targetSelector = '#toastContainer') {
  // Prevent duplicate injection
  if (document.getElementById('toast')) return;
  fetch('../../../components/Toast.html')
    .then(response => response.text())
    .then(html => {
      let container = document.querySelector(targetSelector);
      if (!container) {
        // Fallback: inject into body
        container = document.body;
      }
      // Only inject if not already present
      if (!document.getElementById('toast')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const toastDiv = tempDiv.querySelector('#toast');
        if (toastDiv) container.appendChild(toastDiv);
      }
    });
}

/**
 * Shows a toast notification with the specified message and type
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('info', 'success', 'error', 'warning')
 */
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  
  // Create toast element if it doesn't exist
  if (!toast) {
    // Try to find the toast container first
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
      // Load the toast HTML if not already loaded
      if (!toastContainer.querySelector('#toast')) {
        fetch('../../../components/Toast.html')
          .then(response => response.text())
          .then(html => {
            toastContainer.innerHTML = html;
            // Now try to show the toast again
            setTimeout(() => showToast(message, type), 100);
          })
          .catch(() => {
            // Fallback: create toast directly in body
            createToastInBody(message, type);
          });
        return;
      }
    } else {
      // Fallback: create toast directly in body
      createToastInBody(message, type);
      return;
    }
  }
  
  // Reset classes and set new ones
  toast.className = 'toast-notification';
  toast.classList.add('show', `toast-${type}`);
  toast.textContent = message;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.style.display = 'none';
      toast.className = 'toast-notification';
    }, 500);
  }, 3000);
  
  toast.style.display = 'block';
}

function createToastInBody(message, type) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  
  // Reset classes and set new ones
  toast.className = 'toast-notification';
  toast.classList.add('show', `toast-${type}`);
  toast.textContent = message;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.style.display = 'none';
      toast.className = 'toast-notification';
    }, 500);
  }, 3000);
  
  toast.style.display = 'block';
}

/**
 * Shows a success toast notification
 * @param {string} message - The success message to display
 */
function showSuccessToast(message) {
  showToast(message, 'success');
}

/**
 * Shows an error toast notification
 * @param {string} message - The error message to display
 */
function showErrorToast(message) {
  showToast(message, 'error');
}

/**
 * Shows a warning toast notification
 * @param {string} message - The warning message to display
 */
function showWarningToast(message) {
  showToast(message, 'warning');
}

/**
 * Shows an info toast notification
 * @param {string} message - The info message to display
 */
function showInfoToast(message) {
  showToast(message, 'info');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast
  };
} 