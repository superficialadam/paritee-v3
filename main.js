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

  // Set initial state for hero text
  utils.set('#hero h1', {
    opacity: 0,
    x: -200,
    filter: 'blur(20px)'
  });

  // Create timeline animation for hero text
  const heroTimeline = createTimeline({
    onComplete: function () {
      console.log('Hero animation complete, enabling scroll');
      // Enable scrolling after hero animation completes
      scrollBlocked = false;
      // Remove event listeners
      window.removeEventListener('scroll', blockScroll);
      window.removeEventListener('wheel', blockScroll);
      window.removeEventListener('touchmove', blockScroll);
    }
  });

  // Add hero text slide-in and blur-to-sharp animation
  heroTimeline.add('#hero h1', {
    opacity: [0, 1],
    x: [-200, 0],
    filter: ['blur(20px)', 'blur(0px)'],
    duration: 5000,
    ease: 'outExpo'
  });

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

    let scrollThresholdValue = 0.3; // Default threshold
    let headingTravelTime = 1000;
    let headingStartPos = window.innerWidth - 300;

    // Create timeline for this heading's animation
    const headingTimeline = createTimeline({
      autoplay: onScroll({
        target: container,
        threshold: [0, scrollThresholdValue],
        repeat: true,
      })
    });

    // Animate cyan layer
    headingTimeline.add(prismHeadings[0], {
      opacity: [0, 1],
      x: [headingStartPos, 0],
      duration: headingTravelTime,
      ease: 'outSine'
    }, 0);

    // Animate purple layer with slight delay
    headingTimeline.add(prismHeadings[1], {
      opacity: [0, 1],
      x: [headingStartPos + 3, 0],
      duration: headingTravelTime,
      ease: 'outSine'
    }, 100);

    // Animate yellow layer with more delay
    headingTimeline.add(prismHeadings[2], {
      opacity: [0, 1],
      x: [headingStartPos + 1, 0],
      duration: headingTravelTime,
      ease: 'outSine'
    }, 200);

    // Quickly fade in the dark grey text after prism settles
    headingTimeline.add(mainHeading, {
      opacity: [0, 1],
      duration: 300,
      ease: 'outSine'
    }, headingTravelTime);
  });

  console.log('All animations initialized!');
  
  // Circle configurations for each section
  const circleConfigs = {
    hero: {
      circle1: { x: 0, y: 0, scale: 1, opacity: 0.4, fill: '#0E2683' },
      circle2: { x: 0, y: 0, scale: 1, opacity: 0.3, fill: '#3B167A' },
      circle3: { x: 0, y: 0, scale: 1, opacity: 0.35, fill: '#0E2683' },
      circle4: { x: 0, y: 0, scale: 1, opacity: 0.45, fill: '#3B167A' },
      circle5: { x: 0, y: 0, scale: 1, opacity: 0.3, fill: '#0E2683' }
    },
    section1: {
      circle1: { x: 100, y: 50, scale: 1.2, opacity: 0.5, fill: '#2A45B8' },
      circle2: { x: -50, y: 100, scale: 0.9, opacity: 0.4, fill: '#5C2F9A' },
      circle3: { x: -100, y: -50, scale: 1.3, opacity: 0.3, fill: '#1A35A0' },
      circle4: { x: 150, y: -100, scale: 1.1, opacity: 0.5, fill: '#6B3AAA' },
      circle5: { x: -120, y: -80, scale: 0.8, opacity: 0.25, fill: '#3A55C8' }
    },
    section2: {
      circle1: { x: -80, y: 120, scale: 0.8, opacity: 0.6, fill: '#4A65D8' },
      circle2: { x: 100, y: -50, scale: 1.4, opacity: 0.25, fill: '#7C4FBA' },
      circle3: { x: 50, y: 100, scale: 1.0, opacity: 0.45, fill: '#2A55B0' },
      circle4: { x: -120, y: 80, scale: 0.9, opacity: 0.35, fill: '#8B5ACA' },
      circle5: { x: 80, y: -120, scale: 1.2, opacity: 0.4, fill: '#5A75E8' }
    },
    section3: {
      circle1: { x: 150, y: -80, scale: 1.5, opacity: 0.3, fill: '#6A85F8' },
      circle2: { x: -100, y: -100, scale: 1.1, opacity: 0.5, fill: '#9C6FDA' },
      circle3: { x: -50, y: 150, scale: 0.7, opacity: 0.6, fill: '#4A75D0' },
      circle4: { x: 200, y: 50, scale: 1.3, opacity: 0.25, fill: '#AB7AEA' },
      circle5: { x: -150, y: 100, scale: 1.0, opacity: 0.5, fill: '#7A95FF' }
    },
    section4: {
      circle1: { x: -120, y: -120, scale: 1.1, opacity: 0.4, fill: '#8AA5FF' },
      circle2: { x: 80, y: 80, scale: 1.2, opacity: 0.35, fill: '#BC8FFA' },
      circle3: { x: 120, y: -80, scale: 1.4, opacity: 0.5, fill: '#6A95F0' },
      circle4: { x: -80, y: -50, scale: 0.8, opacity: 0.6, fill: '#CB9AFF' },
      circle5: { x: 50, y: 120, scale: 0.9, opacity: 0.45, fill: '#9AB5FF' }
    }
  };
  
  // Get all sections
  const sections = ['hero', 'section1', 'section2', 'section3', 'section4'];
  let currentSectionIndex = 0;
  let lastSectionIndex = -1;
  
  // Function to interpolate circle properties based on scroll
  const updateCirclesOnScroll = () => {
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
    
    // Animate each circle
    for (let i = 1; i <= 5; i++) {
      const circleKey = `circle${i}`;
      const current = currentConfig[circleKey];
      const next = nextConfig[circleKey];
      
      // Interpolate values
      const x = current.x + (next.x - current.x) * sectionProgress;
      const y = current.y + (next.y - current.y) * sectionProgress;
      const scale = current.scale + (next.scale - current.scale) * sectionProgress;
      const opacity = current.opacity + (next.opacity - current.opacity) * sectionProgress;
      
      // Use utils.set for immediate updates to avoid animation queue buildup
      utils.set(`.circle-${i}`, {
        x: x,
        y: y,
        scale: scale,
        opacity: opacity
      });
      
      // Only animate color when entering a new section
      if (actualSectionIndex !== lastSectionIndex && actualSectionIndex < sections.length - 1) {
        animate(`.circle-${i} circle`, {
          fill: [current.fill, next.fill],
          duration: 1000,
          ease: 'inOutSine'
        });
      }
    }
    
    lastSectionIndex = actualSectionIndex;
  };
  
  // Add scroll listener after hero animation completes
  setTimeout(() => {
    window.addEventListener('scroll', updateCirclesOnScroll);
    updateCirclesOnScroll(); // Initial update
  }, 5000); // Wait for hero animation to complete

  // Store final positions after hero animation
  let heroFinalPositions = {};
  
  // Background theme transition timeline
  const themeTimeline = createTimeline({
    duration: 5000,
    ease: 'inOutQuad',
    onComplete: function() {
      // Store the final positions of circles after hero animation
      heroFinalPositions = {
        circle1: { x: 150, y: 100, scale: 1.3, opacity: 0.4, fill: '#C8DDFF' },
        circle2: { x: -100, y: 50, scale: 0.8, opacity: 0.3, fill: '#E8D8FF' },
        circle3: { x: -80, y: -120, scale: 1.2, opacity: 0.35, fill: '#C8DDFF' },
        circle4: { x: 200, y: -80, scale: 1.1, opacity: 0.45, fill: '#E8D8FF' },
        circle5: { x: -150, y: -100, scale: 0.9, opacity: 0.3, fill: '#C8DDFF' }
      };
      // Update hero config with final positions
      circleConfigs.hero = heroFinalPositions;
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

  // Keep hero text white initially then transition to dark
  themeTimeline.add('#hero h1', {
    color: ['#ffffff', '#1A1A2E'],
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
