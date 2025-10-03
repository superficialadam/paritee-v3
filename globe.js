import * as THREE from 'three';

// ===== PARAMETERS =====
const DOT_SIZE = 2.0;          // Size of each dot
const DOT_DENSITY = 280;       // Dots per latitude row (higher = more dots)
const CITY_DOT_SIZE = 20.0;    // Size of city dots
const GLOBE_RADIUS = 1;
const CAMERA_FOV = 45;         // Camera field of view
const CAMERA_HORIZONTAL_ROTATION = 80;   // Horizontal rotation in degrees (0-360)
const CAMERA_VERTICAL_ROTATION = 30;     // Vertical rotation in degrees (-90 to 90)
const CAMERA_DISTANCE = 3;              // Distance from globe center
// ======================

// Cities with lat/long coordinates
const CITIES = [
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Brussels', lat: 50.8503, lon: 4.3517 },
  { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
  { name: 'Munich', lat: 48.1351, lon: 11.5820 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Dublin', lat: 53.3498, lon: -6.2603 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Minneapolis', lat: 44.9778, lon: -93.2650 },
  { name: 'Washington D.C', lat: 38.9072, lon: -77.0369 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 }
];

// Convert lat/lon to 3D position on sphere (matching the dot generation formula)
function latLonToPosition(lat, lon) {
  // lat: -90 to +90 degrees -> phi: 0 to PI (south to north)
  // lon: -180 to +180 degrees -> theta: 0 to 2PI
  const phi = (lat + 90) * (Math.PI / 180); // -90° -> 0, +90° -> PI
  const theta = ((lon + 180) / 360) * Math.PI * 2; // -180° -> 0, +180° -> 2PI

  // Match the exact formula used for dots
  const x = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = -GLOBE_RADIUS * Math.cos(phi);
  const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// Convert spherical camera coordinates to cartesian
function getCameraPosition(horizontalDeg, verticalDeg, distance) {
  const horizontalRad = horizontalDeg * (Math.PI / 180);
  const verticalRad = verticalDeg * (Math.PI / 180);

  const x = distance * Math.cos(verticalRad) * Math.sin(horizontalRad);
  const y = distance * Math.sin(verticalRad);
  const z = distance * Math.cos(verticalRad) * Math.cos(horizontalRad);

  return { x, y, z };
}

const canvas = document.getElementById('globe');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000);

const cameraPos = getCameraPosition(CAMERA_HORIZONTAL_ROTATION, CAMERA_VERTICAL_ROTATION, CAMERA_DISTANCE);
camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// Load world texture
const textureLoader = new THREE.TextureLoader();
const worldTexture = await textureLoader.loadAsync('GlobeTexture.jpg');

// Calculate city positions
const cityPositions = CITIES.map(city => ({
  name: city.name,
  position: latLonToPosition(city.lat, city.lon)
}));

// Point camera at center of globe
camera.lookAt(0, 0, 0);

// Create globe dots
const DOTS_PER_ROW = DOT_DENSITY; // Latitude divisions
const DOTS_PER_COL = DOT_DENSITY * 2; // Longitude divisions

const positions = [];
const sizes = [];
const dotPositions = []; // Store as Vector3 for distance calculations

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
      dotPositions.push(new THREE.Vector3(px, py, pz));
    }
  }
}

// Find closest dot to each city and make it larger
cityPositions.forEach(city => {
  let closestDotIndex = -1;
  let closestDistance = Infinity;

  dotPositions.forEach((dotPos, index) => {
    const distance = dotPos.distanceTo(city.position);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestDotIndex = index;
    }
  });

  if (closestDotIndex !== -1) {
    sizes[closestDotIndex] = CITY_DOT_SIZE;
  }
});

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
  renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
