// neue-gui.js — With lil-gui controls and JSON config
import * as THREE from 'three';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

const canvas = document.getElementById('dotmatrix');


// Default parameters
const params = {
  // Scroll camera controls
  cameraOffsetX: 0.0,
  cameraOffsetY: 0.0,
  cameraOffsetZ: 6.0,
  cameraFOV: 70,
};

let renderer, scene, camera, uniforms, clock, gui, testCube;


// Try to load config file
// Renderer / Camera / Scene
renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(params.cameraFOV, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(params.cameraOffsetX, params.cameraOffsetY, params.cameraOffsetZ);
camera.lookAt(0, 0, 0);
let currentCameraY = params.cameraOffsetY;
let targetCameraY = params.cameraOffsetY;

// Add test cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
testCube = new THREE.Mesh(geometry, material);
scene.add(testCube);

// Add lighting for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Initialize uniforms
uniforms = {
  uTime: { value: 0 },
  uDeltaTime: { value: 0 }
};

// Expose for DevTools
Object.assign(window, { scene, camera, renderer, testCube });



// Setup GUI
setupGUI();



// Animate
clock = new THREE.Clock();
let lastTime = 0;
renderer.setAnimationLoop(() => {
  const currentTime = clock.getElapsedTime();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  uniforms.uTime.value = currentTime;
  uniforms.uDeltaTime.value = deltaTime;

  // Update animation system
  // Rotate the test cube
  if (testCube) {
    testCube.rotation.x += deltaTime * 0.5;
    testCube.rotation.y += deltaTime * 0.7;
  }


  renderer.render(scene, camera);
});

// Resize
window.addEventListener('resize', onResize);


function setupGUI() {

  gui = new GUI({ title: 'dotmatrix' });

  // Camera & Scroll folder
  const cameraFolder = gui.addFolder('Camera & Scroll');
  cameraFolder.add(params, 'cameraOffsetX', -10, 10, 0.1)
    .name('Camera X Offset')
    .onChange(v => {
      camera.position.x = v;
    });
  cameraFolder.add(params, 'cameraOffsetY', -10, 10, 0.1)
    .name('Camera Y Offset')
    .onChange(v => {
      // Update target position immediately
      targetCameraY = v;
      currentCameraY = v;
      camera.position.y = v;
    });
  cameraFolder.add(params, 'cameraOffsetZ', 0.1, 20, 0.1)
    .name('Camera Z Offset')
    .onChange(v => {
      camera.position.z = v;
      // Update plane size when Z changes
    });
  cameraFolder.add(params, 'cameraFOV', 30, 120, 1)
    .name('Camera FOV')
    .onChange(v => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      // Update plane size when FOV changes
    });
  cameraFolder.open();


  // Add keyboard shortcuts
  let guiHidden = false;
  document.addEventListener('keydown', (event) => {

    // H key: Hide/Show GUI
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      if (guiHidden) {
        gui.show();
        guiHidden = false;
        console.log('GUI shown (press H to hide)');
      } else {
        gui.hide();
        guiHidden = true;
        console.log('GUI hidden (press H to show)');
      }
    }
  });

}


function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
