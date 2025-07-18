// Theme management logic for the whole app

function updateThemeIcon(theme) {
  // Update both navbar and login theme toggles if present
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
  }
  const themeToggleLogin = document.getElementById('themeToggleLogin');
  if (themeToggleLogin) {
    themeToggleLogin.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon; 