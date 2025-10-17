// Generic Background Initialization
// This file configures the dot matrix and scroll behavior for the generic background system
// To use: Include dotmatrix-background.js and generic-parallax-circles.js modules, then include this script

window.addEventListener('load', function() {
  // Disable circle height checking temporarily to prevent rebuild during fade-in
  let heightCheckEnabled = false;

  // Wait for all scripts to initialize and layout to settle before fading in
  // This prevents the glitch where circles reposition after becoming visible
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const dotmatrix = document.getElementById('dotmatrix');
        const circles = document.querySelector('.bg-circles');
        const globeCanvas = document.getElementById('globe-canvas');

        if (dotmatrix) {
          dotmatrix.style.opacity = '1';
        }
        if (circles) {
          circles.style.opacity = '1';
        }
        if (globeCanvas) {
          globeCanvas.style.opacity = '1';
        }

        // Re-enable height checking after fade-in is complete
        setTimeout(() => {
          heightCheckEnabled = true;
        }, 1000);
      }, 100);
    });
  });

  // Note: Settings are now baked into dotmatrix-background.js defaults
  // No need to override them here unless customizing

  // Connect scroll to noise offset Y (inverted with small multiplier)
  const scrollMultiplier = 0.0005; // Small multiplier for subtle effect
  window.addEventListener('scroll', function() {
    if (window.dotMatrixParams && window.syncParamsToUniforms) {
      const scrollY = window.scrollY;
      dotMatrixParams.noiseOffsetY = -scrollY * scrollMultiplier; // Inverted
      window.syncParamsToUniforms();
    }
  }, { passive: true });
});
