import * as THREE from "three";

// ===== PARAMETERS =====
const DOT_SIZE = 4.0;
const DOT_DENSITY = 120;
const CITY_DOT_SIZE = 20.0;
const GLOBE_RADIUS = 1;
const CAMERA_DISTANCE = 2.3;
const GLOBE_TARGET_WIDTH_RATIO = 0.8;
// ======================

// Calculate responsive FOV
function getResponsiveFOV(width, height) {
  const aspect = width / height;
  const globeVisibleWidth = 2 * GLOBE_RADIUS;
  const targetScreenRatio = GLOBE_TARGET_WIDTH_RATIO;
  const desiredVisibleWidth = globeVisibleWidth / targetScreenRatio;
  const vFOV =
    2 * Math.atan(desiredVisibleWidth / (2 * CAMERA_DISTANCE * aspect));
  const vFOVDegrees = vFOV * (180 / Math.PI);
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

function latLonToPosition(lat, lon) {
  const phi = (lat + 90) * (Math.PI / 180);
  const theta = ((lon + 180) / 360) * Math.PI * 2;
  const x = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = -GLOBE_RADIUS * Math.cos(phi);
  const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function getCameraPosition(horizontalDeg, verticalDeg, distance) {
  const horizontalRad = horizontalDeg * (Math.PI / 180);
  const verticalRad = verticalDeg * (Math.PI / 180);
  const x = distance * Math.cos(verticalRad) * Math.sin(horizontalRad);
  const y = distance * Math.sin(verticalRad);
  const z = distance * Math.cos(verticalRad) * Math.cos(horizontalRad);
  return { x, y, z };
}

function cartesianToAngles(x, y, z) {
  const distance = Math.sqrt(x * x + y * y + z * z);
  const verticalRad = Math.asin(y / distance);
  const horizontalRad = Math.atan2(x, z);
  return {
    horizontal: horizontalRad * (180 / Math.PI),
    vertical: verticalRad * (180 / Math.PI),
  };
}

let renderer;
let camera;
let scene;
let points;

async function initGlobe() {
  // Find container - try #globeWrapper first, fallback to .bg-globe
  const container =
    document.getElementById("globeWrapper") ||
    document.querySelector(".bg-globe");

  if (!container) {
    console.error(
      "globe-background.js: No container found (#globeWrapper or .bg-globe)",
    );
    return;
  }

  console.log(
    "Initializing globe in container:",
    container.id || container.className,
  );

  // Wait for container to have dimensions
  const waitForDimensions = () => {
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    if (w === 0 || h === 0) {
      console.log("Waiting for container dimensions...");
      setTimeout(waitForDimensions, 100);
      return;
    }

    console.log(`Container ready: ${w}×${h}px`);
    setupGlobe(container, w, h);
  };

  waitForDimensions();
}

async function setupGlobe(container, width, height) {
  scene = new THREE.Scene();

  // Setup camera
  const fov = getResponsiveFOV(width, height);
  camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);

  // Point camera at Frankfurt
  const frankfurtCity = CITIES.find((c) => c.slug === "frankfurt");
  const frankfurtPos = latLonToPosition(frankfurtCity.lat, frankfurtCity.lon);
  const targetCameraPos = frankfurtPos
    .normalize()
    .multiplyScalar(CAMERA_DISTANCE);
  const frankfurtAngles = cartesianToAngles(
    targetCameraPos.x,
    targetCameraPos.y,
    targetCameraPos.z,
  );

  const cameraPos = getCameraPosition(
    frankfurtAngles.horizontal,
    frankfurtAngles.vertical,
    CAMERA_DISTANCE,
  );
  camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
  camera.lookAt(0, 0, 0);

  // Setup renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  // Style canvas
  renderer.domElement.id = "globe-canvas";
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.mixBlendMode = "screen";

  container.appendChild(renderer.domElement);

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const worldTexture = await textureLoader.loadAsync("GlobeTexture.jpg");

  // Create globe dots
  const DOTS_PER_ROW = DOT_DENSITY;
  const DOTS_PER_COL = DOT_DENSITY * 2;
  const positions = [];
  const sizes = [];
  const dotPositions = [];

  // Sample texture
  const canvas2d = document.createElement("canvas");
  const ctx = canvas2d.getContext("2d");
  canvas2d.width = worldTexture.image.width;
  canvas2d.height = worldTexture.image.height;
  ctx.drawImage(worldTexture.image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height);

  // Create points
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

  // Mark cities
  const cityPositions = CITIES.map((city) => ({
    name: city.name,
    position: latLonToPosition(city.lat, city.lon),
  }));

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

  console.log(`Globe rendered with ${positions.length / 3} points`);

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  // Shader material
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

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uGlobeOpacity: { value: 1.0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  // Camera animation state
  let currentHorizontal = frankfurtAngles.horizontal;
  let currentVertical = frankfurtAngles.vertical;
  let targetHorizontal = frankfurtAngles.horizontal;
  let targetVertical = frankfurtAngles.vertical;
  let isAnimating = false;

  // Animate to city
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

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

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
    }

    const pos = getCameraPosition(
      currentHorizontal,
      currentVertical,
      CAMERA_DISTANCE,
    );
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // City navigation
  document.querySelectorAll(".city-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      animateToCity(link.getAttribute("data-city"));
    });
  });

  // Resize handler
  window.addEventListener("resize", () => {
    const w = container.offsetWidth || width;
    const h = container.offsetHeight || height;
    camera.fov = getResponsiveFOV(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobe);
} else {
  initGlobe();
}
