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
  pointSize: 2.0,      // Size of each point in pixels
  pointMargin: 1.0,    // Margin between points (multiplier of point size)
  pointOpacity: 1.0,   // Global opacity
  pointColor: '#ffffff', // Global color
  
  // Debug
  showStats: false
};

let renderer, scene, camera, clock, gui;
let dotMatrix, dotGeometry, dotMaterial;
let dotAttributes = {}; // Store per-point attributes

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
    
    // Calculate screen-space size
    gl_PointSize = uPointSize * size;
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
  const totalSpacing = params.pointSize * (1 + params.pointMargin);
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
      
      // Default size (1.0 = normal size)
      sizes[index] = 1.0;
      
      // Default color (white)
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
      uPointSize: { value: params.pointSize },
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

// Example animation function (for testing)
function animatePoints(time) {
  if (!dotAttributes.totalPoints) return;
  
  // Example: Create a wave effect
  for (let i = 0; i < dotAttributes.totalPoints; i++) {
    const x = dotAttributes.positions[i * 3];
    const y = dotAttributes.positions[i * 3 + 1];
    const wave = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time);
    
    // Animate size
    dotAttributes.sizes[i] = 1.0 + wave * 0.3;
    
    // Animate opacity
    dotAttributes.opacities[i] = 0.5 + wave * 0.5;
  }
  
  dotGeometry.attributes.size.needsUpdate = true;
  dotGeometry.attributes.opacity.needsUpdate = true;
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
  params 
});

// Setup GUI
function setupGUI() {
  gui = new GUI({ title: 'Dot Matrix Controls' });
  
  // Camera folder
  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(params, 'cameraOffsetX', -10, 10, 0.1)
    .name('X Position')
    .onChange(v => camera.position.x = v);
  cameraFolder.add(params, 'cameraOffsetY', -10, 10, 0.1)
    .name('Y Position')
    .onChange(v => camera.position.y = v);
  cameraFolder.add(params, 'cameraOffsetZ', 0.1, 20, 0.1)
    .name('Z Position')
    .onChange(v => {
      camera.position.z = v;
      createDotMatrix(); // Recreate to adjust to new camera distance
    });
  cameraFolder.add(params, 'cameraFOV', 30, 120, 1)
    .name('Field of View')
    .onChange(v => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      createDotMatrix(); // Recreate to adjust to new FOV
    });
  
  // Dot Matrix folder
  const matrixFolder = gui.addFolder('Dot Matrix');
  matrixFolder.add(params, 'gridResolution', 10, 200, 1)
    .name('Grid Resolution')
    .onChange(() => createDotMatrix());
  matrixFolder.add(params, 'pointSize', 0.5, 10, 0.1)
    .name('Point Size')
    .onChange(v => {
      if (dotMaterial) {
        dotMaterial.uniforms.uPointSize.value = v;
      }
    });
  matrixFolder.add(params, 'pointMargin', 0, 5, 0.1)
    .name('Point Margin')
    .onChange(() => createDotMatrix());
  matrixFolder.add(params, 'pointOpacity', 0, 1, 0.01)
    .name('Global Opacity')
    .onChange(v => {
      if (dotMaterial) {
        dotMaterial.uniforms.uGlobalOpacity.value = v;
      }
    });
  matrixFolder.addColor(params, 'pointColor')
    .name('Global Color')
    .onChange(v => {
      const color = new THREE.Color(v);
      for (let i = 0; i < dotAttributes.totalPoints; i++) {
        dotAttributes.colors[i * 3] = color.r;
        dotAttributes.colors[i * 3 + 1] = color.g;
        dotAttributes.colors[i * 3 + 2] = color.b;
      }
      dotGeometry.attributes.color.needsUpdate = true;
    });
  matrixFolder.open();
  
  // Debug folder
  const debugFolder = gui.addFolder('Debug');
  debugFolder.add(params, 'showStats')
    .name('Show Stats')
    .onChange(v => {
      if (v) {
        console.log('Dot Matrix Stats:', {
          totalPoints: dotAttributes.totalPoints,
          cols: dotAttributes.cols,
          rows: dotAttributes.rows,
          pointSize: params.pointSize,
          gridResolution: params.gridResolution
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
  
  // Uncomment to test animation
  // animatePoints(currentTime);
  
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

console.log('Dot Matrix initialized. Press H to toggle GUI.');