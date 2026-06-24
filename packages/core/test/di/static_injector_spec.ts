/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {forwardRef, Inject, Injector, Self, SkipSelf} from '../../src/core';

import {stringify} from '../../src/util/stringify';

class Engine {
  static PROVIDER = {provide: Engine, useClass: Engine, deps: []};
}

class BrokenEngine {
  static PROVIDER = {provide: Engine, useClass: BrokenEngine, deps: []};
  constructor() {
    throw new Error('Broken Engine');
  }
}

class TurboEngine extends Engine {
  static override PROVIDER = {provide: Engine, useClass: TurboEngine, deps: []};
}

class Car {
  static PROVIDER = {provide: Car, useClass: Car, deps: [Engine]};
  constructor(public engine: Engine) {}
}

class SportsCar extends Car {
  static override PROVIDER = {provide: Car, useClass: SportsCar, deps: [Engine]};
}

describe('child', () => {
  it('should load instances from parent injector', () => {
    const parent = Injector.create({providers: [Engine.PROVIDER]});
    const child = Injector.create({providers: [], parent});

    const engineFromParent = parent.get(Engine);
    const engineFromChild = child.get(Engine);

    expect(engineFromChild).toBe(engineFromParent);
  });

  it('should not use the child providers when resolving the dependencies of a parent provider', () => {
    const parent = Injector.create({providers: [Car.PROVIDER, Engine.PROVIDER]});
    const child = Injector.create({providers: [TurboEngine.PROVIDER], parent});

    const carFromChild = child.get<Car>(Car);
    expect(carFromChild.engine).toBeInstanceOf(Engine);
  });

  it('should create new instance in a child injector', () => {
    const parent = Injector.create({providers: [Engine.PROVIDER]});
    const child = Injector.create({providers: [TurboEngine.PROVIDER], parent});

    const engineFromParent = parent.get(Engine);
    const engineFromChild = child.get(Engine);

    expect(engineFromParent).not.toBe(engineFromChild);
    expect(engineFromChild).toBeInstanceOf(TurboEngine);
  });

  it('should give access to parent', () => {
    const parent = Injector.create({providers: []});
    const child = Injector.create({providers: [], parent});
    expect((child as any).parent).toBe(parent);
  });
});

describe('instantiate', () => {
  it('should instantiate an object in the context of the injector', () => {
    const inj = Injector.create({providers: [Engine.PROVIDER]});
    const childInj = Injector.create({providers: [Car.PROVIDER], parent: inj});
    const car = childInj.get<Car>(Car);
    expect(car).toBeInstanceOf(Car);
    expect(car.engine).toBe(inj.get(Engine));
  });
});

describe('dependency resolution', () => {
  describe('@Self()', () => {
    it('should return a dependency from self', () => {
      const inj = Injector.create({
        providers: [
          Engine.PROVIDER,
          {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]},
        ],
      });

      expect(inj.get(Car)).toBeInstanceOf(Car);
    });

    it('should throw when not requested provider on self', () => {
      const parent = Injector.create({providers: [Engine.PROVIDER]});
      const child = Injector.create({
        providers: [
          {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]},
        ],
        parent,
      });

      expect(() => child.get(Car)).toThrowError(
        'NG0201: No provider found for `Engine`. ' +
          'Path: Car -> Engine. ' +
          'Find more at https://angular.dev/errors/NG0201',
      );
    });

    it('should return a default value when not requested provider on self', () => {
      const car = new SportsCar(new Engine());
      const injector = Injector.create({providers: []});
      expect(injector.get<Car | null>(Car, null, {self: true})).toBeNull();
      expect(injector.get<Car>(Car, car, {self: true})).toBe(car);
    });

    it('should return a default value when not requested provider on self and optional', () => {
      const injector = Injector.create({providers: []});
      expect(injector.get<Car | null>(Car, null, {self: true})).toBeNull();
      expect(injector.get<Car | number>(Car, 0, {self: true, optional: true})).toBe(0);
    });

    it(`should return null when not requested provider on self and optional`, () => {
      const injector = Injector.create({providers: []});
      expect(injector.get<Car | null>(Car, undefined, {self: true, optional: true})).toBeNull();
    });

    it('should throw error when not requested provider on self', () => {
      const injector = Injector.create({providers: []});
      expect(() => injector.get(Car, undefined, {self: true})).toThrowError(
        'NG0201: No provider found for `Car`. ' + 'Find more at https://angular.dev/errors/NG0201',
      );
    });
  });

  describe('default', () => {
    it('should skip self', () => {
      const parent = Injector.create({providers: [Engine.PROVIDER]});
      const child = Injector.create({
        providers: [
          TurboEngine.PROVIDER,
          {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[SkipSelf, Engine]]},
        ],
        parent,
      });

      expect(child.get<Car>(Car).engine).toBeInstanceOf(Engine);
    });
  });
});

describe('resolve', () => {
  it('should throw when mixing multi providers with regular providers', () => {
    expect(() => {
      Injector.create([
        {provide: Engine, useClass: BrokenEngine, deps: [], multi: true},
        Engine.PROVIDER,
      ]);
    }).toThrowError(/Cannot mix multi providers and regular providers/);

    expect(() => {
      Injector.create([
        Engine.PROVIDER,
        {provide: Engine, useClass: BrokenEngine, deps: [], multi: true},
      ]);
    }).toThrowError(/Cannot mix multi providers and regular providers/);
  });

  it('should resolve forward references', () => {
    const injector = Injector.create({
      providers: [
        [{provide: forwardRef(() => BrokenEngine), useClass: forwardRef(() => Engine), deps: []}],
        {
          provide: forwardRef(() => String),
          useFactory: (e: any) => e,
          deps: [forwardRef(() => BrokenEngine)],
        },
      ],
    });
    expect(injector.get(String)).toBeInstanceOf(Engine);
    expect(injector.get(BrokenEngine)).toBeInstanceOf(Engine);
  });

  it('should support overriding factory dependencies with dependency annotations', () => {
    const injector = Injector.create({
      providers: [
        Engine.PROVIDER,
        {provide: 'token', useFactory: (e: any) => e, deps: [[new Inject(Engine)]]},
      ],
    });

    expect(injector.get('token')).toBeInstanceOf(Engine);
  });
});

describe('displayName', () => {
  it('should work', () => {
    expect(
      Injector.create({
        providers: [Engine.PROVIDER, {provide: BrokenEngine, useValue: null}],
      }).toString(),
    ).toEqual(
      'R3Injector[Engine, BrokenEngine, InjectionToken INJECTOR, InjectionToken INJECTOR_DEF_TYPES, InjectionToken ENVIRONMENT_INITIALIZER]',
    );
  });
});
