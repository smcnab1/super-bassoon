// Assessment Brief Generate Page Script
// Page-specific functions for the assessment brief generation page

let assessmentData = null;

// --- REVIEW RENDERING ---
function loadData() {
  // Always hide PageTools first
  if (typeof hidePageTools === 'function') hidePageTools();

  const draft = localStorage.getItem('individualAssessmentDraft');
  const edit = localStorage.getItem('individualAssessmentEdit');
  let data = null;
  if (edit) { try { data = JSON.parse(edit); } catch (e) {} }
  if (!data && draft) { try { data = JSON.parse(draft); } catch (e) {} }
  assessmentData = data;

  // Restore form state (e.g., submission date)
  restoreFormStateFromDraft(data);

  // DOM references
  const content = document.getElementById('jsonImportContent');
  const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
  const mainContent = document.getElementById('mainContentContainer');
  const previewFrame = document.getElementById('previewFrame');

  // Check for valid assessment data
  const hasValidData = data && (data.assessmentTitle || data.assessmentKey);

  if (hasValidData) {
    // Collapse JSON import section
    if (content && toggleIcon) {
      content.classList.add('collapsed');
      toggleIcon.textContent = '\u25b6';
      toggleIcon.style.transform = 'rotate(-90deg)';
      // Only collapse if not already collapsed
    }
    if (mainContent) mainContent.style.display = '';
    if (typeof showPageTools === 'function') showPageTools();
    if (previewFrame) previewFrame.style.display = 'none';
    // Render review with collapsibles
    let html = '';
    html += `<div class='review-card'>`;
    const prefix = data.assessmentKey ? `${escapeHtml(data.assessmentKey)}: ` : '';
    html += `<div class='review-title'>${prefix}${escapeHtml(data.assessmentTitle)}</div>`;
    html += renderCollapsible('🎯 Overview', escapeHtml(data.overview));
    html += renderCollapsible('📋 Requirements', `<ul class='review-list'>${(data.requirements||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    html += renderCollapsible('📌 Assessment Criteria', `<ul class='review-list'>${(data.criteria||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    html += renderCollapsible('🧪 Example Tools', `<ul class='review-list'>${(data.tools||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    html += renderCollapsible('✅ How to Prepare', `<ul class='review-list'>${(data.prepare||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    html += renderCollapsible('⚠️ Important Note', escapeHtml(data.importantNote));
    html += `</div>`;
    document.getElementById('review').innerHTML = html;
    // Attach collapsible logic
    document.querySelectorAll('.review-collapsible-header').forEach(header => {
      header.addEventListener('click', function() {
        const content = this.nextElementSibling;
        const icon = this.querySelector('.review-collapsible-toggle');
        content.classList.toggle('collapsed');
        this.classList.toggle('collapsed');
        if (icon) icon.textContent = content.classList.contains('collapsed') ? '\u25b6' : '\u25bc';
      });
    });
    // Check page content after loading data
    if (typeof checkPageContent === 'function') checkPageContent();
    
    // Update PageTools button states after loading data
    if (typeof updateButtonStates === 'function') {
      updateButtonStates();
    }
    return;
  } else {
    // Clear assessmentData if no valid data
    assessmentData = null;
    if (content && toggleIcon) {
      // Only expand if not already expanded
      if (!content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggleIcon.textContent = '\u25bc';
        toggleIcon.style.transform = 'rotate(0deg)';
      }
    }
    if (mainContent) mainContent.style.display = 'none';
    if (previewFrame) previewFrame.style.display = 'none';
    document.getElementById('review').innerHTML = '<p style="color:red;">No assessment data found. Please create or edit an assessment first.</p>';
    // Hide PageTools if no data
    if (typeof hidePageTools === 'function') hidePageTools();
    // Check content for PageTools as well
    if (typeof checkPageContent === 'function') checkPageContent();
    return;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(tag) {
    const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return charsToReplace[tag] || tag;
  });
}

function renderCollapsible(title, contentHtml) {
  return `
    <div class='review-collapsible'>
      <div class='review-collapsible-header collapsed'>${title}<span class='review-collapsible-toggle'>▶</span></div>
      <div class='review-collapsible-content collapsed'>${contentHtml}</div>
    </div>
  `;
}

// --- GENERATE HTML, PREVIEW, COPY, RESET ---
function generateHtml() {
  if (!assessmentData) return;
  
  // Validate required submission date
  const submissionDateInput = document.getElementById('submissionDate');
  const submissionDate = submissionDateInput.value;
  if (!submissionDate) {
    if (typeof showToast === 'function') showToast('Please select a submission date before generating the assessment brief.', 'error');
    submissionDateInput.classList.add('required-error');
    submissionDateInput.focus();
    return;
  }
  
  // Remove error styling if validation passes
  submissionDateInput.classList.remove('required-error');
  
  // Update PageTools button states
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
  
  // Save form state on every generate
  saveAssessmentDraftToStorage();
  const dateStr = new Date(submissionDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const html = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n  <title>${escapeHtml(assessmentData.assessmentTitle)}</title>\n  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css\">\n  <style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #333; } .container { max-width: 1100px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); padding: 30px; } h1, h2, h3 { color: #004080; margin-bottom: 10px; } h1 { font-size: 2rem; } h2 { margin-top: 40px; font-size: 1.5rem; } table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; background: #fff; } th, td { padding: 12px 16px; border: 1px solid #ccc; text-align: left; } th { background-color: #e6f0fa; font-weight: bold; } .badge-green { background-color: #28a745; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; } .ai-section, .info-section { background: #eef6ff; border-left: 6px solid #0073e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; } .important-note { background: #fffbe6; border-left: 6px solid #ffc107; padding: 16px; border-radius: 8px; margin-top: 20px; } ul { padding-left: 20px; } li { margin-bottom: 8px; } a { color: #0073e6; text-decoration: none; } a:hover { text-decoration: underline; } @media (max-width: 768px) { table, th, td { font-size: 0.9rem; } h1 { font-size: 1.6rem; } h2 { font-size: 1.2rem; } } </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1><i class=\"fa-solid fa-vr-cardboard\"></i> ${escapeHtml(assessmentData.assessmentKey)}: ${escapeHtml(assessmentData.assessmentTitle)}</h1>\n    <h2>🗓 Submission Details</h2>\n    <p><strong>Submission Date:</strong> ${dateStr}<br>\n       <strong>Format:</strong> <span id=\"format\">${escapeHtml(assessmentData.format || '30-minute immersive simulation event (Practical)')}</span><br>\n       <strong>Weighting:</strong> <span id=\"weighting\">${escapeHtml(assessmentData.weighting || '60%')}</span><br>\n       <strong>Submission Method:</strong> <span id=\"submissionMethod\">${escapeHtml(assessmentData.submissionMethod || 'In-Person')}</span></p>\n    <h2>🎯 Assessment Overview</h2>\n    <div class=\"info-section\">\n      <p>${escapeHtml(assessmentData.overview)}</p>\n    </div>\n    <h2>📋 Requirements</h2>\n    <ul>${(assessmentData.requirements||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>\n    <h2>📌 Assessment Criteria (Linked to Learning Outcomes)</h2>\n    <ul>${(assessmentData.criteria||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>\n    <h2>🧪 Example Tools You Can Use</h2>\n    <ul>${(assessmentData.tools||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>\n    <h2>✅ How to Prepare</h2>\n    <ul>${(assessmentData.prepare||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>\n    <div class=\"important-note\">\n      <strong>Note:</strong><br>\n      ${escapeHtml(assessmentData.importantNote)}\n    </div>\n  </div>\n</html>`;
  var outputHtmlElem = document.getElementById('outputHtml');
  if (outputHtmlElem) {
    outputHtmlElem.value = html;
  }
}

function getExportHtml() {
  if (!assessmentData) return '';
  const submissionDate = document.getElementById('submissionDate').value;
  if (!submissionDate) return '';
  const dateStr = new Date(submissionDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(assessmentData.assessmentTitle)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 1100px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); padding: 30px; }
    h1, h2, h3 { color: #004080; margin-bottom: 10px; }
    h1 { font-size: 2rem; }
    h2 { margin-top: 40px; font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; background: #fff; }
    th, td { padding: 12px 16px; border: 1px solid #ccc; text-align: left; }
    th { background-color: #e6f0fa; font-weight: bold; }
    .badge-green { background-color: #28a745; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; }
    .ai-section, .info-section { background: #eef6ff; border-left: 6px solid #0073e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .important-note { background: #fffbe6; border-left: 6px solid #ffc107; padding: 16px; border-radius: 8px; margin-top: 20px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    a { color: #0073e6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (max-width: 768px) { table, th, td { font-size: 0.9rem; } h1 { font-size: 1.6rem; } h2 { font-size: 1.2rem; } }
  </style>
</head>
<body>
  <div class="container">
    <h1><i class="fa-solid fa-vr-cardboard"></i> ${escapeHtml(assessmentData.assessmentKey)}: ${escapeHtml(assessmentData.assessmentTitle)}</h1>
    <h2>🗓 Submission Details</h2>
    <p><strong>Submission Date:</strong> ${dateStr}<br>
       <strong>Format:</strong> <span id="format">${escapeHtml(assessmentData.format || '30-minute immersive simulation event (Practical)')}</span><br>
       <strong>Weighting:</strong> <span id="weighting">${escapeHtml(assessmentData.weighting || '60%')}</span><br>
       <strong>Submission Method:</strong> <span id="submissionMethod">${escapeHtml(assessmentData.submissionMethod || 'In-Person')}</span></p>
    <h2>🎯 Assessment Overview</h2>
    <div class="info-section">
      <p>${escapeHtml(assessmentData.overview)}</p>
    </div>
    <h2>📋 Requirements</h2>
    <ul>${(assessmentData.requirements||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
    <h2>📌 Assessment Criteria (Linked to Learning Outcomes)</h2>
    <ul>${(assessmentData.criteria||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
    ${(assessmentData.tools && assessmentData.tools.length > 0) ? `
    <h2>🧪 Example Tools You Can Use</h2>
    <ul>${assessmentData.tools.map(x=>`<li>${escapeHtml(x)}`).join('')}</ul>
    ` : ''}
    ${(assessmentData.prepare && assessmentData.prepare.length > 0) ? `
    <h2>✅ How to Prepare</h2>
    <ul>${assessmentData.prepare.map(x=>`<li>${escapeHtml(x)}`).join('')}</ul>
    ` : ''}
    <div class="important-note">
      <strong>Note:</strong><br>
      ${escapeHtml(assessmentData.importantNote)}
    </div>
  </div>
</html>`;
}

function previewAssessment() {
  if (!assessmentData) {
    if (typeof showToast === 'function') showToast('No assessment data to preview!', 'error');
    return;
  }
  
  // Validate required submission date
  const submissionDateInput = document.getElementById('submissionDate');
  const submissionDate = submissionDateInput.value;
  if (!submissionDate) {
    if (typeof showToast === 'function') showToast('Please select a submission date before previewing the assessment brief.', 'error');
    submissionDateInput.classList.add('required-error');
    submissionDateInput.focus();
    return;
  }
  
  // Remove error styling if validation passes
  submissionDateInput.classList.remove('required-error');
  const iframe = document.getElementById('previewFrame');
  iframe.style.display = 'block';
  iframe.style.width = '100%';
  iframe.style.height = '80vh';
  iframe.style.border = '1px solid #ccc';
  iframe.style.marginTop = '32px';
  iframe.srcdoc = getExportHtml();
  // Scroll to the preview iframe
  setTimeout(() => {
    iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function openPreviewInNewTab() {
  if (!assessmentData) {
    if (typeof showToast === 'function') showToast('No assessment data to preview!', 'error');
    return;
  }
  
  // Validate required submission date
  const submissionDateInput = document.getElementById('submissionDate');
  const submissionDate = submissionDateInput.value;
  if (!submissionDate) {
    if (typeof showToast === 'function') showToast('Please select a submission date before previewing the assessment brief.', 'error');
    submissionDateInput.classList.add('required-error');
    submissionDateInput.focus();
    return;
  }
  
  // Remove error styling if validation passes
  submissionDateInput.classList.remove('required-error');
  const html = getExportHtml();
  const newWindow = window.open();
  newWindow.document.write(html);
  newWindow.document.close();
  return newWindow; // Return the window object for focus functionality
}

function copyHtml() {
  if (!assessmentData) {
    if (typeof showToast === 'function') showToast('No assessment data to copy!', 'error');
    return;
  }
  
  // Validate required submission date
  const submissionDateInput = document.getElementById('submissionDate');
  const submissionDate = submissionDateInput.value;
  if (!submissionDate) {
    if (typeof showToast === 'function') showToast('Please select a submission date before copying the assessment brief.', 'error');
    submissionDateInput.classList.add('required-error');
    submissionDateInput.focus();
    return;
  }
  
  // Remove error styling if validation passes
  submissionDateInput.classList.remove('required-error');
  const dateStr = new Date(submissionDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(assessmentData.assessmentTitle)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 1100px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); padding: 30px; }
    h1, h2, h3 { color: #004080; margin-bottom: 10px; }
    h1 { font-size: 2rem; }
    h2 { margin-top: 40px; font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; background: #fff; }
    th, td { padding: 12px 16px; border: 1px solid #ccc; text-align: left; }
    th { background-color: #e6f0fa; font-weight: bold; }
    .badge-green { background-color: #28a745; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; }
    .ai-section, .info-section { background: #eef6ff; border-left: 6px solid #0073e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .important-note { background: #fffbe6; border-left: 6px solid #ffc107; padding: 16px; border-radius: 8px; margin-top: 20px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    a { color: #0073e6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (max-width: 768px) { table, th, td { font-size: 0.9rem; } h1 { font-size: 1.6rem; } h2 { font-size: 1.2rem; } }
  </style>
</head>
<body>
  <div class="container">
    <h1><i class="fa-solid fa-vr-cardboard"></i> ${escapeHtml(assessmentData.assessmentKey)}: ${escapeHtml(assessmentData.assessmentTitle)}</h1>
    <h2>🗓 Submission Details</h2>
    <p><strong>Submission Date:</strong> ${dateStr}<br>
       <strong>Format:</strong> <span id="format">${escapeHtml(assessmentData.format || '30-minute immersive simulation event (Practical)')}</span><br>
       <strong>Weighting:</strong> <span id="weighting">${escapeHtml(assessmentData.weighting || '60%')}</span><br>
       <strong>Submission Method:</strong> <span id="submissionMethod">${escapeHtml(assessmentData.submissionMethod || 'In-Person')}</span></p>
    <h2>🎯 Assessment Overview</h2>
    <div class="info-section">
      <p>${escapeHtml(assessmentData.overview)}</p>
    </div>
    <h2>📋 Requirements</h2>
    <ul>${(assessmentData.requirements||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
    <h2>📌 Assessment Criteria (Linked to Learning Outcomes)</h2>
    <ul>${(assessmentData.criteria||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
    ${(assessmentData.tools && assessmentData.tools.length > 0) ? `
    <h2>🧪 Example Tools You Can Use</h2>
    <ul>${assessmentData.tools.map(x=>`<li>${escapeHtml(x)}`).join('')}</ul>
    ` : ''}
    ${(assessmentData.prepare && assessmentData.prepare.length > 0) ? `
    <h2>✅ How to Prepare</h2>
    <ul>${assessmentData.prepare.map(x=>`<li>${escapeHtml(x)}`).join('')}</ul>
    ` : ''}
    <div class="important-note">
      <strong>Note:</strong><br>
      ${escapeHtml(assessmentData.importantNote)}
    </div>
  </div>
</html>`;
  navigator.clipboard.writeText(html);
  if (typeof showToast === 'function') showToast('HTML copied to clipboard!', 'success');
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
    window.location.reload();
  }
}

function closeJsonImport() {
  const content = document.getElementById('jsonImportContent');
  const toggleIcon = document.querySelector('.json-import-section .toggle-icon');
  if (content && toggleIcon) {
    content.classList.add('collapsed');
    toggleIcon.textContent = '▶';
    toggleIcon.style.transform = 'rotate(-90deg)';
  }
  // Show main content and sticky footer
  const mainContent = document.getElementById('mainContentContainer');
  const stickyFooter = document.getElementById('stickyFooter');
  const previewFrame = document.getElementById('previewFrame');
  if (mainContent) mainContent.style.display = '';
  if (stickyFooter) stickyFooter.style.display = '';
  if (previewFrame) previewFrame.style.display = 'none';
}

// --- DATA PERSISTENCE HELPERS ---
function saveAssessmentDraftToStorage() {
  // Save both assessmentData and form state (submissionDate)
  const submissionDate = document.getElementById('submissionDate')?.value || '';
  // Only save if assessmentData is a valid object with at least a title or key
  if (assessmentData && (assessmentData.assessmentTitle || assessmentData.assessmentKey)) {
    const draft = { ...assessmentData, submissionDate };
    localStorage.setItem('individualAssessmentDraft', JSON.stringify(draft));
  }
}

function restoreFormStateFromDraft(draft) {
  if (!draft) return;
  // Restore submission date if present
  if (draft.submissionDate && document.getElementById('submissionDate')) {
    document.getElementById('submissionDate').value = draft.submissionDate;
  }
}

// --- SUBMISSION DATE TIME HANDLING ---
let lastSubmissionTime = '16:00'; // Default to 16:00
let userSetTime = false; // Tracks if user has manually set the time

function handleSubmissionDateInput(e) {
  const input = e.target;
  let value = input.value;
  if (!value) return;
  
  // Remove error styling when user starts typing/selecting
  input.classList.remove('required-error');

  // Split into date and time
  let [date, time] = value.split('T');

  // If the user is changing the time, update the flag and lastSubmissionTime
  if (e.inputType === 'insertText' || e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
    if (time) {
      lastSubmissionTime = time;
      userSetTime = true;
    }
    generateHtml();
    return;
  }

  // If the user picked a date (not a time), and time is missing, set time to 16:00
  if (!time) {
    time = lastSubmissionTime || '16:00';
    input.value = `${date}T${time}`;
    lastSubmissionTime = time;
    userSetTime = false;
    generateHtml();
    return;
  }
  // If the user picked a new date, but the time is already set (userSetTime), do not overwrite
  generateHtml();
  saveAssessmentDraftToStorage();
}

function handleSubmissionDateChange(e) {
  const input = e.target;
  let value = input.value;
  if (!value) return;
  
  // Remove error styling when user selects a date
  input.classList.remove('required-error');
  
  // Update PageTools button states
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
  
  let [date, time] = value.split('T');
  // If userSetTime is false and time is missing, set to 16:00
  if (!userSetTime && (!time || time === '00:00')) {
    time = '16:00';
    input.value = `${date}T${time}`;
    lastSubmissionTime = time;
    generateHtml();
    return;
  }
  // If userSetTime is true, do not overwrite the time
  generateHtml();
  saveAssessmentDraftToStorage();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  const submissionDateInput = document.getElementById('submissionDate');
  if (submissionDateInput) {
    submissionDateInput.addEventListener('input', handleSubmissionDateInput);
    submissionDateInput.addEventListener('change', handleSubmissionDateChange);
  }

  // Load data and generate HTML
  loadData();
  generateHtml();

  // Set up content listeners for PageTools
  if (typeof setupContentListeners === 'function') {
    setTimeout(() => {
      setupContentListeners();
      if (typeof checkPageContent === 'function') checkPageContent();
    }, 100);
  }

  // Patch loadPreset to reset submission date and save form state after preset is loaded
  if (typeof window.loadPreset === 'function') {
    const originalLoadPreset = window.loadPreset;
    window.loadPreset = function(moduleCode, data) {
      originalLoadPreset(moduleCode, data);
      // Set assessmentData to the selected preset
      const preset = data[moduleCode];
      if (preset) {
        // Deep clone and ensure all required fields are present
        assessmentData = {
          assessmentTitle: preset.assessmentTitle || '',
          assessmentKey: preset.assessmentKey || '',
          overview: preset.overview || '',
          requirements: Array.isArray(preset.requirements) ? preset.requirements : [],
          criteria: Array.isArray(preset.criteria) ? preset.criteria : [],
          tools: Array.isArray(preset.tools) ? preset.tools : [],
          prepare: Array.isArray(preset.prepare) ? preset.prepare : [],
          importantNote: preset.importantNote || ''
        };
      }
      // Reset submission date input after loading a new preset
      const submissionDateInput = document.getElementById('submissionDate');
      if (submissionDateInput) {
        // Always clear the submission date when loading a new preset
        submissionDateInput.value = '';
        // Clear any stored submission date from localStorage
        const draft = localStorage.getItem('individualAssessmentDraft');
        if (draft) {
          try {
            const draftData = JSON.parse(draft);
            delete draftData.submissionDate;
            localStorage.setItem('individualAssessmentDraft', JSON.stringify(draftData));
          } catch (e) {}
        }
      }
      // Save the new state and sync UI
      if (typeof saveAssessmentDraftToStorage === 'function') saveAssessmentDraftToStorage();
      if (typeof loadData === 'function') loadData();
      // Ensure PageTools is injected before showing
      if (!document.getElementById('pageTools') && typeof loadPageTools === 'function') {
        loadPageTools();
        setTimeout(() => {
          if (typeof showPageTools === 'function') showPageTools();
        }, 150);
      } else {
        if (typeof showPageTools === 'function') showPageTools();
      }
      if (typeof checkPageContent === 'function') checkPageContent();
    };
  }

  // Patch showAssessmentSelectModal to save form state after preset is selected
  if (typeof window.showAssessmentSelectModal === 'function') {
    const originalShowAssessmentSelectModal = window.showAssessmentSelectModal;
    window.showAssessmentSelectModal = function(modulePresets) {
      // Wrap the original function
      originalShowAssessmentSelectModal(modulePresets);
      // Patch the modal buttons to also save form state after selection
      setTimeout(() => {
        const optionsDiv = document.getElementById('assessmentOptions');
        if (optionsDiv) {
          Array.from(optionsDiv.querySelectorAll('button.cohort-btn')).forEach(btn => {
            const originalOnClick = btn.onclick;
            btn.onclick = function(e) {
              if (originalOnClick) originalOnClick.call(this, e);
              // Clear submission date when a new assessment is selected
              const submissionDateInput = document.getElementById('submissionDate');
              if (submissionDateInput) {
                submissionDateInput.value = '';
              }
              if (typeof saveAssessmentDraftToStorage === 'function') saveAssessmentDraftToStorage();
              if (typeof checkPageContent === 'function') checkPageContent();
            };
          });
        }
      }, 50);
    };
  }
});

// Make functions globally available
window.loadData = loadData;
window.generateHtml = generateHtml;
window.previewAssessment = previewAssessment;
window.openPreviewInNewTab = openPreviewInNewTab;
window.copyHtml = copyHtml;
window.confirmReset = confirmReset;
window.showResetModalFallback = showResetModalFallback;
window.closeJsonImport = closeJsonImport;

// Patch importFromText and importFromFile to also save form state and check content
if (typeof window.importFromText === 'function') {
  const originalImportFromText = window.importFromText;
  window.importFromText = function() {
    originalImportFromText();
    setTimeout(() => {
      // Clear submission date when importing new data
      const submissionDateInput = document.getElementById('submissionDate');
      if (submissionDateInput) {
        submissionDateInput.value = '';
      }
      // Save form state after import
      saveAssessmentDraftToStorage();
      if (typeof checkPageContent === 'function') checkPageContent();
    }, 150);
  };
}
if (typeof window.importFromFile === 'function') {
  const originalImportFromFile = window.importFromFile;
  window.importFromFile = function() {
    originalImportFromFile();
    setTimeout(() => {
      // Clear submission date when importing new data
      const submissionDateInput = document.getElementById('submissionDate');
      if (submissionDateInput) {
        submissionDateInput.value = '';
      }
      // Save form state after import
      saveAssessmentDraftToStorage();
      if (typeof checkPageContent === 'function') checkPageContent();
    }, 150);
  };
}

 