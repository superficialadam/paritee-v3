// Generic Background Initialization
// This file configures the dot matrix and scroll behavior for the generic background system
// To use: Include dotmatrix.js and generic-parallax-circles.js modules, then include this script

window.addEventListener('load', function() {
  if (window.dotMatrixParams) {
    // Camera
    dotMatrixParams.cameraOffsetX = 0.0;
    dotMatrixParams.cameraOffsetY = 0.0;
    dotMatrixParams.cameraOffsetZ = 6.0;
    dotMatrixParams.cameraFOV = 70;

    // Dot Matrix
    dotMatrixParams.gridResolution = 80;
    dotMatrixParams.sizeBlack = 0.5;
    dotMatrixParams.sizeWhite = 16;
    dotMatrixParams.pointMargin = 1.0;
    dotMatrixParams.pointOpacity = 1.0;

    // Main Noise - Slower animation with scroll-linked offset
    dotMatrixParams.mainNoiseEnabled = true;
    dotMatrixParams.noiseAnimated = true;
    dotMatrixParams.noiseScale = 80.0;
    dotMatrixParams.noiseSpeed = 4.0; // Slower animation
    dotMatrixParams.noiseOffsetX = -0.9;
    dotMatrixParams.noiseOffsetY = 0.0;
    dotMatrixParams.noiseOffsetZ = 0.0;
    dotMatrixParams.noiseEvolution = 0.0;
    dotMatrixParams.noiseOctaves = 4;
    dotMatrixParams.noiseLacunarity = 2.0;
    dotMatrixParams.noiseGain = 0.673;
    dotMatrixParams.noiseThreshold = 0.4;
    dotMatrixParams.noiseIslandSize = 0.8937;
    dotMatrixParams.noiseExposure = 0.742;
    dotMatrixParams.noiseGamma = 0.5;
    dotMatrixParams.noiseMultiplier = 0.4;

    // Influence Zone 1 - Disabled for generic background
    dotMatrixParams.influence1Enabled = false;
    dotMatrixParams.influence1Intensity = 0.0;

    // Influence Zone 2 - Disabled
    dotMatrixParams.influence2Enabled = false;
    dotMatrixParams.influence2Intensity = 0.0;

    // Sync settings
    setTimeout(() => {
      if (window.syncParamsToUniforms) {
        window.syncParamsToUniforms();
      }
    }, 100);
  }

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
