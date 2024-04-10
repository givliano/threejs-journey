import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 2.5
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Models
 */
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // NOTE we need to update the resize on the `effectComposer`.
    composer.setSize(sizes.width, sizes.height);
    composer.setPixelRatio(Math.min(window.devicePixelRation, 2));
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
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
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace

/**
 * Post Processing
 */
// Render target
// NOTE Anti alis
// There are multiple ways to deal with anti alias on the effect composer
// We will add it via a pass in this case, in our own `WebGLRenderTarget`,
// via the `third` parameter of the `renderTarget`.
// pixelRatio > 1 doesn't need anti-alias, its a waste.
// PERFORMANCE: try to make each thing at only one pass. Every pass is worse for performance.
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        samples: ( renderer.getPixelRatio() === 1 ) ? 2 : 0 // the more samples, the better the `antialias`
    }
);
// Using a `pass` for antialiasing
// * FXAA: `Fast Approximate Anti-Alias`: classic, perfomant, but a bit blurry
// * SMAA: `Subpixel Morphological Anti-Alias`: usually better than FXAA, but less performant
// * MSAA (the one used in the 3js renderer and in the samples above)
// * SSAA: `Super Sampling Anti-Alias`: tricky to use, best quality but worst performance
// * TAA: `Temporal Anti-Alias`: performant but limited result.

// NOTE post-processing works in a similar way to the `GPGPU` code. We don't render in a canvas,
// we render in a buffer (`FBO`), also using two of them in a ping pong buffer since we can't
// read and write from them at the same time. At the end it is rendered as a texture in a plane
// covering the whole screen.
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
// A `pass` is an effect in the postprocessing 3js world.
effectComposer.addPass(renderPass);

// Dot Screen pass
const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false; // disable the pass
effectComposer.addPass(dotScreenPass);

// Glitch pass
const glitchPass = new GlitchPass();
// Some passes have editable properties
glitchPass.goWild = true;
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

// RGB Shift pass
// Some passes require being passed as a Uniform to the shader
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

// Unreal Bloom pass
const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);

gui.add(unrealBloomPass, 'enabled');
gui.add(unrealBloomPass, 'strength', 0, 2, 0.001).name('strength');
gui.add(unrealBloomPass, 'radius', 0, 2, 0.001).name('radius');
gui.add(unrealBloomPass, 'threshold', 0, 1, 0.001).name('threshold');

// Gamma correction pass
// The last pass need to be the `gammaCorrectionShader` to fix from 
// the standard `linear encoding` to `sRGB` encoding.
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

// Tint pass (custom pass)
// const TintShader = {
//     uniforms: {
//         tDiffuse: { value: null }, // the `RenderTarget` containing the previous render will update this automatically
//         uTint: { value: null } // by default initialize the `value` with null
//     },
//     vertexShader: `
//         varying vec2 vUv;
//         void main()
//         {
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//
//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D tDiffuse;
//         uniform vec3 uTint;
//
//         varying vec2 vUv;
//         
//         void main()
//         {
//             // Pick the color at the 'uv'
//             vec4 color = texture2D(tDiffuse, vUv);
//             // Change the tint
//             color.rgb += uTint;
//             gl_FragColor = color;
//         }
//     `,
// };
// const tintPass = new ShaderPass(TintShader);
// tintPass.material.uniforms.uTint.value = new THREE.Vector3(0, 0, 0);
// effectComposer.addPass(tintPass);
//
// gui.add(tintPass.material.uniforms.uTint.value, 'x', -1, 1, 0.001).name('red');
// gui.add(tintPass.material.uniforms.uTint.value, 'y', -1, 1, 0.001).name('green');
// gui.add(tintPass.material.uniforms.uTint.value, 'z', -1, 1, 0.001).name('blue');

// Displacement pass (custom pass)
// const DisplacementShader = {
//     uniforms: {
//         tDiffuse: { value: null }, // the `RenderTarget` containing the previous render will update this automatically
//         uTime: { value: null }
//     },
//     vertexShader: `
//         varying vec2 vUv;
//         void main()
//         {
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//
//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D tDiffuse;
//         uniform float uTime;
//
//         varying vec2 vUv;
//         
//         void main()
//         {
//             vec2 newUv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1);
//             vec4 color = texture2D(tDiffuse, newUv);
//             gl_FragColor = color;
//         }
//     `,
// };
// const displacementPass = new ShaderPass(DisplacementShader);
// displacementPass.material.uniforms.uTime.value = 0; // ensure we have 0
// effectComposer.addPass(displacementPass);

// Displacement shader 2
const DisplacementShader = {
    uniforms: {
        tDiffuse: { value: null }, // the `RenderTarget` containing the previous render will update this automatically
        uNormalMap: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D uNormalMap;

        varying vec2 vUv;
        
        void main()
        {
            // original goes from 0 to 1, we make it go from -1 to 1
            vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0; 

            vec2 newUv = vUv + normalColor.xy * 0.1;
            vec4 color = texture2D(tDiffuse, newUv);

            vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));// normalize the direction
// compare the direction of the normal to the direction of the light
// if they are going against each other we get one
// if they are perpendicular we get 0
// if they are perfectly at same direction we get -1.0, so we clamp it
            float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
            color.rgb += lightness * 2.0;

            gl_FragColor = color;
        }
    `,
};
const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png');
effectComposer.addPass(displacementPass);
// gui.add(tintPass.material.uniforms.uTint.value, 'x', -1, 1, 0.001).name('red');
// gui.add(tintPass.material.uniforms.uTint.value, 'y', -1, 1, 0.001).name('green');
// gui.add(tintPass.material.uniforms.uTint.value, 'z', -1, 1, 0.001).name('blue');

// Antialias: only thing after the `GammaCorrectionPass` allowed
// SMAA pass
// We will check if the `samples` property in the `renderTarget` is not supported (WebGL 1).
// If the devicePixelRatio is 1 and it doesn't support WebGL 2 then we add the `SMAA` pass.
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass();
    effectComposer.addPass(smaaPass);

    console.log('Using SMAA');
}
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update passes
    // displacementPass.material.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
