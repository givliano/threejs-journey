import EventEmitter from './EventEmitter';
/**
 * Handle the sizes of the experience
 * It'll include the width, the height and the puxel ration
 */
export default class Sizes extends EventEmitter {
  constructor() {
    super();
    // Make the Experience fill the viewport
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Resize event
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.trigger('resize');
    });
  }
}

