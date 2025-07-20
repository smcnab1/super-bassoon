// Reusable copy and download JSON utilities

/**
 * Copy a JSON string to clipboard
 * @param {string|object} json - The JSON string or object to copy
 * @param {function} [onSuccess] - Optional callback on success
 * @param {function} [onError] - Optional callback on error
 */
export function copyJson(json, onSuccess, onError) {
  let jsonString = '';
  try {
    jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      if (onSuccess) onSuccess();
    }, () => {
      if (onError) onError();
    });
  } catch (e) {
    if (onError) onError(e);
  }
}

/**
 * Download a JSON string as a file
 * @param {string|object} json - The JSON string or object to download
 * @param {string} [filename] - The filename for the download (default: 'data.json')
 * @param {function} [onSuccess] - Optional callback on success
 * @param {function} [onError] - Optional callback on error
 */
export function downloadJson(json, filename = 'data.json', onSuccess, onError) {
  let jsonString = '';
  try {
    jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onSuccess) onSuccess();
  } catch (e) {
    if (onError) onError(e);
  }
} 