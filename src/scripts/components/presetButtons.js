// --- Preset Buttons Component Logic ---

// List of all modules (shared across pages)
const presetAllModules = [
  { code: 'ED70011X', name: 'Foundations of Simulation Education', year: 1 },
  { code: 'ED70012X', name: 'Simulation Delivery & Leadership', year: 1 },
  { code: 'ED70013X', name: 'Digital Technologies in Education', year: 2 },
  { code: 'ED70014X', name: 'Current Issues & Policies in Simulation Education', year: 2 },
  { code: 'ED70015X', name: 'Simulation in Innovative Practice', year: 2 },
  { code: 'ED70016X', name: 'Quality Improvement & Demonstrative Simulation', year: 3 },
];

// Map page path to relevant preset JSON file
function getPresetJsonPath() {
  const path = window.location.pathname;
  
  if (path.includes('/assessments/brief/')) {
    console.log('Detected assessments/brief/ - using ../../../../presets/individual-assessments.json');
    return '../../../../presets/individual-assessments.json';
  }
  if (path.includes('/assessments/overview/')) {
    console.log('Detected assessments/overview/ - using ../../../../presets/assessments.json');
    return '../../../../presets/assessments.json';
  }
  if (path.includes('/overview/')) {
    console.log('Detected overview/ - using ../../../../presets/overview.json');
    return '../../../presets/overview.json';
  }
  if (path.includes('/team/')) {
    console.log('Detected team/ - using ../../../../presets/team.json');
    return '../../../presets/team.json';
  }
  if (path.includes('/timetable/')) {
    console.log('Detected timetable/ - using ../../../../presets/timetable.json');
    return '../../../presets/timetable.json';
  }
  // fallback
  return null;
}

export function loadPresetButtons(targetSelector = '#presetButtonsContainer', loadPresetOverride) {
  fetch('../../../components/PresetButtons.html')
    .then(response => response.text())
    .then(html => {
      const container = document.querySelector(targetSelector);
      if (!container) return;
      container.innerHTML = html;
      renderPresetButtons(loadPresetOverride);
    });
}

function renderPresetButtons(loadPresetOverride) {
  const presetJsonPath = getPresetJsonPath();
  const container = document.getElementById('presetButtons');
  if (!container) return;
  if (!presetJsonPath) {
    container.innerHTML = '<div style="color: red;">No preset file mapped for this page.</div>';
    return;
  }
  fetch(presetJsonPath)
    .then(response => response.ok ? response.json() : {})
    .then(data => {
      container.innerHTML = '';
      presetAllModules.forEach(mod => {
        // Check if module exists and has data
        const moduleData = data[mod.code];
        const hasData = moduleData && Object.keys(moduleData).length > 0;
        
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.innerHTML = `
          <span class="preset-title">${mod.name}</span>
          <span class="preset-badges">
            <span class="module-badge">${mod.code}</span>
            <span class="year-badge year-${mod.year}">Year ${mod.year}</span>
          </span>
        `;
        btn.setAttribute('aria-label', hasData
          ? `Load ${mod.name} preset`
          : `${mod.name} preset (not available)`);
        if (hasData) {
          btn.onclick = () => {
            if (typeof loadPresetOverride === 'function') {
              loadPresetOverride(mod.code, data);
            } else {
              alert('loadPreset not implemented for this page.');
            }
          };
        } else {
          btn.disabled = true;
        }
        container.appendChild(btn);
      });
    })
    .catch(() => {
      // fallback: render all as disabled
      container.innerHTML = '';
      presetAllModules.forEach(mod => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.disabled = true;
        btn.innerHTML = `
          <strong>${mod.name}</strong>
          <span class="module-code">${mod.code}</span>
          <span class="year-tag year-${mod.year}">Year ${mod.year}</span>
        `;
        btn.setAttribute('aria-label', `${mod.name} preset (not available)`);
        container.appendChild(btn);
      });
    });
}

// --- Assessment Selection Modal Logic ---
function showAssessmentSelectModal(modulePresets) {
  const modal = document.getElementById('assessmentSelectModal');
  const optionsDiv = document.getElementById('assessmentOptions');
  
  if (!modal || !optionsDiv) {
    console.error('Modal elements not found');
    return;
  }
  
  optionsDiv.innerHTML = '';
  Object.entries(modulePresets).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'cohort-btn';
    btn.textContent = `${key}: ${preset.assessmentTitle || ''}`;
    btn.onclick = function() {
      console.log('Assessment selected:', key);
      const presetWithKey = { ...preset, assessmentKey: key };
      localStorage.setItem('individualAssessmentDraft', JSON.stringify(presetWithKey));
      localStorage.removeItem('individualAssessmentEdit');
      if (typeof closeJsonImport === 'function') closeJsonImport();
      if (typeof loadData === 'function') loadData();
      if (typeof generateHtml === 'function') generateHtml();
      if (typeof showToast === 'function') showToast('✅ Preset loaded!', 'success');
      console.log('About to close modal...');
      closeAssessmentSelectModal();
      console.log('Modal close function called');
    };
    optionsDiv.appendChild(btn);
  });
  modal.style.display = 'flex';
}
function closeAssessmentSelectModal() {
  console.log('closeAssessmentSelectModal called');
  const modal = document.getElementById('assessmentSelectModal');
  console.log('Modal element found:', modal);
  if (modal) {
    console.log('Setting modal display to none');
    modal.style.display = 'none';
    console.log('Modal display set to:', modal.style.display);
  } else {
    console.error('Modal element not found!');
  }
}

// Make functions globally available
window.showAssessmentSelectModal = showAssessmentSelectModal;
window.closeAssessmentSelectModal = closeAssessmentSelectModal; 