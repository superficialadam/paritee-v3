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

  // Circle configurations for each section - now with INTRO and MAIN states
  // Base positions from hero, with transformations dialed back by 5x
  const circleConfigs = {
    hero: {
      circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4, fill: '#C8DDFF' },
      circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3, fill: '#E8D8FF' },
      circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35, fill: '#C8DDFF' },
      circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45, fill: '#E8D8FF' },
      circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3, fill: '#C8DDFF' },
      dotMatrix: {
        influence1X: 0.5,
        influence1Y: 0.5,
        influence1RadiusX: 0.02,
        influence1RadiusY: 0.02,
        influence1Falloff: 2.0,
        influence1Intensity: 0.0,
        influence1EdgeStart: 0.3,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.5,
        influence1EdgeThreshold: 0.2,
        influence1EdgeIslandSize: 1.2,
        influence1EdgeExposure: 0.5,
        influence1EdgeGamma: 0.8
      }
    },
    section1_intro: {
      circle1: { x: -10, y: 220, scale: 3.9, opacity: 0.25, fill: '#0080B0' },  // 3x scale
      circle2: { x: 120, y: -90, scale: 2.4, opacity: 0.2, fill: '#0060A0' },   // 3x scale
      circle3: { x: 100, y: 40, scale: 3.6, opacity: 0.15, fill: '#0070A0' },   // 3x scale
      circle4: { x: -60, y: -260, scale: 2.75, opacity: 0.3, fill: '#0080B0' }, // 2.5x scale
      circle5: { x: 60, y: -10, scale: 2.7, opacity: 0.2, fill: '#0080A0' },    // 3x scale
      dotMatrix: {
        influence1X: 0.8,  // Right side
        influence1Y: 0.3,  // Upper area
        influence1RadiusX: 0.3,  // Medium-large radius
        influence1RadiusY: 0.3,
        influence1Falloff: 0.3,  // Much softer falloff
        influence1Intensity: 0.8,  // High intensity for intro
        influence1EdgeStart: 0.1,
        influence1EdgeInfluence: 0.9,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.08,
        influence1EdgeThreshold: 0.3,
        influence1EdgeIslandSize: 1.6,
        influence1EdgeExposure: 0.6,
        influence1EdgeGamma: 0.12
      }
    },
    section1_main: {
      circle1: { x: -250, y: 340, scale: 0.8, opacity: 0.6, fill: '#B8C5E8' },  // Smaller scale
      circle2: { x: 400, y: -250, scale: 0.5, opacity: 0.3, fill: '#C8B8D8' },  // Smaller scale
      circle3: { x: 280, y: 200, scale: 0.7, opacity: 0.2, fill: '#A8B8E0' },   // Smaller scale
      circle4: { x: -280, y: -440, scale: 0.6, opacity: 0.5, fill: '#D0C0E0' }, // Smaller scale
      circle5: { x: 270, y: 80, scale: 0.5, opacity: 0.35, fill: '#B0C0E8' },   // Smaller scale
      dotMatrix: {
        influence1X: 0.2,  // Left side - flows across screen
        influence1Y: 0.7,  // Lower area
        influence1RadiusX: 0.05,  // Small radius
        influence1RadiusY: 0.05,
        influence1Falloff: 0.8,  // Still soft falloff
        influence1Intensity: 0.1,  // Low intensity for main
        influence1EdgeStart: 0.3,
        influence1EdgeInfluence: 0.5,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.5,
        influence1EdgeThreshold: 0.4,
        influence1EdgeIslandSize: 1.2,
        influence1EdgeExposure: 0.4,
        influence1EdgeGamma: 0.2
      }
    },
    section2_intro: {
      circle1: { x: 350, y: -90, scale: 3.6, opacity: 0.35, fill: '#8090C0' },   // 3x scale
      circle2: { x: -340, y: 190, scale: 2.64, opacity: 0.1, fill: '#A080B0' },  // 3x scale
      circle3: { x: -240, y: -310, scale: 3.48, opacity: 0.3, fill: '#7080A0' }, // 3x scale
      circle4: { x: 460, y: 50, scale: 3.0, opacity: 0.15, fill: '#B090C0' },    // 2.5x scale
      circle5: { x: -340, y: -230, scale: 3.06, opacity: 0.2, fill: '#9090B0' }, // 3x scale
      dotMatrix: {
        influence1X: 0.3,  // Left-center, flowing clockwise
        influence1Y: 0.8,  // Bottom area
        influence1RadiusX: 0.5,  // Larger radius than section1
        influence1RadiusY: 0.5,
        influence1Falloff: 0.2,  // Very soft falloff
        influence1Intensity: 0.9,  // High intensity
        influence1EdgeStart: 0.05,
        influence1EdgeInfluence: 0.95,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.09,
        influence1EdgeThreshold: 0.75,
        influence1EdgeIslandSize: 1.7,
        influence1EdgeExposure: 0.65,
        influence1EdgeGamma: 0.1
      }
    },
    section2_main: {
      circle1: { x: 610, y: -260, scale: 0.6, opacity: 0.7, fill: '#C0D0F0' },  // Smaller scale
      circle2: { x: -580, y: 330, scale: 0.4, opacity: 0.15, fill: '#D8C8E8' }, // Smaller scale
      circle3: { x: -400, y: -500, scale: 0.5, opacity: 0.55, fill: '#B0C0E0' },// Smaller scale
      circle4: { x: 720, y: 140, scale: 0.7, opacity: 0.25, fill: '#E0D0F0' },  // Smaller scale
      circle5: { x: -530, y: -360, scale: 0.6, opacity: 0.3, fill: '#C8D0F0' }, // Smaller scale
      dotMatrix: {
        influence1X: 0.9,  // Right side - continues flow
        influence1Y: 0.5,  // Center
        influence1RadiusX: 0.03,  // Small radius
        influence1RadiusY: 0.03,
        influence1Falloff: 1.0,  // Moderate falloff
        influence1Intensity: 0.05,  // Very low intensity
        influence1EdgeStart: 0.4,
        influence1EdgeInfluence: 0.4,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.4,
        influence1EdgeThreshold: 0.4,
        influence1EdgeIslandSize: 1.0,
        influence1EdgeExposure: 0.3,
        influence1EdgeGamma: 0.25
      }
    },
    section3_intro: {
      circle1: { x: -100, y: -100, scale: 3.78, opacity: 0.2, fill: '#90A0D0' }, // 3x scale
      circle2: { x: 120, y: 230, scale: 2.82, opacity: 0.2, fill: '#B090C0' },   // 3x scale
      circle3: { x: 90, y: -280, scale: 3.39, opacity: 0.4, fill: '#8090B0' },   // 3x scale
      circle4: { x: -80, y: 0, scale: 3.1, opacity: 0.12, fill: '#C0A0D0' },     // 2.5x scale
      circle5: { x: 90, y: -220, scale: 2.88, opacity: 0.25, fill: '#A0A0D0' },  // 3x scale
      dotMatrix: {
        influence1X: 0.7,  // Right side
        influence1Y: 0.2,  // Top area - flowing pattern
        influence1RadiusX: 0.6,  // Even larger radius
        influence1RadiusY: 0.6,
        influence1Falloff: 0.15,  // Super soft falloff
        influence1Intensity: 0.85,  // High intensity
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 12.2,
        influence1EdgeGain: 0.1,
        influence1EdgeThreshold: 0.7,
        influence1EdgeIslandSize: 1.8,
        influence1EdgeExposure: 0.7,
        influence1EdgeGamma: 0.08
      }
    },
    section3_main: {
      circle1: { x: -350, y: -300, scale: 0.7, opacity: 0.4, fill: '#D0D8F8' }, // Smaller scale
      circle2: { x: 340, y: 410, scale: 0.5, opacity: 0.35, fill: '#E0D0F0' },  // Smaller scale
      circle3: { x: 260, y: -400, scale: 0.6, opacity: 0.7, fill: '#C0D0E8' },  // Smaller scale
      circle4: { x: -360, y: 80, scale: 0.8, opacity: 0.2, fill: '#E8D8F0' },   // Smaller scale
      circle5: { x: 330, y: -360, scale: 0.5, opacity: 0.45, fill: '#D0D8F8' }, // Smaller scale
      dotMatrix: {
        influence1X: 0.4,  // Center-left
        influence1Y: 0.6,  // Lower-center
        influence1RadiusX: 0.02,  // Very small radius
        influence1RadiusY: 0.02,
        influence1Falloff: 1.2,  // Moderate falloff
        influence1Intensity: 0.02,  // Very low intensity
        influence1EdgeStart: 0.5,
        influence1EdgeInfluence: 0.3,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 2.0,
        influence1EdgeGain: 0.3,
        influence1EdgeThreshold: 0.5,
        influence1EdgeIslandSize: 0.8,
        influence1EdgeExposure: 0.2,
        influence1EdgeGamma: 0.3
      }
    },
    section4_intro: {
      circle1: { x: 420, y: 310, scale: 4.08, opacity: 0.3, fill: '#A0B0E0' },  // 3x scale
      circle2: { x: -330, y: -290, scale: 2.28, opacity: 0.25, fill: '#C0B0E0' },// 3x scale
      circle3: { x: -280, y: 250, scale: 3.96, opacity: 0.18, fill: '#90A0C0' }, // 3x scale
      circle4: { x: 450, y: -230, scale: 2.55, opacity: 0.5, fill: '#C0B0E0' },  // 2.5x scale
      circle5: { x: -330, y: -340, scale: 2.7, opacity: 0.22, fill: '#A0B0E0' }, // 3x scale
      dotMatrix: {
        influence1X: 0.2,  // Left side - completing circular flow
        influence1Y: 0.5,  // Center
        influence1RadiusX: 0.8,  // Largest radius
        influence1RadiusY: 0.8,
        influence1Falloff: 0.1,  // Extremely soft falloff
        influence1Intensity: 0.95,  // Very high intensity
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 60.0,
        influence1EdgeSpeed: 0.5,
        influence1EdgeGain: 0.12,
        influence1EdgeThreshold: 0.65,
        influence1EdgeIslandSize: 2.0,
        influence1EdgeExposure: 0.75,
        influence1EdgeGamma: 0.05
      }
    },
    section4_main: {
      circle1: { x: 690, y: 520, scale: 0.9, opacity: 0.5, fill: '#D8E0F8' },  // Smaller scale
      circle2: { x: -560, y: -470, scale: 0.4, opacity: 0.4, fill: '#E8D8F8' },// Smaller scale
      circle3: { x: -480, y: 420, scale: 0.7, opacity: 0.3, fill: '#D0D8F0' }, // Smaller scale
      circle4: { x: 700, y: -380, scale: 0.5, opacity: 0.8, fill: '#E8D8F8' }, // Smaller scale
      circle5: { x: -510, y: -540, scale: 0.4, opacity: 0.35, fill: '#D8E0F8' },// Smaller scale
      dotMatrix: {
        influence1X: 0.5,  // Back to center
        influence1Y: 0.9,  // Bottom
        influence1RadiusX: 0.01,  // Tiny radius
        influence1RadiusY: 0.01,
        influence1Falloff: 1.5,  // Moderate falloff
        influence1Intensity: 0.0,  // Zero intensity
        influence1EdgeStart: 0.6,
        influence1EdgeInfluence: 0.2,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 9.5,
        influence1EdgeGain: 0.01,
        influence1EdgeThreshold: 1.0,
        influence1EdgeIslandSize: 0.5,
        influence1EdgeExposure: 0.1,
        influence1EdgeGamma: 0.4
      }
    },
    section5_intro: {
      circle1: { x: -450, y: -210, scale: 3.69, opacity: 0.4, fill: '#B0C0F0' }, // 3x scale
      circle2: { x: 280, y: 380, scale: 2.94, opacity: 0.15, fill: '#D0C0F0' },  // 3x scale
      circle3: { x: 320, y: -150, scale: 3.57, opacity: 0.35, fill: '#A0B0E0' }, // 3x scale
      circle4: { x: -340, y: 120, scale: 2.75, opacity: 0.2, fill: '#E0D0F8' },  // 2.5x scale
      circle5: { x: 380, y: 180, scale: 3.12, opacity: 0.3, fill: '#C0D0F0' },   // 3x scale
      dotMatrix: {
        influence1X: 0.6,  // Right-center
        influence1Y: 0.4,  // Upper-middle
        influence1RadiusX: 0.7,  // Large radius
        influence1RadiusY: 0.7,
        influence1Falloff: 0.2,  // Soft falloff
        influence1Intensity: 0.9,  // High intensity
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 50.0,
        influence1EdgeSpeed: 12.8,
        influence1EdgeGain: 0.11,
        influence1EdgeThreshold: 0.7,
        influence1EdgeIslandSize: 1.9,
        influence1EdgeExposure: 0.8,
        influence1EdgeGamma: 0.06
      }
    },
    section5_main: {
      circle1: { x: -750, y: -340, scale: 0.6, opacity: 0.65, fill: '#E0E8F8' }, // Smaller scale
      circle2: { x: 480, y: 610, scale: 0.5, opacity: 0.25, fill: '#F0E8F8' },  // Smaller scale
      circle3: { x: 540, y: -240, scale: 0.6, opacity: 0.6, fill: '#D8E0F0' },  // Smaller scale
      circle4: { x: -580, y: 200, scale: 0.6, opacity: 0.35, fill: '#F8E8F8' }, // Smaller scale
      circle5: { x: 650, y: 300, scale: 0.7, opacity: 0.5, fill: '#E8F0F8' },   // Smaller scale
      dotMatrix: {
        influence1X: 0.1,  // Far left
        influence1Y: 0.3,  // Upper area
        influence1RadiusX: 0.04,  // Small radius
        influence1RadiusY: 0.04,
        influence1Falloff: 0.9,  // Medium falloff
        influence1Intensity: 0.08,  // Low intensity
        influence1EdgeStart: 0.4,
        influence1EdgeInfluence: 0.4,
        influence1EdgeScale: 45.0,
        influence1EdgeSpeed: 0.7,
        influence1EdgeGain: 0.4,
        influence1EdgeThreshold: 0.4,
        influence1EdgeIslandSize: 1.1,
        influence1EdgeExposure: 0.25,
        influence1EdgeGamma: 0.28
      }
    },
    section6_intro: {
      circle1: { x: 180, y: -420, scale: 3.84, opacity: 0.25, fill: '#A8B8E8' }, // 3x scale
      circle2: { x: -480, y: 240, scale: 2.58, opacity: 0.35, fill: '#C8B8E8' }, // 3x scale
      circle3: { x: -360, y: -180, scale: 3.72, opacity: 0.2, fill: '#98A8D8' }, // 3x scale
      circle4: { x: 540, y: 280, scale: 3.05, opacity: 0.4, fill: '#D8C8F0' },   // 2.5x scale
      circle5: { x: -420, y: -450, scale: 2.85, opacity: 0.18, fill: '#B8C8E8' },// 3x scale
      dotMatrix: {
        influence1X: 0.85,  // Far right
        influence1Y: 0.6,  // Lower-middle
        influence1RadiusX: 0.6,  // Large radius
        influence1RadiusY: 0.6,
        influence1Falloff: 0.25,  // Soft falloff
        influence1Intensity: 0.88,  // High intensity
        influence1EdgeStart: 0.05,
        influence1EdgeInfluence: 0.92,
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 3.2,
        influence1EdgeGain: 0.095,
        influence1EdgeThreshold: 0.72,
        influence1EdgeIslandSize: 1.85,
        influence1EdgeExposure: 0.75,
        influence1EdgeGamma: 0.08
      }
    },
    section6_main: {
      circle1: { x: 310, y: -680, scale: 0.8, opacity: 0.45, fill: '#E8F0F8' }, // Smaller scale
      circle2: { x: -820, y: 410, scale: 0.4, opacity: 0.6, fill: '#F0E0F8' },  // Smaller scale
      circle3: { x: -610, y: -290, scale: 0.8, opacity: 0.35, fill: '#E0E8F0' }, // Smaller scale
      circle4: { x: 920, y: 480, scale: 0.6, opacity: 0.7, fill: '#F8F0F8' },   // Smaller scale
      circle5: { x: -720, y: -720, scale: 0.5, opacity: 0.3, fill: '#F0F8F8' }, // Smaller scale
      dotMatrix: {
        influence1X: 0.95,  // Far right edge
        influence1Y: 0.8,  // Lower area
        influence1RadiusX: 0.025,  // Very small radius
        influence1RadiusY: 0.025,
        influence1Falloff: 1.1,  // Medium falloff
        influence1Intensity: 0.03,  // Very low intensity
        influence1EdgeStart: 0.5,
        influence1EdgeInfluence: 0.3,
        influence1EdgeScale: 55.0,
        influence1EdgeSpeed: 0.6,
        influence1EdgeGain: 0.35,
        influence1EdgeThreshold: 0.4,
        influence1EdgeIslandSize: 0.9,
        influence1EdgeExposure: 0.2,
        influence1EdgeGamma: 0.32
      }
    },
    section7_intro: {
      circle1: { x: -280, y: 450, scale: 3.96, opacity: 0.3, fill: '#C0D0F8' },  // 3x scale
      circle2: { x: 420, y: -320, scale: 2.76, opacity: 0.28, fill: '#E0D0F8' }, // 3x scale
      circle3: { x: 340, y: 160, scale: 3.45, opacity: 0.38, fill: '#B0C0E8' },  // 3x scale
      circle4: { x: -380, y: -140, scale: 2.95, opacity: 0.22, fill: '#F0E0F8' },// 2.5x scale
      circle5: { x: 460, y: 240, scale: 3.24, opacity: 0.26, fill: '#D0E0F8' },  // 3x scale
      dotMatrix: {
        influence1X: 0.15,  // Left side
        influence1Y: 0.75,  // Lower area
        influence1RadiusX: 0.75,  // Very large radius
        influence1RadiusY: 0.75,
        influence1Falloff: 0.18,  // Very soft falloff
        influence1Intensity: 0.92,  // Very high intensity
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 2.6,
        influence1EdgeGain: 0.12,
        influence1EdgeThreshold: 0.68,
        influence1EdgeIslandSize: 2.1,
        influence1EdgeExposure: 0.82,
        influence1EdgeGamma: 0.04
      }
    },
    section7_main: {
      circle1: { x: -480, y: 730, scale: 0.8, opacity: 0.55, fill: '#F0F8F8' }, // Smaller scale
      circle2: { x: 720, y: -520, scale: 0.5, opacity: 0.5, fill: '#F8F0F8' },  // Smaller scale
      circle3: { x: 580, y: 260, scale: 0.7, opacity: 0.65, fill: '#E8F0F8' },  // Smaller scale
      circle4: { x: -650, y: -230, scale: 0.6, opacity: 0.4, fill: '#F8F8F0' }, // Smaller scale
      circle5: { x: 790, y: 390, scale: 0.7, opacity: 0.45, fill: '#F8F8F8' },  // Smaller scale
      dotMatrix: {
        influence1X: 0.25,  // Left-center
        influence1Y: 0.1,  // Top area
        influence1RadiusX: 0.035,  // Small radius
        influence1RadiusY: 0.035,
        influence1Falloff: 0.7,  // Medium falloff
        influence1Intensity: 0.06,  // Low intensity
        influence1EdgeStart: 0.45,
        influence1EdgeInfluence: 0.35,
        influence1EdgeScale: 65.0,
        influence1EdgeSpeed: 0.4,
        influence1EdgeGain: 0.3,
        influence1EdgeThreshold: 0.4,
        influence1EdgeIslandSize: 0.85,
        influence1EdgeExposure: 0.18,
        influence1EdgeGamma: 0.35
      }
    },
    section8_intro: {
      circle1: { x: 520, y: 180, scale: 4.02, opacity: 0.35, fill: '#D8E8F8' },  // 3x scale
      circle2: { x: -360, y: -480, scale: 2.88, opacity: 0.32, fill: '#F0E8F8' },// 3x scale
      circle3: { x: -520, y: 380, scale: 3.81, opacity: 0.25, fill: '#C8D8F0' }, // 3x scale
      circle4: { x: 620, y: -260, scale: 2.65, opacity: 0.45, fill: '#F8F0F8' }, // 2.5x scale
      circle5: { x: -480, y: -120, scale: 3.18, opacity: 0.28, fill: '#E8F0F8' },// 3x scale
      dotMatrix: {
        influence1X: 0.5,  // Center - full circle completion
        influence1Y: 0.5,  // Center
        influence1RadiusX: 0.9,  // Maximum radius
        influence1RadiusY: 0.9,
        influence1Falloff: 0.12,  // Extremely soft falloff
        influence1Intensity: 0.95,  // Maximum intensity
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 4.0,
        influence1EdgeGain: 0.15,
        influence1EdgeThreshold: 0.6,
        influence1EdgeIslandSize: 2.2,
        influence1EdgeExposure: 0.9,
        influence1EdgeGamma: 0.02
      }
    },
    section8_main: {
      circle1: { x: 890, y: 290, scale: 0.9, opacity: 0.6, fill: '#F8F8F8' },   // Smaller scale
      circle2: { x: -620, y: -780, scale: 0.6, opacity: 0.55, fill: '#F8F8F8' }, // Smaller scale
      circle3: { x: -890, y: 620, scale: 0.8, opacity: 0.4, fill: '#F8F8F8' },  // Smaller scale
      circle4: { x: 1060, y: -420, scale: 0.5, opacity: 0.7, fill: '#F8F8F8' }, // Smaller scale
      circle5: { x: -820, y: -200, scale: 0.6, opacity: 0.5, fill: '#F8F8F8' }, // Smaller scale
      dotMatrix: {
        influence1X: 0.5,  // Center - final state
        influence1Y: 0.5,  // Center
        influence1RadiusX: 0.005,  // Minimum radius
        influence1RadiusY: 0.005,
        influence1Falloff: 2.0,  // Strong falloff
        influence1Intensity: 0.0,  // Zero intensity - clean slate
        influence1EdgeStart: 0.8,
        influence1EdgeInfluence: 0.1,
        influence1EdgeScale: 100.0,
        influence1EdgeSpeed: 0.1,
        influence1EdgeGain: 0.005,
        influence1EdgeThreshold: 1.0,
        influence1EdgeIslandSize: 0.3,
        influence1EdgeExposure: 0.05,
        influence1EdgeGamma: 0.5
      }
    }
  };

  // Get all sections
  const sections = ['hero', 'section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];
  let lastSectionIndex = -1;

  // Store target values for direct application
  let targetValues = {
    circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4 },
    circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3 },
    circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35 },
    circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45 },
    circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3 }
  };

  // Helper function to interpolate between hex colors
  const interpolateColor = (color1, color2, progress) => {
    // Convert hex to RGB
    const hex2rgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Convert RGB back to hex
    const rgb2hex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);

    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * progress);
    const g = Math.round(c1.g + (c2.g - c1.g) * progress);
    const b = Math.round(c1.b + (c2.b - c1.b) * progress);

    return rgb2hex(r, g, b);
  };

  // Parallax multipliers for each layer
  const parallaxMultipliers = {
    background: 0.15,  // Slowest - moves 15% of scroll
    middle: 0.3,       // Medium - moves 30% of scroll
    foreground: 0.5    // Fastest - moves 50% of scroll
  };

  // Function to apply parallax effect based on scroll
  const updateCirclesOnScroll = () => {
    const scrollY = window.scrollY;

    // Apply parallax to each layer (inverse scroll = upward movement)
    utils.set('.parallax-background', {
      translateY: -scrollY * parallaxMultipliers.background
    });

    utils.set('.parallax-middle', {
      translateY: -scrollY * parallaxMultipliers.middle
    });

    utils.set('.parallax-foreground', {
      translateY: -scrollY * parallaxMultipliers.foreground
    });

    // Still interpolate dotMatrix parameters based on scroll position
    const windowHeight = window.innerHeight;
    const totalScroll = scrollY / windowHeight;

    let fromConfig, toConfig, localProgress;

    if (totalScroll <= 0.5) {
      fromConfig = circleConfigs.hero;
      toConfig = circleConfigs.section1_intro;
      localProgress = totalScroll * 2;
    } else if (totalScroll <= 1.0) {
      fromConfig = circleConfigs.section1_intro;
      toConfig = circleConfigs.section1_main;
      localProgress = (totalScroll - 0.5) * 2;
    } else if (totalScroll <= 1.5) {
      fromConfig = circleConfigs.section1_main;
      toConfig = circleConfigs.section2_intro;
      localProgress = (totalScroll - 1.0) * 2;
    } else if (totalScroll <= 2.0) {
      fromConfig = circleConfigs.section2_intro;
      toConfig = circleConfigs.section2_main;
      localProgress = (totalScroll - 1.5) * 2;
    } else if (totalScroll <= 2.5) {
      fromConfig = circleConfigs.section2_main;
      toConfig = circleConfigs.section3_intro;
      localProgress = (totalScroll - 2.0) * 2;
    } else if (totalScroll <= 3.0) {
      fromConfig = circleConfigs.section3_intro;
      toConfig = circleConfigs.section3_main;
      localProgress = (totalScroll - 2.5) * 2;
    } else if (totalScroll <= 3.5) {
      fromConfig = circleConfigs.section3_main;
      toConfig = circleConfigs.section4_intro;
      localProgress = (totalScroll - 3.0) * 2;
    } else if (totalScroll <= 4.0) {
      fromConfig = circleConfigs.section4_intro;
      toConfig = circleConfigs.section4_main;
      localProgress = (totalScroll - 3.5) * 2;
    } else if (totalScroll <= 4.5) {
      fromConfig = circleConfigs.section4_main;
      toConfig = circleConfigs.section5_intro;
      localProgress = (totalScroll - 4.0) * 2;
    } else if (totalScroll <= 5.0) {
      fromConfig = circleConfigs.section5_intro;
      toConfig = circleConfigs.section5_main;
      localProgress = (totalScroll - 4.5) * 2;
    } else if (totalScroll <= 5.5) {
      fromConfig = circleConfigs.section5_main;
      toConfig = circleConfigs.section6_intro;
      localProgress = (totalScroll - 5.0) * 2;
    } else if (totalScroll <= 6.0) {
      fromConfig = circleConfigs.section6_intro;
      toConfig = circleConfigs.section6_main;
      localProgress = (totalScroll - 5.5) * 2;
    } else if (totalScroll <= 6.5) {
      fromConfig = circleConfigs.section6_main;
      toConfig = circleConfigs.section7_intro;
      localProgress = (totalScroll - 6.0) * 2;
    } else if (totalScroll <= 7.0) {
      fromConfig = circleConfigs.section7_intro;
      toConfig = circleConfigs.section7_main;
      localProgress = (totalScroll - 6.5) * 2;
    } else if (totalScroll <= 7.5) {
      fromConfig = circleConfigs.section7_main;
      toConfig = circleConfigs.section8_intro;
      localProgress = (totalScroll - 7.0) * 2;
    } else if (totalScroll <= 8.0) {
      fromConfig = circleConfigs.section8_intro;
      toConfig = circleConfigs.section8_main;
      localProgress = (totalScroll - 7.5) * 2;
    } else {
      fromConfig = circleConfigs.section8_main;
      toConfig = circleConfigs.section8_main;
      localProgress = 1;
    }

    // Interpolate and apply dotMatrix parameters
    if (window.dotMatrixParams && fromConfig.dotMatrix && toConfig.dotMatrix) {
      const fromDot = fromConfig.dotMatrix;
      const toDot = toConfig.dotMatrix;

      // Interpolate all dotMatrix parameters
      dotMatrixParams.influence1X = fromDot.influence1X + (toDot.influence1X - fromDot.influence1X) * localProgress;
      dotMatrixParams.influence1Y = fromDot.influence1Y + (toDot.influence1Y - fromDot.influence1Y) * localProgress;
      dotMatrixParams.influence1RadiusX = fromDot.influence1RadiusX + (toDot.influence1RadiusX - fromDot.influence1RadiusX) * localProgress;
      dotMatrixParams.influence1RadiusY = fromDot.influence1RadiusY + (toDot.influence1RadiusY - fromDot.influence1RadiusY) * localProgress;
      dotMatrixParams.influence1Falloff = fromDot.influence1Falloff + (toDot.influence1Falloff - fromDot.influence1Falloff) * localProgress;
      dotMatrixParams.influence1Intensity = fromDot.influence1Intensity + (toDot.influence1Intensity - fromDot.influence1Intensity) * localProgress;
      dotMatrixParams.influence1EdgeStart = fromDot.influence1EdgeStart + (toDot.influence1EdgeStart - fromDot.influence1EdgeStart) * localProgress;
      dotMatrixParams.influence1EdgeInfluence = fromDot.influence1EdgeInfluence + (toDot.influence1EdgeInfluence - fromDot.influence1EdgeInfluence) * localProgress;
      dotMatrixParams.influence1EdgeScale = fromDot.influence1EdgeScale + (toDot.influence1EdgeScale - fromDot.influence1EdgeScale) * localProgress;
      dotMatrixParams.influence1EdgeSpeed = fromDot.influence1EdgeSpeed + (toDot.influence1EdgeSpeed - fromDot.influence1EdgeSpeed) * localProgress;
      dotMatrixParams.influence1EdgeGain = fromDot.influence1EdgeGain + (toDot.influence1EdgeGain - fromDot.influence1EdgeGain) * localProgress;
      dotMatrixParams.influence1EdgeThreshold = fromDot.influence1EdgeThreshold + (toDot.influence1EdgeThreshold - fromDot.influence1EdgeThreshold) * localProgress;
      dotMatrixParams.influence1EdgeIslandSize = fromDot.influence1EdgeIslandSize + (toDot.influence1EdgeIslandSize - fromDot.influence1EdgeIslandSize) * localProgress;
      dotMatrixParams.influence1EdgeExposure = fromDot.influence1EdgeExposure + (toDot.influence1EdgeExposure - fromDot.influence1EdgeExposure) * localProgress;
      dotMatrixParams.influence1EdgeGamma = fromDot.influence1EdgeGamma + (toDot.influence1EdgeGamma - fromDot.influence1EdgeGamma) * localProgress;

      // Sync the interpolated parameters to the shader uniforms
      if (window.syncParamsToUniforms) {
        window.syncParamsToUniforms();
      }
    }

    lastSectionIndex = Math.floor(totalScroll);
  };

  const startScrollListener = () => {
    window.addEventListener('scroll', updateCirclesOnScroll);
    // Initialize circles on load
    updateCirclesOnScroll();
  };

  // Background theme transition timeline (this is the main hero animation)
});
