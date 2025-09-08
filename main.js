// Wait for the page to fully load
window.addEventListener('load', function () {
  console.log('Page loaded');

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

    console.log('Dot matrix parameters initialized');
  }

  // Debug: Check what's available globally
  console.log('anime:', typeof anime);
  console.log('animeJS:', typeof animeJS);
  console.log('window.anime:', typeof window.anime);

  // Check if anime is loaded (v4 should use global anime object)
  if (typeof anime === 'undefined') {
    console.error('Anime.js is not loaded!');
    return;
  }

  console.log('Anime.js loaded successfully!');
  console.log('Available methods:', Object.keys(anime));

  // Destructure the anime.js functions from the global object
  const { animate, utils, onScroll, createTimeline } = anime;

  // Prevent scrolling initially by blocking scroll events
  let scrollBlocked = true;

  const blockScroll = (e) => {
    if (scrollBlocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Block scroll events
  window.addEventListener('scroll', blockScroll, { passive: false });
  window.addEventListener('wheel', blockScroll, { passive: false });
  window.addEventListener('touchmove', blockScroll, { passive: false });

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

  const heroLogoRevealTl = createTimeline({
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
    autoplay: true,
    onComplete: function () {
      console.log('Theme timeline complete, playing hero heading animation');
      // Play the hero heading animation after theme timeline completes
      heroHeadingTimeline.play();
      startScrollListener(); // Start listening to scroll after initial animations

    },
  });



  // 3 second idle state (nothing happens)
  const idleTime = 5000;

  // Circle 2 expands and lightens first (lead circle)
  themeTimeline.add('.circle-2', {
    translateX: 500,
    translateY: 500,
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
    translateX: [0, 150],
    translateY: [0, 100],
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
    translateX: [0, 200],
    translateY: [0, -80],
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
    translateX: [0, -150],
    translateY: [0, -100],
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
    autoplay: false,
    onComplete: function () {
      console.log('Hero heading animation complete, enabling scroll');
      // Enable scrolling after all hero animations complete
      scrollBlocked = false;
      // Remove event listeners
      window.removeEventListener('scroll', blockScroll);
      window.removeEventListener('wheel', blockScroll);
      window.removeEventListener('touchmove', blockScroll);
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

    console.log('Setting up prism animation for:', mainHeading.textContent);

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

  console.log('All animations initialized!');

  // Circle configurations for each section - now with INTRO and MAIN states
  const circleConfigs = {
    hero: {
      circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4, fill: '#C8DDFF' },
      circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3, fill: '#E8D8FF' },
      circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35, fill: '#C8DDFF' },
      circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45, fill: '#E8D8FF' },
      circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3, fill: '#C8DDFF' }
    },
    section1_intro: {
      circle1: { x: -800, y: 600, scale: 1.3, opacity: 0.25, fill: '#0080B0' },
      circle2: { x: 1000, y: -700, scale: 0.8, opacity: 0.2, fill: '#0060A0' },
      circle3: { x: 900, y: 800, scale: 1.2, opacity: 0.15, fill: '#0070A0' },
      circle4: { x: -1100, y: -900, scale: 1.1, opacity: 0.3, fill: '#0080B0' },
      circle5: { x: 1050, y: 450, scale: 0.9, opacity: 0.2, fill: '#0080A0' }
    },
    section1_main: {
      circle1: { x: -2000, y: 1200, scale: 3.0, opacity: 0.6, fill: '#B8C5E8' },
      circle2: { x: 2500, y: -1500, scale: 0.2, opacity: 0.3, fill: '#C8B8D8' },
      circle3: { x: 1800, y: 1600, scale: 2.5, opacity: 0.2, fill: '#A8B8E0' },
      circle4: { x: -2200, y: -1800, scale: 0.4, opacity: 0.5, fill: '#D0C0E0' },
      circle5: { x: 2100, y: 900, scale: 1.8, opacity: 0.35, fill: '#B0C0E8' }
    },
    section2_intro: {
      circle1: { x: 1150, y: -850, scale: 0.5, opacity: 0.35, fill: '#8090C0' },
      circle2: { x: -1200, y: 700, scale: 2.0, opacity: 0.1, fill: '#A080B0' },
      circle3: { x: -800, y: -950, scale: 0.8, opacity: 0.3, fill: '#7080A0' },
      circle4: { x: 1300, y: 550, scale: 1.5, opacity: 0.15, fill: '#B090C0' },
      circle5: { x: -950, y: -650, scale: 1.8, opacity: 0.2, fill: '#9090B0' }
    },
    section2_main: {
      circle1: { x: 2300, y: -1700, scale: 0.3, opacity: 0.7, fill: '#C0D0F0' },
      circle2: { x: -2400, y: 1400, scale: 3.5, opacity: 0.15, fill: '#D8C8E8' },
      circle3: { x: -1600, y: -1900, scale: 0.6, opacity: 0.55, fill: '#B0C0E0' },
      circle4: { x: 2600, y: 1100, scale: 2.2, opacity: 0.25, fill: '#E0D0F0' },
      circle5: { x: -1900, y: -1300, scale: 2.8, opacity: 0.3, fill: '#C8D0F0' }
    },
    section3_intro: {
      circle1: { x: -1250, y: -1000, scale: 0.8, opacity: 0.2, fill: '#90A0D0' },
      circle2: { x: 1100, y: 900, scale: 1.7, opacity: 0.2, fill: '#B090C0' },
      circle3: { x: 850, y: -800, scale: 0.5, opacity: 0.4, fill: '#8090B0' },
      circle4: { x: -1400, y: 400, scale: 2.0, opacity: 0.12, fill: '#C0A0D0' },
      circle5: { x: 1200, y: -700, scale: 1.3, opacity: 0.25, fill: '#A0A0D0' }
    },
    section3_main: {
      circle1: { x: -2500, y: -2000, scale: 1.2, opacity: 0.4, fill: '#D0D8F8' },
      circle2: { x: 2200, y: 1800, scale: 2.5, opacity: 0.35, fill: '#E0D0F0' },
      circle3: { x: 1700, y: -1600, scale: 0.3, opacity: 0.7, fill: '#C0D0E8' },
      circle4: { x: -2800, y: 800, scale: 3.0, opacity: 0.2, fill: '#E8D8F0' },
      circle5: { x: 2400, y: -1400, scale: 2.0, opacity: 0.45, fill: '#D0D8F8' }
    },
    section4_intro: {
      circle1: { x: 1350, y: 1050, scale: 1.6, opacity: 0.3, fill: '#A0B0E0' },
      circle2: { x: -1150, y: -950, scale: 0.6, opacity: 0.25, fill: '#C0B0E0' },
      circle3: { x: -1000, y: 850, scale: 2.2, opacity: 0.18, fill: '#90A0C0' },
      circle4: { x: 1250, y: -750, scale: 0.4, opacity: 0.5, fill: '#C0B0E0' },
      circle5: { x: -900, y: -1100, scale: 1.0, opacity: 0.22, fill: '#A0B0E0' }
    },
    section4_main: {
      circle1: { x: 2700, y: 2100, scale: 2.5, opacity: 0.5, fill: '#D8E0F8' },
      circle2: { x: -2300, y: -1900, scale: 0.4, opacity: 0.4, fill: '#E8D8F8' },
      circle3: { x: -2000, y: 1700, scale: 3.5, opacity: 0.3, fill: '#D0D8F0' },
      circle4: { x: 2500, y: -1500, scale: 0.2, opacity: 0.8, fill: '#E8D8F8' },
      circle5: { x: -1800, y: -2200, scale: 1.6, opacity: 0.35, fill: '#D8E0F8' }
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
      console.log(`Scroll: ${totalScroll.toFixed(2)}, Progress: ${localProgress.toFixed(2)}, From: ${fromConfig.circle1.x}, To: ${toConfig.circle1.x}`);
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

    lastSectionIndex = Math.floor(totalScroll);
  };

  const startScrollListener = () => {
    window.addEventListener('scroll', updateCirclesOnScroll);
    // Initialize circles on load
    updateCirclesOnScroll();
  };

  // Background theme transition timeline (this is the main hero animation)
});
