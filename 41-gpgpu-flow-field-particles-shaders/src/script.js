import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer';
import GUI from 'lil-gui'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import gpgpuParticlesShader from './shaders/gpgpu/particles.glsl';

/**
 * THEORY
 *
 * `GPGPU` stands for `General-Purpose computing on Graphics Processing Units`
 * It's a way of using the GPU to process data rather than rendering pixels for the end user.
 * Great for when you need to do the same complex calculations thousands of time
 *
 * Use the pixels of the render to calculate data
 *
 * `Flow Field` corresponds to spatialized streams
 * For ani point in space, we calculate a direction.
 * And streams can be interpreted like a `wind` force
 *
 * A PROBLEM: the data needs to be persisted accross all the particles, because
 * it is unpredictable.
 *
 * We can save it on a `Frame Buffer Object (FBO)`, which are textures.
 * We can save the renders in this textures instead of doing it on the `<canvas>`
 * When we do a render for a classic `WebGL` website we put it in a `canvas`.
 * When we do a render to `compute data`, not used in the screen, then we use `FBO`
 *
 * In this technique each pixel will hold the `xyz` coordinates in the "texture pixel" `rgb` channels
 * On each frame, we update the FBO based on the previous FBO
 * The position of the particles persists and we keep on updating them on each frame.
 *
 * CREATING A GPGPU
 *
 * First we need to create a brand new offscreen scene (not the one being used)
 * We then add a `OrthographicCamera` to the scene and position it facing the front of the plane perfectly.
 * Then we apply a custom shader to the plane, in which we send the `FBO` texture containing the position
 * of the particles.
 * We send a `texture` that contain the initial position for each `pixel`.
 * The `texture` will be sent to the `plane` via a custom `shader`.
 * The `pixels` of the `plane` won't be shown. Just their `positions` will be updated.
 * We then calculate the `flow field` on each `pixel`.
 * Before rendering the real scene, we render that offscreen scene using the 
 * offscreen camera and save the result in an `FBO`, which will contain the `particles` coordinates.
 *
 * CHALLEHNGES
 * 1. We can't read and write in the same FBO. We need to have two of them and to invert
 * them on each new update `"ping-pong buffers`
 * 2. Using pixel as data is difficult because of the various formats and types a pixel can have.
 * 3. We need to complete the setup with almost nothing on screen until it works.
 *
 * `GPUComputationRenderer` class will do most of the heavy lifting
 * * Creating the scene
 * * handling the ping-pong buffers
 * * Setting the color format
 * * Rendering
 * * etc.
 * Better documentation on `GPUComputationRenderer.js`
 */


// TODO
// Control the effect based on cursor
// Use the cursor position to control the effect
// Add a low poly model and do some RAYCASTING on it
// similar to cursor interaction in place of particles
// use an invisible model, with not so many particles and vertices (low poly)
// retrieve the intersection coordinate
// send the intersection coordinate to the particles.glsl
// use the distance from the particle to the cursor coordinate to
// control the strength of the effect

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

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
    particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
camera.position.set(4.5, 4, 11)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#29191f'
renderer.setClearColor(debugObject.clearColor)

/**
 * Load model
 */
// Important to note that this model already has the color baked in the texture
// this was done using a python script (check the class notes).
const gltf = await gltfLoader.loadAsync('./model.glb');

/**
 * Base Geometry
 */
const baseGeometry = {};
baseGeometry.instance = gltf.scene.children[0].geometry;
baseGeometry.count = baseGeometry.instance.attributes.position.count;

/**
 * GPU Compute
 */
// Setup
// Each pixel of the `FBO` will correspond to one particle
// If we have 9 particles, we need 9 pixels on the FBO
// Since FBOs are like 2D renders, they are rectangular
// In order to make calculations easier, we will consider it a square
// For 9 particles we need a 3x3 square.
// We round the square root up to calculate the size so theres space for all the particles
const gpgpu = {};
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer);
// With `GPGPUComputationRenderer` each type of data that will be computed is called a `variable`
// We only have one variable and it's the particles
// To create a variable, we send the base texture (`vaseParticlesTexture`) that we created earlier
// and a shader that will update that texture (update each pixel).
// On its own the GPUComputationRenderer will put the `camera` in front of the `plane`, put the `shader` in
// the `plane` and send the `texture` that we just created as the base texture.

