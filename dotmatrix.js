import * as THREE from 'three';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

const canvas = document.getElementById('dotmatrix');

// Global variables
let scene, camera, renderer;
let dotMatrix, dotGeometry, dotMaterial, dotAttributes;
let gui, clock;
let showFPS = false;

// Initialize Three.js scene
function initScene() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  // Camera
  camera = new THREE.PerspectiveCamera(
    params.cameraFOV,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    params.cameraOffsetX,
    params.cameraOffsetY,
    params.cameraOffsetZ
  );
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
}

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
  sizeWhite: 16.0,     // Size when point is white
  
  // Main noise controls
  mainNoiseEnabled: true, // Toggle main noise on/off
  noiseScale: 20.0,    // Scale of the noise pattern
  noiseSpeed: 5.0,     // Speed of noise evolution
  noiseOctaves: 4,     // Number of octaves for fractal noise
  noiseLacunarity: 2.0, // Frequency multiplier per octave
  noiseGain: 0.873,    // Amplitude multiplier per octave
  noiseThreshold: 0.5562,  // Black level threshold (cuts off values below)
  noiseIslandSize: 0.5, // Controls bright island size (remap range)
  noiseExposure: 0.0,  // Exposure adjustment (stops)
  noiseGamma: 1.1542,  // Gamma correction (1 = linear)
  noiseMultiplier: 1.592, // Final output multiplier (overall fader)
  noiseOffsetX: -0.9,  // Manual X offset for noise
  noiseOffsetY: 0.0,   // Manual Y offset for noise
  noiseOffsetZ: 0.0,   // Manual Z offset for noise
  noiseEvolution: 0.0, // Evolution/phase offset for noise morphing
  noiseAnimated: true, // Toggle noise animation on/off
  
  // Influence zone 1 controls
  influence1Enabled: true,
  influence1X: 0.3,     // X position (0-1, normalized)
  influence1Y: 0.5,     // Y position (0-1, normalized)
  influence1RadiusX: 0.2, // Ellipse radius X (0-1, normalized)
  influence1RadiusY: 0.15, // Ellipse radius Y (0-1, normalized)
  influence1Falloff: 2.0, // Falloff power (1=linear, 2=quadratic, etc)
  influence1Intensity: 1.0, // Intensity/value of influence
  influence1Subtract: false, // If true, subtracts from value instead of adding
  
  // Edge noise for zone 1
  influence1EdgeEnabled: true,
  influence1EdgeStart: 0.0,      // Where edge noise starts (0=center, 1=edge)
  influence1EdgeInfluence: 2.0,  // How much the edge noise affects the influence
  influence1EdgeScale: 40.0,     // Scale of edge noise
  influence1EdgeSpeed: 20.0,     // Speed of edge noise evolution
  influence1EdgeOctaves: 2,      // Octaves for edge noise
  influence1EdgeLacunarity: 2.5, // Lacunarity for edge noise
  influence1EdgeGain: 0.688,     // Gain for edge noise
  influence1EdgeThreshold: 0.0,  // Black level threshold for edge noise
  influence1EdgeIslandSize: 0.9937, // Island size for edge noise
  influence1EdgeExposure: -0.342,   // Exposure for edge noise
  influence1EdgeGamma: 1.0,      // Gamma for edge noise
  
  // Influence zone 2 controls
  influence2Enabled: true,
  influence2X: 0.7,     // X position (0-1, normalized)
  influence2Y: 0.5,     // Y position (0-1, normalized)
  influence2RadiusX: 0.15, // Ellipse radius X (0-1, normalized)
  influence2RadiusY: 0.25, // Ellipse radius Y (0-1, normalized)
  influence2Falloff: 1.5, // Falloff power (1=linear, 2=quadratic, etc)
  influence2Intensity: 0.3, // Intensity/value of influence
  influence2Subtract: false, // If true, subtracts from value instead of adding
  
  // Edge noise for zone 2
  influence2EdgeEnabled: true,
  influence2EdgeStart: 0.4,      // Where edge noise starts (0=center, 1=edge)
  influence2EdgeInfluence: 0.25, // How much the edge noise affects the influence
  influence2EdgeScale: 8.0,      // Scale of edge noise
  influence2EdgeSpeed: 0.5,      // Speed of edge noise evolution
  influence2EdgeOctaves: 3,      // Octaves for edge noise
  influence2EdgeLacunarity: 2.0, // Lacunarity for edge noise
  influence2EdgeGain: 0.5,       // Gain for edge noise
  influence2EdgeThreshold: 0.0,  // Black level threshold for edge noise
  influence2EdgeIslandSize: 0.5, // Island size for edge noise
  influence2EdgeExposure: 0.0,   // Exposure for edge noise
  influence2EdgeGamma: 1.0,      // Gamma for edge noise
  
// Debug
  showStats: false
};

// Initialize the scene
initScene();

// Hash function for noise generation
function hash(x, y, z) {
  const p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
  
  let h = p[Math.floor(x) & 255];
  h = p[(h + Math.floor(y)) & 255];
  h = p[(h + Math.floor(z)) & 255];
  return h;
}

