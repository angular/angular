// Car without DI
import {Engine, Tires} from './car';
export class Car {
  engine;
  tires;
  description = 'No DI';
  constructor() {
    this.engine = new Engine();
    this.tires = new Tires();
  }
  // Method using the engine and tires
  drive() {
    return (
      `${this.description} car with ` +
      `${this.engine.cylinders} cylinders and ${this.tires.make} tires.`
    );
  }
}
//# sourceMappingURL=car-no-di.js.map
