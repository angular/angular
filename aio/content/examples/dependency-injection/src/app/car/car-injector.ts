import { Injector } from '@angular/core';

import { Car, Engine, Tires } from './car';
import { Logger }             from '../logger.service';

// #docregion injector
export function useInjector() {
  let injector: Injector;
  // #enddocregion injector
  /*
  // #docregion injector-no-new
  // Cannot instantiate an Injector like this!
  let injector = new Injector([
    { provide: Car, deps: [Engine, Tires] },
    { provide: Engine, deps: [] },
    { provide: Tires, deps: [] }
  ]);
  // #enddocregion injector-no-new
  */
  // #docregion injector, injector-create-and-call
  injector = Injector.create({
    providers: [
      { provide: Car, deps: [Engine, Tires] },
      { provide: Engine, deps: [] },
      { provide: Tires, deps: [] }
    ]
  });
  // #docregion injector-call
  let car = injector.get(Car);
  // #enddocregion injector-call, injector-create-and-call
  car.description = 'Injector';

  injector = Injector.create({
    providers: [{ provide: Logger, deps: [] }]
  });
  let logger = injector.get(Logger);
  logger.log('Injector car.drive() said: ' + car.drive());
  return car;
}
