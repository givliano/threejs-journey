import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import GUI from 'lil-gui'
import terrainVertexShader from './shaders/terrain/vertex.glsl';
import terrainFragmentShader from './shaders/terrain/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const rgbeLoader = new RGBELoader()

/**
 * Environment map
 */
rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.backgroundBlurriness = 0.5
    scene.environment = environmentMap
})

/**
 * Terrain
 */
// Geometry
const geometry = new THREE.PlaneGeometry(10, 10, 500, 500);
geometry.deleteAttribute('normal');
geometry.deleteAttribute('uv');
// NOTE rotate the geometry so that in the shader Y still goes up
// If it was the `Mesh` it would be the Z in the shader.
geometry.rotateX(- Math.PI * 0.5);

// Material
debugObject.colorWaterDeep = '#002b3d'
debugObject.colorWaterSurface = '#66a8ff'
debugObject.colorSand = '#ffe894'
debugObject.colorGrass = '#85d534'
debugObject.colorSnow = '#ffffff'
debugObject.colorRock = '#bfbd8d'

const uniforms = {
    uTime: new THREE.Uniform(0),
    uPositionFrequency: new THREE.Uniform(0.2),
    uStrength: new THREE.Uniform(2),
    uWarpFrequency: new THREE.Uniform(5),
    uWarpStrength: new THREE.Uniform(0.5),
    uColorWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colorWaterDeep)),
    uColorWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colorWaterSurface)),
    uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
    uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
    uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow)),
    uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
};

gui
    .add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency');
gui
    .add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength');
gui
    .add(uniforms.uWarpFrequency, 'value', 0, 1, 0.001).name('uWarpFrequency');
gui
    .add(uniforms.uWarpStrength, 'value', 0, 1, 0.001).name('uWarpStrength');

gui.addColor(debugObject, 'colorWaterDeep').onChange(() => uniforms.uColorWaterDeep.value.set(debugObject.colorWaterDeep))
gui.addColor(debugObject, 'colorWaterSurface').onChange(() => uniforms.uColorWaterSurface.value.set(debugObject.colorWaterSurface))
gui.addColor(debugObject, 'colorSand').onChange(() => uniforms.uColorSand.value.set(debugObject.colorSand))
gui.addColor(debugObject, 'colorGrass').onChange(() => uniforms.uColorGrass.value.set(debugObject.colorGrass))
gui.addColor(debugObject, 'colorSnow').onChange(() => uniforms.uColorSnow.value.set(debugObject.colorSnow))
gui.addColor(debugObject, 'colorRock').onChange(() => uniforms.uColorRock.value.set(debugObject.colorRock))

const material = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms,

    // MeshStandardMaterial
    metalness: 0,
    roughness: 0.5,
    color: 0x85d534
});

const depthMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshDepthMaterial,
    silent: true,
    vertexShader: terrainVertexShader,
    uniforms,

    // MeshDepthMaterial
    depthPacking: THREE.RGBADepthPacking,
});

// Mesh
const terrain = new THREE.Mesh(geometry, material);
terrain.customDepthMaterial = depthMaterial;
terrain.receiveShadow = true;
terrain.castShadow = true;
scene.add(terrain);

/**
 * Water
 */
const water = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 1, 1),
    new THREE.MeshPhysicalMaterial({
        transmission: 1,
        roughness: 0.3
    })
);
water.rotation.x = - Math.PI * 0.5;
// Make it at water level
water.position.y = - 0.1;
scene.add(water);

/**
 * Board
 */
// NOTE to instantiate a brush we need to send a three shape
// We'll create two boxes: a large one and a small one poking a whole in the larger
// a Brush is also a 3js `Obejct3D` instance
const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));
// NOTE the transformation matrix used by 3js hasn't been updated.
// It updates is only when rendering to avoid unecessary calculations.
// That's why we update it manually
// boardHole.position.y = 0.2;
// boardHole.updateMatrixWorld();

// Evaluate
const evaluator = new Evaluator();
const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
// NOTE Clear inherited groups from the brushes
// always clean up useless data
board.geometry.clearGroups();
board.material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.3
});
board.castShadow = true;
board.receiveShadow = true;
scene.add(board);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

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
camera.position.set(-10, 6, -2)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Uniforms
    uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
