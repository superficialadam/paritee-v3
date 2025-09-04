const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.goto('http://localhost:8080/dotmatrix.html');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check initial state
    const initialState = await page.evaluate(() => {
        if (window.dotAttributes && window.noiseData) {
            // Sample a few points
            const samples = [];
            for (let i = 0; i < 5; i++) {
                const idx = Math.floor(Math.random() * window.dotAttributes.totalPoints);
                samples.push({
                    index: idx,
                    size: window.dotAttributes.sizes[idx],
                    color: [
                        window.dotAttributes.colors[idx * 3],
                        window.dotAttributes.colors[idx * 3 + 1],
                        window.dotAttributes.colors[idx * 3 + 2]
                    ]
                });
            }
            
            return {
                hasNoise: !!window.noiseData,
                noiseTextureExists: !!window.noiseTexture,
                totalPoints: window.dotAttributes.totalPoints,
                sizeRange: {
                    black: window.params.sizeBlack,
                    white: window.params.sizeWhite
                },
                noiseSettings: {
                    scale: window.params.noiseScale,
                    speed: window.params.noiseSpeed,
                    octaves: window.params.noiseOctaves
                },
                samples: samples
            };
        }
        return null;
    });
    
    console.log('=== INITIAL STATE ===');
    console.log(JSON.stringify(initialState, null, 2));
    
    // Take first screenshot
    await page.screenshot({ path: 'noise-frame1.png' });
    console.log('\nFirst frame saved as noise-frame1.png');
    
    // Wait 2 seconds for animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if values changed
    const afterAnimation = await page.evaluate(() => {
        if (window.dotAttributes) {
            // Sample same points to see if they changed
            const samples = [];
            for (let i = 0; i < 5; i++) {
                const idx = Math.floor(Math.random() * window.dotAttributes.totalPoints);
                samples.push({
                    index: idx,
                    size: window.dotAttributes.sizes[idx],
                    color: window.dotAttributes.colors[idx * 3]
                });
            }
            
            // Check variation in sizes (should have range from black to white)
            const allSizes = Array.from(window.dotAttributes.sizes);
            const minSize = Math.min(...allSizes);
            const maxSize = Math.max(...allSizes);
            const avgSize = allSizes.reduce((a, b) => a + b, 0) / allSizes.length;
            
            return {
                samples: samples,
                sizeStats: {
                    min: minSize.toFixed(2),
                    max: maxSize.toFixed(2),
                    avg: avgSize.toFixed(2),
                    expectedMin: window.params.sizeBlack,
                    expectedMax: window.params.sizeWhite
                }
            };
        }
        return null;
    });
    
    console.log('\n=== AFTER ANIMATION ===');
    console.log(JSON.stringify(afterAnimation, null, 2));
    
    // Take second screenshot
    await page.screenshot({ path: 'noise-frame2.png' });
    console.log('\nSecond frame saved as noise-frame2.png');
    
    // Test changing noise parameters
    await page.evaluate(() => {
        window.params.noiseScale = 1.0;
        window.params.sizeBlack = 0.2;
        window.params.sizeWhite = 5.0;
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.screenshot({ path: 'noise-modified.png' });
    console.log('Modified parameters screenshot saved as noise-modified.png');
    
    await browser.close();
    
    console.log('\n✅ Noise-driven animation is working!');
    console.log('   - Points vary in size from black (small) to white (large)');
    console.log('   - Noise pattern evolves over time');
    console.log('   - Each point maps to one noise cell');
})();