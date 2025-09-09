// DEVELOPER SWITCH: Set to true to skip logo and theme animations
const SKIP_INTRO_ANIMATIONS = true;
const SKIP_LOGS = true;

function logger(msg) {
  SKIP_LOGS || console.log(msg);
}
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

    // Main Noise
    dotMatrixParams.mainNoiseEnabled = true;
    dotMatrixParams.noiseAnimated = true;
    dotMatrixParams.noiseScale = 5.0;
    dotMatrixParams.noiseSpeed = 0.5;
    dotMatrixParams.noiseOffsetX = 0.0;
    dotMatrixParams.noiseOffsetY = 0.0;
    dotMatrixParams.noiseOffsetZ = 0.0;
    dotMatrixParams.noiseEvolution = 0.0;
    dotMatrixParams.noiseOctaves = 4;
    dotMatrixParams.noiseLacunarity = 2.0;
    dotMatrixParams.noiseGain = 0.644;
    dotMatrixParams.noiseThreshold = 0.7281;
    dotMatrixParams.noiseIslandSize = 1.3965;
    dotMatrixParams.noiseExposure = 0.102;
    dotMatrixParams.noiseGamma = 0.6032;
    dotMatrixParams.noiseMultiplier = 0.198;

    // Influence Zone 1
    dotMatrixParams.influence1Enabled = true;
    dotMatrixParams.influence1Subtract = false;
    dotMatrixParams.influence1X = 0.5;
    dotMatrixParams.influence1Y = 0.5;
    dotMatrixParams.influence1RadiusX = 0.02;
    dotMatrixParams.influence1RadiusY = 0.02;
    dotMatrixParams.influence1Falloff = 2.0;
    dotMatrixParams.influence1Intensity = 0.0;

    // Influence Zone 1 Edge Noise
    dotMatrixParams.influence1EdgeEnabled = true;
    dotMatrixParams.influence1EdgeStart = 0.0;
    dotMatrixParams.influence1EdgeInfluence = 1.0;
    dotMatrixParams.influence1EdgeScale = 40.0;
    dotMatrixParams.influence1EdgeSpeed = 2.0;
    dotMatrixParams.influence1EdgeOctaves = 2;
    dotMatrixParams.influence1EdgeLacunarity = 2.5;
    dotMatrixParams.influence1EdgeGain = 0.077;
    dotMatrixParams.influence1EdgeThreshold = 0.8192;
    dotMatrixParams.influence1EdgeIslandSize = 1.5352;
    dotMatrixParams.influence1EdgeExposure = 0.636;
    dotMatrixParams.influence1EdgeGamma = 0.1;

    // Influence Zone 2 - DISABLED
    dotMatrixParams.influence2Enabled = true;
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
    dotMatrixParams.influence2EdgeThreshold = 0.0;
    dotMatrixParams.influence2EdgeIslandSize = 0.5;
    dotMatrixParams.influence2EdgeExposure = 0.0;
    dotMatrixParams.influence2EdgeGamma = 1.0;

    logger('Dot matrix parameters initialized');
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
    }, 2000)
    .add(dotMatrixParams, {
      influence1Intensity: 1,
      influence1Falloff: 0.4,
      duration: 2000,
      ease: 'outExpo',
    })
    .add(dotMatrixParams, {
      influence1RadiusX: 1.0,
      influence1RadiusY: 1.0,
      influence1Falloff: 0.1,
      duration: 1500,
      ease: 'outSine',
    })
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
    }, '-=3000')
    .add(dotMatrixParams, {
      influence2EdgeThreshold: 1,
      influence1Intensity: 0.0,
      duration: 1500,
      ease: 'outSine',
    }, '-=4000')
    .add(dotMatrixParams, {
      influence2Intensity: 0,
      duration: 1500,
      ease: 'outSine',
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

    // Create timeline for this heading's animation that resets when out of view
    const headingTimeline = createTimeline({
      autoplay: false
    });

    // Create scroll observer that plays/resets the timeline
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
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
        influence1EdgeStart: 0.0,
        influence1EdgeInfluence: 1.0,
        influence1EdgeScale: 40.0,
        influence1EdgeSpeed: 2.0,
        influence1EdgeGain: 0.077,
        influence1EdgeThreshold: 0.8192,
        influence1EdgeIslandSize: 1.5352,
        influence1EdgeExposure: 0.636,
        influence1EdgeGamma: 0.1
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
        influence1EdgeScale: 20.0,  // 20 scale noise as requested
        influence1EdgeSpeed: 2.5,
        influence1EdgeGain: 0.08,
        influence1EdgeThreshold: 0.8,
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
        influence1EdgeSpeed: 1.0,
        influence1EdgeGain: 0.04,
        influence1EdgeThreshold: 0.9,
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
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 3.0,
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
        influence1EdgeScale: 50.0,
        influence1EdgeSpeed: 0.8,
        influence1EdgeGain: 0.03,
        influence1EdgeThreshold: 0.95,
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
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 2.2,
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
        influence1EdgeScale: 60.0,
        influence1EdgeSpeed: 0.5,
        influence1EdgeGain: 0.02,
        influence1EdgeThreshold: 0.98,
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
        influence1EdgeScale: 20.0,
        influence1EdgeSpeed: 3.5,
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
        influence1EdgeScale: 80.0,
        influence1EdgeSpeed: 0.3,
        influence1EdgeGain: 0.01,
        influence1EdgeThreshold: 1.0,
        influence1EdgeIslandSize: 0.5,
        influence1EdgeExposure: 0.1,
        influence1EdgeGamma: 0.4
      }
    }
  };

  // Get all sections
  const sections = ['hero', 'section1', 'section2', 'section3', 'section4'];
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

  // Function to calculate and apply values based on scroll
  const updateCirclesOnScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const totalScroll = scrollY / windowHeight;

    // Create a continuous interpolation path through all states
    // Each section has 2 states (intro at 0.5, main at 1.0)
    // Hero (0) -> S1_intro (0.5) -> S1_main (1.0) -> S2_intro (1.5) -> S2_main (2.0) etc.

    let fromConfig, toConfig, localProgress;

    if (totalScroll <= 0.5) {
      // Hero to Section1_intro
      fromConfig = circleConfigs.hero;
      toConfig = circleConfigs.section1_intro;
      localProgress = totalScroll * 2; // 0 to 1
    } else if (totalScroll <= 1.0) {
      // Section1_intro to Section1_main
      fromConfig = circleConfigs.section1_intro;
      toConfig = circleConfigs.section1_main;
      localProgress = (totalScroll - 0.5) * 2; // 0 to 1
    } else if (totalScroll <= 1.5) {
      // Section1_main to Section2_intro
      fromConfig = circleConfigs.section1_main;
      toConfig = circleConfigs.section2_intro;
      localProgress = (totalScroll - 1.0) * 2; // 0 to 1
    } else if (totalScroll <= 2.0) {
      // Section2_intro to Section2_main
      fromConfig = circleConfigs.section2_intro;
      toConfig = circleConfigs.section2_main;
      localProgress = (totalScroll - 1.5) * 2; // 0 to 1
    } else if (totalScroll <= 2.5) {
      // Section2_main to Section3_intro
      fromConfig = circleConfigs.section2_main;
      toConfig = circleConfigs.section3_intro;
      localProgress = (totalScroll - 2.0) * 2; // 0 to 1
    } else if (totalScroll <= 3.0) {
      // Section3_intro to Section3_main
      fromConfig = circleConfigs.section3_intro;
      toConfig = circleConfigs.section3_main;
      localProgress = (totalScroll - 2.5) * 2; // 0 to 1
    } else if (totalScroll <= 3.5) {
      // Section3_main to Section4_intro
      fromConfig = circleConfigs.section3_main;
      toConfig = circleConfigs.section4_intro;
      localProgress = (totalScroll - 3.0) * 2; // 0 to 1
    } else if (totalScroll <= 4.0) {
      // Section4_intro to Section4_main
      fromConfig = circleConfigs.section4_intro;
      toConfig = circleConfigs.section4_main;
      localProgress = (totalScroll - 3.5) * 2; // 0 to 1
    } else {
      // Stay at Section4_main
      fromConfig = circleConfigs.section4_main;
      toConfig = circleConfigs.section4_main;
      localProgress = 1;
    }

    // Debug: Log current state occasionally
    if (Math.random() < 0.02) {
      logger(`Scroll: ${totalScroll.toFixed(2)}, Progress: ${localProgress.toFixed(2)}, From: ${fromConfig.circle1.x}, To: ${toConfig.circle1.x}`);
    }

    // Apply smooth interpolation for each circle
    for (let i = 1; i <= 5; i++) {
      const circleKey = `circle${i}`;
      const from = fromConfig[circleKey];
      const to = toConfig[circleKey];

      // Interpolate position, scale, and opacity
      const x = from.x + (to.x - from.x) * localProgress;
      const y = from.y + (to.y - from.y) * localProgress;
      const scale = from.scale + (to.scale - from.scale) * localProgress;
      const opacity = from.opacity + (to.opacity - from.opacity) * localProgress;

      // Interpolate color smoothly
      const fill = interpolateColor(from.fill, to.fill, localProgress);

      // Apply transform for position and scale
      // Use translateX and translateY separately to avoid parsing issues
      utils.set(`.circle-${i}`, {
        translateX: x,
        translateY: y,
        scale: scale,
        opacity: opacity
      });

      utils.set(`.circle-${i} circle`, {
        fill: fill
      });
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
