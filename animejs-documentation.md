# Anime.js Documentation

> Complete documentation for Anime.js animation library

Source: https://animejs.com/documentation/
Generated: 2025-09-03T08:19:57.180Z

---

## Documentation

This documentation is brought to you with the help of our incredible sponsors.

Ice Open Network

LambdaTest
  
  
    
  




    
    InSpatial

You can support the project and promote your product or service specifically to Anime.js's audience of web developers by becoming a sponsor on GitHub Sponsors.

Anime.js is only possible thanks to our incredible sponsors:

Help the project survive, become a sponsor.

- Getting started
- Timer
- Animation
- Timeline
- Animatable
- Draggable
- Scroll
- Scope
- Stagger
- SVG
- Text
- Utilities
- WAAPI
- Engine

- Getting started

---


## Getting started

### Funding goal

Help the project survive, become a sponsor.

---


## Timer            V4

### Schedules and controls timed function callbacks that can be used as a replacement to setTimeout() or setInterval(), keeping animations and callbacks in sync.

```javascript
setTimeout()
```

```javascript
setInterval()
```

Timers are created using the createTimer() function.

```javascript
createTimer()
```

```javascript
import { createTimer } from 'animejs';

const timer = createTimer(parameters);
```

### Parameters

```javascript
Object
```

### Returns

Timer

### Timer code example

```javascript
import { animate } from 'animejs';

const [ $time, $count ] = utils.$('.value');

createTimer({
  duration: 1000,
  loop: true,
  frameRate: 30,
  onUpdate: self => $time.innerHTML = self.currentTime,
  onLoop: self => $count.innerHTML = self._currentIteration
});
```

```javascript
<div class="large centered row">
  <div class="half col">
    <pre class="large log row">
      <span class="label">current time</span>
      <span class="value lcd">0</span>
    </pre>
  </div>
  <div class="half col">
    <pre class="large log row">
      <span class="label">callback fired</span>
      <span class="value lcd">0</span>
    </pre>
  </div>
</div>
```

- Playback settings
- Callbacks
- Methods
- Properties

- Using with React
- Timer playback settings

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Animation

### Animates the properties values of targeted elements, with a wide range of parameters, callbacks and methods.

Animations are created using the animate() method.

```javascript
animate()
```

```javascript
import { animate } from 'animejs';

const animation = animate(targets, parameters);
```

### Parameters

```javascript
Object
```

### Returns

JSAnimation

### WAAPI powered animations

Anime.js provides a more lightweight (3KB) version of the animate() method (10KB) powered by the Web Animation API.

```javascript
animate()
```

```javascript
import { waapi } from 'animejs';

const animation = waapi.animate(targets, parameters);
```

The WAAPI version has less features overall, but covers most of the basic API.

To know more about when to use the WAAPI version and its potential pitfalls, please refer to the Web Animations API Guide.

Features only available in the JavaScript version are indicated with a (JS) badge and WAAPI specific features are indicated with a (WAAPI) badge

### Animation code example

```javascript
import { animate, stagger, text } from 'animejs';

const { chars } = text.split('h2', { words: false, chars: true });

animate(chars, {
  // Property keyframes
  y: [
    { to: '-2.75rem', ease: 'outExpo', duration: 600 },
    { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
  ],
  // Property specific parameters
  rotate: {
    from: '-1turn',
    delay: 0
  },
  delay: stagger(50),
  ease: 'inOutCirc',
  loopDelay: 1000,
  loop: true
});
```

```javascript
<div class="large grid centered square-grid">
  <h2 class="text-xl">HELLO WORLD</h2>
</div>
```

```javascript
#animation .text-xl {
  font-size: 1.5rem;
  color: currentColor;
  letter-spacing: 0.06em;
}
```

- Targets
- Animatable properties
- Tween value types
- Tween parameters
- Keyframes
- Playback settings
- Callbacks
- Methods
- Properties

- Timer properties
- Targets

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Timeline

### Synchronises animations, timers, and functions together.

Timelines are created using the createTimeline() function.

```javascript
createTimeline()
```

```javascript
import { createTimeline } from 'animejs';

const timeline = createTimeline(parameters);
```

### Parameters

```javascript
Object
```

### Returns

A Timeline instance with various methods used to add animations, timers, callback functions and labels to it:

```javascript
timeline.add(target, animationParameters, position);
timeline.add(timerParameters, position);
timeline.sync(timelineB, position);
timeline.call(callbackFunction, position);
timeline.label(labelName, position);
```

### Timeline code example

```javascript
import { createTimeline } from 'animejs';

const tl = createTimeline({ defaults: { duration: 750 } });

tl.label('start')
  .add('.square', { x: '15rem' }, 500)
  .add('.circle', { x: '15rem' }, 'start')
  .add('.triangle', { x: '15rem', rotate: '1turn' }, '<-=500');
```