// Base particles
const baseParticlesTexture = gpgpu.computation.createTexture();

// Configure each particle coordinates (`x`, `y` and `z`) as the `r`, `g`, `b` (ignoring the `a` for now).
// The `geometry particles` go `3 by 3` (`xyz`)
// The array we need to update in the FBO go `4 by 4` (`rgba`)
// So for each particle we create both an `i3` and an `i4`
for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    // Position based on geometry and create the `rgba` channels of the texture
    baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0];
    baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1];
    baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2];
    baseParticlesTexture.image.data[i4 + 3] = Math.random();
}

// Particles variable
// the `baseParticlesTexture` will be injected in the shader and accessible in the name `uParticles`
gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture);
// We need to create a loop, with the shader output being fed into the shaders input so that progress is saved.
// This is the `ping pong buffer`.
// To reinject the variable in the shader we can use the method `setVariableDependencies`
// First parameter is the variable (`gpgpu.particlesVariable`), the second parameter is an array
// containing the dependencies (the same `gpgpu.particlesVariable`).
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [ gpgpu.particlesVariable ]);

// Uniforms
// Send uniforms to the `shader` material
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
// Send the delta time so that updates are not tied to screen framerate (things
// dying faster on higher framerates). 
// Also, never declare it with 0 to avoid bugs
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(1);
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture);
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2);
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5);

// Init
gpgpu.computation.init();

// Add debug plane
// good to see the render result
gpgpu.debug = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshBasicMaterial({
        map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    })
);
gpgpu.debug.visible = false; // disable it after dev
gpgpu.debug.position.x = 3;
scene.add(gpgpu.debug);

// We can access the `GPUComputationRenderer` output texture using the `getCurrentrenderTarget()`
// Then send it to `gpgpu.particlesVariable` and `console.log` the result
// The result is a WebGLRenderTarget, the wrapper for the FBO. We access the `texture` property.
console.log(gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture);

/**
 * Particles
 */
const particles = {}

// Create the array for the vertex shader
// we want to get the center of the pixel to get the proper position
const particlesUvArray = new Float32Array(baseGeometry.count * 2); // uv coordinates need a pair for each particle
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y++) {
    for (let x = 0; x < gpgpu.size; x++) {
        // create an index going from `0` to the amount of particles
        const i = (y * gpgpu.size + x);
        const i2 = i * 2;

        const uvX = (x + 0.5) / gpgpu.size; // normalize the X and get the value from the center of the pixel
        const uvY = (y + 0.5) / gpgpu.size; // normalize the Y and get the value from the center of the pixel

        particlesUvArray[i2 + 0] = uvX;
        particlesUvArray[i2 + 1] = uvY;

        // Random sizes
        sizesArray[i] = Math.random();
    }
}

// Geometry
// Create an empty geometry which will be fed the result of the FBO
particles.geometry = new THREE.BufferGeometry();
// since our geometry doesn't have a `position` and a `size` attribute to render
// the amount of particles, we set it here so that the particles can be rendered.
particles.geometry.setDrawRange(0, baseGeometry.count);
particles.geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2));
particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color);
particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1)); 

// Material
particles.material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uSize: new THREE.Uniform(0.07),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uParticlesTexture: new THREE.Uniform() // the FBO output
    }
})

// Points
particles.points = new THREE.Points(particles.geometry, particles.material)
scene.add(particles.points)

/**
 * Tweaks
 */
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
gui.add(particles.material.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('uSize')

gui
    .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value')
    .min(0)
    .max(1)
    .name('uFlowFieldInfluence');

gui
    .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value')
    .min(0)
    .max(10)
    .name('uFlowFieldStrength');

gui
    .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uFlowFieldStrength');
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // One way to avoid bugs in inactive tabs is to clamp the frameRate so that
    // the minimum framerate is 30 fps
    // another is the mod for particle.a in the particle shader
    // const deltaTime = Math.min(elapsedTime - previousTime, 1 / 30);
    const deltaTime = Math.min(elapsedTime - previousTime, 1 / 30);
    previousTime = elapsedTime
    
    // Update controls
    controls.update()

    // GPGPU Update
    // update time before computing the changes
    gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
    gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
    gpgpu.computation.compute();
    particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
