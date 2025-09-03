// Wait for the page to fully load
window.addEventListener('load', function () {
  console.log('Page loaded');

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

    // Set initial positions - start from right side of screen
    utils.set(prismHeadings[0], { opacity: 0, x: window.innerWidth }); // cyan
    utils.set(prismHeadings[1], { opacity: 0, x: window.innerWidth + 30 }); // purple - slightly offset
    utils.set(prismHeadings[2], { opacity: 0, x: window.innerWidth + 60 }); // green - more offset
    utils.set(mainHeading, { opacity: 0 });
  });

  // Create scroll-triggered prism animations for each section
  headingContainers.forEach(function (container) {
    const prismHeadings = container.querySelectorAll('.heading-prism');
    const mainHeading = container.querySelector('.heading-main');

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
          // Play the timeline
          headingTimeline.restart();
        }
      });
    }, { threshold: 0.1 });

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
      circle1: { x: -2000, y: 1200, scale: 3.0, opacity: 0.6, fill: '#2A45B8' },
      circle2: { x: 2500, y: -1500, scale: 0.2, opacity: 0.3, fill: '#5C2F9A' },
      circle3: { x: 1800, y: 1600, scale: 2.5, opacity: 0.2, fill: '#1A35A0' },
      circle4: { x: -2200, y: -1800, scale: 0.4, opacity: 0.5, fill: '#6B3AAA' },
      circle5: { x: 2100, y: 900, scale: 1.8, opacity: 0.35, fill: '#3A55C8' }
    },
    section2: {
      circle1: { x: 2300, y: -1700, scale: 0.3, opacity: 0.7, fill: '#4A65D8' },
      circle2: { x: -2400, y: 1400, scale: 3.5, opacity: 0.15, fill: '#7C4FBA' },
      circle3: { x: -1600, y: -1900, scale: 0.6, opacity: 0.55, fill: '#2A55B0' },
      circle4: { x: 2600, y: 1100, scale: 2.2, opacity: 0.25, fill: '#8B5ACA' },
      circle5: { x: -1900, y: -1300, scale: 2.8, opacity: 0.3, fill: '#5A75E8' }
    },
    section3: {
      circle1: { x: -2500, y: -2000, scale: 1.2, opacity: 0.4, fill: '#6A85F8' },
      circle2: { x: 2200, y: 1800, scale: 2.5, opacity: 0.35, fill: '#9C6FDA' },
      circle3: { x: 1700, y: -1600, scale: 0.3, opacity: 0.7, fill: '#4A75D0' },
      circle4: { x: -2800, y: 800, scale: 3.0, opacity: 0.2, fill: '#AB7AEA' },
      circle5: { x: 2400, y: -1400, scale: 2.0, opacity: 0.45, fill: '#7A95FF' }
    },
    section4: {
      circle1: { x: 2700, y: 2100, scale: 2.5, opacity: 0.5, fill: '#8AA5FF' },
      circle2: { x: -2300, y: -1900, scale: 0.4, opacity: 0.4, fill: '#BC8FFA' },
      circle3: { x: -2000, y: 1700, scale: 3.5, opacity: 0.3, fill: '#6A95F0' },
      circle4: { x: 2500, y: -1500, scale: 0.2, opacity: 0.8, fill: '#CB9AFF' },
      circle5: { x: -1800, y: -2200, scale: 1.6, opacity: 0.35, fill: '#9AB5FF' }
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

  // Add scroll listener after hero animation completes
  setTimeout(() => {
    window.addEventListener('scroll', updateCirclesOnScroll);
    // Start the continuous animation loop
    animateCircles();
  }, 5000); // Wait for hero animation to complete

  // Background theme transition timeline (this is the main hero animation)
  const themeTimeline = createTimeline({
    duration: 5000,
    ease: 'inOutQuad',
    onComplete: function () {
      console.log('Theme timeline complete, playing hero heading animation');
      // Play the hero heading animation after theme timeline completes
      heroHeadingTimeline.play();
    }
  });
  
  // Animate background gradient to much brighter mode by fading in the light background
  themeTimeline.add('.bg-light', {
    opacity: [0, 1],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate only main heading text colors to dark for light mode (not prism layers)
  themeTimeline.add('.heading-main', {
    color: ['#333333', '#1A1A2E'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Transition hero main heading text to dark
  themeTimeline.add('#hero .heading-main', {
    color: ['#333333', '#1A1A2E'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate circle 1 - move, scale and color change
  themeTimeline.add('.circle-1', {
    x: [0, 150],
    y: [0, 100],
    scale: [1, 1.3],
    duration: 5000,
    ease: 'inOutQuad'
  }, 0);

  themeTimeline.add('.circle-1 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate circle 2 - move, scale and color change
  themeTimeline.add('.circle-2', {
    x: [0, -100],
    y: [0, 50],
    scale: [1, 0.8],
    duration: 5000,
    ease: 'inOutQuad'
  }, 0);

  themeTimeline.add('.circle-2 circle', {
    fill: ['#3B167A', '#E8D8FF'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate circle 3 - move, scale and color change
  themeTimeline.add('.circle-3', {
    x: [0, -80],
    y: [0, -120],
    scale: [1, 1.2],
    duration: 5000,
    ease: 'inOutQuad'
  }, 0);

  themeTimeline.add('.circle-3 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate circle 4 - move, scale and color change
  themeTimeline.add('.circle-4', {
    x: [0, 200],
    y: [0, -80],
    scale: [1, 1.1],
    duration: 5000,
    ease: 'inOutQuad'
  }, 0);

  themeTimeline.add('.circle-4 circle', {
    fill: ['#3B167A', '#E8D8FF'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);

  // Animate circle 5 - move, scale and color change
  themeTimeline.add('.circle-5', {
    x: [0, -150],
    y: [0, -100],
    scale: [1, 0.9],
    duration: 5000,
    ease: 'inOutQuad'
  }, 0);

  themeTimeline.add('.circle-5 circle', {
    fill: ['#0E2683', '#C8DDFF'],
    duration: 5000,
    ease: 'inOutSine'
  }, 0);
});
