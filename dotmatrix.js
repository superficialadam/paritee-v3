import * as THREE from 'three';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

const canvas = document.getElementById('dotmatrix');

// Default parameters
const params = {
  // Camera controls
  cameraOffsetX: 0.0,
  cameraOffsetY: 0.0,
  cameraOffsetZ: 6.0,
  cameraFOV: 70,
  
  // Dot matrix controls
  gridResolution: 100, // Number of points across width
  pointMargin: 1.0,    // Margin between points (multiplier of point size)
  pointOpacity: 1.0,   // Global opacity
  
  // Size-to-color mapping
  sizeBlack: 0.5,      // Size when point is black
  sizeWhite: 3.0,      // Size when point is white
  
  // Main noise controls
  mainNoiseEnabled: true, // Toggle main noise on/off
  noiseScale: 3.0,     // Scale of the noise pattern
  noiseSpeed: 0.5,     // Speed of noise evolution
  noiseOctaves: 4,     // Number of octaves for fractal noise
  noiseLacunarity: 2.0, // Frequency multiplier per octave
  noiseGain: 0.5,      // Amplitude multiplier per octave
  
  // Influence zone 1 controls
  influence1Enabled: true,
  influence1X: 0.3,     // X position (0-1, normalized)
  influence1Y: 0.5,     // Y position (0-1, normalized)
  influence1RadiusX: 0.2, // Ellipse radius X (0-1, normalized)
  influence1RadiusY: 0.15, // Ellipse radius Y (0-1, normalized)
  influence1Falloff: 2.0, // Falloff power (1=linear, 2=quadratic, etc)
  influence1Intensity: 0.5, // Intensity/value of influence (0=black, 1=white)
  
  // Influence zone 2 controls
  influence2Enabled: true,
  influence2X: 0.7,     // X position (0-1, normalized)
  influence2Y: 0.5,     // Y position (0-1, normalized)
  influence2RadiusX: 0.15, // Ellipse radius X (0-1, normalized)
  influence2RadiusY: 0.25, // Ellipse radius Y (0-1, normalized)
  influence2Falloff: 1.5, // Falloff power (1=linear, 2=quadratic, etc)
  influence2Intensity: 0.3, // Intensity/value of influence (0=black, 1=white)
  
  // Edge noise controls (for breaking up influence zone edges)
  edgeNoiseEnabled: true,
  edgeNoiseStart: 0.3,      // Where edge noise starts (0=center, 1=edge)
  edgeNoiseInfluence: 0.3,  // How much the edge noise affects the influence (0-1)
  edgeNoiseScale: 5.0,      // Scale of edge noise
  edgeNoiseSpeed: 0.3,      // Speed of edge noise evolution
  edgeNoiseOctaves: 2,      // Octaves for edge noise
  edgeNoiseLacunarity: 2.5, // Lacunarity for edge noise
  edgeNoiseGain: 0.6,       // Gain for edge noise
  edgeNoiseContrast: 1.0,   // Contrast adjustment for edge noise
  
  // Debug
  showStats: false
};

let renderer, scene, camera, clock, gui;
let dotMatrix, dotGeometry, dotMaterial;
let dotAttributes = {}; // Store per-point attributes
let noiseTexture, noiseData;

// Vertex shader - handles screen-space sizing
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float opacity;
  
  varying vec3 vColor;
  varying float vOpacity;
  
  uniform float uPointSize;
  uniform vec2 uResolution;
  
  void main() {
    vColor = color;
    vOpacity = opacity;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Calculate screen-space size (size attribute now controls the actual size)
    gl_PointSize = size;
  }
`;

// Fragment shader - renders circular points
const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  uniform float uGlobalOpacity;
  
  void main() {
    // Make points circular
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Smooth edges
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    
    gl_FragColor = vec4(vColor, vOpacity * uGlobalOpacity * alpha);
  }
`;

// Initialize renderer
renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

