import * as THREE from "three";

const TEXTURE_PATHS = [
  "blurred-circle-small.png",
  "blurred-circle-small-1.png",
  "blurred-circle-small-2.png",
];

const LAYERS = [
  {
    key: "slow",
    multiplier: 0.35,
    depth: -40,
    sizeRange: [900, 1600],
    hueShift: -0.05,
  },
  {
    key: "medium",
    multiplier: 0.7,
    depth: -30,
    sizeRange: [600, 1100],
    hueShift: 0,
  },
  {
    key: "fast",
    multiplier: 2.2,
    depth: -20,
    sizeRange: [320, 650],
    hueShift: 0.05,
  },
];

const COLOR_POOL = [
  "#0E2683",
  "#3B167A",
  "#5463B2",
  "#6629CC",
  "#7D9DD9",
  "#9EA1D8",
];

const CIRCLES_PER_SCREEN = 12; // Total circles per viewport height

let renderer;
let camera;
let scene;
let planeGeometry;
let textures = [];
let allMeshes = [];
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let documentHeight = 0;

function multiOctaveNoise(x, y, z) {
  return (
    Math.sin(x * 0.5 + z) * 0.5 +
    Math.sin(x * 1.3 + y * 0.7 + z * 1.1) * 0.3 +
    Math.sin(x * 2.1 + y * 1.9 + z * 0.8) * 0.2
  );
}

function adjustHue(hex, hueShift) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = (h + hueShift) % 1;

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hue2rgb = (pp, qq, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
    if (t < 1 / 2) return qq;
    if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
    return pp;
  };

  const r2 = hue2rgb(p, q, h + 1 / 3);
  const g2 = hue2rgb(p, q, h);
  const b2 = hue2rgb(p, q, h - 1 / 3);

  const toHex = (value) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

function loadTextures() {
  const loader = new THREE.TextureLoader();
  return Promise.all(
    TEXTURE_PATHS.map(
      (path) =>
        new Promise((resolve, reject) => {
          loader.load(
            path,
            (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              resolve(texture);
            },
            undefined,
            reject,
          );
        }),
    ),
  );
}

function setupThree(container) {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.domElement.id = "parallax-circle-canvas";
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.zIndex = "-1";
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  updateCamera();
  planeGeometry = new THREE.PlaneGeometry(1, 1);
}

function updateCamera() {
  camera = new THREE.OrthographicCamera(
    -viewportWidth / 2,
    viewportWidth / 2,
    viewportHeight / 2,
    -viewportHeight / 2,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getDocumentHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );
}

function createCircleDefinitions() {
  documentHeight = getDocumentHeight();
  const numScreens = Math.ceil(documentHeight / viewportHeight);
  const totalCircles = CIRCLES_PER_SCREEN * numScreens;
  const definitions = [];

  for (let i = 0; i < totalCircles; i++) {
    // Pick random layer
    const layer = LAYERS[Math.floor(Math.random() * LAYERS.length)];

    // Random color from pool with hue shift
    const baseColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
    const tintedColor = adjustHue(baseColor, layer.hueShift);

    // Random horizontal position (left or right side with some variance)
    const isLeft = Math.random() < 0.5;
    const leftStart = viewportWidth * 0.05;
    const leftEnd = viewportWidth * 0.45;
    const rightStart = viewportWidth * 0.55;
    const rightEnd = viewportWidth * 0.95;

    const basePageX = isLeft
      ? leftStart + Math.random() * (leftEnd - leftStart)
      : rightStart + Math.random() * (rightEnd - rightStart);

    // Random vertical position across entire document
    const basePageY = Math.random() * documentHeight;

    // Random size within layer range
    const size = randomBetween(layer.sizeRange[0], layer.sizeRange[1]);

    // Opacity varies by layer and position (half transparency for fainter effect)
    const opacity = (0.15 + Math.random() * 0.35) * 0.5;

    // Noise parameters for animation
    const baseAmplitude =
      layer.key === "fast"
        ? Math.max(size * 0.35, 160)
        : Math.max(size * 0.22, 120);

    const scaleVariance = layer.key === "fast" ? 0.18 : 0.14;

    definitions.push({
      layerKey: layer.key,
      basePageX,
      basePageY,
      parallaxMultiplier: layer.multiplier,
      size,
      opacity,
      color: tintedColor,
      depth: layer.depth,
      textureIndex: Math.floor(Math.random() * textures.length),
      noisePhaseX: Math.random() * Math.PI * 2,
      noisePhaseY: Math.random() * Math.PI * 2,
      noiseSpeed: 0.18 + Math.random() * 0.25,
      noiseAmplitude: baseAmplitude,
      noiseSeeds: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000,
      },
      scaleJitter: scaleVariance + Math.random() * 0.06,
    });
  }

  return definitions;
}

