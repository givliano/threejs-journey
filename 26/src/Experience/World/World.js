import Environment from './Environment';
import Experience from '../Experience';
import Floor from './Floor';
import Fox from './Fox';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor();
      this.fox = new Fox();
      // Load environment for last so that it is applied for everything in the scene
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }
  }
}