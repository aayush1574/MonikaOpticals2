/**
 * Monika Opticals - API Configuration
 * Pure ES5 version for maximum compatibility.
 */
var API_CONFIG = (function() {
  var BACKEND_URL = 'https://monikaopticals2-nr5i.onrender.com';

  return {
    BASE_URL: BACKEND_URL,
    api: function(path) {
      var separator = (path.charAt(0) === '/') ? '' : '/';
      return BACKEND_URL + separator + path;
    },
    imageUrl: function(src) {
      if (!src) return '';
      // If it's already a full URL or data URI, return as is
      if (src.indexOf('http://') === 0 || 
          src.indexOf('https://') === 0 || 
          src.indexOf('data:') === 0 || 
          src.indexOf('images/') === 0) {
        return src;
      }
      var separator = (src.charAt(0) === '/') ? '' : '/';
      return BACKEND_URL + separator + src;
    }
  };
})();

// Ensure it's globally accessible
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
