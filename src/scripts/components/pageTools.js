/**
 * Page Tools Component
 * Provides a reusable page tools/actions component across the application
 */

/**
 * Get the current page context based on URL
 * @returns {Object} Page context with type and specific page info
 */
function getPageContext() {
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');
  
  // Check for different page types
  if (pathSegments.includes('assessments')) {
    if (pathSegments.includes('brief')) {
      return {
        type: 'assessment-brief',
        page: 'generate',
        buttons: [
          { id: 'previewBtn', text: '🔍 Preview', onclick: 'previewAssessment()', ariaLabel: 'Preview assessment overview' },
          { id: 'openTabBtn', text: '🧾 New Tab', onclick: 'openPreviewInNewTabWithFocus()', ariaLabel: 'Open preview in new tab' },
          { id: 'copyBtn', text: '📋 Copy', onclick: 'copyHtml()', ariaLabel: 'Copy assessment overview HTML' },
          { id: 'resetBtn', text: '🔄 Reset', onclick: 'showResetModal()', ariaLabel: 'Reset all changes', className: 'btn-secondary' }
        ]
      };
    } else if (pathSegments.includes('overview')) {
      return {
        type: 'assessment-overview',
        page: 'generate',
        buttons: [
          { id: 'previewBtn', text: '🔍 Preview', onclick: 'previewOverview()', ariaLabel: 'Preview assessment overview' },
          { id: 'openTabBtn', text: '🧾 New Tab', onclick: 'openPreviewInNewTabWithFocus()', ariaLabel: 'Open preview in new tab' },
          { id: 'copyBtn', text: '📋 Copy', onclick: 'copyHtml()', ariaLabel: 'Copy assessment overview HTML' },
          { id: 'exportBtn', text: '📄 Export', onclick: 'exportPDF()', ariaLabel: 'Export to PDF' },
          { id: 'resetBtn', text: '🔄 Reset', onclick: 'showResetModal()', ariaLabel: 'Reset all changes', className: 'btn-secondary' }
        ]
      };
    }
  } else if (pathSegments.includes('timetable')) {
    return {
      type: 'timetable',
      page: 'generate',
      buttons: [
        { id: 'previewBtn', text: '🔍 Preview', onclick: 'previewTimetable()', ariaLabel: 'Preview timetable' },
        { id: 'openTabBtn', text: '🧾 New Tab', onclick: 'openPreviewInNewTabWithFocus()', ariaLabel: 'Open preview in new tab' },
        { id: 'copyBtn', text: '📋 Copy', onclick: 'copyHtml()', ariaLabel: 'Copy timetable HTML' },
        { id: 'exportBtn', text: '📄 Export', onclick: 'exportPDF()', ariaLabel: 'Export to PDF' },
        { id: 'calculateBtn', text: '📅 Calculate Dates', onclick: 'calculateDates()', ariaLabel: 'Calculate teaching dates' },
        { id: 'resetBtn', text: '🔄 Reset', onclick: 'showResetModal()', ariaLabel: 'Reset all changes', className: 'btn-secondary' }
      ]
    };
  } else if (pathSegments.includes('overview')) {
    return {
      type: 'module-overview',
      page: 'generate',
      buttons: [
        { id: 'previewBtn', text: '🔍 Preview', onclick: 'previewOverview()', ariaLabel: 'Preview module overview' },
        { id: 'openTabBtn', text: '🧾 New Tab', onclick: 'openPreviewInNewTabWithFocus()', ariaLabel: 'Open preview in new tab' },
        { id: 'copyBtn', text: '📋 Copy', onclick: 'copyHtml()', ariaLabel: 'Copy module overview HTML' },
        { id: 'exportBtn', text: '📄 Export', onclick: 'exportPDF()', ariaLabel: 'Export to PDF' },
        { id: 'resetBtn', text: '🔄 Reset', onclick: 'showResetModal()', ariaLabel: 'Reset all changes', className: 'btn-secondary' }
      ]
    };
  } else if (pathSegments.includes('team')) {
    return {
      type: 'module-team',
      page: 'generate',
      buttons: [
        { id: 'previewBtn', text: '🔍 Preview', onclick: 'previewTeam()', ariaLabel: 'Preview team overview' },
        { id: 'openTabBtn', text: '🧾 New Tab', onclick: 'openPreviewInNewTabWithFocus()', ariaLabel: 'Open preview in new tab' },
        { id: 'copyBtn', text: '📋 Copy', onclick: 'copyHtml()', ariaLabel: 'Copy team overview HTML' },
        { id: 'resetBtn', text: '🔄 Reset', onclick: 'showResetModal()', ariaLabel: 'Reset all changes', className: 'btn-secondary' }
      ]
    };
  }
  
  // Default fallback
  return {
    type: 'default',
    page: 'index',
    buttons: [
      { id: 'helpBtn', text: '❓ Help', onclick: 'showHelp()', ariaLabel: 'Show help' },
      { id: 'settingsBtn', text: '⚙️ Settings', onclick: 'showSettings()', ariaLabel: 'Show settings' }
    ]
  };
}

