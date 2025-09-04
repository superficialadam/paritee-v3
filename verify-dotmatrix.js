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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: 'dotmatrix-screenshot.png' });
    console.log('Screenshot saved as dotmatrix-screenshot.png');
    
    // Check dot matrix properties
    const dotMatrixInfo = await page.evaluate(() => {
        if (window.dotMatrix && window.dotAttributes) {
            return {
                exists: true,
                totalPoints: window.dotAttributes.totalPoints,
                cols: window.dotAttributes.cols,
                rows: window.dotAttributes.rows,
                type: window.dotMatrix.type,
                visible: window.dotMatrix.visible,
                materialType: window.dotMatrix.material.type,
                hasShader: !!window.dotMatrix.material.vertexShader
            };
        }
        return { exists: false };
    });
    
    console.log('\n=== DOT MATRIX INFO ===');
    console.log(dotMatrixInfo);
    
    // Test point manipulation
    const testResult = await page.evaluate(() => {
        if (window.updatePoint && window.dotAttributes) {
            // Update center point to red
            const centerIndex = Math.floor(window.dotAttributes.totalPoints / 2);
            window.updatePoint(centerIndex, {
                size: 3.0,
                color: {r: 1, g: 0, b: 0},
                opacity: 1.0
            });
            
            // Update corner points to blue
            window.updatePointByCoord(0, 0, {
                size: 2.0,
                color: [0, 0, 1],
                opacity: 1.0
            });
            
            return {
                success: true,
                message: 'Updated center point to red and corner to blue'
            };
        }
        return { success: false, message: 'Functions not available' };
    });
    
    console.log('\n=== POINT UPDATE TEST ===');
    console.log(testResult);
    
    // Wait a bit and take another screenshot
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'dotmatrix-modified.png' });
    console.log('\nModified screenshot saved as dotmatrix-modified.png');
    
    // Get GUI params
    const params = await page.evaluate(() => {
        if (window.params) {
            return window.params;
        }
        return null;
    });
    
    if (params) {
        console.log('\n=== CURRENT PARAMETERS ===');
        console.log(`Grid Resolution: ${params.gridResolution}`);
        console.log(`Point Size: ${params.pointSize}`);
        console.log(`Point Margin: ${params.pointMargin}`);
        console.log(`Point Opacity: ${params.pointOpacity}`);
        console.log(`Point Color: ${params.pointColor}`);
    }
    
    await browser.close();
})();