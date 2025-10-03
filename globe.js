import * as THREE from 'three';

// ===== PARAMETERS =====
const DOT_SIZE = 4.0;          // Size of each dot
const DOT_DENSITY = 250;       // Dots per latitude row (higher = more dots)
const CITY_DOT_SIZE = 20.0;    // Size of city dots
const GLOBE_RADIUS = 1;
const CAMERA_FOV = 45;         // Camera field of view
const CAMERA_HORIZONTAL_ROTATION = 70;   // Horizontal rotation in degrees (0-360)
const CAMERA_VERTICAL_ROTATION = 40;     // Vertical rotation in degrees (-90 to 90)
const CAMERA_DISTANCE = 2.3;              // Distance from globe center
// ======================

// Cities with lat/long coordinates
const CITIES = [
  { name: 'Copenhagen', slug: 'copenhagen', lat: 55.6761, lon: 12.5683 },
  { name: 'Oslo', slug: 'oslo', lat: 59.9139, lon: 10.7522 },
  { name: 'Stockholm', slug: 'stockholm', lat: 59.3293, lon: 18.0686 },
  { name: 'Berlin', slug: 'berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Brussels', slug: 'brussels', lat: 50.8503, lon: 4.3517 },
  { name: 'Frankfurt', slug: 'frankfurt', lat: 50.1109, lon: 8.6821 },
  { name: 'Munich', slug: 'munich', lat: 48.1351, lon: 11.5820 },
  { name: 'Paris', slug: 'paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Madrid', slug: 'madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Dubai', slug: 'dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'London', slug: 'london', lat: 51.5074, lon: -0.1278 },
  { name: 'Dublin', slug: 'dublin', lat: 53.3498, lon: -6.2603 },
  { name: 'New York', slug: 'newyork', lat: 40.7128, lon: -74.0060 },
  { name: 'Minneapolis', slug: 'minneapolis', lat: 44.9778, lon: -93.2650 },
  { name: 'Washington D.C', slug: 'washington', lat: 38.9072, lon: -77.0369 },
  { name: 'San Francisco', slug: 'sanfrancisco', lat: 37.7749, lon: -122.4194 }
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

let renderer;
let camera;
let scene;
let points;

async function initGlobe() {
  // Try to find container or canvas element
  const container = document.querySelector('.bg-globe');
  const canvas = document.getElementById('globe');

  if (!container && !canvas) {
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000);

  const cameraPos = getCameraPosition(CAMERA_HORIZONTAL_ROTATION, CAMERA_VERTICAL_ROTATION, CAMERA_DISTANCE);
  camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

  // Setup renderer differently based on context
  if (container) {
    // Embedded in index.html - create canvas and append to container
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = 'globe-canvas';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '-1';
    container.appendChild(renderer.domElement);
  } else {
    // Standalone globe.html - use existing canvas
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
  }

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
  const DOTS_PER_ROW = DOT_DENSITY;
  const DOTS_PER_COL = DOT_DENSITY * 2;

  const positions = [];
  const sizes = [];
  const dotPositions = [];

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
      const phi = (lat / DOTS_PER_ROW) * Math.PI;
      const theta = (lon / DOTS_PER_COL) * Math.PI * 2;

      const u = lon / DOTS_PER_COL;
      const v = 1.0 - (lat / DOTS_PER_ROW);
      const x = Math.floor(u * imageData.width);
      const y = Math.floor(v * imageData.height);
      const idx = (y * imageData.width + x) * 4;
      const brightness = imageData.data[idx];

      if (brightness > 128) {
        const px = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const py = -GLOBE_RADIUS * Math.cos(phi);
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

      vec3 worldNormal = normalize(position);
      vec3 viewDirection = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
      float facing = dot(worldNormal, viewDirection);

      vVisible = step(0.0, facing);
    }
  `;

  const fragmentShader = `
    varying float vVisible;

    void main() {
      if (vVisible < 0.5) discard;

      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;

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

  points = new THREE.Points(geometry, material);
  scene.add(points);

  // Camera animation state (only for standalone with city links)
  let currentHorizontal = CAMERA_HORIZONTAL_ROTATION;
  let currentVertical = CAMERA_VERTICAL_ROTATION;
  let targetHorizontal = CAMERA_HORIZONTAL_ROTATION;
  let targetVertical = CAMERA_VERTICAL_ROTATION;
  let isAnimating = false;

  // Convert cartesian to spherical camera angles
  function cartesianToAngles(x, y, z) {
    const distance = Math.sqrt(x * x + y * y + z * z);
    const verticalRad = Math.asin(y / distance);
    const horizontalRad = Math.atan2(x, z);

    return {
      horizontal: horizontalRad * (180 / Math.PI),
      vertical: verticalRad * (180 / Math.PI)
    };
  }

  // Animate camera to center a city
  function animateToCity(citySlug) {
    const city = CITIES.find(c => c.slug === citySlug);
    if (!city) return;

    const cityPos = latLonToPosition(city.lat, city.lon);
    const targetPos = cityPos.normalize().multiplyScalar(CAMERA_DISTANCE);
    const angles = cartesianToAngles(targetPos.x, targetPos.y, targetPos.z);

    targetHorizontal = angles.horizontal;
    targetVertical = angles.vertical;
    isAnimating = true;
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Only animate camera if we have city links (standalone mode)
    if (canvas && isAnimating) {
      const speed = 0.05;
      const dx = targetHorizontal - currentHorizontal;
      const dy = targetVertical - currentVertical;

      let shortestDx = dx;
      if (Math.abs(dx) > 180) {
        shortestDx = dx > 0 ? dx - 360 : dx + 360;
      }

      currentHorizontal += shortestDx * speed;
      currentVertical += dy * speed;

      if (currentHorizontal < 0) currentHorizontal += 360;
      if (currentHorizontal >= 360) currentHorizontal -= 360;

      const pos = getCameraPosition(currentHorizontal, currentVertical, CAMERA_DISTANCE);
      camera.position.set(pos.x, pos.y, pos.z);
      camera.lookAt(0, 0, 0);

      if (Math.abs(shortestDx) < 0.1 && Math.abs(dy) < 0.1) {
        isAnimating = false;
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // City navigation click handlers (only for standalone mode)
  if (canvas) {
    document.querySelectorAll('.city-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const citySlug = link.getAttribute('data-city');
        animateToCity(citySlug);
      });
    });
  }

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}
