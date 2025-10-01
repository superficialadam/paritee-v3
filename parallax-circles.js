import * as THREE from 'three';

const TEXTURE_PATHS = [
  'images/blurred-circle-small.png',
  'images/blurred-circle-small-1.png',
  'images/blurred-circle-small-2.png'
];

const LAYERS = [
  { key: 'slow', multiplier: 0.35, depth: -40, sizeRange: [900, 1600], hueShift: -0.05 },
  { key: 'medium', multiplier: 0.7, depth: -30, sizeRange: [600, 1100], hueShift: 0 },
  { key: 'fast', multiplier: 2.2, depth: -20, sizeRange: [320, 650], hueShift: 0.05 }
];

const COLOR_POOL = ['#0E2683', '#3B167A', '#5463B2', '#6629CC', '#7D9DD9', '#9EA1D8'];

const sectionMeta = new Map();
const sectionGroups = new Map();
const activeMeshes = new Set();

let renderer;
let camera;
let scene;
let planeGeometry;
let textures = [];
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;

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

  const toHex = value => Math.round(value * 255).toString(16).padStart(2, '0');
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

function loadTextures() {
  const loader = new THREE.TextureLoader();
  return Promise.all(
    TEXTURE_PATHS.map(
      path =>
        new Promise((resolve, reject) => {
          loader.load(
            path,
            texture => {
              texture.colorSpace = THREE.SRGBColorSpace;
              resolve(texture);
            },
            undefined,
            reject
          );
        })
    )
  );
}

function setupThree(container) {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.domElement.id = 'parallax-circle-canvas';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.style.zIndex = '-1';
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  updateCamera();

  planeGeometry = new THREE.PlaneGeometry(1, 1);
}

function updateCamera() {
  const aspectWidth = viewportWidth;
  const aspectHeight = viewportHeight;

  camera = new THREE.OrthographicCamera(
    -aspectWidth / 2,
    aspectWidth / 2,
    aspectHeight / 2,
    -aspectHeight / 2,
    0.1,
    1000
  );
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);
}

function getSections() {
  sectionMeta.clear();

  const sections = Array.from(document.querySelectorAll('.section'))
    .filter(section => section.id && section.id !== 'hero');

  sections.forEach((section, index) => {
    const key = section.id;
    section.dataset.circleKey = key;
    sectionMeta.set(key, { section, index, key });
  });

  return sections;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function buildSectionDefinitions(meta) {
  const { section, index, key } = meta;
  const rect = section.getBoundingClientRect();
  const sectionTop = rect.top + window.scrollY;
  const sectionHeight = rect.height;
  const sectionCenterY = sectionTop + sectionHeight / 2;
  const isDark = section.classList.contains('dark');

  const definitions = [];

  LAYERS.forEach(layer => {
    const count = 5 + Math.floor(Math.random() * 3);
    const denominator = Math.max(count - 1, 1);

    for (let i = 0; i < count; i++) {
      const normalizedX = denominator === 0 ? 0.5 : i / denominator;
      const baseColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
      const tintedColor = adjustHue(baseColor, layer.hueShift);

      const leftStart = viewportWidth * 0.05;
      const leftEnd = viewportWidth * 0.45;
      const rightStart = viewportWidth * 0.55;
      const rightEnd = viewportWidth * 0.95;

      const basePageX = isDark
        ? leftStart + normalizedX * (leftEnd - leftStart)
        : rightStart + normalizedX * (rightEnd - rightStart);

      const yOffsetRange = layer.key === 'fast' ? 0.6 : 0.4;
      const yOffset = (Math.random() - 0.5) * viewportHeight * yOffsetRange;
      const size = randomBetween(layer.sizeRange[0], layer.sizeRange[1]);
      const opacity = 0.22 + normalizedX * 0.4;

      const centerBaseline = (layer.multiplier * sectionCenterY) + (1 - layer.multiplier) * (viewportHeight / 2);
      const basePageY = centerBaseline + yOffset;

      definitions.push({
        ownerKey: key,
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
        noiseSpeed: 0.15 + Math.random() * 0.25,
        noiseAmplitude: size * 0.015
      });
    }
  });

  const slowLayer = LAYERS[0];
  const edgeColor = adjustHue(
    COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)],
    slowLayer.hueShift
  );

  const edgeMultiplier = slowLayer.multiplier * 0.6;
  const edgeBaseline = (edgeMultiplier * sectionCenterY) + (1 - edgeMultiplier) * (viewportHeight / 2);

  definitions.push({
    ownerKey: key,
    layerKey: 'edge',
    basePageX: isDark ? 0 : viewportWidth,
    basePageY: edgeBaseline,
    parallaxMultiplier: edgeMultiplier,
    size: 1600,
    opacity: 0.38,
    color: edgeColor,
    depth: slowLayer.depth - 5,
    textureIndex: Math.floor(Math.random() * textures.length),
    noisePhaseX: Math.random() * Math.PI * 2,
    noisePhaseY: Math.random() * Math.PI * 2,
    noiseSpeed: 0.08 + Math.random() * 0.12,
    noiseAmplitude: 35
  });

  const sortedMeta = Array.from(sectionMeta.values()).sort((a, b) => a.index - b.index);
  const nextMeta = sortedMeta[index + 1];

  if (nextMeta) {
    const nextRect = nextMeta.section.getBoundingClientRect();
    const nextTop = nextRect.top + window.scrollY;
    const transitionY = sectionTop + sectionHeight + ((nextTop - (sectionTop + sectionHeight)) / 2);

    const transitionCount = 2 + Math.floor(Math.random() * 2);
    for (let t = 0; t < transitionCount; t++) {
      const layer = LAYERS[Math.floor(Math.random() * (LAYERS.length - 1)) + 1];
      const baseColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
      const tintedColor = adjustHue(baseColor, layer.hueShift);

      const isLeft = isDark;
      const leftStart = viewportWidth * 0.05;
      const leftEnd = viewportWidth * 0.45;
      const rightStart = viewportWidth * 0.55;
      const rightEnd = viewportWidth * 0.95;

      const transitionX = isLeft
        ? leftStart + Math.random() * (leftEnd - leftStart)
        : rightStart + Math.random() * (rightEnd - rightStart);

      const transitionBaseline = (layer.multiplier * transitionY) + (1 - layer.multiplier) * (viewportHeight / 2);
      const transitionOffset = (Math.random() - 0.5) * viewportHeight * 0.25;

      definitions.push({
        ownerKey: key,
        layerKey: `${layer.key}-transition`,
        basePageX: transitionX,
        basePageY: transitionBaseline + transitionOffset,
        parallaxMultiplier: layer.multiplier,
        size: randomBetween(420, 780),
        opacity: 0.24,
        color: tintedColor,
        depth: layer.depth + 5,
        textureIndex: Math.floor(Math.random() * textures.length),
        noisePhaseX: Math.random() * Math.PI * 2,
        noisePhaseY: Math.random() * Math.PI * 2,
        noiseSpeed: 0.18 + Math.random() * 0.2,
        noiseAmplitude: 50
      });
    }
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
    blending: THREE.NormalBlending
  });

  const mesh = new THREE.Mesh(planeGeometry, material);
  mesh.userData = definition;
  mesh.scale.set(definition.size, definition.size, 1);
  mesh.position.z = definition.depth;
  mesh.renderOrder = definition.depth;

  scene.add(mesh);
  activeMeshes.add(mesh);

  return mesh;
}