/**
 * Initialize the page tools component
 * @param {Object} config - Optional configuration to override auto-detection
 */
function initPageTools(config = {}) {
  const pageContext = getPageContext();
  
  const defaultConfig = {
    buttons: pageContext.buttons,
    position: 'sticky',
    show: true
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const pageToolsContainer = document.getElementById('pageToolsContainer');
  if (!pageToolsContainer) {
    console.warn('PageTools container not found');
    return;
  }

  // Generate buttons HTML
  const buttonsHtml = finalConfig.buttons.map(button => {
    const className = button.className ? `class="${button.className}"` : '';
    return `<button id="${button.id}" data-onclick="${button.onclick}" aria-label="${button.ariaLabel}" ${className}>${button.text}</button>`;
  }).join('');

  // Create the page tools HTML
  const pageToolsHtml = `
    <div class="page-tools ${finalConfig.position}" id="pageTools" role="toolbar" aria-label="Page actions" data-page-type="${pageContext.type}">
      ${buttonsHtml}
    </div>
  `;

  pageToolsContainer.innerHTML = pageToolsHtml;
  
  // Add event listeners to buttons after they're created
  finalConfig.buttons.forEach(button => {
    const buttonElement = document.getElementById(button.id);
    if (buttonElement) {
      buttonElement.addEventListener('click', function(e) {
        e.preventDefault();
        // Extract function name (remove parentheses)
        const functionName = button.onclick.replace('()', '');
        // Special handling for reset button
        if (functionName === 'showResetModal') {
          if (typeof window.showResetModal === 'function') {
            window.showResetModal();
          } else if (typeof window.showResetModalFallback === 'function') {
            window.showResetModalFallback();
          }
          return;
        }
        // Special handling for openTabBtn (new tab)
        if (button.id === 'openTabBtn' && typeof window.getExportHtml === 'function' && typeof window.assessmentData !== 'undefined' && window.assessmentData) {
          // Open the new tab synchronously
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            try { newWindow.focus(); } catch (e) {}
            // Write the HTML after opening/focusing
            const html = window.getExportHtml();
            newWindow.document.write(html);
            newWindow.document.close();
          }
          return;
        }
        // Execute the function
        if (typeof window[functionName] === 'function') {
          window[functionName]();
        }
      });
    }
  });
  
  // Show/hide based on actual content
  if (typeof checkPageContent === 'function') {
    checkPageContent();
  }
  
  // Set up validation for buttons
  updateButtonStates();
  
  // Set up event listeners for field changes to update button states
  if (pageContext.type === 'assessment-brief') {
    const submissionDateInput = document.getElementById('submissionDate');
    if (submissionDateInput) {
      submissionDateInput.addEventListener('input', updateButtonStates);
      submissionDateInput.addEventListener('change', updateButtonStates);
    }
    
    // Listen for assessment data changes
    const observer = new MutationObserver(updateButtonStates);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-assessment-loaded']
    });
  }

  // Log for debugging
  console.log(`PageTools initialized for: ${pageContext.type} (${pageContext.page})`);
}

/**
 * Show the page tools
 */
function showPageTools() {
  const pageTools = document.getElementById('pageTools');
  if (pageTools) {
    pageTools.style.display = 'flex';
  }
}

/**
 * Hide the page tools
 */
function hidePageTools() {
  const pageTools = document.getElementById('pageTools');
  if (pageTools) {
    pageTools.style.display = 'none';
  }
}

/**
 * Update button text
 * @param {string} buttonId - The ID of the button to update
 * @param {string} newText - The new text for the button
 */
function updatePageToolButton(buttonId, newText) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.textContent = newText;
  }
}

/**
 * Enable/disable a button
 * @param {string} buttonId - The ID of the button to update
 * @param {boolean} enabled - Whether the button should be enabled
 */
