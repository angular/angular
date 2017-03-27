// Examples with car and engine variations

// #docplaster
import { Car, Engine, Tires } from './car';

///////// example 1 ////////////
export function simpleCar() {
  // #docregion car-ctor-instantiation
  // Simple car with 4 cylinders and Flintstone tires.
  let car = new Car(new Engine(), new Tires());
  // #enddocregion car-ctor-instantiation
  car.description = 'Simple';
  return car;
}


///////// example 2 ////////////
// #docregion car-ctor-instantiation-with-param
  class Engine2 {
    constructor(public cylinders: number) { }
  }
// #enddocregion car-ctor-instantiation-with-param
export function superCar() {
// #docregion car-ctor-instantiation-with-param
  // Super car with 12 cylinders and Flintstone tires.
  let bigCylinders = 12;
  let car = new Car(new Engine2(bigCylinders), new Tires());
// #enddocregion car-ctor-instantiation-with-param
  car.description = 'Super';
  return car;
}

/////////// example 3 //////////
  // #docregion car-ctor-instantiation-with-mocks
  class MockEngine extends Engine { cylinders = 8; }
  class MockTires  extends Tires  { make = 'YokoGoodStone'; }

  // #enddocregion car-ctor-instantiation-with-mocks
export function testCar() {
  // #docregion car-ctor-instantiation-with-mocks
  // Test car with 8 cylinders and YokoGoodStone tires.
  let car = new Car(new MockEngine(), new MockTires());
  // #enddocregion car-ctor-instantiation-with-mocks
  car.description = 'Test';
  return car;
}
