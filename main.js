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

  // Background theme transition timeline
  const themeTimeline = createTimeline({
    duration: 5000,
    ease: 'inOutQuad'
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