// Initialize scene and camera
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(params.cameraFOV, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(params.cameraOffsetX, params.cameraOffsetY, params.cameraOffsetZ);
camera.lookAt(0, 0, 0);

// Simple 3D noise function for Z-axis movement
function noise3D(x, y, z) {
  // Simple pseudo-random based on sin
  return (Math.sin(x * 12.9898 + y * 78.233 + z * 43.532) * 43758.5453) % 1.0;
}

// Smooth noise interpolation in 3D
function smoothNoise3D(x, y, z) {
  const intX = Math.floor(x);
  const intY = Math.floor(y);
  const intZ = Math.floor(z);
  const fracX = x - intX;
  const fracY = y - intY;
  const fracZ = z - intZ;
  
  // Get corner values (8 corners of a cube)
  const a000 = noise3D(intX, intY, intZ);
  const a100 = noise3D(intX + 1, intY, intZ);
  const a010 = noise3D(intX, intY + 1, intZ);
  const a110 = noise3D(intX + 1, intY + 1, intZ);
  const a001 = noise3D(intX, intY, intZ + 1);
  const a101 = noise3D(intX + 1, intY, intZ + 1);
  const a011 = noise3D(intX, intY + 1, intZ + 1);
  const a111 = noise3D(intX + 1, intY + 1, intZ + 1);
  
  // Smooth interpolation
  const fx = fracX * fracX * (3 - 2 * fracX);
  const fy = fracY * fracY * (3 - 2 * fracY);
  const fz = fracZ * fracZ * (3 - 2 * fracZ);
  
  // Trilinear interpolation
  const i00 = a000 * (1 - fx) + a100 * fx;
  const i10 = a010 * (1 - fx) + a110 * fx;
  const i01 = a001 * (1 - fx) + a101 * fx;
  const i11 = a011 * (1 - fx) + a111 * fx;
  
  const i0 = i00 * (1 - fy) + i10 * fy;
  const i1 = i01 * (1 - fy) + i11 * fy;
  
  return i0 * (1 - fz) + i1 * fz;
}

// Fractal noise with octaves
function fractalNoise3D(x, y, z, octaves, lacunarity, gain, seed = 0) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  // Add seed offset for different noise patterns
  x += seed * 100;
  y += seed * 100;
  z += seed * 100;
  
  for (let i = 0; i < octaves; i++) {
    value += smoothNoise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

// Apply contrast to a value
function applyContrast(value, contrast) {
  // Remap to -0.5 to 0.5, apply contrast, remap back
  value = value - 0.5;
  value = value * contrast;
  value = value + 0.5;
  return Math.max(0, Math.min(1, value));
}

// Calculate elliptical influence with edge noise
function calculateInfluence(x, y, centerX, centerY, radiusX, radiusY, falloff, intensity, time, influenceIndex = 1) {
  // Calculate normalized distance from center
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance >= 1.0) return 0;
  
  // Base influence with falloff
  let factor = 1.0 - Math.pow(distance, falloff);
  
  // Apply edge noise to break up the circular edge
  if (params.edgeNoiseEnabled && distance > params.edgeNoiseStart) {
    // Calculate edge noise at this position
    const noiseX = x * params.edgeNoiseScale;
    const noiseY = y * params.edgeNoiseScale;
    const noiseZ = -time * params.edgeNoiseSpeed;
    
    let edgeNoise = fractalNoise3D(
      noiseX,
      noiseY,
      noiseZ,
      params.edgeNoiseOctaves,
      params.edgeNoiseLacunarity,
      params.edgeNoiseGain,
      influenceIndex // Different seed for each influence zone
    );
    
    // Apply contrast
    edgeNoise = applyContrast(edgeNoise, params.edgeNoiseContrast);
    
    // Calculate how much edge noise affects this point
    const edgeWeight = (distance - params.edgeNoiseStart) / (1.0 - params.edgeNoiseStart);
    
    // ADD edge noise (not multiply) - edge noise adds or subtracts from influence
    const noiseEffect = (edgeNoise - 0.5) * 2 * params.edgeNoiseInfluence * edgeWeight;
    factor = factor + noiseEffect;
    factor = Math.max(0, Math.min(1, factor)); // Clamp to [0,1]
  }
  
  return factor * intensity;
}

// Create noise texture data
function createNoiseTexture(cols, rows) {
  const size = cols * rows;
  noiseData = new Float32Array(size * 4); // RGBA
  
  // Create texture
  noiseTexture = new THREE.DataTexture(
    noiseData,
    cols,
    rows,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  noiseTexture.magFilter = THREE.NearestFilter;
  noiseTexture.minFilter = THREE.NearestFilter;
  noiseTexture.needsUpdate = true;
}

// Update noise texture with evolving pattern
function updateNoiseTexture(time) {
  if (!noiseData || !dotAttributes.cols || !dotAttributes.rows) return;
  
  const cols = dotAttributes.cols;
  const rows = dotAttributes.rows;
  const scale = params.noiseScale / Math.min(cols, rows);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = (row * cols + col) * 4;
      
      let finalValue = 0;
      
      // Add main noise if enabled
      if (params.mainNoiseEnabled) {
        const x = col * scale;
        const y = row * scale;
        const z = -time * params.noiseSpeed; // Negative Z for "towards us" movement
        
        const noiseValue = fractalNoise3D(
          x,
          y,
          z,
          params.noiseOctaves,
          params.noiseLacunarity,
          params.noiseGain
        );
        
        finalValue += noiseValue;
      }
      
      // Convert grid coordinates to normalized coordinates (0-1)
      const normX = col / (cols - 1);
      const normY = row / (rows - 1);
      
      // Add influence zone 1 (additive)
      if (params.influence1Enabled) {
        const influence1 = calculateInfluence(
          normX, normY,
          params.influence1X, params.influence1Y,
          params.influence1RadiusX, params.influence1RadiusY,
          params.influence1Falloff,
          params.influence1Intensity,
          time,
          1
        );
        
        finalValue += influence1;
      }
      
      // Add influence zone 2 (additive)
      if (params.influence2Enabled) {
        const influence2 = calculateInfluence(
          normX, normY,
          params.influence2X, params.influence2Y,
          params.influence2RadiusX, params.influence2RadiusY,
          params.influence2Falloff,
          params.influence2Intensity,
          time,
          2
        );
        
        finalValue += influence2;
      }
      
      // Clamp to 0-1 range
      finalValue = Math.max(0, Math.min(1, finalValue));
      
      // Store in texture (using all channels for consistency)
      noiseData[index] = finalValue;
      noiseData[index + 1] = finalValue;
      noiseData[index + 2] = finalValue;
      noiseData[index + 3] = 1.0;
    }
  }
  
  if (noiseTexture) {
    noiseTexture.needsUpdate = true;
  }
}

