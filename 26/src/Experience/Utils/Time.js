import EventEmitter from "./EventEmitter";

/**
 * This class will work a bit like the Clock class of Three.js.
 * It will save:
 * the current time.
 * the elapsed time.
 * the delta time between the current frame and the previous frame.
 */
export default class Time extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    // starting with 0 caused random bugs for Bruno Simon because delta will be 0 with the two Date.now() subtraction
    this.delsta = 16;

    window.requestAnimationFrame(() => this.tick());
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;

    this.trigger('tick');

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}