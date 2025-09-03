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
  const { animate, utils } = anime;
  
  // Hero text bounce animation
  animate('#hero h1', {
    y: [
      { to: -30, duration: 600, ease: 'outExpo' },
      { to: 0, duration: 800, ease: 'outBounce' }
    ],
    scale: [
      { to: 1.1, duration: 600 },
      { to: 1, duration: 800 }
    ],
    loop: true,
    delay: 1500
  });
  
  // Get all section headings except hero
  const sectionHeadings = document.querySelectorAll('.section:not(#hero) h1');
  
  // Set initial state for section headings
  utils.set(sectionHeadings, {
    opacity: 0,
    y: 50
  });
  
  // Create Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
  };
  
  const animatedElements = new Set();
  
  const fadeInObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !animatedElements.has(entry.target)) {
        animatedElements.add(entry.target);
        
        console.log('Animating section:', entry.target.textContent);
        
        // Animate the heading when it comes into view
        animate(entry.target, {
          opacity: [0, 1],
          y: [50, 0],
          duration: 1000,
          ease: 'outExpo'
        });
        
        // Stop observing this element
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Start observing all section headings
  sectionHeadings.forEach(function(h1) {
    fadeInObserver.observe(h1);
    console.log('Now observing:', h1.textContent);
  });
  
  console.log('All animations initialized!');
});