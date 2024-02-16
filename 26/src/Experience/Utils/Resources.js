import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import EventEmitter from "./EventEmitter";
/**
 * Centralize asset loading in a dedicated class that will
 * * Instantiate all of the loaders we need
 * * Loop through an array of assets and load them
 * * Trigger an event when all assets are loeaded
 *
 * Each resource in the array will be defined by an object composed
 * of the following properties
 * * name: which will be used to retrieve the loaded resource
 * * type: in order to know what loader to use
 * * path: the path(s) of the file(s) to load
 */
export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    // Options
    this.sources = sources;

    // Setup
    // loaded resources
    this.items = {};

    // the number of sources to load (this.sources.lgtnh)
    this.toLoad = this.sources.length;

    // the number of sources loaded (starts at 0)
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file)
          );
          break;
        case 'texture':
          this.loaders.textureLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file)
          );
          break;
        case 'cubeTexture':
          this.loaders.cubeTextureLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file)
          );
          break;
        default: {
          return null
        }
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger('ready');
    }
  }
}