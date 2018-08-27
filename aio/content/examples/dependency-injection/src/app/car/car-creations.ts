// Examples with car and engine variations

// #docplaster
import { Car, Engine, Tires } from './car';

///////// example 1 ////////////
export function simpleCar() {
  // #docregion car-ctor-instantiation
  // 4 실린더 엔진과 기본 타이어를 사용하는 자동차 생성하기
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
  // 12 실린더 엔진과 기본 타이어를 사용하는 슈퍼카 생성하기
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
  // 8 실린더 엔진과 YokoGoodStone 메이커의 타이어를 사용하는 테스트카 생성하기
  let car = new Car(new MockEngine(), new MockTires());
  // #enddocregion car-ctor-instantiation-with-mocks
  car.description = 'Test';
  return car;
}
