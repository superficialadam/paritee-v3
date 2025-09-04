// Simple script to check dotmatrix status
console.log('Checking dotmatrix scene...');

// Wait for everything to load
setTimeout(() => {
    console.log('\n=== DOTMATRIX STATUS CHECK ===\n');
    
    // Check Three.js
    if (typeof THREE !== 'undefined') {
        console.log('✅ Three.js loaded successfully');
    } else {
        console.error('❌ Three.js not loaded');
    }
    
    // Check scene components
    if (typeof scene !== 'undefined') {
        console.log('✅ Scene created');
        console.log(`   Scene has ${scene.children.length} children:`);
        scene.children.forEach((child, i) => {
            console.log(`   ${i+1}. ${child.type} ${child.name || ''}`);
        });
    } else {
        console.error('❌ Scene not created');
    }
    
    // Check camera
    if (typeof camera !== 'undefined') {
        console.log('✅ Camera created');
        console.log(`   Position: (${camera.position.x}, ${camera.position.y}, ${camera.position.z})`);
        console.log(`   FOV: ${camera.fov}`);
    } else {
        console.error('❌ Camera not created');
    }
    
    // Check renderer
    if (typeof renderer !== 'undefined') {
        console.log('✅ Renderer created');
        const size = renderer.getSize(new THREE.Vector2());
        console.log(`   Size: ${size.x} x ${size.y}`);
    } else {
        console.error('❌ Renderer not created');
    }
    
    // Check test cube
    if (typeof testCube !== 'undefined') {
        console.log('✅ Test cube created');
        console.log(`   Color: Green (0x00ff00)`);
        console.log(`   Position: (${testCube.position.x}, ${testCube.position.y}, ${testCube.position.z})`);
        console.log(`   Initial rotation: (${testCube.rotation.x.toFixed(2)}, ${testCube.rotation.y.toFixed(2)}, ${testCube.rotation.z.toFixed(2)})`);
        
        // Check rotation after delay
        setTimeout(() => {
            console.log('\n=== ANIMATION CHECK (after 2 seconds) ===');
            console.log(`   Rotation now: (${testCube.rotation.x.toFixed(2)}, ${testCube.rotation.y.toFixed(2)}, ${testCube.rotation.z.toFixed(2)})`);
            if (testCube.rotation.x !== 0 || testCube.rotation.y !== 0) {
                console.log('✅ Cube is rotating!');
            } else {
                console.error('❌ Cube is not rotating');
            }
        }, 2000);
    } else {
        console.error('❌ Test cube not created');
    }
    
    // Check GUI
    if (typeof gui !== 'undefined') {
        console.log('✅ GUI created');
    } else {
        console.error('❌ GUI not created');
    }
    
    console.log('\n=== END STATUS CHECK ===\n');
    
}, 500);