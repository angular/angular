/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {forwardRef, Inject, Injectable, InjectionToken, Injector, Optional, Provider, ReflectiveInjector, ReflectiveKey, Self} from '@angular/core';
import {ReflectiveInjector_} from '@angular/core/src/di/reflective_injector';
import {ResolvedReflectiveProvider_} from '@angular/core/src/di/reflective_provider';
import {getOriginalError} from '@angular/core/src/errors';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {stringify} from '../../src/util/stringify';

class Engine {}

class BrokenEngine {
  constructor() {
    throw new Error('Broken Engine');
  }
}

class DashboardSoftware {}

@Injectable()
class Dashboard {
  constructor(software: DashboardSoftware) {}
}

class TurboEngine extends Engine {}

@Injectable()
class Car {
  constructor(public engine: Engine) {}
}

@Injectable()
class CarWithOptionalEngine {
  constructor(@Optional() public engine: Engine) {}
}

@Injectable()
class CarWithDashboard {
  engine: Engine;
  dashboard: Dashboard;
  constructor(engine: Engine, dashboard: Dashboard) {
    this.engine = engine;
    this.dashboard = dashboard;
  }
}

@Injectable()
class SportsCar extends Car {
}

@Injectable()
class CarWithInject {
  constructor(@Inject(TurboEngine) public engine: Engine) {}
}

@Injectable()
class CyclicEngine {
  constructor(car: Car) {}
}

class NoAnnotations {
  constructor(secretDependency: any) {}
}

function factoryFn(a: any) {}

