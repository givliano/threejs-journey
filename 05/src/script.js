import * as THREE from 'three'
import gsap from 'gsap';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);

// orthographic camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// animations
// Time
// let time = Date.now()
// Replaced with CLOCK
const clock = new THREE.Clock();

// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 });
// gsap.to(mesh.position, { duration: 1, delay: 2, x: 0 });

const tick = () => {
    // const currentTime = Date.now();
    // const deltaTime = currentTime - time;
    // time = currentTime;
    // console.log(deltaTime);
    // Update object
    // mesh.rotation.y += 0.004 * deltaTime
    //const elapsedTime = clock.getElapsedTime();
    //console.log(elapsedTime);
    //mesh.position.y = Math.sin(elapsedTime)
    //mesh.position.x = Math.cos(elapsedTime)

    // Render
    renderer.render(scene, camera)
    requestAnimationFrame(tick);
};

tick();
