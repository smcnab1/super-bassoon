// Assessment Brief Edit Page Script
// Page-specific functions for the assessment brief generation page

import { loadPresetButtons } from '../components/presetButtons.js';
import { copyJson as utilCopyJson, downloadJson as utilDownloadJson } from '../components/copyDownloadJson.js';
import * as toastModule from '../components/toast.js';

function setListValues(listId, arr) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  // Always show at least one input box
  if (!arr || arr.length === 0 || arr.every(val => !val || val.trim() === '')) {
    addListItem(listId, '');
  } else {
    arr.forEach(val => addListItem(listId, val));
  }
  // Re-attach listeners for live save
  attachLiveSaveListeners();
}

// Helper for multi-row fields (should match the one in HTML page)
function addListItem(listId, value = '') {
  const list = document.getElementById(listId);
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  let placeholder = '';
  if (listId === 'requirementsList') placeholder = 'e.g. A defined learner profile and scenario context';
  if (listId === 'criteriaList') placeholder = 'e.g. LO1: Apply simulation technologies to enhance learning';
  if (listId === 'toolsList') placeholder = 'e.g. Bodyswaps, SimVox';
  if (listId === 'prepareList') placeholder = 'e.g. Engage fully in weekly Apply sessions and Investigate tasks';
  // Only show delete button if not the first row
  const isFirstRow = list.children.length === 0;
  div.innerHTML = `<input type="text" value="${value ? value.replace(/"/g, '&quot;') : ''}" placeholder="${placeholder}" />${isFirstRow ? '' : ' <button type="button" onclick="this.parentNode.remove();window.saveFormToDraft&&window.saveFormToDraft();window.validateForm&&window.validateForm();">❌</button>'}`;
  list.appendChild(div);
  // Attach live save and validation to new input
  const input = div.querySelector('input');
  if (input) input.addEventListener('input', function() {
    saveFormToDraft();
    if (typeof window.validateForm === 'function') window.validateForm();
  });
  // Immediately validate the form after adding a new row
  if (typeof window.validateForm === 'function') window.validateForm();
}

function loadPreset(moduleCode, data) {
  const modulePresets = data[moduleCode];
  if (!modulePresets || typeof showAssessmentSelectModal !== 'function') return;
  // If modulePresets is a single assessment, wrap it in an object
  const isSingleAssessment = !Object.values(modulePresets).some(v => typeof v === 'object');
  const modalData = isSingleAssessment ? { [moduleCode]: modulePresets } : modulePresets;
  showAssessmentSelectModal(modalData);
  window.dispatchEvent(new CustomEvent('presetSelected', { detail: { moduleCode } }));
}

// Validate all fields and multi-row lists are non-empty
function validateForm() {
  let valid = true;
  // Helper to mark invalid
  function markInvalid(el) {
    el.classList.add('invalid');
    valid = false;
  }
  function clearInvalid(el) {
    el.classList.remove('invalid');
  }
  // Single fields
  const ids = ['assessmentTitle', 'format', 'weighting', 'submissionMethod', 'overview', 'importantNote'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      clearInvalid(el);
      if (!el.value.trim()) markInvalid(el);
    }
  });
  // Multi-row lists
  ['requirementsList', 'criteriaList', 'toolsList', 'prepareList'].forEach(listId => {
    const list = document.getElementById(listId);
    if (list) {
      const inputs = Array.from(list.querySelectorAll('input'));
      let allFilled = true;
      inputs.forEach(input => {
        clearInvalid(input);
        if (!input.value.trim()) {
          markInvalid(input);
          allFilled = false;
        }
      });
      // If you want at least one required, but not all, you can adjust here
      // For now, require all to be filled
    }
  });
  // REMOVE the call to updateButtonStates here to prevent infinite recursion
  // if (typeof window.updateButtonStates === 'function') window.updateButtonStates();
  return valid;
}

