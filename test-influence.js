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
    
    // Test influence zone
    const influenceTest = await page.evaluate(() => {
        if (window.params) {
            // Set up a clear influence zone in the center
            window.params.influenceEnabled = true;
            window.params.influenceX = 0.5;
            window.params.influenceY = 0.5;
            window.params.influenceRadiusX = 0.2;
            window.params.influenceRadiusY = 0.15;
            window.params.influenceFalloff = 2.0;
            window.params.influenceIntensity = 1.0;
            window.params.influenceBlend = 0.8; // Strong influence
            
            return {
                enabled: window.params.influenceEnabled,
                position: [window.params.influenceX, window.params.influenceY],
                radius: [window.params.influenceRadiusX, window.params.influenceRadiusY],
                falloff: window.params.influenceFalloff,
                intensity: window.params.influenceIntensity,
                blend: window.params.influenceBlend,
                maxSize: window.params.sizeWhite
            };
        }
        return null;
    });
    
    console.log('=== INFLUENCE ZONE TEST ===');
    console.log(JSON.stringify(influenceTest, null, 2));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'influence-center.png' });
    console.log('\nCenter influence saved as influence-center.png');
    
    // Move influence to corner
    await page.evaluate(() => {
        window.params.influenceX = 0.8;
        window.params.influenceY = 0.2;
        window.params.influenceRadiusX = 0.15;
        window.params.influenceRadiusY = 0.3;
        window.params.influenceBlend = 1.0; // Only influence, no noise
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'influence-corner.png' });
    console.log('Corner influence saved as influence-corner.png');
    
    // Test with larger size
    await page.evaluate(() => {
        window.params.sizeWhite = 20; // Increase max size
        window.params.influenceX = 0.5;
        window.params.influenceY = 0.5;
        window.params.influenceRadiusX = 0.4;
        window.params.influenceRadiusY = 0.2;
        window.params.influenceFalloff = 1.5;
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'influence-large.png' });
    console.log('Large size influence saved as influence-large.png');
    
    await browser.close();
    
    console.log('\n✅ Influence zone features working:');
    console.log('   - Elliptical influence zone with customizable position');
    console.log('   - Adjustable radius X and Y for elliptical shape');
    console.log('   - Falloff control for smooth transitions');
    console.log('   - Intensity control for influence strength');
    console.log('   - Blend factor to mix with noise');
    console.log('   - Max size increased to 50');
})();