function setPageToolButtonState(buttonId, enabled) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !enabled;
    if (!enabled) {
      button.classList.add('disabled');
    } else {
      button.classList.remove('disabled');
    }
  }
}

/**
 * Check if all required fields are validated for the current page
 * @returns {boolean} True if all required fields are valid
 */
function validateRequiredFields() {
  const pageContext = getPageContext();
  
  // For assessment brief page, check submission date
  if (pageContext.type === 'assessment-brief') {
    const submissionDateInput = document.getElementById('submissionDate');
    if (!submissionDateInput) {
      console.log('PageTools: submissionDateInput not found');
      return false;
    }
    
    const submissionDate = submissionDateInput.value;
    if (!submissionDate) {
      console.log('PageTools: submissionDate is empty');
      return false;
    }
    
    // Check for assessment data in multiple places
    let hasAssessmentData = false;
    
    // Check window.assessmentData
    if (typeof window.assessmentData !== 'undefined' && window.assessmentData) {
      hasAssessmentData = true;
      console.log('PageTools: Found window.assessmentData');
    }
    
    // Check localStorage for assessment data
    const draft = localStorage.getItem('individualAssessmentDraft');
    const edit = localStorage.getItem('individualAssessmentEdit');
    
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && (parsed.assessmentTitle || parsed.assessmentKey)) {
          hasAssessmentData = true;
          console.log('PageTools: Found assessment data in localStorage draft');
        }
      } catch (e) {}
    }
    
    if (edit) {
      try {
        const parsed = JSON.parse(edit);
        if (parsed && (parsed.assessmentTitle || parsed.assessmentKey)) {
          hasAssessmentData = true;
          console.log('PageTools: Found assessment data in localStorage edit');
        }
      } catch (e) {}
    }
    
    if (!hasAssessmentData) {
      console.log('PageTools: No assessment data found');
      return false;
    }
    
    console.log('PageTools: Validation passed - submission date and assessment data found');
    return true;
  }
  
  // For other pages, add validation as needed
  // For now, return true for other pages
  return true;
}

/**
 * Update button states based on field validation
 */
function updateButtonStates() {
  const pageContext = getPageContext();
  const isValid = validateRequiredFields();
  
  console.log('PageTools: updateButtonStates called, isValid:', isValid);
  
  // Buttons that should be disabled when validation fails
  const buttonsToDisable = ['previewBtn', 'openTabBtn', 'copyBtn'];
  
  buttonsToDisable.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      setPageToolButtonState(buttonId, isValid);
      console.log(`PageTools: Button ${buttonId} set to ${isValid ? 'enabled' : 'disabled'}`);
    } else {
      console.log(`PageTools: Button ${buttonId} not found`);
    }
  });
  
  // Add tooltip for disabled buttons
  buttonsToDisable.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      if (!isValid) {
        button.title = 'Please fill in all required fields before using this feature';
      } else {
        button.title = '';
      }
    }
  });
}

/**
 * Add a custom button to the page tools
 * @param {Object} buttonConfig - Button configuration
 * @param {number} position - Position to insert (optional, defaults to end)
 */
function addPageToolButton(buttonConfig, position = -1) {
  const pageTools = document.getElementById('pageTools');
  if (!pageTools) return;
  
  const button = document.createElement('button');
  button.id = buttonConfig.id;
  button.onclick = new Function(buttonConfig.onclick);
  button.setAttribute('aria-label', buttonConfig.ariaLabel);
  if (buttonConfig.className) {
    button.className = buttonConfig.className;
  }
  button.textContent = buttonConfig.text;
  
  if (position >= 0 && position < pageTools.children.length) {
    pageTools.insertBefore(button, pageTools.children[position]);
  } else {
    pageTools.appendChild(button);
  }
}

/**
 * Remove a button from the page tools
 * @param {string} buttonId - The ID of the button to remove
 */
function removePageToolButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.remove();
  }
}

/**
 * Enhanced openPreviewInNewTab function that focuses on the new tab
 * This function wraps the page-specific openPreviewInNewTab function
 * and adds focus behavior
 */