// Gradient function for Perlin noise
function grad(i, j, k, x, y, z) {
  const h = hash(i, j, k) & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// 3D Perlin noise implementation
function gradientNoise3D(x, y, z) {
  // Find unit cube that contains point
  const i = Math.floor(x);
  const j = Math.floor(y);
  const k = Math.floor(z);
  
  // Find relative x, y, z of point in cube
  const fx = x - i;
  const fy = y - j;
  const fz = z - k;
  
  // Fade curves for smooth interpolation
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const w = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
  
  // Gradients at 8 corners
  const g000 = grad(i, j, k, fx, fy, fz);
  const g100 = grad(i + 1, j, k, fx - 1, fy, fz);
  const g010 = grad(i, j + 1, k, fx, fy - 1, fz);
  const g110 = grad(i + 1, j + 1, k, fx - 1, fy - 1, fz);
  const g001 = grad(i, j, k + 1, fx, fy, fz - 1);
  const g101 = grad(i + 1, j, k + 1, fx - 1, fy, fz - 1);
  const g011 = grad(i, j + 1, k + 1, fx, fy - 1, fz - 1);
  const g111 = grad(i + 1, j + 1, k + 1, fx - 1, fy - 1, fz - 1);
  
  // Interpolate
  const x00 = g000 * (1 - u) + g100 * u;
  const x10 = g010 * (1 - u) + g110 * u;
  const x01 = g001 * (1 - u) + g101 * u;
  const x11 = g011 * (1 - u) + g111 * u;
  
  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;
  
  const result = y0 * (1 - w) + y1 * w;
  
  // Normalize to 0-1 range
  return (result + 1) * 0.5;
}

// Fractional Brownian Motion (FBM)
function fbm3D(x, y, z, octaves, lacunarity, gain, seed = 0) {
  // If gain is 0, return neutral value (0.5)
  if (gain === 0) return 0.5;
  
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxAmplitude = 0;
  
  // Add seed offset for different noise patterns
  x += seed * 137.5;
  y += seed * 285.2;
  // Don't add seed to z to maintain pure forward evolution
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * gradientNoise3D(
      x * frequency,
      y * frequency,
      z * frequency
    );
    maxAmplitude += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }
  
  // Normalize based on actual amplitude used
  value = value / maxAmplitude;
  
  // Map from [-0.5, 0.5] to [0, 1] range
  return Math.max(0, Math.min(1, value + 0.5));
}

// Keep old function name for compatibility but use FBM
function fractalNoise3D(x, y, z, octaves, lacunarity, gain, seed = 0) {
  return fbm3D(x, y, z, octaves, lacunarity, gain, seed);
}

// Apply contrast to a value
function applyContrast(value, contrast) {
  // Remap to -0.5 to 0.5, apply contrast, remap back
  value = value - 0.5;
  value = value * contrast;
  value = value + 0.5;
  return Math.max(0, Math.min(1, value));
}

// Calculate elliptical influence with individual edge noise
function calculateInfluence(x, y, centerX, centerY, radiusX, radiusY, falloff, intensity, time, zoneParams, zoneIndex) {
  // Calculate normalized distance from center
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance >= 1.0) return 0;
  
  // Base influence with falloff
  let factor = 1.0 - Math.pow(distance, falloff);
  
  // Apply edge noise to break up the circular edge
  if (zoneParams.edgeEnabled && distance > zoneParams.edgeStart) {
    // Calculate edge noise at this position - ONLY USE Z FOR TIME
    const noiseX = x * zoneParams.edgeScale;
    const noiseY = y * zoneParams.edgeScale;
    const noiseZ = -time * zoneParams.edgeSpeed; // Only Z moves with time
    
    let edgeNoise = fractalNoise3D(
      noiseX,
      noiseY,
      noiseZ,
      zoneParams.edgeOctaves,
      zoneParams.edgeLacunarity,
      zoneParams.edgeGain,
      zoneIndex // Different seed for each influence zone
    );
    
    // Apply same processing as main noise: threshold, island size, exposure, gamma
    if (edgeNoise < zoneParams.edgeThreshold) {
      edgeNoise = 0;
    } else {
      const range = 1.0 - zoneParams.edgeThreshold;
      const islandRange = range * zoneParams.edgeIslandSize;
      edgeNoise = (edgeNoise - zoneParams.edgeThreshold) / islandRange;
      edgeNoise = Math.min(1, edgeNoise);
    }
    
    // Apply exposure and gamma
    edgeNoise = edgeNoise * Math.pow(2, zoneParams.edgeExposure);
    edgeNoise = Math.pow(edgeNoise, 1.0 / zoneParams.edgeGamma);
    edgeNoise = Math.max(0, Math.min(1, edgeNoise));
    
    // Calculate how much edge noise affects this point
    const edgeWeight = (distance - zoneParams.edgeStart) / (1.0 - zoneParams.edgeStart);
    
    // ADD edge noise (not multiply) - edge noise adds or subtracts from influence
    const noiseEffect = (edgeNoise - 0.5) * 2 * zoneParams.edgeInfluence * edgeWeight;
    factor = factor + noiseEffect;
    factor = Math.max(0, Math.min(1, factor)); // Clamp to [0,1]
  }
  
  // Apply intensity and handle subtraction mode
  const result = factor * intensity;
  return zoneParams.subtract ? -result : result;
}

// Noise texture creation removed - now handled in shader

// Update noise texture removed - now handled in shader

