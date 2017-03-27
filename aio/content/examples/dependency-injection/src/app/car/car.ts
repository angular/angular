import { Injectable } from '@angular/core';

export class Engine {
  public cylinders = 4;
}

export class Tires {
  public make  = 'Flintstone';
  public model = 'Square';
}

@Injectable()
export class Car {
  // #docregion car-ctor
  public description = 'DI';

  constructor(public engine: Engine, public tires: Tires) { }
  // #enddocregion car-ctor

  // Method using the engine and tires
  drive() {
    return `${this.description} car with ` +
      `${this.engine.cylinders} cylinders and ${this.tires.make} tires.`;
  }
}