function ensureSectionCircles(key) {
  if (sectionGroups.has(key)) {
    return;
  }

  const meta = sectionMeta.get(key);
  if (!meta) {
    return;
  }

  const definitions = buildSectionDefinitions(meta);
  const meshes = definitions.map(createMesh);

  sectionGroups.set(key, { meshes });
}

function removeSectionCircles(key) {
  const group = sectionGroups.get(key);
  if (!group) {
    return;
  }

  group.meshes.forEach(mesh => {
    activeMeshes.delete(mesh);
    scene.remove(mesh);
    if (mesh.material) {
      mesh.material.dispose();
    }
  });

  sectionGroups.delete(key);
}

function clearAllSections() {
  const keys = Array.from(sectionGroups.keys());
  keys.forEach(removeSectionCircles);
}

function rebuildAllSections() {
  clearAllSections();
  const sections = getSections();
  sections.forEach(section => ensureSectionCircles(section.dataset.circleKey));
}

function updateMeshes(time) {
  const scrollY = window.scrollY;

  activeMeshes.forEach(mesh => {
    const data = mesh.userData;
    const relativeX = data.basePageX - viewportWidth / 2;
    const worldX = relativeX + Math.sin(time * data.noiseSpeed + data.noisePhaseX) * data.noiseAmplitude;

    const effectivePageY = data.basePageY - scrollY * (data.parallaxMultiplier - 1);
    const relativeY = effectivePageY - scrollY;
    const worldY = viewportHeight / 2 - relativeY + Math.cos(time * data.noiseSpeed + data.noisePhaseY) * data.noiseAmplitude;

    mesh.position.x = worldX;
    mesh.position.y = worldY;
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

  rebuildAllSections();
}

async function initParallaxCircles() {
  const container = document.querySelector('.bg-circles');
  if (!container) {
    return;
  }

  try {
    textures = await loadTextures();
  } catch (error) {
    console.error('Failed to load parallax circle textures', error);
    return;
  }
  setupThree(container);

  rebuildAllSections();

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParallaxCircles);
} else {
  initParallaxCircles();
}
