// --- AssessmentSelectModal Component Loader and Logic ---

/**
 * Loads the AssessmentSelectModal component and attaches all event listeners.
 * @param {string} [targetSelector] - Optional selector for the container to inject the modal into. Defaults to <body>.
 */
export function loadAssessmentSelectModal(targetSelector) {
  // Prevent duplicate injection
  if (document.getElementById('assessmentSelectModal')) return;
  fetch('../../../components/AssessmentSelectModal.html')
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
      const modalDiv = tempDiv.querySelector('#assessmentSelectModal');
      if (modalDiv) container.appendChild(modalDiv);
      attachAssessmentSelectModalListeners();
    });
}

function attachAssessmentSelectModalListeners() {
  const modal = document.getElementById('assessmentSelectModal');
  if (!modal) return;
  // Cancel button
  const cancelBtn = modal.querySelector('.cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeAssessmentSelectModal);
}

function closeAssessmentSelectModal() {
  const modal = document.getElementById('assessmentSelectModal');
  if (modal) modal.style.display = 'none';
}

// Make function globally available for other scripts
window.closeAssessmentSelectModal = closeAssessmentSelectModal; 