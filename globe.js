import * as THREE from "three";

// ===== PARAMETERS =====
const DOT_SIZE = 4.0; // Size of each dot
const DOT_DENSITY = 120; // Dots per latitude row (REDUCED from 250 for performance)
const CITY_DOT_SIZE = 20.0; // Size of city dots
const GLOBE_RADIUS = 1;
const CAMERA_DISTANCE = 2.3; // Fixed camera distance
const CAMERA_HORIZONTAL_ROTATION = 130; // Horizontal rotation in degrees (0-360)
const CAMERA_VERTICAL_ROTATION = 40; // Vertical rotation in degrees (-90 to 90)
const GLOBE_TARGET_WIDTH_RATIO = 0.8; // Globe should occupy 80% of window width (10% margin each side)
const REFERENCE_WIDTH = 1920; // Reference width where globe looks good
const BASE_FOV = 45; // Base FOV at reference width
// ======================

// Calculate responsive FOV to maintain globe at 80% of window width
function getResponsiveFOV() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  // Calculate FOV to keep globe at consistent screen width percentage
  // Globe diameter in world units = 2 (radius = 1)
  // We want it to occupy 80% of screen width
  const globeVisibleWidth = 2 * GLOBE_RADIUS;
  const targetScreenRatio = GLOBE_TARGET_WIDTH_RATIO; // 0.8

  // How much total visible width we need at the camera distance
  const desiredVisibleWidth = globeVisibleWidth / targetScreenRatio;

  // Calculate vertical FOV: visibleWidth = 2 * distance * tan(vFOV/2) * aspect
  const vFOV =
    2 * Math.atan(desiredVisibleWidth / (2 * CAMERA_DISTANCE * aspect));
  const vFOVDegrees = vFOV * (180 / Math.PI);

  console.log(`Window: ${width}×${height}px, FOV: ${vFOVDegrees.toFixed(1)}°`);
  return vFOVDegrees;
}

