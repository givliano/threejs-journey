import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

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
 * Particles
 */
const particles = {}

// Geometry
particles.geometry = new THREE.SphereGeometry(3)

// Material
particles.material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uSize: new THREE.Uniform(0.4),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio))
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

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
