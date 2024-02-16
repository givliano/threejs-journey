import * as THREE from 'three';
import Camera from './Camera';
import Renderer from './Renderer';
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';
import World from './World/World';
import Resources from './Utils/Resources';
import Debug from './Utils/Debug';
import sources from './sources';

let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) {
      return instance;
    }
    instance = this;
    // Global access (messy to attach it to window but its Bruno Simon)
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug(); // first one if it's necessary for the other ones
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Sizes resize event
    this.sizes.on('resize', () => {
      this.resize();
    });

    // Time tick event
    this.time.on('tick', () => {
      this.update();
    });

    // this.destroy();
  }

  // Centralize the resize propagation from here so that we can control
  // better the order of the execution of the children callbacks
  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  // Just like on resize it is better to update the camera
  // before the renderer
  // Update on ticks
  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  // destroy() {
  //   console.log('cu')
  //   this.sizes.off('resize');
  //   this.sizes.off('tick');

  //   // Traverse the whole scene
  //   // Dispose the meshe
  //   // Dispose components of materials etc
  //   this.scene.traverse((child) => {
  //     console.log('cu')
  //     console.log(child );
  //     if (child instanceof THREE.Mesh) {
  //       console.log(child);
  //       child.geometry.dispose();

  //       for (const key in child.material) {
  //         const value = child.material[key];

  //         if (value && typeof value.dispose === 'function') {
  //           console.log(value);
  //           value.dispose();
  //         }
  //       }
  //     }
  //   });

  //   this.camera.controls.dispose();
  //   this.renderer.instance.dispose();

  //   if (this.debug.active) {
  //     this.debug.ui.destroy();
  //   }
  // }

  destroy() {
    // Removes EventEmitter events.
    this.sizes.off('resize')
    this.sizes.off('tick')

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key]

          // Test if there is a dispose function
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })
    this.camera.controls.dispose()
    this.renderer.instance.dispose()
    if (this.debug.active) this.debug.ui.destroy()
    // Removes window events.
    // this.sizes.removeEvent()
    // this.time.removeEvent()
  }
}