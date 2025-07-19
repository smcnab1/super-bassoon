// --- ResetModal Component Loader and Logic ---

/**
 * Loads the ResetModal component and attaches all event listeners.
 * @param {string} [targetSelector] - Optional selector for the container to inject the modal into. Defaults to <body>.
 */
export function loadResetModal(targetSelector) {
  // Prevent duplicate injection
  if (document.getElementById('resetModal')) return;
  fetch('../../../components/ResetModal.html')
    .then(response => response.text())
    .then(html => {
      let container;
      if (targetSelector) {
        container = document.querySelector(targetSelector);
      } else {
        container = document.body;
      }
      if (!container) return;
      // Extract only the modal div (ignore <script> in HTML file)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const modalDiv = tempDiv.querySelector('#resetModal');
      if (modalDiv) container.appendChild(modalDiv);
      attachResetModalListeners();
    });
}

function attachResetModalListeners() {
  const modal = document.getElementById('resetModal');
  if (!modal) return;
  // Cancel button
  const cancelBtn = modal.querySelector('.cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeResetModal);
  // Confirm button
  const confirmBtn = modal.querySelector('.confirm-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', performReset);
}

function showResetModal() {
  const modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function closeResetModal() {
  const modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

function performReset() {
  localStorage.removeItem('individualAssessmentDraft');
  localStorage.removeItem('individualAssessmentEdit');
  localStorage.removeItem('manualJsonContent');
  closeResetModal();
  if (typeof window.checkPageContent === 'function') window.checkPageContent();
  window.location.reload();
}

// Make functions globally available for other scripts
window.showResetModal = showResetModal;
window.closeResetModal = closeResetModal;
window.performReset = performReset; 