function openPreviewInNewTabWithFocus() {
  // Call the original function if it exists
  if (typeof openPreviewInNewTab === 'function') {
    try {
      const newWindow = openPreviewInNewTab();
      
      // If the function returns a window object, focus on it
      if (newWindow && newWindow.focus) {
        // Try to focus immediately first
        try {
          newWindow.focus();
        } catch (e) {
          // If immediate focus fails, try again after a delay
          setTimeout(() => {
            try {
              newWindow.focus();
            } catch (e2) {
              // Focus failed - likely due to popup blocker or browser security
            }
          }, 100);
        }
      }
    } catch (error) {
      // Error opening preview in new tab
    }
  }
}

// Make functions globally available
window.openPreviewInNewTabWithFocus = openPreviewInNewTabWithFocus;

// --- CONTENT CHECKING FOR PAGETOOLS ---
function checkPageContent() {
  // Check for assessment data - handle both global and window-scoped variables
  let hasAssessmentData = false;
  if (typeof assessmentData !== 'undefined' && assessmentData !== null) {
    hasAssessmentData = true;
  } else if (typeof window.assessmentData !== 'undefined' && window.assessmentData !== null) {
    hasAssessmentData = true;
  }

  // Check for JSON textarea content
  const jsonTextarea = document.getElementById('jsonTextarea');
  const hasJsonContent = jsonTextarea && jsonTextarea.value.trim().length > 0;

  // Check for selected file
  const fileInput = document.getElementById('jsonFileInput');
  const hasSelectedFile = fileInput && fileInput.files && fileInput.files.length > 0;

  // Check for manual JSON content in localStorage
  const hasManualJson = localStorage.getItem('manualJsonContent');

  // Check for assessment data in localStorage (must be valid and non-empty)
  let hasStoredAssessment = false;
  const draft = localStorage.getItem('individualAssessmentDraft');
  const edit = localStorage.getItem('individualAssessmentEdit');
  try {
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed && Object.keys(parsed).length > 0) hasStoredAssessment = true;
    }
    if (edit) {
      const parsed = JSON.parse(edit);
      if (parsed && Object.keys(parsed).length > 0) hasStoredAssessment = true;
    }
  } catch (e) {}

  // Show PageTools if any content is present
  const hasContent = hasAssessmentData || hasJsonContent || hasSelectedFile || hasManualJson || hasStoredAssessment;

  if (typeof showPageTools === 'function' && typeof hidePageTools === 'function') {
    if (hasContent) {
      showPageTools();
    } else {
      hidePageTools();
    }
  }
}

// Set up event listeners for content changes
function setupContentListeners() {
  // Listen for JSON textarea changes
  const jsonTextarea = document.getElementById('jsonTextarea');
  if (jsonTextarea) {
    jsonTextarea.addEventListener('input', checkPageContent);
  }
  
  // Listen for file input changes
  const fileInput = document.getElementById('jsonFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', checkPageContent);
  }
  
  // Listen for localStorage changes (for manual JSON content)
  window.addEventListener('storage', function(e) {
    if (e.key === 'manualJsonContent') {
      checkPageContent();
    }
  });
}

/**
 * Loads the PageTools component into the specified container and initializes it.
 * @param {string} targetSelector - The selector for the container to inject the component into. Defaults to #pageToolsContainer.
 */
export function loadPageTools(targetSelector = '#pageToolsContainer') {
  // Prevent duplicate injection
  if (document.getElementById('pageTools')) return;
  fetch('../../../components/PageTools.html')
    .then(response => response.text())
    .then(html => {
      const container = document.querySelector(targetSelector);
      if (!container) return;
      container.innerHTML = html;
      initPageTools();
    });
}

// Make key functions globally available
window.loadPageTools = loadPageTools;
window.showPageTools = showPageTools;
window.hidePageTools = hidePageTools;
window.validateRequiredFields = validateRequiredFields;
window.updateButtonStates = updateButtonStates;

// Add a manual test function
window.testPageToolsValidation = function() {
  console.log('=== PageTools Validation Test ===');
  console.log('Submission date value:', document.getElementById('submissionDate')?.value);
  console.log('Window assessmentData:', window.assessmentData);
  console.log('localStorage draft:', localStorage.getItem('individualAssessmentDraft'));
  console.log('localStorage edit:', localStorage.getItem('individualAssessmentEdit'));
  console.log('Validation result:', validateRequiredFields());
  updateButtonStates();
  console.log('=== End Test ===');
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPageTools,
    getPageContext,
    showPageTools,
    hidePageTools,
    updatePageToolButton,
    setPageToolButtonState,
    addPageToolButton,
    removePageToolButton,
    openPreviewInNewTabWithFocus,
    checkPageContent,
    setupContentListeners
  };
} 