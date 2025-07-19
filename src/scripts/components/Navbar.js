// Dynamic Navbar Component
function initNavbar() {
  // Get the current page path to determine relative paths
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');
  
  // Determine the base path for navigation
  let basePath = '';
  
  // Check if we're in a subdirectory
  if (pathSegments.includes('assessments')) {
    if (pathSegments.includes('brief') || pathSegments.includes('overview')) {
      // We're in assessments/brief/ or assessments/overview/
      basePath = '../../../pages/';
    } else {
      // We're in assessments/
      basePath = '../../pages/';
    }
  } else if (pathSegments.includes('timetable')) {
    // We're in timetable/
    basePath = '../../pages/';
  } else if (pathSegments.includes('overview') || pathSegments.includes('team')) {
    // We're in overview/ or team/
    basePath = '../../pages/';
  } else {
    // We're in the root pages directory
    basePath = '';
  }
  
  // Use absolute path from root for logo
  const logoPath = '/public/';

  // Update the navbar HTML with correct paths
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary" role="navigation" aria-label="Main navigation">
        <div class="container-fluid">
          <a class="navbar-brand d-flex align-items-center" href="${basePath}index.html" aria-label="ModuMate Home">
            <img src="${logoPath}images/logo.png" alt="ModuMate Logo" width="32" height="32" class="d-inline-block align-text-top me-2">
            <strong>ModuMate</strong>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="briefDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  📝 Assessment Brief
                </a>
                <ul class="dropdown-menu" aria-labelledby="briefDropdown">
                  <li><a class="dropdown-item" href="${basePath}assessments/brief/generate.html">🎯 Generate</a></li>
                  <li><a class="dropdown-item" href="${basePath}assessments/brief/preset-edit.html">✏️ Edit</a></li>
                  <li><a class="dropdown-item" href="${basePath}assessments/brief/preset-new.html">📄 New</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="timetableDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  📅 Timetable
                </a>
                <ul class="dropdown-menu" aria-labelledby="timetableDropdown">
                  <li><a class="dropdown-item" href="${basePath}timetable/generate.html">🎯 Generate</a></li>
                  <li><a class="dropdown-item" href="${basePath}timetable/preset-new.html">📄 New Preset</a></li>
                  <li><a class="dropdown-item" href="${basePath}timetable/preset-edit.html">✏️ Edit Preset</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="assessmentsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  📝 Assessments
                </a>
                <ul class="dropdown-menu" aria-labelledby="assessmentsDropdown">
                  <li><a class="dropdown-item" href="${basePath}assessments/overview/generate.html">🎯 Generate Overview</a></li>
                  <li><a class="dropdown-item" href="${basePath}assessments/overview/new.html">📄 New Preset</a></li>
                  <li><a class="dropdown-item" href="${basePath}assessments/overview/edit.html">✏️ Edit Preset</a></li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${basePath}overview/generate.html">📘 Module Overview</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${basePath}team/generate.html">👥 Module Team</a>
              </li>
              <li class="nav-item d-flex align-items-center gap-2 ms-3">
                <button class="btn btn-outline-light" type="button" onclick="toggleTheme()" id="themeToggle" aria-label="Toggle dark mode">🌙</button>
                <button class="btn btn-outline-light" type="button" onclick="logout()" aria-label="Logout from application">🔓</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initNavbar };
} 