// Cities with lat/long coordinates
const CITIES = [
  { name: "Copenhagen", slug: "copenhagen", lat: 55.6761, lon: 12.5683 },
  { name: "Oslo", slug: "oslo", lat: 59.9139, lon: 10.7522 },
  { name: "Stockholm", slug: "stockholm", lat: 59.3293, lon: 18.0686 },
  { name: "Berlin", slug: "berlin", lat: 52.52, lon: 13.405 },
  { name: "Brussels", slug: "brussels", lat: 50.8503, lon: 4.3517 },
  { name: "Frankfurt", slug: "frankfurt", lat: 50.1109, lon: 8.6821 },
  { name: "Munich", slug: "munich", lat: 48.1351, lon: 11.582 },
  { name: "Paris", slug: "paris", lat: 48.8566, lon: 2.3522 },
  { name: "Madrid", slug: "madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Dubai", slug: "dubai", lat: 25.2048, lon: 55.2708 },
  { name: "London", slug: "london", lat: 51.5074, lon: -0.1278 },
  { name: "Dublin", slug: "dublin", lat: 53.3498, lon: -6.2603 },
  { name: "New York", slug: "newyork", lat: 40.7128, lon: -74.006 },
  { name: "Minneapolis", slug: "minneapolis", lat: 44.9778, lon: -93.265 },
  { name: "Washington D.C", slug: "washington", lat: 38.9072, lon: -77.0369 },
  { name: "San Francisco", slug: "sanfrancisco", lat: 37.7749, lon: -122.4194 },
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
  const container = document.querySelector(".bg-globe");
  const canvas = document.getElementById("globe");

  if (!container && !canvas) {
    return;
  }

  scene = new THREE.Scene();

  // Use responsive FOV to maintain globe at 80% of window width
  const fov = getResponsiveFOV();
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const cameraPos = getCameraPosition(
    CAMERA_HORIZONTAL_ROTATION,
    CAMERA_VERTICAL_ROTATION,
    CAMERA_DISTANCE,
  );
  camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

  // Setup renderer differently based on context
  if (container) {
    // Embedded in a page with .bg-globe container - create canvas and append
    // Optimized: antialias off, pixelRatio capped at 1.5 for performance
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = "globe-canvas";
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.pointerEvents = "none";
    container.appendChild(renderer.domElement);
  } else {
    // Standalone globe.html - use existing canvas
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000);
  }

  // Load world texture
  const textureLoader = new THREE.TextureLoader();
  const worldTexture = await textureLoader.loadAsync("GlobeTexture.jpg");

  // Calculate city positions
  const cityPositions = CITIES.map((city) => ({
    name: city.name,
    position: latLonToPosition(city.lat, city.lon),
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
  const canvas2d = document.createElement("canvas");
  const ctx = canvas2d.getContext("2d");
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
      const v = 1.0 - lat / DOTS_PER_ROW;
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
  // Optimized: use squared distance to avoid expensive sqrt() calls
  cityPositions.forEach((city) => {
    let closestDotIndex = -1;
    let closestDistanceSq = Infinity;

    dotPositions.forEach((dotPos, index) => {
      const dx = dotPos.x - city.position.x;
      const dy = dotPos.y - city.position.y;
      const dz = dotPos.z - city.position.z;
      const distanceSq = dx * dx + dy * dy + dz * dz;

      if (distanceSq < closestDistanceSq) {
        closestDistanceSq = distanceSq;
        closestDotIndex = index;
      }
    });

    if (closestDotIndex !== -1) {
      sizes[closestDotIndex] = CITY_DOT_SIZE;
    }
  });

  // Log actual point count for performance monitoring
  console.log(`Globe rendered with ${positions.length / 3} points`);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

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
    uniform float uGlobeOpacity;
    varying float vVisible;

    void main() {
      if (vVisible < 0.5) discard;

      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;

      float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * uGlobeOpacity);
    }
  `;

  // In standalone mode (canvas), globe should be visible by default
  // In embedded mode (container), globe should be visible unless main.js sets it to 0
  const initialOpacity = canvas ? 1 : 1;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uGlobeOpacity: { value: initialOpacity },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  // Expose globe opacity control for external use (e.g., main.js)
  window.globeOpacity = initialOpacity;
  window.globeRotation = CAMERA_HORIZONTAL_ROTATION; // Start at initial rotation

  // Update material opacity and camera rotation on each render
  function updateGlobeOpacity() {
    if (material && material.uniforms && material.uniforms.uGlobeOpacity) {
      material.uniforms.uGlobeOpacity.value = window.globeOpacity;
    }
  }

  function updateGlobeRotation() {
    if (container) {
      const pos = getCameraPosition(
        window.globeRotation,
        CAMERA_VERTICAL_ROTATION,
        CAMERA_DISTANCE,
      );
      camera.position.set(pos.x, pos.y, pos.z);
      camera.lookAt(0, 0, 0);
    }
  }

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
      vertical: verticalRad * (180 / Math.PI),
    };
  }

  // Animate camera to center a city
  function animateToCity(citySlug) {
    const city = CITIES.find((c) => c.slug === citySlug);
    if (!city) return;

    const cityPos = latLonToPosition(city.lat, city.lon);
    const targetPos = cityPos.normalize().multiplyScalar(CAMERA_DISTANCE);
    const angles = cartesianToAngles(targetPos.x, targetPos.y, targetPos.z);

    targetHorizontal = angles.horizontal;
    targetVertical = angles.vertical;
    isAnimating = true;
  }

  // Track if we need to render
  let needsRender = true;
  let lastOpacity = window.globeOpacity;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    let shouldRender = false;

    // Animate camera if animation is active (works in both modes)
    if (isAnimating) {
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

      if (Math.abs(shortestDx) < 0.1 && Math.abs(dy) < 0.1) {
        isAnimating = false;
      }

      shouldRender = true;
    }

    // Always use currentHorizontal/currentVertical for camera position
    // This ensures camera stays where animation left it
    const pos = getCameraPosition(
      currentHorizontal,
      currentVertical,
      CAMERA_DISTANCE,
    );
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(0, 0, 0);

    // Update globe opacity if embedded
    if (container) {
      updateGlobeOpacity();
      // Check if opacity changed
      if (lastOpacity !== window.globeOpacity) {
        lastOpacity = window.globeOpacity;
        shouldRender = true;
      }
    }

    // Only render when something has changed
    if (needsRender || shouldRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  }

  animate();

  // Request render when needed
  window.requestGlobeRender = () => {
    needsRender = true;
  };

  // City navigation click handlers (works in both standalone and embedded modes)
  document.querySelectorAll(".city-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const citySlug = link.getAttribute("data-city");
      animateToCity(citySlug);
    });
  });

  // Handle resize
  window.addEventListener("resize", () => {
    // Update FOV to maintain globe at 80% of window width
    camera.fov = getResponsiveFOV();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    needsRender = true;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobe);
} else {
  initGlobe();
}
