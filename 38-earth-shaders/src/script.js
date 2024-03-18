import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */
const earthParameters = {};
earthParameters.atmosphereDayColor = 0x00aaff;
earthParameters.atmosphereTwilightColor = 0xff6600;

gui
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() => earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor));

gui
    .addColor(earthParameters, 'atmosphereTwilightColor')
    .onChange(() => earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor));

// Textures
// we add an Anisotropic filter, the higher the value, the sharper the texture
// there are limitations by the hardware, but Simon says 8 is a good all around value for mobile and desktop
// // but there is a performance hit
const earthDayTexture = textureLoader.load('./earth/day.jpg');
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load('./earth/night.jpg');
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

// The specular image is data so it doesn't need a color space
const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg');
earthSpecularCloudsTexture.anisotropy = 8;
// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

/**
 * Sun
 */
// create an aligned sun at the equator of earth
// its radius is 1 so its already normalized. A different one would need normalization
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

// Debug
const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
);
scene.add(debugSun);

// Update sun
const updateSun = () => {
    // Sun direction according to the Spherical object
    sunDirection.setFromSpherical(sunSpherical);

    // Update debug object
    // multiply the scalar because the Spherical radius is 1 but the Earth radius is 2
    debugSun.position
        .copy(sunDirection)
        .multiplyScalar(5);

    // Uniforms
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection); // also already normalized
};
updateSun();

// Tweaks
gui
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI) // South pole to north pole
    .onChange(updateSun);

gui
    .add(sunSpherical, 'theta')
    .min(- Math.PI) // Full circle all around
    .max(Math.PI)
    .onChange(updateSun);
    

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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