(function() {
const dynamicProviders = [
  {provide: 'provider0', useValue: 1}, {provide: 'provider1', useValue: 1},
  {provide: 'provider2', useValue: 1}, {provide: 'provider3', useValue: 1},
  {provide: 'provider4', useValue: 1}, {provide: 'provider5', useValue: 1},
  {provide: 'provider6', useValue: 1}, {provide: 'provider7', useValue: 1},
  {provide: 'provider8', useValue: 1}, {provide: 'provider9', useValue: 1},
  {provide: 'provider10', useValue: 1}
];

function createInjector(
    providers: Provider[], parent?: ReflectiveInjector|null): ReflectiveInjector_ {
  const resolvedProviders = ReflectiveInjector.resolve(providers.concat(dynamicProviders));
  if (parent != null) {
    return <ReflectiveInjector_>parent.createChildFromResolved(resolvedProviders);
  } else {
    return <ReflectiveInjector_>ReflectiveInjector.fromResolvedProviders(resolvedProviders);
  }
}

describe(`injector`, () => {
  it('should instantiate a class without dependencies', () => {
    const injector = createInjector([Engine]);
    const engine = injector.get(Engine);

    expect(engine).toBeAnInstanceOf(Engine);
  });

  it('should resolve dependencies based on type information', () => {
    const injector = createInjector([Engine, Car]);
    const car = injector.get(Car);

    expect(car).toBeAnInstanceOf(Car);
    expect(car.engine).toBeAnInstanceOf(Engine);
  });

  it('should resolve dependencies based on @Inject annotation', () => {
    const injector = createInjector([TurboEngine, Engine, CarWithInject]);
    const car = injector.get(CarWithInject);

    expect(car).toBeAnInstanceOf(CarWithInject);
    expect(car.engine).toBeAnInstanceOf(TurboEngine);
  });

  it('should throw when no type and not @Inject (class case)', () => {
    expect(() => createInjector([NoAnnotations]))
        .toThrowError(
            'Cannot resolve all parameters for \'NoAnnotations\'(?). ' +
            'Make sure that all the parameters are decorated with Inject or have valid type annotations ' +
            'and that \'NoAnnotations\' is decorated with Injectable.');
  });

  it('should throw when no type and not @Inject (factory case)', () => {
    expect(() => createInjector([{provide: 'someToken', useFactory: factoryFn}]))
        .toThrowError(
            'Cannot resolve all parameters for \'factoryFn\'(?). ' +
            'Make sure that all the parameters are decorated with Inject or have valid type annotations ' +
            'and that \'factoryFn\' is decorated with Injectable.');
  });

  it('should cache instances', () => {
    const injector = createInjector([Engine]);

    const e1 = injector.get(Engine);
    const e2 = injector.get(Engine);

    expect(e1).toBe(e2);
  });

  it('should provide to a value', () => {
    const injector = createInjector([{provide: Engine, useValue: 'fake engine'}]);

    const engine = injector.get(Engine);
    expect(engine).toEqual('fake engine');
  });

  it('should inject dependencies instance of InjectionToken', () => {
    const TOKEN = new InjectionToken<string>('token');

    const injector = createInjector([
      {provide: TOKEN, useValue: 'by token'},
      {provide: Engine, useFactory: (v: string) => v, deps: [[TOKEN]]},
    ]);

    const engine = injector.get(Engine);
    expect(engine).toEqual('by token');
  });

  it('should provide to a factory', () => {
    function sportsCarFactory(e: any) {
      return new SportsCar(e);
    }

    const injector =
        createInjector([Engine, {provide: Car, useFactory: sportsCarFactory, deps: [Engine]}]);

    const car = injector.get(Car);
    expect(car).toBeAnInstanceOf(SportsCar);
    expect(car.engine).toBeAnInstanceOf(Engine);
  });

  it('should supporting provider to null', () => {
    const injector = createInjector([{provide: Engine, useValue: null}]);
    const engine = injector.get(Engine);
    expect(engine).toBeNull();
  });

  it('should provide to an alias', () => {
    const injector = createInjector([
      Engine, {provide: SportsCar, useClass: SportsCar}, {provide: Car, useExisting: SportsCar}
    ]);

    const car = injector.get(Car);
    const sportsCar = injector.get(SportsCar);
    expect(car).toBeAnInstanceOf(SportsCar);
    expect(car).toBe(sportsCar);
  });

  it('should support multiProviders', () => {
    const injector = createInjector([
      Engine, {provide: Car, useClass: SportsCar, multi: true},
      {provide: Car, useClass: CarWithOptionalEngine, multi: true}
    ]);

    const cars = injector.get(Car);
    expect(cars.length).toEqual(2);
    expect(cars[0]).toBeAnInstanceOf(SportsCar);
    expect(cars[1]).toBeAnInstanceOf(CarWithOptionalEngine);
  });

  it('should support multiProviders that are created using useExisting', () => {
    const injector =
        createInjector([Engine, SportsCar, {provide: Car, useExisting: SportsCar, multi: true}]);

    const cars = injector.get(Car);
    expect(cars.length).toEqual(1);
    expect(cars[0]).toBe(injector.get(SportsCar));
  });

  it('should throw when the aliased provider does not exist', () => {
    const injector = createInjector([{provide: 'car', useExisting: SportsCar}]);
    const e = `No provider for ${stringify(SportsCar)}! (car -> ${stringify(SportsCar)})`;
    expect(() => injector.get('car')).toThrowError(e);
  });

  it('should handle forwardRef in useExisting', () => {
    const injector = createInjector([
      {provide: 'originalEngine', useClass: forwardRef(() => Engine)},
      {provide: 'aliasedEngine', useExisting: <any>forwardRef(() => 'originalEngine')}
    ]);
    expect(injector.get('aliasedEngine')).toBeAnInstanceOf(Engine);
  });

  it('should support overriding factory dependencies', () => {
    const injector = createInjector(
        [Engine, {provide: Car, useFactory: (e: Engine) => new SportsCar(e), deps: [Engine]}]);

    const car = injector.get(Car);
    expect(car).toBeAnInstanceOf(SportsCar);
    expect(car.engine).toBeAnInstanceOf(Engine);
  });

  it('should support optional dependencies', () => {
    const injector = createInjector([CarWithOptionalEngine]);

    const car = injector.get(CarWithOptionalEngine);
    expect(car.engine).toEqual(null);
  });

  it('should flatten passed-in providers', () => {
    const injector = createInjector([[[Engine, Car]]]);

    const car = injector.get(Car);
    expect(car).toBeAnInstanceOf(Car);
  });

  it('should use the last provider when there are multiple providers for same token', () => {
    const injector = createInjector(
        [{provide: Engine, useClass: Engine}, {provide: Engine, useClass: TurboEngine}]);

    expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
  });

  it('should use non-type tokens', () => {
    const injector = createInjector([{provide: 'token', useValue: 'value'}]);

    expect(injector.get('token')).toEqual('value');
  });

  it('should throw when given invalid providers', () => {
    expect(() => createInjector(<any>['blah']))
        .toThrowError(
            'Invalid provider - only instances of Provider and Type are allowed, got: blah');
  });

  it('should provide itself', () => {
    const parent = createInjector([]);
    const child = parent.resolveAndCreateChild([]);

    expect(child.get(Injector)).toBe(child);
  });

  it('should throw when no provider defined', () => {
    const injector = createInjector([]);
    expect(() => injector.get('NonExisting')).toThrowError('No provider for NonExisting!');
  });

  it('should show the full path when no provider', () => {
    const injector = createInjector([CarWithDashboard, Engine, Dashboard]);
    expect(() => injector.get(CarWithDashboard))
        .toThrowError(`No provider for DashboardSoftware! (${stringify(CarWithDashboard)} -> ${
            stringify(Dashboard)} -> DashboardSoftware)`);
  });

  it('should throw when trying to instantiate a cyclic dependency', () => {
    const injector = createInjector([Car, {provide: Engine, useClass: CyclicEngine}]);

    expect(() => injector.get(Car))
        .toThrowError(`Cannot instantiate cyclic dependency! (${stringify(Car)} -> ${
            stringify(Engine)} -> ${stringify(Car)})`);
  });

  it('should show the full path when error happens in a constructor', () => {
    const providers = ReflectiveInjector.resolve([Car, {provide: Engine, useClass: BrokenEngine}]);
    const injector = new ReflectiveInjector_(providers);

    try {
      injector.get(Car);
      throw 'Must throw';
    } catch (e) {
      expect(e.message).toContain(
          `Error during instantiation of Engine! (${stringify(Car)} -> Engine)`);
      expect(getOriginalError(e) instanceof Error).toBeTruthy();
      expect(e.keys[0].token).toEqual(Engine);
    }
  });

  it('should instantiate an object after a failed attempt', () => {
    let isBroken = true;

    const injector = createInjector(
        [Car, {provide: Engine, useFactory: (() => isBroken ? new BrokenEngine() : new Engine())}]);

    expect(() => injector.get(Car))
        .toThrowError('Broken Engine: Error during instantiation of Engine! (Car -> Engine).');

    isBroken = false;

    expect(injector.get(Car)).toBeAnInstanceOf(Car);
  });

  it('should support null values', () => {
    const injector = createInjector([{provide: 'null', useValue: null}]);
    expect(injector.get('null')).toBe(null);
  });
});


describe('child', () => {
  it('should load instances from parent injector', () => {
    const parent = ReflectiveInjector.resolveAndCreate([Engine]);
    const child = parent.resolveAndCreateChild([]);

    const engineFromParent = parent.get(Engine);
    const engineFromChild = child.get(Engine);

    expect(engineFromChild).toBe(engineFromParent);
  });

  it('should not use the child providers when resolving the dependencies of a parent provider',
     () => {
       const parent = ReflectiveInjector.resolveAndCreate([Car, Engine]);
       const child = parent.resolveAndCreateChild([{provide: Engine, useClass: TurboEngine}]);

       const carFromChild = child.get(Car);
       expect(carFromChild.engine).toBeAnInstanceOf(Engine);
     });

  it('should create new instance in a child injector', () => {
    const parent = ReflectiveInjector.resolveAndCreate([Engine]);
    const child = parent.resolveAndCreateChild([{provide: Engine, useClass: TurboEngine}]);

    const engineFromParent = parent.get(Engine);
    const engineFromChild = child.get(Engine);

    expect(engineFromParent).not.toBe(engineFromChild);
    expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
  });

  it('should give access to parent', () => {
    const parent = ReflectiveInjector.resolveAndCreate([]);
    const child = parent.resolveAndCreateChild([]);
    expect(child.parent).toBe(parent);
  });
});

describe('resolveAndInstantiate', () => {
  it('should instantiate an object in the context of the injector', () => {
    const inj = ReflectiveInjector.resolveAndCreate([Engine]);
    const car = inj.resolveAndInstantiate(Car);
    expect(car).toBeAnInstanceOf(Car);
    expect(car.engine).toBe(inj.get(Engine));
  });

  it('should not store the instantiated object in the injector', () => {
    const inj = ReflectiveInjector.resolveAndCreate([Engine]);
    inj.resolveAndInstantiate(Car);
    expect(() => inj.get(Car)).toThrowError();
  });
});

describe('instantiate', () => {
  it('should instantiate an object in the context of the injector', () => {
    const inj = ReflectiveInjector.resolveAndCreate([Engine]);
    const car = inj.instantiateResolved(ReflectiveInjector.resolve([Car])[0]);
    expect(car).toBeAnInstanceOf(Car);
    expect(car.engine).toBe(inj.get(Engine));
  });
});

describe('depedency resolution', () => {
  describe('@Self()', () => {
    it('should return a dependency from self', () => {
      const inj = ReflectiveInjector.resolveAndCreate([
        Engine, {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]}
      ]);

      expect(inj.get(Car)).toBeAnInstanceOf(Car);
    });

    it('should throw when not requested provider on self', () => {
      const parent = ReflectiveInjector.resolveAndCreate([Engine]);
      const child = parent.resolveAndCreateChild(
          [{provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]}]);

      expect(() => child.get(Car))
          .toThrowError(`No provider for Engine! (${stringify(Car)} -> ${stringify(Engine)})`);
    });
  });

  describe('default', () => {
    it('should not skip self', () => {
      const parent = ReflectiveInjector.resolveAndCreate([Engine]);
      const child = parent.resolveAndCreateChild([
        {provide: Engine, useClass: TurboEngine},
        {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [Engine]}
      ]);

      expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
    });
  });
});

