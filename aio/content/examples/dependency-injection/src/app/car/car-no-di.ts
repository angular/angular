// Car without DI
import { Engine, Tires } from './car';

// #docregion car
export class Car {

  // #docregion car-ctor
  public engine: Engine;
  public tires: Tires;
  public description = 'No DI';

  constructor() {
    this.engine = new Engine();
    this.tires = new Tires();
  }
  // #enddocregion car-ctor

  // Method using the engine and tires
  drive() {
    return `${this.description} car with ` +
      `${this.engine.cylinders} cylinders and ${this.tires.make} tires.`;
  }
}
// #enddocregion car
