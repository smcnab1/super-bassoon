let loadingOverlayShownAt = Date.now();
let overlayHidden = false;

function hideLoadingOverlay() {
  if (overlayHidden) return;
  overlayHidden = true;
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const minVisible = 1000; // ms (increased for visibility)
    const elapsed = Date.now() - loadingOverlayShownAt;
    const delay = Math.max(0, minVisible - elapsed);
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 500); // matches CSS transition
    }, delay);
  }
}
window.hideLoadingOverlay = hideLoadingOverlay;

function showLoadingOverlay() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    // Re-inject the overlay HTML synchronously
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../components/LoadingOverlay.html', false);
    xhr.send(null);
    if (xhr.status === 200) {
      var temp = document.createElement('div');
      temp.innerHTML = xhr.responseText;
      overlay = temp.firstElementChild;
      document.body.insertBefore(overlay, document.body.firstChild);
    }
  } else {
    overlay.classList.remove('fade-out');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
  }
  loadingOverlayShownAt = Date.now();
  overlayHidden = false;
}
window.showLoadingOverlay = showLoadingOverlay;

// (Removed automatic hiding on window load) 