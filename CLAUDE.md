# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

Paritee V3 is a vanilla JavaScript animated landing page featuring advanced WebGL dot matrix effects, scroll-driven animations, and dynamic visual effects using Three.js and anime.js v4.

**Tech Stack:**
- Vanilla JavaScript (ES6 modules)
- Three.js 0.157.0 for WebGL rendering
- anime.js v4 for animations
- No build system - runs directly in browser

## Development Commands

### Running the Project

Start a local development server (required for ES modules):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Testing Individual Components

- `index.html` - Main landing page with all sections
- `simple-test.html` - Simplified test environment
- `test-shader.html` - Shader testing
- `test-dotmatrix.html` - Dot matrix debugging
- `dotmatrix.html` - Standalone dot matrix demo

### Debug Controls

- Press `H` in the browser to toggle the lil-gui debug panel
- Check browser console for performance metrics and debug logs
- Use developer switches in `main.js`:
  - `SKIP_INTRO_ANIMATIONS` - Skip logo/theme animations for faster testing
  - `SKIP_LOGS` - Disable console logging

## Architecture

### File Structure

```
index.html          # Main page with 9 sections
main.js            # Animation orchestration, scroll logic, circle configs
dotmatrix.js       # Three.js WebGL dot matrix system with custom shaders
style.css          # Background layers, blend modes, circles
anime.min.js       # anime.js v4 library (local copy)
```

### Core Systems

#### 1. Dot Matrix System (dotmatrix.js)

GPU-accelerated particle system using Three.js shader materials:

- **Vertex Shader**: Generates 3D Perlin noise (FBM) for each point, handles influence zones with edge noise
- **Fragment Shader**: Renders circular points with smooth edges
- **Parameters**: Exposed via `window.dotMatrixParams` for animation control
- **Grid**: Dynamically sized based on viewport, responsive to window resize

Key concepts:
- Points map brightness to size (black = small, white = large)
- Two influence zones with independent edge noise for visual effects
- All noise calculations run on GPU for 60fps performance

#### 2. Animation System (main.js)

Uses anime.js v4 API (`animate`, `createTimeline`, `onScroll`, `utils`):

- **Hero Animation**: Logo reveal → circle expansion → theme transition → heading prism effect
- **Scroll Animations**: Per-section heading animations with prism layers (cyan, purple, yellow)
- **Circle Choreography**: Smooth interpolation between section-specific circle configurations
- **Parallax Effects**: Scroll-driven dotMatrix parameter interpolation

#### 3. Visual Layers (z-index hierarchy)

```
Layer -3: .bg-dark (dark gradient)
Layer -2: .bg-light (light gradient, animated opacity)
Layer -1: .bg-circles (5 SVG circles with blur)
Layer  0: #dotmatrix canvas (blend mode: plus-lighter)
Layer  1: .paritee-logo (3 color-shifted logos, cyan/purple/yellow)
Layer  2: .section content (headings, text)
```

### Animation Patterns

#### Prism Effect (Text)

Each heading uses 4 layers:
1. Three colored layers (.heading-prism) - cyan, purple, yellow with `mix-blend-mode: lighten`
2. One solid layer (.heading-main) - dark grey, fades in after prism settles
3. Slide from right with staggered timing and blur
4. Content fade-in after heading completes

#### Circle Configurations

Each section defines two states (intro/main) with 16 transitions total:
- `section1_intro` → `section1_main` → `section2_intro` → `section2_main` etc.
- Smooth interpolation based on scroll position (0.5 sections per state)
- Properties: x, y, scale, opacity, fill color
- DotMatrix influence zones animate in sync

### Scroll System

- Tracks direction (up/down) to control animation triggers
- Headings animate on scroll-down only, reset on scroll-up
- Circle/dotMatrix params interpolate continuously based on scroll position
- `IntersectionObserver` triggers heading animations at 30% viewport

## Key Parameters

### DotMatrix Control

Access via `window.dotMatrixParams`:

```javascript
// Main noise
noiseScale, noiseSpeed, noiseGain, noiseThreshold
noiseMultiplier  // Overall fader (0-2)

// Influence zones (1 & 2)
influence1X, influence1Y           // Position (0-1 normalized)
influence1RadiusX, influence1RadiusY  // Size
influence1Falloff, influence1Intensity
influence1EdgeEnabled              // Edge noise toggle
influence1EdgeScale, influence1EdgeSpeed, influence1EdgeGain
```

After modifying params, call `window.syncParamsToUniforms()` to apply changes.

### anime.js v4 Patterns

```javascript
const { animate, createTimeline, utils, onScroll } = anime;

// Set initial state
utils.set(element, { opacity: 0, x: 100 });

// Animate
animate(element, {
  opacity: 1,
  x: 0,
  duration: 1000,
  ease: 'outSine'
});

// Timeline
const tl = createTimeline({ autoplay: false });
tl.add(element, { ... }, 1000); // time offset
```

## Animation Workflow

When implementing new animations:

1. **Plan in timeline**: Define states, timing, easing
2. **Set initial state**: Use `utils.set()` before animations
3. **Create timeline**: Use `createTimeline({ autoplay: false })` for control
4. **Test with skip**: Enable `SKIP_INTRO_ANIMATIONS` to skip to section
5. **Sync dotMatrix**: Remember to call `syncParamsToUniforms()` after param changes
6. **Consider scroll direction**: Check `scrollDirection` for up/down behavior

## Common Tasks

### Adding a New Section

1. Add section HTML in `index.html` with `.section` class
2. Include heading structure (3 prism layers + 1 main)
3. Add circle configs in `main.js` (both `_intro` and `_main`)
4. Add dotMatrix params to circle config
5. Update interpolation logic in `updateCirclesOnScroll()`

### Modifying DotMatrix Visual

1. Open debug panel with `H` key
2. Adjust parameters in GUI
3. Note values you want
4. Set in `main.js` dotMatrix initialization or circle configs
5. Call `syncParamsToUniforms()` if changing from timeline

### Debugging Animation Timing

1. Check browser console for timeline completion logs
2. Use `logger()` function for conditional logging (respects `SKIP_LOGS`)
3. Timeline completion fires `onComplete` callbacks
4. Enable `showStats` in GUI for performance metrics

## Performance Considerations

- Dot matrix noise runs entirely on GPU (vertex shader)
- Circle interpolation happens on scroll, throttled by requestAnimationFrame
- Blend modes (plus-lighter, lighten) are GPU-accelerated
- Grid resolution (default: 80-100) affects point count and performance
- Edge noise adds minimal overhead (same FBM already running for main noise)

## Browser Compatibility

- Requires WebGL support
- Uses ES6 modules (importmap in HTML)
- CSS blend modes (widely supported)
- Tested in modern Chrome/Firefox/Safari
- No polyfills included

## Notes

- anime.js v4 uses global `anime` object with destructured methods
- Three.js uses CDN import via importmap (version pinned to 0.157.0)
- All animations respect reduced motion preferences implicitly through scroll
- Logos (.paritee-logo) fade out after intro, hidden during main content
- Background theme transition (dark → light) happens during hero sequence