```javascript
<div class="large row">
  <div class="medium pyramid">
    <div class="triangle"></div>
    <div class="square"></div>
    <div class="circle"></div>
  </div>
</div>
```

- Add timers
- Add animations
- Sync WAAPI animations
- Sync timelines
- Call functions
- Time position
- Playback settings
- Callbacks
- Methods
- Properties

- Animation properties
- Add timers

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Animatable            V4

### Efficiently animates target properties, making it an ideal replacement for animate() and utils.set() in situations where values change frequently, such as cursor events or animation loops.

```javascript
animate()
```

```javascript
utils.set()
```

Animatables are created using the createAnimatable() function.

```javascript
createAnimatable()
```

```javascript
import { createAnimatable } from 'animejs';

const animatable = createAnimatable(targets, parameters);
```

### Parameters

```javascript
Object
```

### Returns

An Animatable instance with animatable property functions used to get and set values:

```javascript
animatable.propertyName(value, duration, ease); // Triggers an animation
animatable.propertyName(); // Returns the current value
```

For performance reasons, only Number or Array<Number> can be passed to an animatable property function.

```javascript
Number
```

```javascript
Array<Number>
```

### Animatable code example

```javascript
import { createAnimatable, utils } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const $demo = $demos.querySelector('.docs-demo.is-active');

let bounds = $demo.getBoundingClientRect();
const refreshBounds = () => bounds = $demo.getBoundingClientRect();

const animatableSquare = createAnimatable('.square', {
  x: 500, // Define the x duration to be 500ms
  y: 500, // Define the y duration to be 500ms
  ease: 'out(3)',
});

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const hw = width / 2;
  const hh = height / 2;
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  animatableSquare.x(x); // Animate the x value in 500ms
  animatableSquare.y(y); // Animate the y value in 500ms
}

window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

```javascript
<div class="large centered row">
  <div class="col">
    <div class="square"></div>
  </div>
</div>
<div class="small centered row">
  <span class="label">Move cursor around</span>
</div>
```

- Settings
- Methods
- Properties

- Timeline properties
- Animatable settings

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Draggable            V4

### Adds draggable capabilities to DOM Elements.

Draggables are created using the createDraggable() function.

```javascript
createDraggable()
```

```javascript
import { createDraggable } from 'animejs';

const draggable = createDraggable(target, parameters);
```

### Parameters

```javascript
Object
```

### Returns

Draggable

### Draggable code example

```javascript
import { createDraggable } from 'animejs';

createDraggable('.square');
```

```javascript
<div class="large row centered">
  <div class="square draggable"></div>
</div>
```

- Axes parameters
- Settings
- Callbacks
- Methods
- Properties

- Animatable properties
- Draggable axes parameters

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## ScrollObserver            V4

### Triggers and synchronises Timer, Animation and Timeline instances on scroll.

ScrollObservers are created with the onScroll() function and can be directly declared in the autoplay parameter.

```javascript
onScroll()
```

```javascript
autoplay parameter
```

```javascript
import { onScroll, animate } from 'animejs';

animate(targets, { x: 100, autoplay: onScroll(parameters) });
```

### Parameters

```javascript
Object
```

### Returns

ScrollObserver

### ScrollObserver code example

```javascript
import { animate, utils, onScroll } from 'animejs';

const [ container ] = utils.$('.scroll-container');
const debug = true;

// Animation

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  autoplay: onScroll({ container, debug })
});

// Timer

const [ $timer ] = utils.$('.timer');

createTimer({
  duration: 2000,
  alternate: true,
  loop: true,
  onUpdate: self => {
    $timer.innerHTML = self.iterationCurrentTime
  },
  autoplay: onScroll({
    target: $timer.parentNode,
    container,
    debug
  })
});

// Timeline

const circles = utils.$('.circle');

createTimeline({
  alternate: true,
  loop: true,
  autoplay: onScroll({
    target: circles[0],
    container,
    debug
  })
})
.add(circles[2], { x: '9rem' })
.add(circles[1], { x: '9rem' })
.add(circles[0], { x: '9rem' });
```

```javascript
<div class="scroll-container scroll-y">
  <div class="scroll-content grid square-grid">
    <div class="scroll-section padded">
      <div class="large centered row">
        <div class="label">scroll down</div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="square"></div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large centered row">
        <pre class="large log row">
          <span class="label">timer</span>
          <span class="timer value lcd">0</span>
        </pre>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    </div>
  </div>
</div>
```

```javascript
#scroll-auto-play-on-scroll pre {
  left: 3rem;
  width: 12rem;
}

#scroll-auto-play-on-scroll .circle {
  margin: 0;
}
```

- Settings
- Thresholds
- Synchronisation modes
- Callbacks
- Methods
- Properties

- Draggable properties
- ScrollObserver settings

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Scope            V4

### Anime.js instances declared inside a Scope can react to media queries, use custom root elements, share default parameters, and be reverted in batch, streamlining work in responsive and component-based environments.

Scopes are created using the createScope() function.

```javascript
createScope()
```

```javascript
import { createScope } from 'animejs';

