import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== PARAMETERS =====
const DOT_SIZE = 8.0;          // Size of each dot
const DOT_DENSITY = 280;       // Dots per latitude row (higher = more dots)
const GLOBE_RADIUS = 1;
// ======================

const canvas = document.getElementById('globe');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 10;

// Load world texture
const textureLoader = new THREE.TextureLoader();
const worldTexture = await textureLoader.loadAsync('GlobeTexture.jpg');

// Create globe dots
const DOTS_PER_ROW = DOT_DENSITY; // Latitude divisions
const DOTS_PER_COL = DOT_DENSITY * 2; // Longitude divisions

const positions = [];
const sizes = [];

// Sample texture to get land data
const canvas2d = document.createElement('canvas');
const ctx = canvas2d.getContext('2d');
canvas2d.width = worldTexture.image.width;
canvas2d.height = worldTexture.image.height;
ctx.drawImage(worldTexture.image, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height);

// Create points on sphere where texture is white
for (let lat = 0; lat < DOTS_PER_ROW; lat++) {
  for (let lon = 0; lon < DOTS_PER_COL; lon++) {
    const phi = (lat / DOTS_PER_ROW) * Math.PI; // 0 to PI
    const theta = (lon / DOTS_PER_COL) * Math.PI * 2; // 0 to 2PI

    // Sample texture at this UV coordinate (equirectangular mapping)
    const u = lon / DOTS_PER_COL;
    const v = 1.0 - (lat / DOTS_PER_ROW); // Flip V for proper texture orientation
    const x = Math.floor(u * imageData.width);
    const y = Math.floor(v * imageData.height);
    const idx = (y * imageData.width + x) * 4;
    const brightness = imageData.data[idx]; // R channel

    // Only create dots where texture is white (land)
    if (brightness > 128) {
      // Convert spherical to cartesian
      const px = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta); // Negate X to mirror horizontally
      const py = -GLOBE_RADIUS * Math.cos(phi); // Negate Y to flip
      const pz = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      positions.push(px, py, pz);
      sizes.push(DOT_SIZE);
    }
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

// Custom shader material for backface culling
const vertexShader = `
  attribute float size;
  varying float vVisible;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size;

    // Calculate if dot faces camera (backface culling)
    vec3 worldNormal = normalize(position); // For a sphere, normal = position
    vec3 viewDirection = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    float facing = dot(worldNormal, viewDirection);

    // Only visible if facing camera
    vVisible = step(0.0, facing);
  }
`;

const fragmentShader = `
  varying float vVisible;

  void main() {
    if (vVisible < 0.5) discard;

    // Draw circular dots
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    // Smooth edge
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
