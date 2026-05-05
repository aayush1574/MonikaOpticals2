/**
 * Monika Opticals - API Configuration
 * Robust configuration that works in multiple inclusion scenarios.
 */
var API_CONFIG = (function() {
  const BACKEND_URL = 'https://monikaopticals2-cakb.onrender.com';

  return {
    BASE_URL: BACKEND_URL,
    api: (path) => `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`,
    imageUrl: (src) => {
      if (!src) return '';
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('images/')) {
        return src;
      }
      return `${BACKEND_URL}${src.startsWith('/') ? '' : '/'}${src}`;
    }
  };
})();

// Ensure it's globally accessible even if included as a module
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