const scope = createScope(parameters);
```

### Parameters

### Returns

Scope

```javascript
Scope
```

### Scope code example

```javascript
import { animate, utils, createScope } from 'animejs';

createScope({
  mediaQueries: {
    isSmall: '(max-width: 200px)',
    reduceMotion: '(prefers-reduced-motion)',
  }
})
.add(self => {

  const { isSmall, reduceMotion } = self.matches;
  
  if (isSmall) {
    utils.set('.square', { scale: .5 });
  }
    
  animate('.square', {
    x: isSmall ? 0 : ['-35vw', '35vw'],
    y: isSmall ? ['-40vh', '40vh'] : 0,
    loop: true,
    alternate: true,
    duration: reduceMotion ? 0 : isSmall ? 750 : 1250
  });

});
```

```javascript
<div class="iframe-content resizable">
  <div class="large centered row">
    <div class="col">
      <div class="square"></div>
    </div>
  </div>
</div>
```

- Add constructor function
- Register method function
- Parameters
- Methods
- Properties

- ScrollObserver properties
- Add constructor function

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Stagger

### Creates sequential effects by distributing values progressively across multiple targets.

Stagger Function based values are created using stagger() function.

```javascript
stagger()
```

```javascript
import { stagger } from 'animejs';

const functionValue = stagger(value, parameters);
```

### Parameters

### Returns

Function based value

### Stagger code example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: '17rem',
  scale: stagger([1, .1]),
  delay: stagger(100),
});
```

```javascript
<div class="small row">
  <div class="square"></div>
</div>
<div class="small row">
  <div class="square"></div>
</div>
<div class="small row">
  <div class="square"></div>
</div>
<div class="small row">
  <div class="square"></div>
</div>
```

- Time staggering
- Values staggering
- Timeline staggering
- Value types
- Parameters

- Scope properties
- Time staggering

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## SVG

### A collection of utility functions to help with SVG morphing, line drawing and motion path animations.

All SVG utility functions are available on the svg object.

```javascript
svg
```

```javascript
import { svg } from 'animejs';
```

- morphTo()
- createDrawable()
- createMotionPath()

- Stagger total
- morphTo()

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Text            V4

### A collection of utility functions to help with text animations.

All text utility functions are available on the text object.

```javascript
text
```

```javascript
import { text } from 'animejs';
```

- split()

- createMotionPath()
- split()

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Utilities

### A collection of utility functions for common animation tasks that can also serve as modifier functions.

All utility functions are available on the utils object.

```javascript
utils
```

```javascript
import { utils } from 'animejs';
```

- $()
- get()
- set()
- remove()
- cleanInlineStyles()
- keepTime()
- random()
- randomPick()
- shuffle()
- sync()
- lerp()
- round()
- clamp()
- snap()
- wrap()
- mapRange()
- interpolate()
- roundPad()
- padStart()
- padEnd()
- degToRad()
- radToDeg()
- Chain-able utilities

- TextSplitter properties
- $()

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Web Animation API            V4

### Create WAAPI powered animations with the simplicity of Anime.js.

Anime.js offers a even more lightweight alternative (3KB versus 10KB) to the animate() method that uses the Web Animation Element.animate() API under the hood.

```javascript
animate()
```

```javascript
Element.animate()
```

WAAPI powered animations are created using the waapi.animate() method.

```javascript
waapi.animate()
```

```javascript
import { waapi } from 'animejs';

const animation = waapi.animate(targets, parameters);
```

### Parameters

```javascript
Object
```

### Returns

WAAPIAnimation

### Web Animation API code example

```javascript
import { waapi, stagger, text } from 'animejs';

const { chars } = text.split('h2', { words: false, chars: true });

waapi.animate(chars, {
  translate: `0 -2rem`,
  delay: stagger(100),
  duration: 600,
  loop: true,
  alternate: true,
  ease: 'inOut(2)',
});
```

```javascript
<div class="large grid centered square-grid">
  <h2 class="text-xl">HELLO WAAPI</h2>
</div>
```

```javascript
#web-animation-api .text-xl {
  font-size: 1.5rem;
  color: currentColor;
  letter-spacing: 0.06em;
}
```

- When to use
- Hardware-acceleration
- Improvements to WAAPI
- API differences
- convertEase()

- Chain-able utility functions
- When to use WAAPI

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---


## Engine            V4

### Drives and synchronises all Animation, Timer, and Timeline instances.

```javascript
import { engine } from 'animejs';
```

- Parameters
- Methods
- Properties
- Engine defaults

- waapi.convertEase()
- Engine parameters

Anime.js is only possible thanks to our incredible sponsors:

### Funding goal

Help the project survive, become a sponsor.

---