// Create dot matrix system
function createDotMatrix() {
  // Remove existing matrix if it exists
  if (dotMatrix) {
    scene.remove(dotMatrix);
    dotGeometry.dispose();
    dotMaterial.dispose();
  }
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  
  // Calculate grid dimensions
  const cols = params.gridResolution;
  const totalSpacing = params.sizeWhite * (1 + params.pointMargin);
  const rows = Math.floor(cols / aspect);
  
  const totalPoints = cols * rows;
  
  // Calculate the visible area at z=0 plane
  const distance = camera.position.z;
  const vFov = (params.cameraFOV * Math.PI) / 180;
  const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
  const visibleWidth = visibleHeight * aspect;
  
  // Calculate actual spacing to fit the grid in view
  const gridWidth = visibleWidth * 0.95; // 95% of visible area
  const gridHeight = visibleHeight * 0.95;
  const spacingX = gridWidth / (cols - 1);
  const spacingY = gridHeight / (rows - 1);
  const spacing = Math.min(spacingX, spacingY); // Use uniform spacing
  
  // Create noise texture matching grid resolution
  createNoiseTexture(cols, rows);
  
  // Create geometry
  dotGeometry = new THREE.BufferGeometry();
  
  // Position array
  const positions = new Float32Array(totalPoints * 3);
  // Size array (for individual size control)
  const sizes = new Float32Array(totalPoints);
  // Color array (for individual color control)
  const colors = new Float32Array(totalPoints * 3);
  // Opacity array (for individual opacity control)
  const opacities = new Float32Array(totalPoints);
  
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Position
      const x = (col - (cols - 1) / 2) * spacing;
      const y = (row - (rows - 1) / 2) * spacing;
      const z = 0;
      
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
      
      // Default size (will be updated by noise)
      sizes[index] = params.sizeWhite;
      
      // Default color (white, will be updated by noise)
      colors[index * 3] = 1.0;
      colors[index * 3 + 1] = 1.0;
      colors[index * 3 + 2] = 1.0;
      
      // Default opacity
      opacities[index] = 1.0;
      
      index++;
    }
  }
  
  // Set attributes
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dotGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  dotGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  dotGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  
  // Store references for later manipulation
  dotAttributes = {
    positions: positions,
    sizes: sizes,
    colors: colors,
    opacities: opacities,
    cols: cols,
    rows: rows,
    totalPoints: totalPoints
  };
  
  // Create material
  dotMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPointSize: { value: params.sizeWhite },
      uResolution: { value: new THREE.Vector2(width, height) },
      uGlobalOpacity: { value: params.pointOpacity }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  // Create points mesh
  dotMatrix = new THREE.Points(dotGeometry, dotMaterial);
  scene.add(dotMatrix);
}

