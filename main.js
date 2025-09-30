// DEVELOPER SWITCH: Set to true to skip logo and theme animations
const SKIP_INTRO_ANIMATIONS = false;
const SKIP_LOGS = true;

function logger(msg) {
  SKIP_LOGS || console.log(msg);
}
console.log("woho");
// Wait for the page to fully load
window.addEventListener('load', function () {
  logger('Page loaded');

  // Initialize dot matrix parameters
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

    // Main Noise - Use dotmatrix.js init values for visibility
    dotMatrixParams.mainNoiseEnabled = true;
    dotMatrixParams.noiseAnimated = true;
    dotMatrixParams.noiseScale = 80.0;      // From dotmatrix.js
    dotMatrixParams.noiseSpeed = 20.0;       // From dotmatrix.js
    dotMatrixParams.noiseOffsetX = -0.9;    // From dotmatrix.js
    dotMatrixParams.noiseOffsetY = 0.0;
    dotMatrixParams.noiseOffsetZ = 0.0;
    dotMatrixParams.noiseEvolution = 0.0;
    dotMatrixParams.noiseOctaves = 4;
    dotMatrixParams.noiseLacunarity = 2.0;
    dotMatrixParams.noiseGain = 0.673;      // From dotmatrix.js
    dotMatrixParams.noiseThreshold = 0.3; // From dotmatrix.js
    dotMatrixParams.noiseIslandSize = 0.8937;   // From dotmatrix.js
    dotMatrixParams.noiseExposure = 0.742;     // From dotmatrix.js
    dotMatrixParams.noiseGamma = 0.5;     // From dotmatrix.js
    dotMatrixParams.noiseMultiplier = 0.0; // From dotmatrix.js

    // Influence Zone 1 - Use dotmatrix.js init values
    dotMatrixParams.influence1Enabled = true;
    dotMatrixParams.influence1Subtract = false;
    dotMatrixParams.influence1X = 0.5;      // From dotmatrix.js
    dotMatrixParams.influence1Y = 0.5;      // From dotmatrix.js
    dotMatrixParams.influence1RadiusX = 0.04; // From dotmatrix.js
    dotMatrixParams.influence1RadiusY = 0.04; // From dotmatrix.js
    dotMatrixParams.influence1Falloff = 2.0; // From dotmatrix.js
    dotMatrixParams.influence1Intensity = 0.0; // From dotmatrix.js - was 0.0!

    // Influence Zone 1 Edge Noise - Match main noise exactly
    dotMatrixParams.influence1EdgeEnabled = true;
    dotMatrixParams.influence1EdgeStart = 0.0;      // Lower start point for edge effect
    dotMatrixParams.influence1EdgeInfluence = 1.5;  // Moderate influence
    dotMatrixParams.influence1EdgeScale = 60.0;     // Same as main noise
    dotMatrixParams.influence1EdgeSpeed = 30.0;     // Same as main noise
    dotMatrixParams.influence1EdgeOctaves = 4;      // Same as main noise
    dotMatrixParams.influence1EdgeLacunarity = 2.0; // Same as main noise
    dotMatrixParams.influence1EdgeGain = 0.673;     // Same as main noise
    dotMatrixParams.influence1EdgeThreshold = 0.4;  // Same as main noise
    dotMatrixParams.influence1EdgeIslandSize = 0.4937; // Same as main noise
    dotMatrixParams.influence1EdgeExposure = 0.342;    // Same as main noise
    dotMatrixParams.influence1EdgeGamma = 0.5;      // Same as main noise

    // Influence Zone 2 - DISABLED
    dotMatrixParams.influence2Enabled = false;
    dotMatrixParams.influence2Subtract = true;
    dotMatrixParams.influence2X = 0.5;
    dotMatrixParams.influence2Y = 0.5;
    dotMatrixParams.influence2RadiusX = 0.05;
    dotMatrixParams.influence2RadiusY = 0.05;
    dotMatrixParams.influence2Falloff = 1.5;
    dotMatrixParams.influence2Intensity = 0.0;

    // Influence Zone 2 Edge Noise
    dotMatrixParams.influence2EdgeEnabled = false;
    dotMatrixParams.influence2EdgeStart = 0.4;
    dotMatrixParams.influence2EdgeInfluence = 0.25;
    dotMatrixParams.influence2EdgeScale = 8.0;
    dotMatrixParams.influence2EdgeSpeed = 0.5;
    dotMatrixParams.influence2EdgeOctaves = 3;
    dotMatrixParams.influence2EdgeLacunarity = 2.0;
    dotMatrixParams.influence2EdgeGain = 0.5;
    dotMatrixParams.influence2EdgeThreshold = 0.8;
    dotMatrixParams.influence2EdgeIslandSize = 0.5;
    dotMatrixParams.influence2EdgeExposure = 0.0;
    dotMatrixParams.influence2EdgeGamma = 1.0;

    logger('Dot matrix parameters initialized');

    // Defer sync to ensure dotMatrix is fully initialized
    setTimeout(() => {
      if (window.syncParamsToUniforms) {
        console.log('Syncing initial dotMatrix parameters to shader uniforms...');
        console.log('influence1Intensity:', dotMatrixParams.influence1Intensity);
        console.log('influence1EdgeEnabled:', dotMatrixParams.influence1EdgeEnabled);
        console.log('influence1EdgeScale:', dotMatrixParams.influence1EdgeScale);
        console.log('influence1EdgeSpeed:', dotMatrixParams.influence1EdgeSpeed);
        console.log('influence1EdgeGain:', dotMatrixParams.influence1EdgeGain);
        console.log('influence1EdgeThreshold:', dotMatrixParams.influence1EdgeThreshold);
        window.syncParamsToUniforms();
        console.log('Sync complete.');

        // Force a second sync after a brief delay to ensure all parameters are applied
        setTimeout(() => {
          console.log('Second sync to ensure edge noise parameters are applied...');
          window.syncParamsToUniforms();
        }, 50);
      } else {
        console.warn('syncParamsToUniforms function not available after timeout');
      }
    }, 100);
  }

  // Debug: Check what's available globally
  logger('anime:', typeof anime);
  logger('animeJS:', typeof animeJS);
  logger('window.anime:', typeof window.anime);

  // Check if anime is loaded (v4 should use global anime object)
  if (typeof anime === 'undefined') {
    logger('Anime.js is not loaded!');
    return;
  }

  logger('Anime.js loaded successfully!');
  logger('Available methods:', Object.keys(anime));

  // Destructure the anime.js functions from the global object
  const { animate, utils, onScroll, createTimeline } = anime;

  // Prevent scrolling initially by blocking scroll events (unless skipping intro)
  let scrollBlocked = !SKIP_INTRO_ANIMATIONS;

  const blockScroll = (e) => {
    if (scrollBlocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Block scroll events (unless skipping intro)
  if (!SKIP_INTRO_ANIMATIONS) {
    window.addEventListener('scroll', blockScroll, { passive: false });
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
  }

  // Set initial state for hero prism headings
  const heroContainer = document.querySelector('#hero .heading-container');
  const heroPrismHeadings = heroContainer.querySelectorAll('.heading-prism');
  const heroMainHeading = heroContainer.querySelector('.heading-main');
  const heroHomeContainer = document.querySelector('#hero .homeContent');

  // Logo selectors
  const logoAll = document.querySelector('.paritee-logo');
  const logo1 = document.querySelector('.paritee-logo.cyan');
  const logo2 = document.querySelector('.paritee-logo.purple');
  const logo3 = document.querySelector('.paritee-logo.yellow');




  utils.set(heroPrismHeadings[0], { opacity: 0, x: window.innerWidth, filter: 'blur(5px)' }); // cyan
  utils.set(heroPrismHeadings[1], { opacity: 0, x: window.innerWidth + 30, filter: 'blur(5px)' }); // purple
  utils.set(heroPrismHeadings[2], { opacity: 0, x: window.innerWidth + 60, filter: 'blur(5px)' }); // yellow
  utils.set(heroMainHeading, { opacity: 0 });
  utils.set(heroHomeContainer, { opacity: 0 });

  utils.set(logo1, { opacity: 0 });
  utils.set(logo2, { opacity: 0 });
  utils.set(logo3, { opacity: 0 });

  // If skipping intro, immediately set final states
  if (SKIP_INTRO_ANIMATIONS) {
    logger('Skipping intro animations - setting final states');

    // HIDE logos - they should be gone after the intro
    utils.set(logo1, { opacity: 0, width: '240px', left: '50%' });
    utils.set(logo2, { opacity: 0, width: '240px', left: '50%' });
    utils.set(logo3, { opacity: 0, width: '240px', left: '50%' });

    // Set hero headings to visible
    utils.set(heroPrismHeadings[0], { opacity: 1, x: 0, filter: 'blur(0px)' });
    utils.set(heroPrismHeadings[1], { opacity: 1, x: 0, filter: 'blur(0px)' });
    utils.set(heroPrismHeadings[2], { opacity: 1, x: 0, filter: 'blur(0px)' });
    utils.set(heroMainHeading, { opacity: 1 });
    utils.set(heroHomeContainer, { opacity: 1 });

    // Set theme to light mode
    utils.set('.bg-light', { opacity: 1 });
    utils.set('.heading-main', { color: '#1A1A2E' });
    utils.set('#hero .heading-main', { color: '#1A1A2E' });

    // Set circles to their final positions
    utils.set('.circle-1', { translateX: 150, translateY: 100, scale: 1.3 });
    utils.set('.circle-1 circle', { fill: '#C8DDFF' });
    utils.set('.circle-2', { translateX: -100, translateY: 50, scale: 0.8 });
    utils.set('.circle-2 circle', { fill: '#E8D8FF' });
    utils.set('.circle-3', { translateX: -80, translateY: -120, scale: 1.2 });
    utils.set('.circle-3 circle', { fill: '#C8DDFF' });
    utils.set('.circle-4', { translateX: 200, translateY: -80, scale: 1.1 });
    utils.set('.circle-4 circle', { fill: '#E8D8FF' });
    utils.set('.circle-5', { translateX: -150, translateY: -100, scale: 0.9 });
    utils.set('.circle-5 circle', { fill: '#C8DDFF' });

    // Set dotMatrix to final state (no influence zones visible)
    if (window.dotMatrixParams) {
      dotMatrixParams.influence1Intensity = 0.0;
      dotMatrixParams.influence2Intensity = 0.0;
      dotMatrixParams.influence1RadiusX = 0.02;
      dotMatrixParams.influence1RadiusY = 0.02;
      dotMatrixParams.influence1Falloff = 2.0;
      dotMatrixParams.influence2RadiusX = 0.05;
      dotMatrixParams.influence2RadiusY = 0.05;
      dotMatrixParams.influence2Falloff = 1.5;

      // Sync these changes to the shader uniforms
      if (window.syncParamsToUniforms) {
        window.syncParamsToUniforms();
      }
    }

    // Defer starting scroll listener to ensure everything is initialized
    setTimeout(() => {
      startScrollListener();
    }, 100);
  }

  const heroLogoRevealTl = createTimeline({
    autoplay: !SKIP_INTRO_ANIMATIONS
  })
    .add(dotMatrixParams, {
      influence1Intensity: 1,
      duration: 100,
      ease: 'outExpo',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, 2000)
    .add(dotMatrixParams, {
      influence1Intensity: 1,
      influence1Falloff: 0.4,
      duration: 2000,
      ease: 'outExpo',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    })
    .add(dotMatrixParams, {
      influence1RadiusX: 2.0,
      influence1RadiusY: 2.0,
      influence1Falloff: 0.1,
      influence1EdgeScale: 50,
      duration: 2500,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    })
    .add(dotMatrixParams, {
      noiseMultiplier: 0.4,
      duration: 1500,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, 5000)
    .add(dotMatrixParams, {
      influence1EdgeThreshold: 0.8,
      duration: 2000,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, 5000)
    //LOGO SCALE ANDD FADE
    .add(logo1, {
      opacity: 1.0,
      duration: 1000,
      ease: 'inOutSine',
    }, 4500)
    .add(logo1, {
      width: ['200px', '240px'],
      duration: 5000,
    }, 4500)
    .add(logo2, {
      opacity: 1.0,
      duration: 1000,
      ease: 'inOutSine',
    }, 4500)
    .add(logo2, {
      width: ['200px', '240px'],
      duration: 5000,
    }, 4500)
    .add(logo3, {
      opacity: 1.0,
      duration: 1000,
      ease: 'inOutSine',
    }, 4500)
    .add(logo3, {
      width: ['200px', '240px'],
      duration: 5000,
    }, 4500)
    //LOGO COLOR SHIFT
    .add(logo1, {
      left: ['50%', '50.1%'],
      duration: 1000,
      ease: 'inOutSine',
    }, 4500)
    .add(logo1, {
      left: ['50.1%', '50%'],
      duration: 1000,
      ease: 'inOutSine',
    }, 5500)
    .add(logo2, {
      left: ['50%', '49.9%'],
      duration: 1000,
      ease: 'inOutSine',
    }, 4500)
    .add(logo2, {
      left: ['49.9%', '50%'],
      duration: 1000,
      ease: 'inOutSine',
    }, 5500)

    //OPACITY GLITCH OUT
    .add(logo1, {
      opacity: 0.0,
      duration: 10,
    }, 9000)
    .add(logo1, {
      opacity: 1.0,
      duration: 10,
    }, 9100)
    .add(logo1, {
      opacity: 0.0,
      duration: 10,
    }, 9150)
    .add(logo1, {
      opacity: 1.0,
      duration: 10,
    }, 9200)
    .add(logo1, {
      opacity: 0.0,
      duration: 10,
    }, 9220)
    .add(logo2, {
      opacity: 0.0,
      duration: 10,
    }, 9000)
    .add(logo2, {
      opacity: 1.0,
      duration: 10,
    }, 9100)
    .add(logo2, {
      opacity: 0.0,
      duration: 10,
    }, 9150)
    .add(logo2, {
      opacity: 1.0,
      duration: 10,
    }, 9200)
    .add(logo2, {
      opacity: 0.0,
      duration: 10,
    }, 9220)
    .add(logo3, {
      opacity: 0.0,
      duration: 10,
    }, 9000)
    .add(logo3, {
      opacity: 1.0,
      duration: 10,
    }, 9100)
    .add(logo3, {
      opacity: 0.0,
      duration: 10,
    }, 9150)
    .add(logo3, {
      opacity: 1.0,
      duration: 10,
    }, 9200)
    .add(logo3, {
      opacity: 0.0,
      duration: 10,
    }, 9220)
    .add(dotMatrixParams, {
      influence2RadiusX: 1.0,
      influence2RadiusY: 1.0,
      influence2Falloff: 0.8,
      influence2Intensity: 1,
      duration: 2500,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, '-=3000')
    .add(dotMatrixParams, {
      influence2EdgeThreshold: 1,
      influence1Intensity: 0.0,
      duration: 1500,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, '-=4000')
    .add(dotMatrixParams, {
      influence2Intensity: 0,
      duration: 1500,
      ease: 'outSine',
      onUpdate: () => window.syncParamsToUniforms && window.syncParamsToUniforms()
    }, '-=3000');

  const themeTimeline = createTimeline({
    autoplay: !SKIP_INTRO_ANIMATIONS,
    onComplete: function () {
      logger('Theme timeline complete, playing hero heading animation');
      // Play the hero heading animation after theme timeline completes
      heroHeadingTimeline.play();
      startScrollListener(); // Start listening to scroll after initial animations

    },
  });



  // 3 second idle state (nothing happens)
  const idleTime = 5000;

  // Circle 2 expands and lightens first (lead circle)
  themeTimeline.add('.circle-2', {
    translateX: -100,  // Base position
    translateY: 50,     // Base position
    scale: [1, 1.8], // Expand more than its final size first
    duration: 500,
    ease: 'outExpo'
  }, idleTime);

  themeTimeline.add('.circle-2 circle', {
    fill: ['#3B167A', '#E8D8FF'],
    duration: 500,
    ease: 'outExpo'
  }, idleTime);

  // Then scale down to final size while others start animating
  themeTimeline.add('.circle-2', {
    scale: [1.8, 0.8], // Settle to final size
    duration: 2000,
    ease: 'inOutSine'
  }, idleTime + 1500);

  // Background and other elements follow after circle 2 starts
  const followDelay = idleTime + 800; // Start 800ms after circle 2

  // Animate background gradient to much brighter mode
  themeTimeline.add('.bg-light', {
    opacity: [0, 1],
    duration: 3500,
    ease: 'inOutSine'
  }, followDelay);

  // Animate main heading text colors to dark for light mode
  themeTimeline.add('.heading-main', {
    color: ['#333333', '#1A1A2E'],
    duration: 3500,
    ease: 'inOutSine'
  }, followDelay);

  // Transition hero main heading text to dark
  themeTimeline.add('#hero .heading-main', {
    color: ['#333333', '#1A1A2E'],
    duration: 3500,
    ease: 'inOutSine'
  }, followDelay);

  // Animate circle 1 - move, scale and color change
  themeTimeline.add('.circle-1', {
    translateX: [0, 150],  // Keep base position
    translateY: [0, 100],   // Keep base position
    scale: [1, 1.3],
    duration: 3000,
    ease: 'inOutQuad'
  }, followDelay + 200);

  themeTimeline.add('.circle-1 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 3000,
    ease: 'inOutSine'
  }, followDelay + 200);

  // Animate circle 3 - move, scale and color change
  themeTimeline.add('.circle-3', {
    translateX: [0, -80],
    translateY: [0, -120],
    scale: [1, 1.2],
    duration: 3000,
    ease: 'inOutQuad'
  }, followDelay + 400);

  themeTimeline.add('.circle-3 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 3000,
    ease: 'inOutSine'
  }, followDelay + 400);

  // Animate circle 4 - move, scale and color change
  themeTimeline.add('.circle-4', {
    translateX: [0, 200],  // Keep base position
    translateY: [0, -80],   // Keep base position
    scale: [1, 1.1],
    duration: 3000,
    ease: 'inOutQuad'
  }, followDelay + 600);

  themeTimeline.add('.circle-4 circle', {
    fill: ['#3B167A', '#E8D8FF'],
    duration: 3000,
    ease: 'inOutSine'
  }, followDelay + 600);

  // Animate circle 5 - move, scale and color change
  themeTimeline.add('.circle-5', {
    translateX: [0, -150],  // Keep base position
    translateY: [0, -100],   // Keep base position
    scale: [1, 0.9],
    duration: 3000,
    ease: 'inOutQuad'
  }, followDelay + 800);

  themeTimeline.add('.circle-5 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 3000,
    ease: 'inOutSine'
  }, followDelay + 800);

  // Create heading animation timeline for hero
  const heroHeadingTimeline = createTimeline({
    autoplay: SKIP_INTRO_ANIMATIONS,
    onComplete: function () {
      logger('Hero heading animation complete, enabling scroll');
      // Enable scrolling after all hero animations complete
      scrollBlocked = false;
      // Remove event listeners
      if (!SKIP_INTRO_ANIMATIONS) {
        window.removeEventListener('scroll', blockScroll);
        window.removeEventListener('wheel', blockScroll);
        window.removeEventListener('touchmove', blockScroll);
      }
    }
  });

  // Add prism animations for hero section (same as section-1)
  let heroPrismTime = 600;
  let heroPrismStart = window.innerWidth - 300;

  // Animate cyan layer - movement, opacity and blur together
  heroHeadingTimeline.add(heroPrismHeadings[0], {
    opacity: [0, 1],
    x: [heroPrismStart, 0],
    filter: ['blur(5px)', 'blur(0px)'],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 0);

  // Animate purple layer - movement, opacity and blur together
  heroHeadingTimeline.add(heroPrismHeadings[1], {
    opacity: [0, 1],
    x: [heroPrismStart + 1, 0],
    filter: ['blur(5px)', 'blur(0px)'],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 30);

  // Animate yellow layer - movement, opacity and blur together
  heroHeadingTimeline.add(heroPrismHeadings[2], {
    opacity: [0, 1],
    x: [heroPrismStart + 2, 0],
    filter: ['blur(5px)', 'blur(0px)'],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 50);

  // Quickly fade in the dark grey text after prism settles
  heroHeadingTimeline.add(heroMainHeading, {
    opacity: [0, 1],
    duration: 200,
    ease: 'outSine'
  }, heroPrismTime + 100);

  heroHeadingTimeline.add(heroHomeContainer, {
    opacity: [0, 1],
    duration: 2000,
    ease: 'inOutSine'
  });


  // Track scroll direction
  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';

  // Update scroll direction on scroll
  const updateScrollDirection = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      scrollDirection = 'down';
    } else if (currentScrollY < lastScrollY) {
      scrollDirection = 'up';
    }
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', updateScrollDirection, { passive: true });

  // Get all section heading containers except hero
  const headingContainers = document.querySelectorAll('.section:not(#hero) .heading-container');

  // Set initial state for prism headings - start from right side
  headingContainers.forEach(function (container) {
    const prismHeadings = container.querySelectorAll('.heading-prism');
    const mainHeading = container.querySelector('.heading-main');
    const section = container.closest('.section'); // Get the parent section
    const homeContent = section ? section.querySelector('.homeContent') : null; // Find homeContent in the section

    // Set initial positions - start from right side of screen
    utils.set(prismHeadings[0], { opacity: 0, x: window.innerWidth, filter: 'blur(5px)' }); // cyan
    utils.set(prismHeadings[1], { opacity: 0, x: window.innerWidth + 30, filter: 'blur(5px)' }); // purple - slightly offset
    utils.set(prismHeadings[2], { opacity: 0, x: window.innerWidth + 60, filter: 'blur(5px)' }); // green - more offset
    utils.set(mainHeading, { opacity: 0 });
    if (homeContent) {
      utils.set(homeContent, { opacity: 0 });
    }
  });

  // Create scroll-triggered prism animations for each section
  headingContainers.forEach(function (container) {
    const prismHeadings = container.querySelectorAll('.heading-prism');
    const mainHeading = container.querySelector('.heading-main');
    const section = container.closest('.section'); // Get the parent section
    const homeContent = section ? section.querySelector('.homeContent') : null; // Find homeContent in the section

    logger('Setting up prism animation for:', mainHeading.textContent);

    // Track if this section has been animated
    let hasAnimated = false;

    // Create timeline for this heading's animation
    const headingTimeline = createTimeline({
      autoplay: false
    });

    // Create scroll observer that plays timeline only when scrolling down
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Only animate when scrolling down and hasn't animated yet
          if (scrollDirection === 'down' && !hasAnimated) {
            // Reset to start positions before playing
            utils.set(prismHeadings[0], { opacity: 0, x: window.innerWidth });
            utils.set(prismHeadings[1], { opacity: 0, x: window.innerWidth + 30 });
            utils.set(prismHeadings[2], { opacity: 0, x: window.innerWidth + 60 });
            utils.set(mainHeading, { opacity: 0 });
            if (homeContent) {
              utils.set(homeContent, { opacity: 0 });
            }
            // Play the timeline
            headingTimeline.restart();
            hasAnimated = true;
          } else if (scrollDirection === 'up' && hasAnimated) {
            // When scrolling up, ensure elements are in their final state
            utils.set(prismHeadings[0], { opacity: 1, x: 0, filter: 'blur(0px)' });
            utils.set(prismHeadings[1], { opacity: 1, x: 0, filter: 'blur(0px)' });
            utils.set(prismHeadings[2], { opacity: 1, x: 0, filter: 'blur(0px)' });
            utils.set(mainHeading, { opacity: 1 });
            if (homeContent) {
              utils.set(homeContent, { opacity: 1 });
            }
          }
        } else {
          // When section goes out of view while scrolling up, reset animation state and hide elements
          if (scrollDirection === 'up') {
            hasAnimated = false;
            // Reset to initial hidden state for next animation
            utils.set(prismHeadings[0], { opacity: 0, x: window.innerWidth, filter: 'blur(5px)' });
            utils.set(prismHeadings[1], { opacity: 0, x: window.innerWidth + 30, filter: 'blur(5px)' });
            utils.set(prismHeadings[2], { opacity: 0, x: window.innerWidth + 60, filter: 'blur(5px)' });
            utils.set(mainHeading, { opacity: 0 });
            if (homeContent) {
              utils.set(homeContent, { opacity: 0 });
            }
          }
        }
      });
    }, { threshold: 0.3 });

    observer.observe(container);

    let prismTime = 600;
    let prismStart = window.innerWidth - 300;

    // Animate cyan layer - movement, opacity and blur together
    headingTimeline.add(prismHeadings[0], {
      opacity: [0, 1],
      x: [prismStart, 0],
      filter: ['blur(5px)', 'blur(0px)'],
      duration: prismTime,
      ease: 'outSine'
    }, 0);

    // Animate purple layer - movement, opacity and blur together
    headingTimeline.add(prismHeadings[1], {
      opacity: [0, 1],
      x: [prismStart + 1, 0],
      filter: ['blur(5px)', 'blur(0px)'],
      duration: prismTime,
      ease: 'outSine'
    }, 30);

    // Animate yellow layer - movement, opacity and blur together
    headingTimeline.add(prismHeadings[2], {
      opacity: [0, 1],
      x: [prismStart + 2, 0],
      filter: ['blur(5px)', 'blur(0px)'],
      duration: prismTime,
      ease: 'outSine'
    }, 50);

    // Quickly fade in the dark grey text after prism settles
    headingTimeline.add(mainHeading, {
      opacity: [0, 1],
      duration: 200,
      ease: 'outSine'
    }, prismTime + 100);

    if (homeContent) {
      headingTimeline.add(homeContent, {
        opacity: [0, 1],
        duration: 2000,
        ease: 'inOutSine'
      }, prismTime + 500); // Start slightly after the main heading appears
    }
  });

  logger('All animations initialized!');

  // Set original circles to their final theme timeline state (they'll remain static)
  const setCirclesToFinalState = () => {
    // Final state from theme timeline
    utils.set('.circle-1', { translateX: 150, translateY: 100, scale: 1.3 });
    utils.set('.circle-1 circle', { fill: '#C8DDFF' });
    utils.set('.circle-2', { translateX: -100, translateY: 50, scale: 0.8 });
    utils.set('.circle-2 circle', { fill: '#E8D8FF' });
    utils.set('.circle-3', { translateX: -80, translateY: -120, scale: 1.2 });
    utils.set('.circle-3 circle', { fill: '#C8DDFF' });
    utils.set('.circle-4', { translateX: 200, translateY: -80, scale: 1.1 });
    utils.set('.circle-4 circle', { fill: '#E8D8FF' });
    utils.set('.circle-5', { translateX: -150, translateY: -100, scale: 0.9 });
    utils.set('.circle-5 circle', { fill: '#C8DDFF' });
  };

  // Create parallax circles that span the full page height
  const createParallaxCircles = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const totalPageHeight = documentHeight + windowHeight * 2; // Extra height for smooth entrance/exit

    // Parallax layers configuration - TESTING WITH VERY VISIBLE CIRCLES
    const layers = {
      background: {
        speed: -0.3, // Opposite direction, slow
        count: 3, // Very few for testing
        sizeRange: [200, 300],
        opacityRange: [1.0, 1.0], // FULL OPACITY
        colors: ['#FF0000', '#00FF00', '#0000FF'] // BRIGHT RED, GREEN, BLUE
      },
      middle: {
        speed: -0.6, // Opposite direction, medium
        count: 2, // Very few for testing
        sizeRange: [250, 350],
        opacityRange: [1.0, 1.0], // FULL OPACITY
        colors: ['#FFFF00', '#FF00FF'] // BRIGHT YELLOW, MAGENTA
      },
      foreground: {
        speed: -1.0, // Opposite direction, fast - passes camera in 100vh
        count: 2, // Very few for testing
        sizeRange: [300, 400],
        opacityRange: [1.0, 1.0], // FULL OPACITY
        colors: ['#00FFFF', '#FFA500'] // BRIGHT CYAN, ORANGE
      }
    };

    const circleContainer = document.querySelector('body');
    const parallaxCircles = [];

    Object.entries(layers).forEach(([layerName, config]) => {
      for (let i = 0; i < config.count; i++) {
        // Create SVG circle element
        const svg = document.createElement('svg');
        svg.classList.add('parallax-circle', `parallax-${layerName}`);

        const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
        const opacity = config.opacityRange[0] + Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];

        // Position circles prominently on screen for testing
        const x = (window.innerWidth / 2) + (Math.random() - 0.5) * 400; // Center with some spread
        const startY = (window.innerHeight / 2) + (Math.random() - 0.5) * 200; // Center vertically

        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${startY}px;
          opacity: ${opacity};
          pointer-events: none;
          z-index: ${layerName === 'background' ? 9998 : layerName === 'middle' ? 9999 : 10000};
          transform: translateZ(0);
        `;

        // Debug logging for first few circles
        if (i < 2) {
          logger(`Created ${layerName} circle ${i}: x=${x.toFixed(0)}, startY=${startY.toFixed(0)}, size=${size.toFixed(0)}`);
        }

        const circle = document.createElement('circle');
        circle.setAttribute('cx', size / 2);
        circle.setAttribute('cy', size / 2);
        circle.setAttribute('r', size / 2);
        circle.setAttribute('fill', color);

        svg.appendChild(circle);
        circleContainer.appendChild(svg);

        // Store circle data for animation
        parallaxCircles.push({
          element: svg,
          speed: config.speed,
          initialY: startY,
          x: x
        });
      }
    });

    return parallaxCircles;
  };

  // Parallax scroll handler for new circles
  let parallaxCircles = [];

  const updateParallaxCircles = () => {
    const scrollY = window.scrollY;

    // Debug logging - more frequent for testing
    if (Math.random() < 0.1) { // Log more frequently
      console.log(`PARALLAX UPDATE: scrollY=${scrollY}, circles=${parallaxCircles.length}`);
      if (parallaxCircles.length > 0) {
        console.log(`First circle: initialY=${parallaxCircles[0].initialY}, speed=${parallaxCircles[0].speed}`);
      }
    }

    parallaxCircles.forEach((circle, index) => {
      // Move opposite to scroll direction
      const newY = circle.initialY + (scrollY * circle.speed);
      circle.element.style.top = `${newY}px`;

      // Debug first circle movement
      if (index === 0 && Math.random() < 0.05) {
        console.log(`Circle 0 moving: initialY=${circle.initialY}, scrollY=${scrollY}, speed=${circle.speed}, newY=${newY}`);
      }
    });
  };

  const initializeParallaxSystem = () => {
    console.log('=== INITIALIZING PARALLAX SYSTEM ===');

    // Set original circles to their final theme state
    setCirclesToFinalState();

    // Create new parallax circles
    console.log('Creating parallax circles...');
    parallaxCircles = createParallaxCircles();
    console.log(`=== CREATED ${parallaxCircles.length} PARALLAX CIRCLES ===`);

    // Log each circle for debugging
    parallaxCircles.forEach((circle, i) => {
      console.log(`Circle ${i}: x=${circle.x}, initialY=${circle.initialY}, speed=${circle.speed}`);
    });

    // Start the parallax scroll listener
    window.addEventListener('scroll', updateParallaxCircles, { passive: true });
    console.log('=== PARALLAX SCROLL LISTENER ATTACHED ===');

    // Initialize parallax circles on load
    updateParallaxCircles();
    console.log('=== PARALLAX SYSTEM INITIALIZED ===');
  };

  const startScrollListener = () => {
    // Initialize the parallax system immediately
    initializeParallaxSystem();
  };

  // IMMEDIATE TEST - CREATE CIRCLES RIGHT NOW
  console.log('=== CREATING TEST CIRCLES IMMEDIATELY ===');

  // Create parallax circles distributed across full page height
  const createFullPageParallax = () => {
    console.log('=== CREATING FULL PAGE PARALLAX ===');

    // Calculate full page dimensions
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    const pageWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    console.log(`Page dimensions: ${pageWidth}x${pageHeight}, Viewport: ${viewportHeight}`);

    // Create three depth layers with circles distributed across full page height
    const layers = [
      { name: 'background', count: 15, speed: -0.3, color: '#FF6B6B', size: [80, 150] },
      { name: 'middle', count: 12, speed: -0.6, color: '#4ECDC4', size: [100, 200] },
      { name: 'foreground', count: 8, speed: -1.0, color: '#45B7D1', size: [120, 250] }
    ];

    const allCircles = [];

    layers.forEach(layer => {
      console.log(`Creating ${layer.count} ${layer.name} circles`);

      for (let i = 0; i < layer.count; i++) {
        const div = document.createElement('div');

        // Random size within range
        const size = layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]);

        // Random position across full page
        const x = Math.random() * (pageWidth - size);
        const y = Math.random() * (pageHeight + viewportHeight * 2) - viewportHeight; // Extra height for smooth entrance

        div.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${layer.color};
          border-radius: 50%;
          left: ${x}px;
          top: ${y}px;
          z-index: ${layer.name === 'background' ? 1 : layer.name === 'middle' ? 2 : 3};
          opacity: 0.3;
          pointer-events: none;
        `;

        document.body.appendChild(div);

        allCircles.push({
          element: div,
          initialY: y,
          speed: layer.speed,
          layer: layer.name
        });

        if (i < 2) {
          console.log(`${layer.name} circle ${i}: x=${x.toFixed(0)}, y=${y.toFixed(0)}, size=${size.toFixed(0)}`);
        }
      }
    });

    console.log(`Total circles created: ${allCircles.length}`);

    // Add scroll listener
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      allCircles.forEach((circle, index) => {
        const newY = circle.initialY + (scrollY * circle.speed);
        circle.element.style.top = newY + 'px';
      });

      // Occasional debug
      if (Math.random() < 0.02) {
        console.log(`Scroll: ${scrollY}, moving ${allCircles.length} circles`);
      }
    });

    console.log('=== FULL PAGE PARALLAX COMPLETE ===');
    return allCircles;
  };

  // Run immediately
  createFullPageParallax();

  // Force initialize parallax system after everything is loaded
  setTimeout(() => {
    if (parallaxCircles.length === 0) {
      logger('Force initializing parallax system...');
      initializeParallaxSystem();
    }
  }, 1000);

  // Background theme transition timeline (this is the main hero animation)
});
