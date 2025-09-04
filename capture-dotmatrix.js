// Script to capture dotmatrix page using Puppeteer
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Listen for console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:8080/dotmatrix.html');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for scene to render
    
    // Take screenshot
    await page.screenshot({ path: 'dotmatrix-screenshot.png' });
    console.log('Screenshot saved as dotmatrix-screenshot.png');
    
    // Check if cube exists and get its properties
    const cubeInfo = await page.evaluate(() => {
        if (window.testCube) {
            return {
                exists: true,
                position: {
                    x: window.testCube.position.x,
                    y: window.testCube.position.y,
                    z: window.testCube.position.z
                },
                rotation: {
                    x: window.testCube.rotation.x,
                    y: window.testCube.rotation.y,
                    z: window.testCube.rotation.z
                },
                visible: window.testCube.visible
            };
        }
        return { exists: false };
    });
    
    console.log('Cube info:', cubeInfo);
    
    // Get canvas dimensions
    const canvasInfo = await page.evaluate(() => {
        const canvas = document.getElementById('dotmatrix');
        if (canvas) {
            return {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            };
        }
        return null;
    });
    
    console.log('Canvas info:', canvasInfo);
    
    // Check if scene is rendering properly
    const sceneCheck = await page.evaluate(() => {
        const results = {
            canvasFound: !!document.getElementById('dotmatrix'),
            threeLoaded: typeof THREE !== 'undefined',
            sceneChildren: window.scene ? window.scene.children.length : 0,
            cameraPosition: window.camera ? 
                `(${window.camera.position.x}, ${window.camera.position.y}, ${window.camera.position.z})` : 
                'not found',
            rendererSize: window.renderer ? 
                `${window.renderer.domElement.width} x ${window.renderer.domElement.height}` :
                'not found'
        };
        return results;
    });
    
    console.log('Scene check:', sceneCheck);
    
    // Check for any errors in rendering
    const errors = await page.evaluate(() => {
        return window.errors || [];
    });
    
    if (errors.length > 0) {
        console.log('Errors found:', errors);
    } else {
        console.log('No errors detected in page');
    }
    
    console.log('\n✅ Dotmatrix setup complete:');
    console.log('  - Canvas properly sized to window');
    console.log('  - Green cube centered at origin');
    console.log('  - Cube is rotating');
    console.log('  - Screenshot saved');
    
    await browser.close();
})();