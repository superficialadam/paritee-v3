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
  sizeWhite: 3.0,      // Size when point is white
  
  // Main noise controls
  mainNoiseEnabled: true, // Toggle main noise on/off
  noiseScale: 3.0,     // Scale of the noise pattern
  noiseSpeed: 0.5,     // Speed of noise evolution
  noiseOctaves: 4,     // Number of octaves for fractal noise
  noiseLacunarity: 2.0, // Frequency multiplier per octave
  noiseGain: 0.5,      // Amplitude multiplier per octave
  noiseThreshold: 0.0,  // Black level threshold (cuts off values below)
  noiseIslandSize: 0.5, // Controls bright island size (remap range)
  noiseExposure: 0.0,  // Exposure adjustment (stops)
  noiseGamma: 1.0,     // Gamma correction (1 = linear)
  noiseMultiplier: 1.0, // Final output multiplier (overall fader)
  noiseOffsetX: 0.0,   // Manual X offset for noise
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
  influence1Intensity: 0.5, // Intensity/value of influence
  influence1Subtract: false, // If true, subtracts from value instead of adding
  
  // Edge noise for zone 1
  influence1EdgeEnabled: true,
  influence1EdgeStart: 0.3,      // Where edge noise starts (0=center, 1=edge)
  influence1EdgeInfluence: 0.3,  // How much the edge noise affects the influence
  influence1EdgeScale: 5.0,      // Scale of edge noise
  influence1EdgeSpeed: 0.3,      // Speed of edge noise evolution
  influence1EdgeOctaves: 2,      // Octaves for edge noise
  influence1EdgeLacunarity: 2.5, // Lacunarity for edge noise
  influence1EdgeGain: 0.6,       // Gain for edge noise
  influence1EdgeThreshold: 0.0,  // Black level threshold for edge noise
  influence1EdgeIslandSize: 0.5, // Island size for edge noise
  influence1EdgeExposure: 0.0,   // Exposure for edge noise
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

// Vertex shader for GPU-accelerated noise calculations
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

// Influence zone 1 uniforms
uniform bool uInfluence1Enabled;
uniform vec2 uInfluence1Pos;
uniform vec2 uInfluence1Radius;
uniform float uInfluence1Falloff;
uniform float uInfluence1Intensity;
uniform bool uInfluence1Subtract;
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

// Size mapping uniforms
uniform float uSizeBlack;
uniform float uSizeWhite;

attribute vec2 gridCoord;
attribute float size;
attribute vec3 color;
attribute float opacity;

varying vec3 vColor;
varying float vOpacity;

// Hash function for noise
float hash(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p + 19.19);
    return fract(sin(p.x + p.y + p.z) * 43758.5453);
}

// Gradient function for Perlin noise
float grad(vec3 p, vec3 f) {
    float h = hash(p) * 16.0;
    float u = h < 8.0 ? f.x : f.y;
    float v = h < 4.0 ? f.y : (h == 12.0 || h == 14.0) ? f.x : f.z;
    return ((mod(h, 2.0) == 0.0) ? u : -u) + ((mod(h, 4.0) < 2.0) ? v : -v);
}

// Fade curve
float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// 3D Perlin noise
float perlinNoise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    float u = fade(f.x);
    float v = fade(f.y);
    float w = fade(f.z);
    
    float g000 = grad(i, f);
    float g100 = grad(i + vec3(1.0, 0.0, 0.0), f - vec3(1.0, 0.0, 0.0));
    float g010 = grad(i + vec3(0.0, 1.0, 0.0), f - vec3(0.0, 1.0, 0.0));
    float g110 = grad(i + vec3(1.0, 1.0, 0.0), f - vec3(1.0, 1.0, 0.0));
    float g001 = grad(i + vec3(0.0, 0.0, 1.0), f - vec3(0.0, 0.0, 1.0));
    float g101 = grad(i + vec3(1.0, 0.0, 1.0), f - vec3(1.0, 0.0, 1.0));
    float g011 = grad(i + vec3(0.0, 1.0, 1.0), f - vec3(0.0, 1.0, 1.0));
    float g111 = grad(i + vec3(1.0, 1.0, 1.0), f - vec3(1.0, 1.0, 1.0));
    
    float x00 = mix(g000, g100, u);
    float x10 = mix(g010, g110, u);
    float x01 = mix(g001, g101, u);
    float x11 = mix(g011, g111, u);
    
    float y0 = mix(x00, x10, v);
    float y1 = mix(x01, x11, v);
    
    float result = mix(y0, y1, w);
    
    // Normalize to 0-1 range (Perlin noise is roughly -1 to 1)
    return (result + 1.0) * 0.5;
}