// Update points based on noise values
function updatePointsFromNoise() {
  if (!noiseData || !dotAttributes.totalPoints) return;
  
  const cols = dotAttributes.cols;
  const rows = dotAttributes.rows;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pointIndex = row * cols + col;
      const noiseIndex = pointIndex * 4;
      
      // Get noise value (0 to 1)
      const noiseValue = noiseData[noiseIndex];
      
      // Map noise to size (black/small when 0, white/big when 1)
      const size = params.sizeBlack + (params.sizeWhite - params.sizeBlack) * noiseValue;
      dotAttributes.sizes[pointIndex] = size;
      
      // Map noise to color (black when 0, white when 1)
      dotAttributes.colors[pointIndex * 3] = noiseValue;
      dotAttributes.colors[pointIndex * 3 + 1] = noiseValue;
      dotAttributes.colors[pointIndex * 3 + 2] = noiseValue;
    }
  }
  
  // Update geometry attributes
  dotGeometry.attributes.size.needsUpdate = true;
  dotGeometry.attributes.color.needsUpdate = true;
}

// Utility function to update individual point properties
function updatePoint(index, properties = {}) {
  if (!dotAttributes.totalPoints || index >= dotAttributes.totalPoints) return;
  
  if (properties.size !== undefined) {
    dotAttributes.sizes[index] = properties.size;
    dotGeometry.attributes.size.needsUpdate = true;
  }
  
  if (properties.color !== undefined) {
    const colorIndex = index * 3;
    dotAttributes.colors[colorIndex] = properties.color.r || properties.color[0] || 0;
    dotAttributes.colors[colorIndex + 1] = properties.color.g || properties.color[1] || 0;
    dotAttributes.colors[colorIndex + 2] = properties.color.b || properties.color[2] || 0;
    dotGeometry.attributes.color.needsUpdate = true;
  }
  
  if (properties.opacity !== undefined) {
    dotAttributes.opacities[index] = properties.opacity;
    dotGeometry.attributes.opacity.needsUpdate = true;
  }
}

// Utility function to update point by grid coordinates
function updatePointByCoord(col, row, properties) {
  if (!dotAttributes.cols || !dotAttributes.rows) return;
  if (col >= dotAttributes.cols || row >= dotAttributes.rows) return;
  
  const index = row * dotAttributes.cols + col;
  updatePoint(index, properties);
}

// Initialize dot matrix
createDotMatrix();

// Expose for DevTools
Object.assign(window, { 
  scene, 
  camera, 
  renderer, 
  dotMatrix,
  updatePoint,
  updatePointByCoord,
  dotAttributes,
  params,
  noiseTexture,
  noiseData
});

