// Wait for the page to fully load
window.addEventListener('load', function() {
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
    onComplete: function() {
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
  
  // Get all section headings except hero
  const sectionHeadings = document.querySelectorAll('.section:not(#hero) h1');
  
  // Set initial state for section headings
  utils.set(sectionHeadings, {
    opacity: 0,
    x: -100
  });
  
  // Create scroll-triggered slide-in animations for each section heading
  sectionHeadings.forEach(function(heading) {
    console.log('Setting up scroll animation for:', heading.textContent);
    
    animate(heading, {
      opacity: [0, 1],
      x: [-100, 0],
      duration: 1000,
      ease: 'outExpo',
      autoplay: onScroll({
        target: heading,
        threshold: [0, 0.3]
      })
    });
  });
  
  console.log('All animations initialized!');
});