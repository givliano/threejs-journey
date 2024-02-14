import * as THREE from 'three';
import Camera from './Camera';
import Renderer from './Renderer';
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';

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
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();

    // Sizes resize event
    this.sizes.on('resize', () => {
      this.resize();
    });

    // Time tick event
    this.time.on('tick', () => {
      this.update();
    });
  }

  // Centralize the resize propagation from here so that we can control
  // better the order of the execution of the children callbacks
  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  // Just like on resize it is better to update the camera
  // before the renderer
  update() {
    this.camera.update();
    this.renderer.update();
  }
}