// Setup GUI
function setupGUI() {
  gui = new GUI({ title: 'Dot Matrix Controls' });
  
  // Camera folder
  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(params, 'cameraOffsetX').name('X Position')
    .onChange(v => camera.position.x = v);
  cameraFolder.add(params, 'cameraOffsetY').name('Y Position')
    .onChange(v => camera.position.y = v);
  cameraFolder.add(params, 'cameraOffsetZ').name('Z Position').min(0.1)
    .onChange(v => {
      camera.position.z = v;
      createDotMatrix();
    });
  cameraFolder.add(params, 'cameraFOV').name('Field of View').min(1).max(180)
    .onChange(v => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      createDotMatrix();
    });
  
  // Dot Matrix folder
  const matrixFolder = gui.addFolder('Dot Matrix');
  matrixFolder.add(params, 'gridResolution').name('Grid Resolution').min(1).step(1)
    .onChange(() => createDotMatrix());
  matrixFolder.add(params, 'sizeBlack').name('Size (Black)').min(0)
    .onChange(() => updatePointsFromNoise());
  matrixFolder.add(params, 'sizeWhite').name('Size (White)').min(0)
    .onChange(() => updatePointsFromNoise());
  matrixFolder.add(params, 'pointMargin').name('Point Margin').min(0)
    .onChange(() => createDotMatrix());
  matrixFolder.add(params, 'pointOpacity').name('Global Opacity').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) {
        dotMaterial.uniforms.uGlobalOpacity.value = v;
      }
    });
  matrixFolder.open();
  
  // Main Noise folder
  const noiseFolder = gui.addFolder('Main Noise');
  noiseFolder.add(params, 'mainNoiseEnabled').name('Enabled');
  noiseFolder.add(params, 'noiseScale').name('Scale').min(0);
  noiseFolder.add(params, 'noiseSpeed').name('Speed').min(0);
  noiseFolder.add(params, 'noiseOctaves').name('Octaves').min(1).step(1);
  noiseFolder.add(params, 'noiseLacunarity').name('Lacunarity').min(0);
  noiseFolder.add(params, 'noiseGain').name('Gain').min(0).max(1);
  
  // Influence Zone 1 folder
  const influence1Folder = gui.addFolder('Influence Zone 1');
  influence1Folder.add(params, 'influence1Enabled').name('Enabled');
  influence1Folder.add(params, 'influence1X').name('X Position').min(0).max(1);
  influence1Folder.add(params, 'influence1Y').name('Y Position').min(0).max(1);
  influence1Folder.add(params, 'influence1RadiusX').name('Radius X').min(0);
  influence1Folder.add(params, 'influence1RadiusY').name('Radius Y').min(0);
  influence1Folder.add(params, 'influence1Falloff').name('Falloff').min(0);
  influence1Folder.add(params, 'influence1Intensity').name('Intensity');
  influence1Folder.open();
  
  // Influence Zone 2 folder
  const influence2Folder = gui.addFolder('Influence Zone 2');
  influence2Folder.add(params, 'influence2Enabled').name('Enabled');
  influence2Folder.add(params, 'influence2X').name('X Position').min(0).max(1);
  influence2Folder.add(params, 'influence2Y').name('Y Position').min(0).max(1);
  influence2Folder.add(params, 'influence2RadiusX').name('Radius X').min(0);
  influence2Folder.add(params, 'influence2RadiusY').name('Radius Y').min(0);
  influence2Folder.add(params, 'influence2Falloff').name('Falloff').min(0);
  influence2Folder.add(params, 'influence2Intensity').name('Intensity');
  
  // Edge Noise folder
  const edgeNoiseFolder = gui.addFolder('Edge Noise');
  edgeNoiseFolder.add(params, 'edgeNoiseEnabled').name('Enabled');
  edgeNoiseFolder.add(params, 'edgeNoiseStart').name('Start Position').min(0).max(1);
  edgeNoiseFolder.add(params, 'edgeNoiseInfluence').name('Influence').min(0);
  edgeNoiseFolder.add(params, 'edgeNoiseScale').name('Scale').min(0);
  edgeNoiseFolder.add(params, 'edgeNoiseSpeed').name('Speed').min(0);
  edgeNoiseFolder.add(params, 'edgeNoiseOctaves').name('Octaves').min(1).step(1);
  edgeNoiseFolder.add(params, 'edgeNoiseLacunarity').name('Lacunarity').min(0);
  edgeNoiseFolder.add(params, 'edgeNoiseGain').name('Gain').min(0).max(1);
  edgeNoiseFolder.add(params, 'edgeNoiseContrast').name('Contrast').min(0);
  edgeNoiseFolder.open();
  
  // Debug folder
  const debugFolder = gui.addFolder('Debug');
  debugFolder.add(params, 'showStats').name('Show Stats')
    .onChange(v => {
      if (v) {
        console.log('Dot Matrix Stats:', {
          totalPoints: dotAttributes.totalPoints,
          cols: dotAttributes.cols,
          rows: dotAttributes.rows,
          sizeBlack: params.sizeBlack,
          sizeWhite: params.sizeWhite,
          gridResolution: params.gridResolution,
          mainNoiseEnabled: params.mainNoiseEnabled,
          influence1: {
            enabled: params.influence1Enabled,
            position: [params.influence1X, params.influence1Y],
            radius: [params.influence1RadiusX, params.influence1RadiusY]
          },
          influence2: {
            enabled: params.influence2Enabled,
            position: [params.influence2X, params.influence2Y],
            radius: [params.influence2RadiusX, params.influence2RadiusY]
          },
          edgeNoise: {
            enabled: params.edgeNoiseEnabled,
            start: params.edgeNoiseStart,
            influence: params.edgeNoiseInfluence,
            scale: params.edgeNoiseScale,
            contrast: params.edgeNoiseContrast
          }
        });
      }
    });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      gui.show(gui._hidden);
    }
  });
}

setupGUI();

// Animation loop
clock = new THREE.Clock();
let lastTime = 0;

renderer.setAnimationLoop(() => {
  const currentTime = clock.getElapsedTime();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update noise texture
  updateNoiseTexture(currentTime);
  
  // Update points based on noise
  updatePointsFromNoise();
  
  renderer.render(scene, camera);
});

// Handle resize
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  
  // Update shader uniforms
  if (dotMaterial) {
    dotMaterial.uniforms.uResolution.value.set(w, h);
  }
  
  // Recreate dot matrix to fit new window size
  createDotMatrix();
}

window.addEventListener('resize', onResize);

console.log('Dot Matrix: Pure additive layers with dual influence zones. Press H to toggle GUI.');