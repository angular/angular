// #docregion
import { Component } from '@angular/core';

import { Car, Engine, Tires } from './car';
import { Car as CarNoDi } from './car-no-di';
import { CarFactory } from './car-factory';

import { testCar,
         simpleCar,
         superCar } from './car-creations';

import { useInjector } from './car-injector';


@Component({
  selector: 'app-car',
  template: `
  <h2>Cars</h2>
  <div id="di">{{car.drive()}}</div>
  <div id="nodi">{{noDiCar.drive()}}</div>
  <div id="injector">{{injectorCar.drive()}}</div>
  <div id="factory">{{factoryCar.drive()}}</div>
  <div id="simple">{{simpleCar.drive()}}</div>
  <div id="super">{{superCar.drive()}}</div>
  <div id="test">{{testCar.drive()}}</div>
  `,
  providers: [Car, Engine, Tires]
})
export class CarComponent {
  factoryCar  = (new CarFactory()).createCar();
  injectorCar = useInjector();
  noDiCar     = new CarNoDi();
  simpleCar   = simpleCar();
  superCar    = superCar();
  testCar     = testCar();

  constructor(public car: Car) {}
}