describe('resolve', () => {
  it('should resolve and flatten', () => {
    const providers = ReflectiveInjector.resolve([Engine, [BrokenEngine]]);
    providers.forEach(function(b) {
      if (!b) return;  // the result is a sparse array
      expect(b instanceof ResolvedReflectiveProvider_).toBe(true);
    });
  });

  it('should support multi providers', () => {
    const provider = ReflectiveInjector.resolve([
      {provide: Engine, useClass: BrokenEngine, multi: true},
      {provide: Engine, useClass: TurboEngine, multi: true}
    ])[0];

    expect(provider.key.token).toBe(Engine);
    expect(provider.multiProvider).toEqual(true);
    expect(provider.resolvedFactories.length).toEqual(2);
  });


  it('should support providers as hash', () => {
    const provider = ReflectiveInjector.resolve([
      {provide: Engine, useClass: BrokenEngine, multi: true},
      {provide: Engine, useClass: TurboEngine, multi: true}
    ])[0];

    expect(provider.key.token).toBe(Engine);
    expect(provider.multiProvider).toEqual(true);
    expect(provider.resolvedFactories.length).toEqual(2);
  });

  it('should support multi providers with only one provider', () => {
    const provider =
        ReflectiveInjector.resolve([{provide: Engine, useClass: BrokenEngine, multi: true}])[0];

    expect(provider.key.token).toBe(Engine);
    expect(provider.multiProvider).toEqual(true);
    expect(provider.resolvedFactories.length).toEqual(1);
  });

  it('should throw when mixing multi providers with regular providers', () => {
    expect(() => {
      ReflectiveInjector.resolve([{provide: Engine, useClass: BrokenEngine, multi: true}, Engine]);
    }).toThrowError(/Cannot mix multi providers and regular providers/);

    expect(() => {
      ReflectiveInjector.resolve([Engine, {provide: Engine, useClass: BrokenEngine, multi: true}]);
    }).toThrowError(/Cannot mix multi providers and regular providers/);
  });

  it('should resolve forward references', () => {
    const providers = ReflectiveInjector.resolve([
      forwardRef(() => Engine),
      [{provide: forwardRef(() => BrokenEngine), useClass: forwardRef(() => Engine)}],
      {provide: forwardRef(() => String), useFactory: () => 'OK', deps: [forwardRef(() => Engine)]}
    ]);

    const engineProvider = providers[0];
    const brokenEngineProvider = providers[1];
    const stringProvider = providers[2];

    expect(engineProvider.resolvedFactories[0].factory() instanceof Engine).toBe(true);
    expect(brokenEngineProvider.resolvedFactories[0].factory() instanceof Engine).toBe(true);
    expect(stringProvider.resolvedFactories[0].dependencies[0].key)
        .toEqual(ReflectiveKey.get(Engine));
  });

  it('should support overriding factory dependencies with dependency annotations', () => {
    const providers = ReflectiveInjector.resolve([{
      provide: 'token',
      useFactory: (e: any /** TODO #9100 */) => 'result',
      deps: [[new Inject('dep')]]
    }]);

    const provider = providers[0];

    expect(provider.resolvedFactories[0].dependencies[0].key.token).toEqual('dep');
  });

  it('should allow declaring dependencies with flat arrays', () => {
    const resolved = ReflectiveInjector.resolve(
        [{provide: 'token', useFactory: (e: any) => e, deps: [new Inject('dep')]}]);
    const nestedResolved = ReflectiveInjector.resolve(
        [{provide: 'token', useFactory: (e: any) => e, deps: [[new Inject('dep')]]}]);
    expect(resolved[0].resolvedFactories[0].dependencies[0].key.token)
        .toEqual(nestedResolved[0].resolvedFactories[0].dependencies[0].key.token);
  });
});

describe('displayName', () => {
  it('should work', () => {
    expect((<ReflectiveInjector_>ReflectiveInjector.resolveAndCreate([Engine, BrokenEngine]))
               .displayName)
        .toEqual('ReflectiveInjector(providers: [ "Engine" ,  "BrokenEngine" ])');
  });
});
})();
