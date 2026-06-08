/**
 * Monika Opticals - API Configuration
 * Pure ES5 version for maximum compatibility.
 */
var API_CONFIG = (function() {
  // Dynamically use the current domain since frontend and backend are now hosted together
  var BACKEND_URL = typeof window !== 'undefined' ? window.location.origin : '';

  return {
    BASE_URL: BACKEND_URL,
    api: function(path) {
      var separator = (path.charAt(0) === '/') ? '' : '/';
      return BACKEND_URL + separator + path;
    },
    imageUrl: function(src) {
      if (!src) return '';
      // Force HTTPS for mixed content issues on Hostinger
      if (src.indexOf('http://') === 0) {
        src = src.replace('http://', 'https://');
      }
      
      if (src.indexOf('https://') === 0 || 
          src.indexOf('data:') === 0 || 
          src.indexOf('images/') === 0) {
        return src;
      }
      var separator = (src.charAt(0) === '/') ? '' : '/';
      return BACKEND_URL + separator + src;
    }
  };
})();

// Global helper for image carousel
if (typeof window !== 'undefined') {
  window.scrollNextImage = function(wrap) {
    var track = wrap.querySelector('.product-card__scroll-track');
    if (!track) return;
    var width = track.offsetWidth;
    var maxScroll = track.scrollWidth - width;
    // Use a small buffer to handle floating point scroll widths
    if (track.scrollLeft + width >= maxScroll - 5) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollTo({ left: track.scrollLeft + width, behavior: 'smooth' });
    }
  };
}

// Ensure it's globally accessible
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}