window.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editForm');
  if (form) {
    form.style.display = '';
  }

  // Populate form fields from localStorage draft if available
  let data = null;
  try {
    const draft = localStorage.getItem('individualAssessmentDraft');
    if (draft) data = JSON.parse(draft);
  } catch (e) {}

  if (data) {
    document.getElementById('assessmentTitle').value = data.assessmentTitle || '';
    document.getElementById('format').value = data.format || '';
    document.getElementById('weighting').value = data.weighting || '';
    document.getElementById('submissionMethod').value = data.submissionMethod || '';
    document.getElementById('overview').value = data.overview || '';
    document.getElementById('importantNote').value = data.importantNote || '';
    setListValues('requirementsList', data.requirements || []);
    setListValues('criteriaList', data.criteria || []);
    setListValues('toolsList', data.tools || []);
    setListValues('prepareList', data.prepare || []);
    // Collapse import JSON section
    const importJsonContent = document.getElementById('jsonImportContent');
    const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
    if (importJsonContent && toggleIcon) {
      importJsonContent.classList.add('collapsed');
      toggleIcon.textContent = '▶';
      toggleIcon.style.transform = 'rotate(-90deg)';
    }
  } else {
    // Expand import JSON section
    const importJsonContent = document.getElementById('jsonImportContent');
    const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
    if (importJsonContent && toggleIcon) {
      importJsonContent.classList.remove('collapsed');
      toggleIcon.textContent = '▼';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  }

  // Load preset buttons with our loadPreset handler
  loadPresetButtons('#presetButtonsContainer', loadPreset);
  attachLiveSaveListeners();

  // Attach validation to form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      if (!validateForm()) {
        e.preventDefault();
        if (window.showToast) window.showToast('Please fill in all fields before saving.', 'error');
      }
    });
  }
});

