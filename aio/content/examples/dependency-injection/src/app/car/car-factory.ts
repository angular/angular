// #docregion
import { Engine, Tires, Car } from './car';

// 안좋은 패턴!
export class CarFactory {
  createCar() {
    const car = new Car(this.createEngine(), this.createTires());
    car.description = 'Factory';
    return car;
  }

  createEngine() {
    return new Engine();
  }

  createTires() {
    return new Tires();
  }
}