function createMesh(definition) {
  const material = new THREE.MeshBasicMaterial({
    map: textures[definition.textureIndex],
    transparent: true,
    color: new THREE.Color(definition.color),
    opacity: definition.opacity,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(planeGeometry, material);
  mesh.userData = definition;
  mesh.scale.set(definition.size, definition.size, 1);
  mesh.userData.baseSize = definition.size;
  mesh.position.z = definition.depth;
  mesh.renderOrder = definition.depth;

  scene.add(mesh);
  return mesh;
}

function buildAllCircles() {
  // Clear existing meshes
  allMeshes.forEach((mesh) => {
    scene.remove(mesh);
    if (mesh.material) {
      mesh.material.dispose();
    }
  });
  allMeshes = [];

  // Create new circles
  const definitions = createCircleDefinitions();
  allMeshes = definitions.map(createMesh);
}

function updateMeshes(time) {
  const scrollY = window.scrollY;

  allMeshes.forEach((mesh) => {
    const data = mesh.userData;
    const relativeX = data.basePageX - viewportWidth / 2;
    const seeds = data.noiseSeeds || { x: 0, y: 0, z: 0 };
    const timeFactor = time * data.noiseSpeed;

    // Multi-octave noise for organic movement
    const noiseX = multiOctaveNoise(seeds.x + timeFactor, seeds.y, seeds.z);
    const noiseY = multiOctaveNoise(
      seeds.x,
      seeds.y + timeFactor,
      seeds.z + 50,
    );
    const noiseS = multiOctaveNoise(
      seeds.x + timeFactor * 0.5,
      seeds.y + timeFactor * 0.5,
      seeds.z + 100,
    );

    // Parallax calculation
    const effectivePageY =
      data.basePageY - scrollY * (data.parallaxMultiplier - 1);
    const relativeY = effectivePageY - scrollY;

    // Apply noise to position
    const worldX = relativeX + noiseX * data.noiseAmplitude;
    const worldY =
      viewportHeight / 2 - relativeY + noiseY * (data.noiseAmplitude * 0.85);

    mesh.position.x = worldX;
    mesh.position.y = worldY;

    // Animate scale with noise
    const scaleFactor = 1 + noiseS * data.scaleJitter;
    const targetSize = data.baseSize * scaleFactor;
    mesh.scale.set(targetSize, targetSize, 1);
  });
}

function animate() {
  const time = performance.now() * 0.001;
  updateMeshes(time);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function handleResize() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewportWidth, viewportHeight);

  updateCamera();
  camera.updateProjectionMatrix();

  buildAllCircles();
}

// Rebuild circles when document height changes (e.g., dynamic content)
let lastDocHeight = 0;
function checkDocumentHeight() {
  const currentHeight = getDocumentHeight();
  if (currentHeight !== lastDocHeight) {
    lastDocHeight = currentHeight;
    buildAllCircles();
  }
}

async function initGenericParallaxCircles() {
  const container = document.querySelector(".bg-circles");
  if (!container) {
    console.error("Container .bg-circles not found");
    return;
  }

  try {
    textures = await loadTextures();
  } catch (error) {
    console.error("Failed to load parallax circle textures", error);
    return;
  }

  setupThree(container);
  buildAllCircles();

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  // Check for document height changes periodically
  setInterval(checkDocumentHeight, 2000);

  animate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGenericParallaxCircles);
} else {
  initGenericParallaxCircles();
}
