// --- JSON Import Section Logic ---
let importSelectedFile = null;

function toggleJsonImport() {
  const content = document.getElementById('jsonImportContent');
  const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
  if (content.classList.contains('collapsed')) {
    content.classList.remove('collapsed');
    toggleIcon.textContent = '▼';
    toggleIcon.style.transform = 'rotate(0deg)';
  } else {
    content.classList.add('collapsed');
    toggleIcon.textContent = '▶';
    toggleIcon.style.transform = 'rotate(-90deg)';
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabName + 'Tab').classList.add('active');
  // --- Fix for file import button ---
  if (tabName === 'file') {
    // If a file is already selected, enable the import button
    const fileInput = document.getElementById('jsonFileInput');
    const importBtn = document.getElementById('importFromFile');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      importBtn.disabled = false;
      document.getElementById('selectedFileName').textContent = fileInput.files[0].name;
      importSelectedFile = fileInput.files[0];
    } else {
      importBtn.disabled = true;
      document.getElementById('selectedFileName').textContent = 'No file selected';
      importSelectedFile = null;
    }
  } else {
    // If leaving the file tab, clear the file input and disable the button
    const fileInput = document.getElementById('jsonFileInput');
    const importBtn = document.getElementById('importFromFile');
    if (fileInput) fileInput.value = '';
    if (importBtn) importBtn.disabled = true;
    document.getElementById('selectedFileName').textContent = 'No file selected';
    importSelectedFile = null;
  }
}

function updateTextButtons() {
  const textarea = document.getElementById('jsonTextarea');
  const importBtn = document.getElementById('importFromText');
  const clearBtn = document.getElementById('clearTextBtn');
  const hasContent = textarea.value.trim().length > 0;
  importBtn.disabled = !hasContent;
  clearBtn.disabled = !hasContent;
  if (hasContent) {
    localStorage.setItem('manualJsonContent', textarea.value);
  } else {
    localStorage.removeItem('manualJsonContent');
  }
}

function clearTextarea() {
  document.getElementById('jsonTextarea').value = '';
  localStorage.removeItem('manualJsonContent');
  updateTextButtons();
  if (typeof showToast === 'function') showToast('Text area cleared', 'success');
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    importSelectedFile = file;
    document.getElementById('importFromFile').disabled = false;
    document.getElementById('selectedFileName').textContent = file.name;
    if (typeof showToast === 'function') showToast(`📁 File selected: ${file.name}`, 'success');
  }
}

function importFromText() {
  const textarea = document.getElementById('jsonTextarea');
  const jsonText = textarea.value.trim();
  if (!jsonText) {
    if (typeof showToast === 'function') showToast('Please enter JSON text to import', 'error');
    return;
  }
  try {
    const presetData = JSON.parse(jsonText);
    localStorage.setItem('individualAssessmentDraft', JSON.stringify(presetData));
    localStorage.removeItem('individualAssessmentEdit');
    localStorage.setItem('manualJsonContent', jsonText);
    if (typeof closeJsonImport === 'function') closeJsonImport();
    setTimeout(() => {
      if (typeof loadData === 'function') loadData();
      if (typeof generateHtml === 'function') generateHtml();
      if (typeof showToast === 'function') showToast('✅ JSON preset imported successfully!', 'success');
    }, 100);
  } catch (error) {
    if (typeof showToast === 'function') showToast('Invalid JSON format', 'error');
  }
}

function importFromFile() {
  if (!importSelectedFile) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const presetData = JSON.parse(e.target.result);
      localStorage.setItem('individualAssessmentDraft', JSON.stringify(presetData));
      localStorage.removeItem('individualAssessmentEdit');
      if (typeof closeJsonImport === 'function') closeJsonImport();
      setTimeout(() => {
        if (typeof loadData === 'function') loadData();
        if (typeof generateHtml === 'function') generateHtml();
        if (typeof showToast === 'function') showToast('✅ JSON file imported successfully!', 'success');
      }, 100);
    } catch (error) {
      if (typeof showToast === 'function') showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(importSelectedFile);
}

/**
 * Loads the ImportJSON component into the specified container and attaches all event listeners.
 * @param {string} targetSelector - The selector for the container to inject the component into.
 */
export function loadImportJSON(targetSelector = '#importJsonContainer') {
  fetch('../../../components/ImportJSON.html')
    .then(response => response.text())
    .then(html => {
      const container = document.querySelector(targetSelector);
      if (!container) return;
      container.innerHTML = html;
      // Remove inline event attributes for safety
      const sectionHeader = container.querySelector('.section-header');
      if (sectionHeader) sectionHeader.removeAttribute('onclick');
      const tabBtns = container.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => btn.removeAttribute('onclick'));
      const textarea = container.querySelector('#jsonTextarea');
      if (textarea) textarea.removeAttribute('oninput');
      const importFromTextBtn = container.querySelector('#importFromText');
      if (importFromTextBtn) importFromTextBtn.removeAttribute('onclick');
      const clearTextBtn = container.querySelector('#clearTextBtn');
      if (clearTextBtn) clearTextBtn.removeAttribute('onclick');
      const fileInput = container.querySelector('#jsonFileInput');
      if (fileInput) fileInput.removeAttribute('onchange');
      const fileSelectBtn = container.querySelector('.file-select-btn');
      if (fileSelectBtn) fileSelectBtn.removeAttribute('onclick');
      const importFromFileBtn = container.querySelector('#importFromFile');
      if (importFromFileBtn) importFromFileBtn.removeAttribute('onclick');
      // Attach listeners
      attachImportJSONListeners(container);
      // Restore textarea content if present
      if (textarea && localStorage.getItem('manualJsonContent')) {
        textarea.value = localStorage.getItem('manualJsonContent');
        updateTextButtons();
      }
    });
}

function attachImportJSONListeners(container) {
  // Section toggle
  const sectionHeader = container.querySelector('.section-header');
  if (sectionHeader) sectionHeader.addEventListener('click', toggleJsonImport);

  // Tab buttons
  const pasteTabBtn = container.querySelector(".tab-btn.active");
  const fileTabBtn = container.querySelectorAll(".tab-btn")[1];
  if (pasteTabBtn) pasteTabBtn.addEventListener('click', () => switchTab('paste'));
  if (fileTabBtn) fileTabBtn.addEventListener('click', () => switchTab('file'));

  // Textarea
  const textarea = container.querySelector('#jsonTextarea');
  if (textarea) textarea.addEventListener('input', updateTextButtons);

  // Import from text
  const importFromTextBtn = container.querySelector('#importFromText');
  if (importFromTextBtn) importFromTextBtn.addEventListener('click', importFromText);

  // Clear text
  const clearTextBtn = container.querySelector('#clearTextBtn');
  if (clearTextBtn) clearTextBtn.addEventListener('click', clearTextarea);

  // File select
  const fileInput = container.querySelector('#jsonFileInput');
  if (fileInput) fileInput.addEventListener('change', handleFileSelect);
  const fileSelectBtn = container.querySelector('.file-select-btn');
  if (fileSelectBtn) fileSelectBtn.addEventListener('click', () => fileInput && fileInput.click());

  // Import from file
  const importFromFileBtn = container.querySelector('#importFromFile');
  if (importFromFileBtn) importFromFileBtn.addEventListener('click', importFromFile);
} 