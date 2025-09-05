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
    dotMatrixParams.noiseMultiplier = 0.498;

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

  utils.set(heroPrismHeadings[0], { opacity: 0, x: window.innerWidth }); // cyan
  utils.set(heroPrismHeadings[1], { opacity: 0, x: window.innerWidth + 30 }); // purple
  utils.set(heroPrismHeadings[2], { opacity: 0, x: window.innerWidth + 60 }); // yellow
  utils.set(heroMainHeading, { opacity: 0 });




  const heroLogoRevealTl = createTimeline({
  })
    .add(dotMatrixParams, {
      influence1Intensity: 1,
      duration: 100,
      ease: 'outExpo',
    }, 2000)
    .add(dotMatrixParams, {
      influence1Intensity: 1,
      duration: 2000,
      ease: 'outExpo',
    })
    .add(dotMatrixParams, {
      influence1RadiusX: 1.0,
      influence1RadiusY: 1.0,
      influence1Falloff: 0.2,
      duration: 1500,
      ease: 'outSine',
    })
    .add(dotMatrixParams, {
      influence2RadiusX: 1.0,
      influence2RadiusY: 1.0,
      influence2Falloff: 0.8,
      influence2Intensity: 1,
      duration: 1500,
      ease: 'outSine',
    }, '-=1000')
    .add(dotMatrixParams, {
      influence2EdgeThreshold: 1,
      influence1Intensity: 0.0,
      duration: 6500,
      ease: 'outSine',
    }, '-=2000');



  const themeTimeline = createTimeline({
    autoplay: true,
    onComplete: function () {
      console.log('Theme timeline complete, playing hero heading animation');
      // Play the hero heading animation after theme timeline completes
      heroHeadingTimeline.play();
      startScrollListener(); // Start listening to scroll after initial animations

    },
  });


  themeTimeline.sync(heroLogoRevealTl);

  // 3 second idle state (nothing happens)
  const idleTime = 3000;

  // Circle 2 expands and lightens first (lead circle)
  themeTimeline.add('.circle-2', {
    x: [0, -100],
    y: [0, 50],
    scale: [1, 1.8], // Expand more than its final size first
    duration: 1500,
    ease: 'outExpo'
  }, idleTime);

  themeTimeline.add('.circle-2 circle', {
    fill: ['#3B167A', '#E8D8FF'],
    duration: 1500,
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
    x: [0, 150],
    y: [0, 100],
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
    x: [0, -80],
    y: [0, -120],
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
    x: [0, 200],
    y: [0, -80],
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
    x: [0, -150],
    y: [0, -100],
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

  // Animate cyan layer - movement only (blur stays at 18)
  heroHeadingTimeline.add(heroPrismHeadings[0], {
    opacity: [0, 1],
    x: [heroPrismStart, 0],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 0);

  // Remove blur AFTER movement completes for cyan
  heroHeadingTimeline.add(heroPrismHeadings[0], {
    filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
    duration: 300,
    ease: 'outExpo'
  }, heroPrismTime);

  // Animate purple layer - movement only (blur stays at 18)
  heroHeadingTimeline.add(heroPrismHeadings[1], {
    opacity: [0, 1],
    x: [heroPrismStart + 2, 0],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 30);

  // Remove blur AFTER movement completes for purple
  heroHeadingTimeline.add(heroPrismHeadings[1], {
    filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
    duration: 300,
    ease: 'outExpo'
  }, heroPrismTime + 30);

  // Animate yellow layer - movement only (blur stays at 18)
  heroHeadingTimeline.add(heroPrismHeadings[2], {
    opacity: [0, 1],
    x: [heroPrismStart + 12, 0],
    duration: heroPrismTime,
    ease: 'outSine'
  }, 50);

  // Remove blur AFTER movement completes for yellow
  heroHeadingTimeline.add(heroPrismHeadings[2], {
    filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
    duration: 300,
    ease: 'outExpo'
  }, heroPrismTime + 50);

  // Quickly fade in the dark grey text after prism settles
  heroHeadingTimeline.add(heroMainHeading, {
    opacity: [0, 1],
    duration: 200,
    ease: 'outSine'
  }, heroPrismTime);


  // Get all section heading containers except hero
  const headingContainers = document.querySelectorAll('.section:not(#hero) .heading-container');

  // Set initial state for prism headings - start from right side
  headingContainers.forEach(function (container) {
    const prismHeadings = container.querySelectorAll('.heading-prism');
    const mainHeading = container.querySelector('.heading-main');
    const homeContent = container.querySelector('.homeContent');

    // Set initial positions - start from right side of screen
    utils.set(prismHeadings[0], { opacity: 0, x: window.innerWidth }); // cyan
    utils.set(prismHeadings[1], { opacity: 0, x: window.innerWidth + 30 }); // purple - slightly offset
    utils.set(prismHeadings[2], { opacity: 0, x: window.innerWidth + 60 }); // green - more offset
    utils.set(mainHeading, { opacity: 0 });
    utils.set(homeContent, { opacity: 0 });
  });

  // Create scroll-triggered prism animations for each section
  headingContainers.forEach(function (container) {
    const prismHeadings = container.querySelectorAll('.heading-prism');
    const mainHeading = container.querySelector('.heading-main');
    const homeContent = container.querySelector('.homeContent');

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
          utils.set(homeContent, { opacity: 0 });
          // Play the timeline
          headingTimeline.restart();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(container);

    let prismTime = 600;
    let prismStart = window.innerWidth - 300;

    // Animate cyan layer - movement only (blur stays at 18)
    headingTimeline.add(prismHeadings[0], {
      opacity: [0, 1],
      x: [prismStart, 0],
      duration: prismTime,
      ease: 'outSine'
    }, 0);

    // Remove blur AFTER movement completes for cyan
    headingTimeline.add(prismHeadings[0], {
      filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
      duration: 300,
      ease: 'outExpo'
    }, prismTime);

    // Animate purple layer - movement only (blur stays at 18)
    headingTimeline.add(prismHeadings[1], {
      opacity: [0, 1],
      x: [prismStart + 2, 0],
      duration: prismTime,
      ease: 'outSine'
    }, 30);

    // Remove blur AFTER movement completes for purple
    headingTimeline.add(prismHeadings[1], {
      filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
      duration: 300,
      ease: 'outExpo'
    }, prismTime + 30);

    // Animate yellow layer - movement only (blur stays at 18)
    headingTimeline.add(prismHeadings[2], {
      opacity: [0, 1],
      x: [prismStart + 12, 0],
      duration: prismTime,
      ease: 'outSine'
    }, 50);

    // Remove blur AFTER movement completes for yellow
    headingTimeline.add(prismHeadings[2], {
      filter: ['url(#motion-blur-18)', 'url(#motion-blur-0)'],
      duration: 300,
      ease: 'outExpo'
    }, prismTime + 50);

    // Quickly fade in the dark grey text after prism settles
    headingTimeline.add(mainHeading, {
      opacity: [0, 1],
      duration: 200,
      ease: 'outSine'
    }, prismTime);

    headingTimeline.add(homeContent, {
      opacity: [0, 1],
      duration: 2000,
      ease: 'inOutSine'
    })
  });

  console.log('All animations initialized!');

  // Circle configurations for each section
  const circleConfigs = {
    hero: {
      circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4, fill: '#C8DDFF' },
      circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3, fill: '#E8D8FF' },
      circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35, fill: '#C8DDFF' },
      circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45, fill: '#E8D8FF' },
      circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3, fill: '#C8DDFF' }
    },
    section1: {
      circle1: { x: -2000, y: 1200, scale: 3.0, opacity: 0.6, fill: '#B8C5E8' },
      circle2: { x: 2500, y: -1500, scale: 0.2, opacity: 0.3, fill: '#C8B8D8' },
      circle3: { x: 1800, y: 1600, scale: 2.5, opacity: 0.2, fill: '#A8B8E0' },
      circle4: { x: -2200, y: -1800, scale: 0.4, opacity: 0.5, fill: '#D0C0E0' },
      circle5: { x: 2100, y: 900, scale: 1.8, opacity: 0.35, fill: '#B0C0E8' }
    },
    section2: {
      circle1: { x: 2300, y: -1700, scale: 0.3, opacity: 0.7, fill: '#C0D0F0' },
      circle2: { x: -2400, y: 1400, scale: 3.5, opacity: 0.15, fill: '#D8C8E8' },
      circle3: { x: -1600, y: -1900, scale: 0.6, opacity: 0.55, fill: '#B0C0E0' },
      circle4: { x: 2600, y: 1100, scale: 2.2, opacity: 0.25, fill: '#E0D0F0' },
      circle5: { x: -1900, y: -1300, scale: 2.8, opacity: 0.3, fill: '#C8D0F0' }
    },
    section3: {
      circle1: { x: -2500, y: -2000, scale: 1.2, opacity: 0.4, fill: '#D0D8F8' },
      circle2: { x: 2200, y: 1800, scale: 2.5, opacity: 0.35, fill: '#E0D0F0' },
      circle3: { x: 1700, y: -1600, scale: 0.3, opacity: 0.7, fill: '#C0D0E8' },
      circle4: { x: -2800, y: 800, scale: 3.0, opacity: 0.2, fill: '#E8D8F0' },
      circle5: { x: 2400, y: -1400, scale: 2.0, opacity: 0.45, fill: '#D0D8F8' }
    },
    section4: {
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

  // Initialize with hero's ending positions
  let targetValues = {
    circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4 },
    circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3 },
    circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35 },
    circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45 },
    circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3 }
  };

  // Current values for smooth interpolation (start from hero end positions)
  let currentValues = JSON.parse(JSON.stringify(targetValues));

  // Smooth damping for gentle catchup with visible movement
  const damping = 0.025; // Slow but visible movement

  // Animation frame for smooth updates
  let animationFrame = null;

  // Function to calculate target values based on scroll
  const updateTargetValues = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollProgress = scrollY / windowHeight;

    // Determine current section and interpolation progress
    const sectionIndex = Math.floor(scrollProgress);
    const sectionProgress = scrollProgress - sectionIndex;

    const actualSectionIndex = Math.min(sectionIndex, sections.length - 1);

    const currentSection = sections[actualSectionIndex];
    const nextSection = sections[Math.min(actualSectionIndex + 1, sections.length - 1)];

    const currentConfig = circleConfigs[currentSection];
    const nextConfig = circleConfigs[nextSection];

    // Update target values for each circle
    for (let i = 1; i <= 5; i++) {
      const circleKey = `circle${i}`;
      const current = currentConfig[circleKey];
      const next = nextConfig[circleKey];

      // Calculate target values
      targetValues[circleKey] = {
        x: current.x + (next.x - current.x) * sectionProgress,
        y: current.y + (next.y - current.y) * sectionProgress,
        scale: current.scale + (next.scale - current.scale) * sectionProgress,
        opacity: current.opacity + (next.opacity - current.opacity) * sectionProgress
      };

      // Animate color when entering a new section
      if (actualSectionIndex !== lastSectionIndex && actualSectionIndex < sections.length - 1) {
        animate(`.circle-${i} circle`, {
          fill: [current.fill, next.fill],
          duration: 2000,
          ease: 'inOutSine'
        });
      }
    }

    lastSectionIndex = actualSectionIndex;
  };

  // Smooth animation loop with very slow easing
  const animateCircles = () => {
    let needsUpdate = false;

    // Update each circle with damped movement
    for (let i = 1; i <= 5; i++) {
      const circleKey = `circle${i}`;
      const target = targetValues[circleKey];
      const current = currentValues[circleKey];

      // Different damping per circle for organic feel (each circle progressively slower)
      const circleDamping = damping * (1 - i * 0.15); // Each circle 15% slower

      // Simple eased interpolation - no immediate response, just smooth catchup
      const deltaX = (target.x - current.x) * circleDamping;
      const deltaY = (target.y - current.y) * circleDamping;
      const deltaScale = (target.scale - current.scale) * circleDamping;
      const deltaOpacity = (target.opacity - current.opacity) * circleDamping;

      // Update current values with very smooth, slow interpolation
      current.x += deltaX;
      current.y += deltaY;
      current.scale += deltaScale;
      current.opacity += deltaOpacity;

      // Check if still animating
      if (Math.abs(target.x - current.x) > 0.1 ||
        Math.abs(target.y - current.y) > 0.1 ||
        Math.abs(target.scale - current.scale) > 0.001 ||
        Math.abs(target.opacity - current.opacity) > 0.001) {
        needsUpdate = true;
      }

      // Apply the smoothed values
      utils.set(`.circle-${i}`, {
        x: current.x,
        y: current.y,
        scale: current.scale,
        opacity: current.opacity
      });
    }

    // Always continue animation loop
    animationFrame = requestAnimationFrame(animateCircles);
  };

  // Function to handle scroll events
  const updateCirclesOnScroll = () => {
    updateTargetValues();
  };

  const startScrollListener = () => {
    window.addEventListener('scroll', updateCirclesOnScroll);
    // Start the animation loop
    animateCircles();
  };

  // Background theme transition timeline (this is the main hero animation)
});