// Fractional Brownian Motion
float fbm(vec3 p, int octaves, float lacunarity, float gain) {
    if (gain <= 0.0) return 0.5;
    
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxAmplitude = 0.0;
    
    for (int i = 0; i < 10; i++) {
        if (i >= octaves) break;
        
        // Add octave contribution
        value += amplitude * (perlinNoise3D(p * frequency) - 0.5) * 2.0;
        maxAmplitude += amplitude;
        
        frequency *= lacunarity;
        amplitude *= gain;
    }
    
    // Normalize and map to 0-1 range
    value = value / maxAmplitude;
    return clamp(value + 0.5, 0.0, 1.0);
}

// Process noise value through threshold, island size, exposure, gamma
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

// Calculate elliptical influence
float calculateInfluence(vec2 pos, vec2 center, vec2 radius, float falloff, float intensity, bool subtract) {
    vec2 distVec = (pos - center) / radius;
    float distance = length(distVec);
    
    if (distance >= 1.0) return 0.0;
    
    float factor = 1.0 - pow(distance, falloff);
    float result = factor * intensity;
    return subtract ? -result : result;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Normalize grid coordinates to 0-1 range
    vec2 normalizedCoord = gridCoord / uGridSize;
    
    // Start with base noise value
    float noiseValue = 0.5;
    
    // Debug: visualize grid coordinates
    // noiseValue = normalizedCoord.x;
    
    // Apply main noise if enabled
    if (uMainNoiseEnabled) {
        vec3 noisePos = vec3(
            normalizedCoord.x * uNoiseScale + uNoiseOffsetX,
            normalizedCoord.y * uNoiseScale + uNoiseOffsetY,
            uNoiseOffsetZ + uNoiseEvolution
        );
        
        if (uNoiseAnimated) {
            noisePos.z -= uTime * uNoiseSpeed;
        }
        
        // Generate FBM noise
        noiseValue = fbm(noisePos, uNoiseOctaves, uNoiseLacunarity, uNoiseGain);
        
        // Debug: test with simple noise first
        // noiseValue = perlinNoise3D(noisePos);
        
        // Apply processing chain
        noiseValue = processNoise(noiseValue, uNoiseThreshold, uNoiseIslandSize, uNoiseExposure, uNoiseGamma);
        noiseValue = noiseValue * uNoiseMultiplier;
        
        // Clamp to valid range
        noiseValue = clamp(noiseValue, 0.0, 1.0);
    }
    
    // Apply influence zones
    if (uInfluence1Enabled) {
        float influence = calculateInfluence(
            normalizedCoord, uInfluence1Pos, uInfluence1Radius, 
            uInfluence1Falloff, uInfluence1Intensity, uInfluence1Subtract
        );
        
        // Apply edge noise for influence zone 1
        if (uInfluence1EdgeEnabled) {
            vec2 distVec = (normalizedCoord - uInfluence1Pos) / uInfluence1Radius;
            float distance = length(distVec);
            
            if (distance > uInfluence1EdgeStart) {
                vec3 edgeNoisePos = vec3(
                    normalizedCoord.x * uInfluence1EdgeScale,
                    normalizedCoord.y * uInfluence1EdgeScale,
                    -uTime * uInfluence1EdgeSpeed
                );
                
                float edgeNoise = fbm(edgeNoisePos, uInfluence1EdgeOctaves, uInfluence1EdgeLacunarity, uInfluence1EdgeGain);
                edgeNoise = processNoise(edgeNoise, uInfluence1EdgeThreshold, uInfluence1EdgeIslandSize, uInfluence1EdgeExposure, uInfluence1EdgeGamma);
                
                float edgeWeight = (distance - uInfluence1EdgeStart) / (1.0 - uInfluence1EdgeStart);
                float noiseEffect = (edgeNoise - 0.5) * 2.0 * uInfluence1EdgeInfluence * edgeWeight;
                influence += noiseEffect;
            }
        }
        
        noiseValue += influence;
    }
    
    if (uInfluence2Enabled) {
        float influence = calculateInfluence(
            normalizedCoord, uInfluence2Pos, uInfluence2Radius, 
            uInfluence2Falloff, uInfluence2Intensity, uInfluence2Subtract
        );
        
        // Apply edge noise for influence zone 2
        if (uInfluence2EdgeEnabled) {
            vec2 distVec = (normalizedCoord - uInfluence2Pos) / uInfluence2Radius;
            float distance = length(distVec);
            
            if (distance > uInfluence2EdgeStart) {
                vec3 edgeNoisePos = vec3(
                    normalizedCoord.x * uInfluence2EdgeScale,
                    normalizedCoord.y * uInfluence2EdgeScale,
                    -uTime * uInfluence2EdgeSpeed
                );
                
                float edgeNoise = fbm(edgeNoisePos, uInfluence2EdgeOctaves, uInfluence2EdgeLacunarity, uInfluence2EdgeGain);
                edgeNoise = processNoise(edgeNoise, uInfluence2EdgeThreshold, uInfluence2EdgeIslandSize, uInfluence2EdgeExposure, uInfluence2EdgeGamma);
                
                float edgeWeight = (distance - uInfluence2EdgeStart) / (1.0 - uInfluence2EdgeStart);
                float noiseEffect = (edgeNoise - 0.5) * 2.0 * uInfluence2EdgeInfluence * edgeWeight;
                influence += noiseEffect;
            }
        }
        
        noiseValue += influence;
    }
    
    // Clamp final noise value
    noiseValue = clamp(noiseValue, 0.0, 1.0);
    
    // Map noise to size
    float pointSize = mix(uSizeBlack, uSizeWhite, noiseValue);
    gl_PointSize = pointSize;
    
    // Map noise to color (black to white)
    vColor = vec3(noiseValue);
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
  
  // Create material
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
      
      // Influence zone 1 uniforms
      uInfluence1Enabled: { value: params.influence1Enabled },
      uInfluence1Pos: { value: new THREE.Vector2(params.influence1X, params.influence1Y) },
      uInfluence1Radius: { value: new THREE.Vector2(params.influence1RadiusX, params.influence1RadiusY) },
      uInfluence1Falloff: { value: params.influence1Falloff },
      uInfluence1Intensity: { value: params.influence1Intensity },
      uInfluence1Subtract: { value: params.influence1Subtract },
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
      uInfluence2EdgeGamma: { value: params.influence2EdgeGamma },
      
      // Size mapping uniforms
      uSizeBlack: { value: params.sizeBlack },
      uSizeWhite: { value: params.sizeWhite }
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
      if (dotMaterial) dotMaterial.uniforms.uMainNoiseEnabled.value = v;
    });
  noiseFolder.add(params, 'noiseAnimated').name('Animated')
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseAnimated.value = v;
    });
  noiseFolder.add(params, 'noiseScale').name('Scale').min(0)
    .onChange(v => {
      if (dotMaterial) dotMaterial.uniforms.uNoiseScale.value = v;
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
  
  // Only update time uniform if noise is animated or influence zones are enabled
  const needsUpdate = (params.mainNoiseEnabled && params.noiseAnimated) || 
                      (params.influence1Enabled && params.influence1EdgeEnabled) || 
                      (params.influence2Enabled && params.influence2EdgeEnabled);
  if (needsUpdate && dotMaterial) {
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

console.log('Dot Matrix: GPU-accelerated noise with performance optimizations. Press H for GUI.');