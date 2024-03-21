import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Displacement
 */
// Everything for the canvas element
const displacement = {};

// 2D canvas
displacement.canvas = document.createElement('canvas');
// Its not necessary to be the same size as the amount of particles.
// It can be less, but it doens't make sense to be more because it waster performance.
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = 'fixed';
displacement.canvas.style.width = '512px';
displacement.canvas.style.heigth = '512px';
displacement.canvas.style.top = 0;
displacement.canvas.style.left = 0;
displacement.canvas.style.zIndex = 10;
document.body.append(displacement.canvas);

// Context
displacement.context = displacement.canvas.getContext('2d');
// FIll the canvas rect
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height);

// GLow image
// add it via native JS because THREE injects a lot of unecessary code for this simple usecase
displacement.glowImage = new Image()
displacement.glowImage.src = './glow.png';
displacement.glowImage.onload = () => {
    displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32); // x, y, width, height
}

// Interactive plane
// since raycaster doesn't work in particles we need a plane behind
// the particles for the effect
// we wont reuse the plane from the particles because it has too many
// vertices and that makes it bad for performance with the `raycaster`
// but it has to be the same size
displacement.interactivePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 'red' })
);
displacement.interactivePlane.visible = false;
scene.add(displacement.interactivePlane);

// Raycaster
displacement.raycaster = new THREE.Raycaster();

// Coordinates
displacement.screenCursor = new THREE.Vector2(9999, 9999); // move the cursor to outside the screen
displacement.canvasCursor = new THREE.Vector2(9999, 9999); // move the cursor to outside the screen

// same as mousemove but works in mobile
window.addEventListener('pointermove', (e) => {
    // we must convert the screen cordinates (which are in `pixels`) to the `clip space`,
    // which have coordinates from `- 1` to `+ 1` (left to right, bottom to top)
    displacement.screenCursor.x = ( e.clientX / sizes.width ) * 2 - 1;
    displacement.screenCursor.y = - ( e.clientY / sizes.height ) * 2 + 1;
})

// Texture
displacement.texture = new THREE.CanvasTexture(displacement.canvas);


/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);

const intensitiesArray = new Float32Array(particlesGeometry.attributes.position.count);
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count);

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
    intensitiesArray[i] = Math.random();
    anglesArray[i] = Math.random() * Math.PI * 2; // position randomly around a circle coordinate
}

particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1));
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(intensitiesArray, 1));

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPictureTexture: new THREE.Uniform(textureLoader.load('./picture-1.png')), // any picture, small, grayscale and square
        uDisplacementTexture: new THREE.Uniform(displacement.texture),
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    /**
      * Raycaster
      */ 
    displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane);

    if (intersections.length) {
        const uv = intersections[0].uv;

        displacement.canvasCursor.x = uv.x * displacement.canvas.width; // from 0 to 128
        // Invert the Y because canvas goes from 0 at the top to 1 at the bottom
        // but the uv goes from 0 at the bottom to 1 at the top
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height; // from 0 to 128
    }

    /**
      * Displacement
      */ 
    // FADE OUT
    // Fill the whole canvas with a black but low opacity. That's the way to do a fade out
    // in canvas
    displacement.context.globalCompositeOperation = 'source-over'; // set the composition to the default one
    // There is a problem with Canvas handling small numbers getting close to 0 and the small variations
    // in color
    // it will be fixed when using the canvas data inside webGL
    displacement.context.globalAlpha = 0.02;
    displacement.context.fillRect(
        0, 
        0, 
        displacement.canvas.width, 
        displacement.canvas.height
    );
    // Draw glow
    const glowSize = displacement.canvas.width * 0.25;
    displacement.context.globalCompositeOperation = 'lighten'; // retains the lightest pixels of the layers
    displacement.context.globalAlpha = 1;
    displacement.context.drawImage(
        displacement.glowImage,
        displacement.canvasCursor.x - glowSize * 0.5, // move the center of the glow to the pointer location
        displacement.canvasCursor.y - glowSize * 0.5,
        glowSize, // width
        glowSize  // height
    );

    // Texture
    // warns Three.JS to send the buffer data to the GPU
    displacement.texture.needsUpdate = true;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