// Complete vertex shader with influence zones
const vertexShader = `
uniform float uPointSize;
uniform vec2 uResolution;
uniform float uGlobalOpacity;
uniform float uTime;
uniform vec2 uGridSize;

// Main noise uniforms
uniform bool uMainNoiseEnabled;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uNoiseOffsetX;
uniform float uNoiseOffsetY;
uniform float uNoiseOffsetZ;
uniform float uNoiseEvolution;
uniform bool uNoiseAnimated;
uniform int uNoiseOctaves;
uniform float uNoiseLacunarity;
uniform float uNoiseGain;
uniform float uNoiseThreshold;
uniform float uNoiseIslandSize;
uniform float uNoiseExposure;
uniform float uNoiseGamma;
uniform float uNoiseMultiplier;

// Size mapping uniforms
uniform float uSizeBlack;
uniform float uSizeWhite;

// Influence zone 1 uniforms
uniform bool uInfluence1Enabled;
uniform vec2 uInfluence1Pos;
uniform vec2 uInfluence1Radius;
uniform float uInfluence1Falloff;
uniform float uInfluence1Intensity;
uniform bool uInfluence1Subtract;

// Influence zone 1 edge noise
uniform bool uInfluence1EdgeEnabled;
uniform float uInfluence1EdgeStart;
uniform float uInfluence1EdgeInfluence;
uniform float uInfluence1EdgeScale;
uniform float uInfluence1EdgeSpeed;
uniform int uInfluence1EdgeOctaves;
uniform float uInfluence1EdgeLacunarity;
uniform float uInfluence1EdgeGain;
uniform float uInfluence1EdgeThreshold;
uniform float uInfluence1EdgeIslandSize;
uniform float uInfluence1EdgeExposure;
uniform float uInfluence1EdgeGamma;

// Influence zone 2 uniforms
uniform bool uInfluence2Enabled;
uniform vec2 uInfluence2Pos;
uniform vec2 uInfluence2Radius;
uniform float uInfluence2Falloff;
uniform float uInfluence2Intensity;
uniform bool uInfluence2Subtract;

// Influence zone 2 edge noise
uniform bool uInfluence2EdgeEnabled;
uniform float uInfluence2EdgeStart;
uniform float uInfluence2EdgeInfluence;
uniform float uInfluence2EdgeScale;
uniform float uInfluence2EdgeSpeed;
uniform int uInfluence2EdgeOctaves;
uniform float uInfluence2EdgeLacunarity;
uniform float uInfluence2EdgeGain;
uniform float uInfluence2EdgeThreshold;
uniform float uInfluence2EdgeIslandSize;
uniform float uInfluence2EdgeExposure;
uniform float uInfluence2EdgeGamma;

attribute vec2 gridCoord;
attribute float size;
attribute vec3 color;
attribute float opacity;

varying vec3 vColor;
varying float vOpacity;

// Permutation table for consistent pseudo-random gradients
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }

// Proper 3D Perlin noise implementation
float perlinNoise3D(vec3 p) {
    vec3 i0 = floor(p);
    vec3 f0 = fract(p);
    
    // Quintic Hermite interpolation for C2 continuity
    vec3 u = f0 * f0 * f0 * (f0 * (f0 * 6.0 - 15.0) + 10.0);
    
    // Generate permutations for gradient lookup
    vec4 ix = vec4(i0.x, i0.x + 1.0, i0.x, i0.x + 1.0);
    vec4 iy = vec4(i0.yy, i0.yy + 1.0);
    vec4 iz0 = i0.zzzz;
    vec4 iz1 = i0.zzzz + 1.0;
    
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    
    // Gradients: 12 gradient directions evenly distributed
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
    // Compute dot products with gradients
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    
    // Normalize gradients
    vec4 norm0 = 1.79284291400159 - 0.85373472095314 * vec4(dot(g000, g000), dot(g100, g100), dot(g010, g010), dot(g110, g110));
    g000 *= norm0.x;
    g100 *= norm0.y;
    g010 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = 1.79284291400159 - 0.85373472095314 * vec4(dot(g001, g001), dot(g101, g101), dot(g011, g011), dot(g111, g111));
    g001 *= norm1.x;
    g101 *= norm1.y;
    g011 *= norm1.z;
    g111 *= norm1.w;
    
    // Compute noise contributions from each corner
    float n000 = dot(g000, f0);
    float n100 = dot(g100, f0 - vec3(1.0, 0.0, 0.0));
    float n010 = dot(g010, f0 - vec3(0.0, 1.0, 0.0));
    float n110 = dot(g110, f0 - vec3(1.0, 1.0, 0.0));
    float n001 = dot(g001, f0 - vec3(0.0, 0.0, 1.0));
    float n101 = dot(g101, f0 - vec3(1.0, 0.0, 1.0));
    float n011 = dot(g011, f0 - vec3(0.0, 1.0, 1.0));
    float n111 = dot(g111, f0 - vec3(1.0, 1.0, 1.0));
    
    // Interpolate contributions
    vec4 n_x = mix(vec4(n000, n001, n010, n011), vec4(n100, n101, n110, n111), u.x);
    vec2 n_xy = mix(n_x.xy, n_x.zw, u.y);
    float n_xyz = mix(n_xy.x, n_xy.y, u.z);
    
    // Scale to approximately [-1, 1] range
    return n_xyz * 2.2;
}

// Fractal Brownian Motion using proper Perlin noise
float fbmPerlin(vec3 p, int octaves, float lacunarity, float gain) {
    if (gain <= 0.0) return 0.5;
    
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    // Offset each octave slightly to reduce correlation
    vec3 offset = vec3(0.0);
    
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        
        // Sample noise with frequency and offset
        vec3 samplePos = p * frequency + offset;
        value += amplitude * perlinNoise3D(samplePos);
        maxValue += amplitude;
        
        // Update for next octave
        frequency *= lacunarity;
        amplitude *= gain;
        
        // Shift each octave to decorrelate
        offset += vec3(17.3, 23.7, 31.9);
    }
    
    // Normalize to [0, 1] range
    return clamp(value / maxValue * 0.5 + 0.5, 0.0, 1.0);
}

// Removed - no longer needed, using fbmPerlin directly

// Process noise value
float processNoise(float noise, float threshold, float islandSize, float exposure, float gamma) {
    if (noise < threshold) {
        return 0.0;
    } else {
        float range = 1.0 - threshold;
        float islandRange = range * islandSize;
        noise = (noise - threshold) / islandRange;
        noise = min(1.0, noise);
    }
    
    noise = noise * pow(2.0, exposure);
    noise = pow(noise, 1.0 / gamma);
    return clamp(noise, 0.0, 1.0);
}

// Calculate influence zone with edge noise
float calculateInfluence(
    vec2 coord, vec2 center, vec2 radius, float falloff, float intensity, bool subtract,
    bool edgeEnabled, float edgeStart, float edgeInfluence, float edgeScale, float edgeSpeed,
    int edgeOctaves, float edgeLacunarity, float edgeGain,
    float edgeThreshold, float edgeIslandSize, float edgeExposure, float edgeGamma,
    float seed
) {
    // Calculate normalized distance from center
    vec2 delta = (coord - center) / radius;
    float distance = length(delta);
    
    if (distance >= 1.0) return 0.0;
    
    // Base influence with falloff
    float factor = 1.0 - pow(distance, falloff);
    
    // Apply edge noise if enabled
    if (edgeEnabled && distance > edgeStart) {
        // Calculate edge noise position with improved setup
        vec3 noisePos = vec3(
            coord.x * edgeScale,
            coord.y * edgeScale,
            seed * 50.0  // Use seed as base Z offset
        );
        
        // Add smooth time-based evolution
        float timeOffset = uTime * edgeSpeed * 0.02; // Same scaling as main noise
        noisePos.z += timeOffset;
        
        // Add slight diagonal motion to avoid artifacts
        noisePos.x += timeOffset * 0.1;
        noisePos.y += timeOffset * 0.05;
        
        // Generate edge noise using improved Perlin FBM
        float edgeNoise = fbmPerlin(noisePos, edgeOctaves, edgeLacunarity, edgeGain);
        
        // Process edge noise
        edgeNoise = processNoise(edgeNoise, edgeThreshold, edgeIslandSize, edgeExposure, edgeGamma);
        
        // Calculate edge weight
        float edgeWeight = (distance - edgeStart) / (1.0 - edgeStart);
        
        // Apply edge noise as modulation
        float noiseEffect = (edgeNoise - 0.5) * 2.0 * edgeInfluence * edgeWeight;
        factor = factor + noiseEffect;
        factor = clamp(factor, 0.0, 1.0);
    }
    
    // Apply intensity
    float result = factor * intensity;
    
    // Return with proper sign for addition/subtraction
    return subtract ? -result : result;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Normalize grid coordinates to 0-1 range
    vec2 normalizedCoord = gridCoord / uGridSize;
    
    // Start with base value
    float finalValue = 0.0;
    
    // Apply main noise if enabled
    if (uMainNoiseEnabled) {
        // Start with base position scaled by noise scale
        vec3 noisePos = vec3(
            normalizedCoord.x * uNoiseScale,
            normalizedCoord.y * uNoiseScale,
            0.0
        );
        
        // Add offsets
        noisePos.x += uNoiseOffsetX;
        noisePos.y += uNoiseOffsetY;
        noisePos.z += uNoiseOffsetZ + uNoiseEvolution;
        
        if (uNoiseAnimated) {
            // Use a very small multiplier and offset to avoid integer boundaries
            // This creates smooth continuous motion through the noise field
            float timeOffset = uTime * uNoiseSpeed * 0.02; // Much smaller scale
            noisePos.z += timeOffset;
            
            // Add a slight diagonal motion to avoid axis-aligned artifacts
            noisePos.x += timeOffset * 0.1;
            noisePos.y += timeOffset * 0.05;
        }
        
        // Generate FBM noise using proper Perlin
        float noiseValue = fbmPerlin(noisePos, uNoiseOctaves, uNoiseLacunarity, uNoiseGain);
        
        // Apply processing chain
        noiseValue = processNoise(noiseValue, uNoiseThreshold, uNoiseIslandSize, uNoiseExposure, uNoiseGamma);
        finalValue = noiseValue * uNoiseMultiplier;
    }
    
    // Apply influence zone 1
    if (uInfluence1Enabled) {
        float influence = calculateInfluence(
            normalizedCoord, uInfluence1Pos, uInfluence1Radius, uInfluence1Falloff, uInfluence1Intensity, uInfluence1Subtract,
            uInfluence1EdgeEnabled, uInfluence1EdgeStart, uInfluence1EdgeInfluence, uInfluence1EdgeScale, uInfluence1EdgeSpeed,
            uInfluence1EdgeOctaves, uInfluence1EdgeLacunarity, uInfluence1EdgeGain,
            uInfluence1EdgeThreshold, uInfluence1EdgeIslandSize, uInfluence1EdgeExposure, uInfluence1EdgeGamma,
            1.0
        );
        
        // Apply influence with proper addition/subtraction
        if (uInfluence1Subtract) {
            finalValue = max(0.0, finalValue + influence); // influence is already negative
        } else {
            finalValue = finalValue + influence;
        }
    }
    
    // Apply influence zone 2
    if (uInfluence2Enabled) {
        float influence = calculateInfluence(
            normalizedCoord, uInfluence2Pos, uInfluence2Radius, uInfluence2Falloff, uInfluence2Intensity, uInfluence2Subtract,
            uInfluence2EdgeEnabled, uInfluence2EdgeStart, uInfluence2EdgeInfluence, uInfluence2EdgeScale, uInfluence2EdgeSpeed,
            uInfluence2EdgeOctaves, uInfluence2EdgeLacunarity, uInfluence2EdgeGain,
            uInfluence2EdgeThreshold, uInfluence2EdgeIslandSize, uInfluence2EdgeExposure, uInfluence2EdgeGamma,
            2.0
        );
        
        // Apply influence with proper addition/subtraction
        if (uInfluence2Subtract) {
            finalValue = max(0.0, finalValue + influence); // influence is already negative
        } else {
            finalValue = finalValue + influence;
        }
    }
    
    // Clamp final value
    finalValue = clamp(finalValue, 0.0, 1.0);
    
    // Map to size
    float pointSize = mix(uSizeBlack, uSizeWhite, finalValue);
    gl_PointSize = pointSize;
    
    // Map to color
    vColor = vec3(finalValue);
    vOpacity = uGlobalOpacity;
}
`;

