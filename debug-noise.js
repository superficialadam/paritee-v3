// Simple test to verify noise functions work correctly
console.log('Testing noise functions...');

// Test the JavaScript noise functions
function testNoiseFunctions() {
    // Test hash function
    function hash(x, y, z) {
        const p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
        
        let h = p[Math.floor(x) & 255];
        h = p[(h + Math.floor(y)) & 255];
        h = p[(h + Math.floor(z)) & 255];
        return h;
    }
    
    // Test gradient function
    function grad(i, j, k, x, y, z) {
        const h = hash(i, j, k) & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    // Test fade function
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    // Test Perlin noise
    function gradientNoise3D(x, y, z) {
        const i = Math.floor(x);
        const j = Math.floor(y);
        const k = Math.floor(z);
        
        const fx = x - i;
        const fy = y - j;
        const fz = z - k;
        
        const u = fade(fx);
        const v = fade(fy);
        const w = fade(fz);
        
        const g000 = grad(i, j, k, fx, fy, fz);
        const g100 = grad(i + 1, j, k, fx - 1, fy, fz);
        const g010 = grad(i, j + 1, k, fx, fy - 1, fz);
        const g110 = grad(i + 1, j + 1, k, fx - 1, fy - 1, fz);
        const g001 = grad(i, j, k + 1, fx, fy, fz - 1);
        const g101 = grad(i + 1, j, k + 1, fx - 1, fy, fz - 1);
        const g011 = grad(i, j + 1, k + 1, fx, fy - 1, fz - 1);
        const g111 = grad(i + 1, j + 1, k + 1, fx - 1, fy - 1, fz - 1);
        
        const x00 = g000 * (1 - u) + g100 * u;
        const x10 = g010 * (1 - u) + g110 * u;
        const x01 = g001 * (1 - u) + g101 * u;
        const x11 = g011 * (1 - u) + g111 * u;
        
        const y0 = x00 * (1 - v) + x10 * v;
        const y1 = x01 * (1 - v) + x11 * v;
        
        const result = y0 * (1 - w) + y1 * w;
        
        return (result + 1) * 0.5;
    }
    
    // Test FBM
    function fbm3D(x, y, z, octaves, lacunarity, gain) {
        if (gain === 0) return 0.5;
        
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1;
        let maxAmplitude = 0;
        
        for (let i = 0; i < octaves; i++) {
            value += amplitude * (gradientNoise3D(
                x * frequency,
                y * frequency,
                z * frequency
            ) - 0.5) * 2;
            maxAmplitude += amplitude;
            frequency *= lacunarity;
            amplitude *= gain;
        }
        
        value = value / maxAmplitude;
        return Math.max(0, Math.min(1, value + 0.5));
    }
    
    // Run tests
    console.log('Testing basic noise values:');
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 10;
        const y = Math.random() * 10;
        const z = Math.random() * 10;
        
        const noise = gradientNoise3D(x, y, z);
        const fbm = fbm3D(x, y, z, 4, 2.0, 0.5);
        
        console.log(`Test ${i}: noise=${noise.toFixed(3)}, fbm=${fbm.toFixed(3)}`);
    }
    
    // Test range
    console.log('\nTesting noise range:');
    let minNoise = 1, maxNoise = 0;
    let minFBM = 1, maxFBM = 0;
    
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const z = Math.random() * 100;
        
        const noise = gradientNoise3D(x, y, z);
        const fbm = fbm3D(x, y, z, 4, 2.0, 0.5);
        
        minNoise = Math.min(minNoise, noise);
        maxNoise = Math.max(maxNoise, noise);
        minFBM = Math.min(minFBM, fbm);
        maxFBM = Math.max(maxFBM, fbm);
    }
    
    console.log(`Noise range: ${minNoise.toFixed(3)} to ${maxNoise.toFixed(3)}`);
    console.log(`FBM range: ${minFBM.toFixed(3)} to ${maxFBM.toFixed(3)}`);
}

testNoiseFunctions();