// Add loadData function to populate form from localStorage draft
function loadData() {
  let data = null;
  try {
    const draft = localStorage.getItem('individualAssessmentDraft');
    if (draft) data = JSON.parse(draft);
  } catch (e) {}

  const container = document.getElementById('mainContentContainer');
  if (data) {
    if (container) container.style.display = '';
    document.getElementById('assessmentTitle').value = data.assessmentTitle || '';
    document.getElementById('format').value = data.format || '';
    document.getElementById('weighting').value = data.weighting || '';
    document.getElementById('submissionMethod').value = data.submissionMethod || '';
    document.getElementById('overview').value = data.overview || '';
    document.getElementById('importantNote').value = data.importantNote || '';
    setListValues('requirementsList', data.requirements || []);
    setListValues('criteriaList', data.criteria || []);
    setListValues('toolsList', data.tools || []);
    setListValues('prepareList', data.prepare || []);
    if (typeof window.showPageTools === 'function') window.showPageTools();
    // Collapse import JSON section
    const importJsonContent = document.getElementById('jsonImportContent');
    const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
    if (importJsonContent && toggleIcon) {
      importJsonContent.classList.add('collapsed');
      toggleIcon.textContent = '▶';
      toggleIcon.style.transform = 'rotate(-90deg)';
    }
    window.dispatchEvent(new CustomEvent('assessmentLoaded', { detail: { assessmentTitle: data.assessmentTitle } }));
  } else {
    if (container) container.style.display = 'none';
    // Expand import JSON section
    const importJsonContent = document.getElementById('jsonImportContent');
    const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
    if (importJsonContent && toggleIcon) {
      importJsonContent.classList.remove('collapsed');
      toggleIcon.textContent = '▼';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  }
  if (typeof window.updateButtonStates === 'function') window.updateButtonStates();
}
// Make loadData globally available
window.loadData = loadData;

// Patch showAssessmentSelectModal to call loadData and close modal after assessment selection
if (typeof window.showAssessmentSelectModal === 'function') {
  const originalShowAssessmentSelectModal = window.showAssessmentSelectModal;
  window.showAssessmentSelectModal = function(modulePresets) {
    originalShowAssessmentSelectModal(modulePresets);
    setTimeout(() => {
      const optionsDiv = document.getElementById('assessmentOptions');
      if (optionsDiv) {
        Array.from(optionsDiv.querySelectorAll('button.cohort-btn')).forEach(btn => {
          const originalOnClick = btn.onclick;
          btn.onclick = function(e) {
            if (originalOnClick) originalOnClick.call(this, e);
            // After assessment is selected and draft is set, update the form and close modal
            loadData();
            if (typeof window.closeAssessmentSelectModal === 'function') {
              window.closeAssessmentSelectModal();
            }
          };
        });
      }
    }, 50);
  };
}

// Patch loadPreset to call loadData after preset is loaded (like generate page)
if (typeof window.loadPreset === 'function') {
  const originalLoadPreset = window.loadPreset;
  window.loadPreset = function(moduleCode, data) {
    originalLoadPreset(moduleCode, data);
    if (typeof window.loadData === 'function') window.loadData();
  };
}

function confirmReset() {
  if (confirm('Are you sure you want to reset all assessment data? This cannot be undone.')) {
    localStorage.removeItem('individualAssessmentDraft');
    localStorage.removeItem('individualAssessmentEdit');
    localStorage.removeItem('manualJsonContent');
    assessmentData = null; // Clear in-memory data
    // Hide main content and PageTools before reload
    const mainContent = document.getElementById('mainContentContainer');
    if (mainContent) mainContent.style.display = 'none';
    if (typeof hidePageTools === 'function') hidePageTools();
    if (typeof checkPageContent === 'function') checkPageContent();
    window.dispatchEvent(new CustomEvent('assessmentReset'));
    window.location.reload();
  }
}

// Fallback reset function in case ResetModal is not available
function showResetModalFallback() {
  if (confirm('Are you sure you want to reset all assessment data? This cannot be undone.')) {
    localStorage.removeItem('individualAssessmentDraft');
    localStorage.removeItem('individualAssessmentEdit');
    localStorage.removeItem('manualJsonContent');
    assessmentData = null; // Clear in-memory data
    if (typeof checkPageContent === 'function') checkPageContent();
    // Hide main content and PageTools before reload
    const mainContent = document.getElementById('mainContentContainer');
    if (mainContent) mainContent.style.display = 'none';
    if (typeof hidePageTools === 'function') hidePageTools();
    window.dispatchEvent(new CustomEvent('assessmentReset'));
    window.location.reload();
  }
}

// Add copyJson and downloadJson for PageTools on preset-edit.html
function copyJson() {
  const draft = localStorage.getItem('individualAssessmentDraft');
  utilCopyJson(draft,
    () => { if (typeof showToast === 'function') showToast('JSON copied to clipboard!', 'success'); },
    () => { if (typeof showToast === 'function') showToast('Failed to copy JSON', 'error'); }
  );
}
window.copyJson = copyJson;

function downloadJson() {
  const draft = localStorage.getItem('individualAssessmentDraft');
  utilDownloadJson(draft, 'assessment-preset.json',
    () => { if (typeof showToast === 'function') showToast('JSON downloaded!', 'success'); },
    () => { if (typeof showToast === 'function') showToast('Failed to download JSON', 'error'); }
  );
}
window.downloadJson = downloadJson;

// Ensure showToast is globally available
if (typeof toastModule.showToast === 'function') window.showToast = toastModule.showToast;

// Save the current form state to localStorage
function saveFormToDraft() {
  const draft = {
    assessmentTitle: document.getElementById('assessmentTitle').value,
    format: document.getElementById('format').value,
    weighting: document.getElementById('weighting').value,
    submissionMethod: document.getElementById('submissionMethod').value,
    overview: document.getElementById('overview').value,
    importantNote: document.getElementById('importantNote').value,
    requirements: Array.from(document.querySelectorAll('#requirementsList input')).map(i => i.value),
    criteria: Array.from(document.querySelectorAll('#criteriaList input')).map(i => i.value),
    tools: Array.from(document.querySelectorAll('#toolsList input')).map(i => i.value),
    prepare: Array.from(document.querySelectorAll('#prepareList input')).map(i => i.value)
  };
  // Preserve assessmentKey if present
  let oldDraft = null;
  try {
    oldDraft = JSON.parse(localStorage.getItem('individualAssessmentDraft'));
  } catch (e) {}
  if (oldDraft && oldDraft.assessmentKey) draft.assessmentKey = oldDraft.assessmentKey;
  localStorage.setItem('individualAssessmentDraft', JSON.stringify(draft));
  if (typeof window.updateButtonStates === 'function') window.updateButtonStates();
}

// Attach listeners to all form fields for live saving
function attachLiveSaveListeners() {
  const ids = ['assessmentTitle', 'format', 'weighting', 'submissionMethod', 'overview', 'importantNote'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function() {
      saveFormToDraft();
      if (typeof window.validateForm === 'function') window.validateForm();
    });
  });
  // Multi-row lists
  ['requirementsList', 'criteriaList', 'toolsList', 'prepareList'].forEach(listId => {
    const list = document.getElementById(listId);
    if (list) {
      list.addEventListener('input', function() {
        saveFormToDraft();
        if (typeof window.validateForm === 'function') window.validateForm();
      });
      list.addEventListener('change', function() {
        saveFormToDraft();
        if (typeof window.validateForm === 'function') window.validateForm();
      });
    }
  });
}

// Make saveFormToDraft globally available for delete button
window.saveFormToDraft = saveFormToDraft;

// Make addListItem globally available for inline onclick handlers
window.addListItem = addListItem;

// Expose isPageValid for PageTools
window.isPageValid = validateForm;