// Fragment shader
const fragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main() {
    // Create circular point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distance = length(coord);
    
    if (distance > 0.5) {
        discard;
    }
    
    // Smooth edge
    float alpha = 1.0 - smoothstep(0.4, 0.5, distance);
    
    gl_FragColor = vec4(vColor, alpha * vOpacity);
}
`;

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
  
  // No need to create noise texture - handled in shader
  
  // Create geometry
  dotGeometry = new THREE.BufferGeometry();
  
  // Position array
  const positions = new Float32Array(totalPoints * 3);
  // Grid coordinate array (for noise sampling)
  const gridCoords = new Float32Array(totalPoints * 2);
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
      
      // Grid coordinates for noise sampling
      gridCoords[index * 2] = col;
      gridCoords[index * 2 + 1] = row;
      
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
  dotGeometry.setAttribute('gridCoord', new THREE.BufferAttribute(gridCoords, 2));
  dotGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  dotGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  dotGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  
  // Store references for later manipulation
  dotAttributes = {
    positions: positions,
    gridCoords: gridCoords,
    sizes: sizes,
    colors: colors,
    opacities: opacities,
    cols: cols,
    rows: rows,
    totalPoints: totalPoints
  };
  
  // Create material with all uniforms
  dotMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPointSize: { value: params.sizeWhite },
      uResolution: { value: new THREE.Vector2(width, height) },
      uGlobalOpacity: { value: params.pointOpacity },
      uTime: { value: 0 },
      uGridSize: { value: new THREE.Vector2(cols, rows) },
      
      // Main noise uniforms
      uMainNoiseEnabled: { value: params.mainNoiseEnabled },
      uNoiseScale: { value: params.noiseScale },
      uNoiseSpeed: { value: params.noiseSpeed },
      uNoiseOffsetX: { value: params.noiseOffsetX },
      uNoiseOffsetY: { value: params.noiseOffsetY },
      uNoiseOffsetZ: { value: params.noiseOffsetZ },
      uNoiseEvolution: { value: params.noiseEvolution },
      uNoiseAnimated: { value: params.noiseAnimated },
      uNoiseOctaves: { value: params.noiseOctaves },
      uNoiseLacunarity: { value: params.noiseLacunarity },
      uNoiseGain: { value: params.noiseGain },
      uNoiseThreshold: { value: params.noiseThreshold },
      uNoiseIslandSize: { value: params.noiseIslandSize },
      uNoiseExposure: { value: params.noiseExposure },
      uNoiseGamma: { value: params.noiseGamma },
      uNoiseMultiplier: { value: params.noiseMultiplier },
      
      // Size mapping uniforms
      uSizeBlack: { value: params.sizeBlack },
      uSizeWhite: { value: params.sizeWhite },
      
      // Influence zone 1 uniforms
      uInfluence1Enabled: { value: params.influence1Enabled },
      uInfluence1Pos: { value: new THREE.Vector2(params.influence1X, params.influence1Y) },
      uInfluence1Radius: { value: new THREE.Vector2(params.influence1RadiusX, params.influence1RadiusY) },
      uInfluence1Falloff: { value: params.influence1Falloff },
      uInfluence1Intensity: { value: params.influence1Intensity },
      uInfluence1Subtract: { value: params.influence1Subtract },
      
      // Influence zone 1 edge noise
      uInfluence1EdgeEnabled: { value: params.influence1EdgeEnabled },
      uInfluence1EdgeStart: { value: params.influence1EdgeStart },
      uInfluence1EdgeInfluence: { value: params.influence1EdgeInfluence },
      uInfluence1EdgeScale: { value: params.influence1EdgeScale },
      uInfluence1EdgeSpeed: { value: params.influence1EdgeSpeed },
      uInfluence1EdgeOctaves: { value: params.influence1EdgeOctaves },
      uInfluence1EdgeLacunarity: { value: params.influence1EdgeLacunarity },
      uInfluence1EdgeGain: { value: params.influence1EdgeGain },
      uInfluence1EdgeThreshold: { value: params.influence1EdgeThreshold },
      uInfluence1EdgeIslandSize: { value: params.influence1EdgeIslandSize },
      uInfluence1EdgeExposure: { value: params.influence1EdgeExposure },
      uInfluence1EdgeGamma: { value: params.influence1EdgeGamma },
      
      // Influence zone 2 uniforms
      uInfluence2Enabled: { value: params.influence2Enabled },
      uInfluence2Pos: { value: new THREE.Vector2(params.influence2X, params.influence2Y) },
      uInfluence2Radius: { value: new THREE.Vector2(params.influence2RadiusX, params.influence2RadiusY) },
      uInfluence2Falloff: { value: params.influence2Falloff },
      uInfluence2Intensity: { value: params.influence2Intensity },
      uInfluence2Subtract: { value: params.influence2Subtract },
      
      // Influence zone 2 edge noise
      uInfluence2EdgeEnabled: { value: params.influence2EdgeEnabled },
      uInfluence2EdgeStart: { value: params.influence2EdgeStart },
      uInfluence2EdgeInfluence: { value: params.influence2EdgeInfluence },
      uInfluence2EdgeScale: { value: params.influence2EdgeScale },
      uInfluence2EdgeSpeed: { value: params.influence2EdgeSpeed },
      uInfluence2EdgeOctaves: { value: params.influence2EdgeOctaves },
      uInfluence2EdgeLacunarity: { value: params.influence2EdgeLacunarity },
      uInfluence2EdgeGain: { value: params.influence2EdgeGain },
      uInfluence2EdgeThreshold: { value: params.influence2EdgeThreshold },
      uInfluence2EdgeIslandSize: { value: params.influence2EdgeIslandSize },
      uInfluence2EdgeExposure: { value: params.influence2EdgeExposure },
      uInfluence2EdgeGamma: { value: params.influence2EdgeGamma }
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

// Initialize dot matrix
createDotMatrix();

// Function to sync dotMatrixParams with shader uniforms
function syncParamsToUniforms() {
  if (!dotMaterial) {
    console.warn('syncParamsToUniforms: dotMaterial not available');
    return;
  }
  
  console.log('Syncing params - influence1Intensity:', params.influence1Intensity, 
              'influence1EdgeEnabled:', params.influence1EdgeEnabled,
              'influence1EdgeScale:', params.influence1EdgeScale);
  
  // Update main noise uniforms
  dotMaterial.uniforms.uMainNoiseEnabled.value = params.mainNoiseEnabled;
  dotMaterial.uniforms.uNoiseScale.value = params.noiseScale;
  dotMaterial.uniforms.uNoiseSpeed.value = params.noiseSpeed;
  dotMaterial.uniforms.uNoiseOffsetX.value = params.noiseOffsetX;
  dotMaterial.uniforms.uNoiseOffsetY.value = params.noiseOffsetY;
  dotMaterial.uniforms.uNoiseOffsetZ.value = params.noiseOffsetZ;
  dotMaterial.uniforms.uNoiseEvolution.value = params.noiseEvolution;
  dotMaterial.uniforms.uNoiseAnimated.value = params.noiseAnimated;
  dotMaterial.uniforms.uNoiseOctaves.value = params.noiseOctaves;
  dotMaterial.uniforms.uNoiseLacunarity.value = params.noiseLacunarity;
  dotMaterial.uniforms.uNoiseGain.value = params.noiseGain;
  dotMaterial.uniforms.uNoiseThreshold.value = params.noiseThreshold;
  dotMaterial.uniforms.uNoiseIslandSize.value = params.noiseIslandSize;
  dotMaterial.uniforms.uNoiseExposure.value = params.noiseExposure;
  dotMaterial.uniforms.uNoiseGamma.value = params.noiseGamma;
  dotMaterial.uniforms.uNoiseMultiplier.value = params.noiseMultiplier;
  
  // Update size mapping uniforms
  dotMaterial.uniforms.uSizeBlack.value = params.sizeBlack;
  dotMaterial.uniforms.uSizeWhite.value = params.sizeWhite;
  
  // Update global uniforms
  dotMaterial.uniforms.uGlobalOpacity.value = params.pointOpacity;
  
  // Update all influence zone 1 uniforms
  dotMaterial.uniforms.uInfluence1Enabled.value = params.influence1Enabled;
  dotMaterial.uniforms.uInfluence1Pos.value.set(params.influence1X, params.influence1Y);
  dotMaterial.uniforms.uInfluence1Radius.value.set(params.influence1RadiusX, params.influence1RadiusY);
  dotMaterial.uniforms.uInfluence1Falloff.value = params.influence1Falloff;
  dotMaterial.uniforms.uInfluence1Intensity.value = params.influence1Intensity;
  dotMaterial.uniforms.uInfluence1Subtract.value = params.influence1Subtract;
  
  // Update influence zone 1 edge noise uniforms
  dotMaterial.uniforms.uInfluence1EdgeEnabled.value = params.influence1EdgeEnabled;
  dotMaterial.uniforms.uInfluence1EdgeStart.value = params.influence1EdgeStart;
  dotMaterial.uniforms.uInfluence1EdgeInfluence.value = params.influence1EdgeInfluence;
  dotMaterial.uniforms.uInfluence1EdgeScale.value = params.influence1EdgeScale;
  dotMaterial.uniforms.uInfluence1EdgeSpeed.value = params.influence1EdgeSpeed;
  dotMaterial.uniforms.uInfluence1EdgeOctaves.value = params.influence1EdgeOctaves;
  dotMaterial.uniforms.uInfluence1EdgeLacunarity.value = params.influence1EdgeLacunarity;
  dotMaterial.uniforms.uInfluence1EdgeGain.value = params.influence1EdgeGain;
  dotMaterial.uniforms.uInfluence1EdgeThreshold.value = params.influence1EdgeThreshold;
  dotMaterial.uniforms.uInfluence1EdgeIslandSize.value = params.influence1EdgeIslandSize;
  dotMaterial.uniforms.uInfluence1EdgeExposure.value = params.influence1EdgeExposure;
  dotMaterial.uniforms.uInfluence1EdgeGamma.value = params.influence1EdgeGamma;
  
  // Update all influence zone 2 uniforms
  dotMaterial.uniforms.uInfluence2Enabled.value = params.influence2Enabled;
  dotMaterial.uniforms.uInfluence2Pos.value.set(params.influence2X, params.influence2Y);
  dotMaterial.uniforms.uInfluence2Radius.value.set(params.influence2RadiusX, params.influence2RadiusY);
  dotMaterial.uniforms.uInfluence2Falloff.value = params.influence2Falloff;
  dotMaterial.uniforms.uInfluence2Intensity.value = params.influence2Intensity;
  dotMaterial.uniforms.uInfluence2Subtract.value = params.influence2Subtract;
  
  // Update influence zone 2 edge noise uniforms
  dotMaterial.uniforms.uInfluence2EdgeEnabled.value = params.influence2EdgeEnabled;
  dotMaterial.uniforms.uInfluence2EdgeStart.value = params.influence2EdgeStart;
  dotMaterial.uniforms.uInfluence2EdgeInfluence.value = params.influence2EdgeInfluence;
  dotMaterial.uniforms.uInfluence2EdgeScale.value = params.influence2EdgeScale;
  dotMaterial.uniforms.uInfluence2EdgeSpeed.value = params.influence2EdgeSpeed;
  dotMaterial.uniforms.uInfluence2EdgeOctaves.value = params.influence2EdgeOctaves;
  dotMaterial.uniforms.uInfluence2EdgeLacunarity.value = params.influence2EdgeLacunarity;
  dotMaterial.uniforms.uInfluence2EdgeGain.value = params.influence2EdgeGain;
  dotMaterial.uniforms.uInfluence2EdgeThreshold.value = params.influence2EdgeThreshold;
  dotMaterial.uniforms.uInfluence2EdgeIslandSize.value = params.influence2EdgeIslandSize;
  dotMaterial.uniforms.uInfluence2EdgeExposure.value = params.influence2EdgeExposure;
  dotMaterial.uniforms.uInfluence2EdgeGamma.value = params.influence2EdgeGamma;
}

// Expose for DevTools and external animation
Object.assign(window, { 
  scene, 
  camera, 
  renderer, 
  dotMatrix,
  updatePoint,
  updatePointByCoord,
  dotAttributes,
  params: params, // Expose params directly
  dotMatrixParams: params, // Expose params with clear name
  // Expose update functions for external control
  updateDotMatrix: () => {
    // No longer needed - noise calculations are done in the vertex shader
  },
  syncParamsToUniforms,
  recreateDotMatrix: createDotMatrix
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
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uSizeBlack.value = v;
    });
  matrixFolder.add(params, 'sizeWhite').name('Size (White)').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uSizeWhite.value = v;
    });
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
  noiseFolder.add(params, 'mainNoiseEnabled').name('Enabled')
    .onChange(v => {
      if (dotMaterial) {
        dotMaterial.uniforms.uMainNoiseEnabled.value = v;
        console.log('Main noise enabled:', v);
      }
    });
  noiseFolder.add(params, 'noiseAnimated').name('Animated')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseAnimated.value = v;
    });
  noiseFolder.add(params, 'noiseScale').name('Scale').min(0)
    .onChange(v => {
      if (dotMaterial) {
        dotMaterial.uniforms.uNoiseScale.value = v;
        console.log('Noise scale updated:', v);
      }
    });
  noiseFolder.add(params, 'noiseSpeed').name('Speed').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseSpeed.value = v;
    });
  noiseFolder.add(params, 'noiseOffsetX', -50, 50).name('Offset X')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseOffsetX.value = v;
    });
  noiseFolder.add(params, 'noiseOffsetY', -50, 50).name('Offset Y')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseOffsetY.value = v;
    });
  noiseFolder.add(params, 'noiseOffsetZ', -50, 50).name('Offset Z')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseOffsetZ.value = v;
    });
  noiseFolder.add(params, 'noiseEvolution', 0, 10).name('Evolution')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseEvolution.value = v;
    });
  noiseFolder.add(params, 'noiseOctaves').name('Octaves').min(1).step(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseOctaves.value = v;
    });
  noiseFolder.add(params, 'noiseLacunarity').name('Lacunarity').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseLacunarity.value = v;
    });
  noiseFolder.add(params, 'noiseGain').name('Gain').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseGain.value = v;
    });
  noiseFolder.add(params, 'noiseThreshold', 0, 0.9).name('Black Threshold')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseThreshold.value = v;
    });
  noiseFolder.add(params, 'noiseIslandSize', 0.1, 2).name('Island Size')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseIslandSize.value = v;
    });
  noiseFolder.add(params, 'noiseExposure', -3, 3).name('Exposure')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseExposure.value = v;
    });
  noiseFolder.add(params, 'noiseGamma', 0.1, 3).name('Gamma')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseGamma.value = v;
    });
  noiseFolder.add(params, 'noiseMultiplier', 0, 2).name('Multiplier')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseMultiplier.value = v;
    });
  noiseFolder.open();
  
  // Influence Zone 1 folder
  const influence1Folder = gui.addFolder('Influence Zone 1');
  influence1Folder.add(params, 'influence1Enabled').name('Enabled')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Enabled.value = v;
    });
  influence1Folder.add(params, 'influence1Subtract').name('Subtract Mode')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Subtract.value = v;
    });
  influence1Folder.add(params, 'influence1X').name('X Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Pos.value.x = v;
    });
  influence1Folder.add(params, 'influence1Y').name('Y Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Pos.value.y = v;
    });
  influence1Folder.add(params, 'influence1RadiusX').name('Radius X').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Radius.value.x = v;
    });
  influence1Folder.add(params, 'influence1RadiusY').name('Radius Y').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Radius.value.y = v;
    });
  influence1Folder.add(params, 'influence1Falloff').name('Falloff').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Falloff.value = v;
    });
  influence1Folder.add(params, 'influence1Intensity').name('Intensity')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1Intensity.value = v;
    });
  
  // Edge noise for zone 1
  const edge1Folder = influence1Folder.addFolder('Edge Noise');
  edge1Folder.add(params, 'influence1EdgeEnabled').name('Enabled')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeEnabled.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeStart').name('Start Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeStart.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeInfluence').name('Influence').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeInfluence.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeScale').name('Scale').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeScale.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeSpeed').name('Speed').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeSpeed.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeOctaves').name('Octaves').min(1).step(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeOctaves.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeLacunarity').name('Lacunarity').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeLacunarity.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeGain').name('Gain').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeGain.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeThreshold', 0, 0.9).name('Black Threshold')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeThreshold.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeIslandSize', 0.1, 2).name('Island Size')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeIslandSize.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeExposure', -3, 3).name('Exposure')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeExposure.value = v;
    });
  edge1Folder.add(params, 'influence1EdgeGamma', 0.1, 3).name('Gamma')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence1EdgeGamma.value = v;
    });
  
  influence1Folder.open();
  
  // Influence Zone 2 folder
  const influence2Folder = gui.addFolder('Influence Zone 2');
  influence2Folder.add(params, 'influence2Enabled').name('Enabled')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Enabled.value = v;
    });
  influence2Folder.add(params, 'influence2Subtract').name('Subtract Mode')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Subtract.value = v;
    });
  influence2Folder.add(params, 'influence2X').name('X Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Pos.value.x = v;
    });
  influence2Folder.add(params, 'influence2Y').name('Y Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Pos.value.y = v;
    });
  influence2Folder.add(params, 'influence2RadiusX').name('Radius X').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Radius.value.x = v;
    });
  influence2Folder.add(params, 'influence2RadiusY').name('Radius Y').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Radius.value.y = v;
    });
  influence2Folder.add(params, 'influence2Falloff').name('Falloff').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Falloff.value = v;
    });
  influence2Folder.add(params, 'influence2Intensity').name('Intensity')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2Intensity.value = v;
    });
  
  // Edge noise for zone 2
  const edge2Folder = influence2Folder.addFolder('Edge Noise');
  edge2Folder.add(params, 'influence2EdgeEnabled').name('Enabled')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeEnabled.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeStart').name('Start Position').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeStart.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeInfluence').name('Influence').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeInfluence.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeScale').name('Scale').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeScale.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeSpeed').name('Speed').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeSpeed.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeOctaves').name('Octaves').min(1).step(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeOctaves.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeLacunarity').name('Lacunarity').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeLacunarity.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeGain').name('Gain').min(0).max(1)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeGain.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeThreshold', 0, 0.9).name('Black Threshold')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeThreshold.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeIslandSize', 0.1, 2).name('Island Size')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeIslandSize.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeExposure', -3, 3).name('Exposure')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeExposure.value = v;
    });
  edge2Folder.add(params, 'influence2EdgeGamma', 0.1, 3).name('Gamma')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uInfluence2EdgeGamma.value = v;
    });
  
  // Debug folder
  const debugFolder = gui.addFolder('Debug');
  
  // Add debug mode for testing
  const debugParams = {
    debugMode: 'none',
    testUniforms: () => {
      if (dotMaterial) {
        console.log('Testing uniform values:');
        console.log('uMainNoiseEnabled:', dotMaterial.uniforms.uMainNoiseEnabled.value);
        console.log('uNoiseScale:', dotMaterial.uniforms.uNoiseScale.value);
        console.log('uNoiseOctaves:', dotMaterial.uniforms.uNoiseOctaves.value);
        console.log('uNoiseGain:', dotMaterial.uniforms.uNoiseGain.value);
        console.log('uTime:', dotMaterial.uniforms.uTime.value);
      }
    }
  };
  
  debugFolder.add(debugParams, 'debugMode', ['none', 'gridCoords', 'simpleNoise', 'uniformTest']).name('Debug Mode')
    .onChange(v => {
      // This would require shader recompilation to implement properly
      console.log('Debug mode changed to:', v);
    });
  
  debugFolder.add(debugParams, 'testUniforms').name('Test Uniforms');
  
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
          noiseOctaves: params.noiseOctaves,
          influence1: {
            enabled: params.influence1Enabled,
            subtract: params.influence1Subtract,
            position: [params.influence1X, params.influence1Y],
            radius: [params.influence1RadiusX, params.influence1RadiusY],
            edgeNoise: params.influence1EdgeEnabled
          },
          influence2: {
            enabled: params.influence2Enabled,
            subtract: params.influence2Subtract,
            position: [params.influence2X, params.influence2Y],
            radius: [params.influence2RadiusX, params.influence2RadiusY],
            edgeNoise: params.influence2EdgeEnabled
          },
          performance: 'GPU-accelerated noise calculations'
        });
      }
    });
  
  // Performance monitoring
  debugFolder.add({ showFPS: showFPS }, 'showFPS').name('Show FPS')
    .onChange(v => {
      showFPS = v;
      if (v) {
        console.log('FPS monitoring enabled - check console for updates');
      }
    });
  
  // Hide GUI by default
  gui.hide();
  
  // Keyboard shortcuts
  let guiVisible = false;
  document.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      guiVisible = !guiVisible;
      if (guiVisible) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  });
}

setupGUI();

// Animation loop
clock = new THREE.Clock();
let lastTime = 0;
let lastUpdateTime = 0;
let frameCount = 0;
let lastFPSUpdate = 0;

renderer.setAnimationLoop(() => {
  const currentTime = clock.getElapsedTime();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // FPS counter
  frameCount++;
  if (currentTime - lastFPSUpdate > 1.0) {
    const fps = frameCount / (currentTime - lastFPSUpdate);
    frameCount = 0;
    lastFPSUpdate = currentTime;
    
    // Update FPS in console every 5 seconds if enabled
    if (showFPS && Math.floor(currentTime) % 5 === 0) {
      console.log(`FPS: ${fps.toFixed(1)}`);
    }
  }
  
  // Update time uniform for animation (influence zones also use it)
  if (dotMaterial) {
    dotMaterial.uniforms.uTime.value = currentTime;
  }
  
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

console.log('Dot Matrix: Simplified GPU noise test. Press H for GUI.');
console.log('Debug: Check browser console for uniform updates and errors.');