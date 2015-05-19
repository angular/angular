import {isBlank, BaseException, stringify} from 'angular2/src/facade/lang';
import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {
  Injector,
  bind,
  ResolvedBinding,
  Key,
  forwardRef,
  DependencyAnnotation,
  Injectable
} from 'angular2/di';
import {Optional, Inject, InjectLazy} from 'angular2/src/di/decorators';
import * as ann from 'angular2/src/di/annotations_impl';

class CustomDependencyAnnotation extends DependencyAnnotation {}

class Engine {}

class BrokenEngine {
  constructor() { throw new BaseException("Broken Engine"); }
}

class DashboardSoftware {}

@Injectable()
class Dashboard {
  constructor(software: DashboardSoftware) {}
}

class TurboEngine extends Engine {}

@Injectable()
class Car {
  engine: Engine;
  constructor(engine: Engine) { this.engine = engine; }
}

@Injectable()
class CarWithLazyEngine {
  engineFactory;
  constructor(@InjectLazy(Engine) engineFactory) { this.engineFactory = engineFactory; }
}

@Injectable()
class CarWithOptionalEngine {
  engine;
  constructor(@Optional() engine: Engine) { this.engine = engine; }
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
  engine: Engine;
  constructor(engine: Engine) { super(engine); }
}

@Injectable()
class CarWithInject {
  engine: Engine;
  constructor(@Inject(TurboEngine) engine: Engine) { this.engine = engine; }
}

@Injectable()
class CyclicEngine {
  constructor(car: Car) {}
}

class NoAnnotations {
  constructor(secretDependency) {}
}

export function main() {
  describe('injector', () => {

    it('should instantiate a class without dependencies', () => {
      var injector = Injector.resolveAndCreate([Engine]);
      var engine = injector.get(Engine);

      expect(engine).toBeAnInstanceOf(Engine);
    });

    it('should resolve dependencies based on type information', () => {
      var injector = Injector.resolveAndCreate([Engine, Car]);
      var car = injector.get(Car);

      expect(car).toBeAnInstanceOf(Car);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });

    it('should resolve dependencies based on @Inject annotation', () => {
      var injector = Injector.resolveAndCreate([TurboEngine, Engine, CarWithInject]);
      var car = injector.get(CarWithInject);

      expect(car).toBeAnInstanceOf(CarWithInject);
      expect(car.engine).toBeAnInstanceOf(TurboEngine);
    });

    it('should throw when no type and not @Inject', () => {
      expect(() => Injector.resolveAndCreate([NoAnnotations]))
          .toThrowError('Cannot resolve all parameters for NoAnnotations(?). ' +
                        'Make sure they all have valid type or annotations.');
    });

    it('should cache instances', () => {
      var injector = Injector.resolveAndCreate([Engine]);

      var e1 = injector.get(Engine);
      var e2 = injector.get(Engine);

      expect(e1).toBe(e2);
    });

    it('should bind to a value', () => {
      var injector = Injector.resolveAndCreate([bind(Engine).toValue("fake engine")]);

      var engine = injector.get(Engine);
      expect(engine).toEqual("fake engine");
    });

    it('should bind to a factory', () => {
      function sportsCarFactory(e) { return new SportsCar(e); }

      var injector =
          Injector.resolveAndCreate([Engine, bind(Car).toFactory(sportsCarFactory, [Engine])]);

      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });

    it('should bind to an alias', () => {
      var injector = Injector.resolveAndCreate(
          [Engine, bind(SportsCar).toClass(SportsCar), bind(Car).toAlias(SportsCar)]);

      var car = injector.get(Car);
      var sportsCar = injector.get(SportsCar);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car).toBe(sportsCar);
    });

    it('should throw when the aliased binding does not exist', () => {
      var injector = Injector.resolveAndCreate([bind('car').toAlias(SportsCar)]);
      var e = `No provider for ${stringify(SportsCar)}! (car -> ${stringify(SportsCar)})`;
      expect(() => injector.get('car')).toThrowError(e);
    });

    it('should throw with a meaningful message when the aliased binding is blank', () => {
      expect(() => bind('car').toAlias(null)).toThrowError('Can not alias car to a blank value!');
    });

    it('should handle forwardRef in toAlias', () => {
      var injector = Injector.resolveAndCreate([
        bind('originalEngine')
            .toClass(forwardRef(() => Engine)),
        bind('aliasedEngine').toAlias(forwardRef(() => 'originalEngine'))
      ]);
      expect(injector.get('aliasedEngine')).toBeAnInstanceOf(Engine);
    });

    it('should support overriding factory dependencies', () => {
      var injector = Injector.resolveAndCreate(
          [Engine, bind(Car).toFactory((e) => new SportsCar(e), [Engine])]);

      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });

    it('should support optional dependencies', () => {
      var injector = Injector.resolveAndCreate([CarWithOptionalEngine]);

      var car = injector.get(CarWithOptionalEngine);
      expect(car.engine).toEqual(null);
    });

    it("should flatten passed-in bindings", () => {
      var injector = Injector.resolveAndCreate([[[Engine, Car]]]);

      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(Car);
    });

    it("should use the last binding when there are multiple bindings for same token", () => {
      var injector = Injector.resolveAndCreate(
          [bind(Engine).toClass(Engine), bind(Engine).toClass(TurboEngine)]);

      expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
    });

    it('should use non-type tokens', () => {
      var injector = Injector.resolveAndCreate([bind('token').toValue('value')]);

      expect(injector.get('token')).toEqual('value');
    });

    it('should throw when given invalid bindings', () => {
      expect(() => Injector.resolveAndCreate(<any>["blah"]))
          .toThrowError(
              'Invalid binding - only instances of Binding and Type are allowed, got: blah');
      expect(() => Injector.resolveAndCreate(<any>[bind("blah")]))
          .toThrowError('Invalid binding - only instances of Binding and Type are allowed, ' +
                        'got: blah');
    });

    it('should provide itself', () => {
      var parent = Injector.resolveAndCreate([]);
      var child = parent.resolveAndCreateChild([]);

      expect(child.get(Injector)).toBe(child);
    });

    it('should throw when no provider defined', () => {
      var injector = Injector.resolveAndCreate([]);
      expect(() => injector.get('NonExisting')).toThrowError('No provider for NonExisting!');
    });

    it('should show the full path when no provider', () => {
      var injector = Injector.resolveAndCreate([CarWithDashboard, Engine, Dashboard]);
      expect(() => injector.get(CarWithDashboard))
          .toThrowError(
              `No provider for DashboardSoftware! (${stringify(CarWithDashboard)} -> ${stringify(Dashboard)} -> DashboardSoftware)`);
    });

    it('should throw when trying to instantiate a cyclic dependency', () => {
      var injector = Injector.resolveAndCreate([Car, bind(Engine).toClass(CyclicEngine)]);

      expect(() => injector.get(Car))
          .toThrowError(
              `Cannot instantiate cyclic dependency! (${stringify(Car)} -> ${stringify(Engine)} -> ${stringify(Car)})`);

      expect(() => injector.asyncGet(Car))
          .toThrowError(
              `Cannot instantiate cyclic dependency! (${stringify(Car)} -> ${stringify(Engine)} -> ${stringify(Car)})`);
    });

    it('should show the full path when error happens in a constructor', () => {
      var injector = Injector.resolveAndCreate([Car, bind(Engine).toClass(BrokenEngine)]);

      try {
        injector.get(Car);
        throw "Must throw";
      } catch (e) {
        expect(e.message)
            .toContain(`Error during instantiation of Engine! (${stringify(Car)} -> Engine)`);
        expect(e.cause instanceof BaseException).toBeTruthy();
        expect(e.causeKey.token).toEqual(Engine);
      }
    });

    it('should instantiate an object after a failed attempt', () => {
      var isBroken = true;

      var injector = Injector.resolveAndCreate(
          [Car, bind(Engine).toFactory(() => isBroken ? new BrokenEngine() : new Engine())]);

      expect(() => injector.get(Car)).toThrowError(new RegExp("Error"));

      isBroken = false;

      expect(injector.get(Car)).toBeAnInstanceOf(Car);
    });

    it('should support null values', () => {
      var injector = Injector.resolveAndCreate([bind('null').toValue(null)]);
      expect(injector.get('null')).toBe(null);
    });

    describe("default bindings", () => {
      it("should be used when no matching binding found", () => {
        var injector = Injector.resolveAndCreate([], {defaultBindings: true});

        var car = injector.get(Car);

        expect(car).toBeAnInstanceOf(Car);
      });

      it("should use the matching binding when it is available", () => {
        var injector =
            Injector.resolveAndCreate([bind(Car).toClass(SportsCar)], {defaultBindings: true});

        var car = injector.get(Car);

        expect(car).toBeAnInstanceOf(SportsCar);
      });
    });

    describe("child", () => {
      it('should load instances from parent injector', () => {
        var parent = Injector.resolveAndCreate([Engine]);
        var child = parent.resolveAndCreateChild([]);

        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);

        expect(engineFromChild).toBe(engineFromParent);
      });

      it("should not use the child bindings when resolving the dependencies of a parent binding",
         () => {
           var parent = Injector.resolveAndCreate([Car, Engine]);
           var child = parent.resolveAndCreateChild([bind(Engine).toClass(TurboEngine)]);

           var carFromChild = child.get(Car);
           expect(carFromChild.engine).toBeAnInstanceOf(Engine);
         });

      it('should create new instance in a child injector', () => {
        var parent = Injector.resolveAndCreate([Engine]);
        var child = parent.resolveAndCreateChild([bind(Engine).toClass(TurboEngine)]);

        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);

        expect(engineFromParent).not.toBe(engineFromChild);
        expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
      });

      it("should create child injectors without default bindings", () => {
        var parent = Injector.resolveAndCreate([], {defaultBindings: true});
        var child = parent.resolveAndCreateChild([]);

        // child delegates to parent the creation of Car
        var childCar = child.get(Car);
        var parentCar = parent.get(Car);

        expect(childCar).toBe(parentCar);
      });

      it("should give access to direct parent", () => {
        var parent = Injector.resolveAndCreate([]);
        var child = parent.resolveAndCreateChild([]);
        expect(child.parent).toBe(parent);
      });
    });

    describe("lazy", () => {
      it("should create dependencies lazily", () => {
        var injector = Injector.resolveAndCreate([Engine, CarWithLazyEngine]);

        var car = injector.get(CarWithLazyEngine);
        expect(car.engineFactory()).toBeAnInstanceOf(Engine);
      });

      it("should cache instance created lazily", () => {
        var injector = Injector.resolveAndCreate([Engine, CarWithLazyEngine]);

        var car = injector.get(CarWithLazyEngine);
        var e1 = car.engineFactory();
        var e2 = car.engineFactory();

        expect(e1).toBe(e2);
      });
    });

    describe('resolve', () => {
      it('should resolve and flatten', () => {
        var bindings = Injector.resolve([Engine, [BrokenEngine]]);
        bindings.forEach(function(b) {
          if (isBlank(b)) return;  // the result is a sparse array
          expect(b instanceof ResolvedBinding).toBe(true);
        });
      });

      it('should resolve forward references', () => {
        var bindings = Injector.resolve([
          forwardRef(() => Engine),
          [bind(forwardRef(() => BrokenEngine)).toClass(forwardRef(() => Engine))],
          bind(forwardRef(() => String)).toFactory(() => 'OK', [forwardRef(() => Engine)]),
          bind(forwardRef(() => DashboardSoftware))
              .toAsyncFactory(() => 123, [forwardRef(() => BrokenEngine)])
        ]);

        var engineBinding = bindings[Key.get(Engine).id];
        var brokenEngineBinding = bindings[Key.get(BrokenEngine).id];
        var stringBinding = bindings[Key.get(String).id];
        var dashboardSoftwareBinding = bindings[Key.get(DashboardSoftware).id];

        expect(engineBinding.factory() instanceof Engine).toBe(true);
        expect(brokenEngineBinding.factory() instanceof Engine).toBe(true);
        expect(stringBinding.dependencies[0].key).toEqual(Key.get(Engine));
        expect(dashboardSoftwareBinding.dependencies[0].key).toEqual(Key.get(BrokenEngine));
      });

      it('should support overriding factory dependencies with dependency annotations', () => {
        var bindings = Injector.resolve([
          bind("token")
              .toFactory((e) => "result",
                         [[new ann.Inject("dep"), new CustomDependencyAnnotation()]])
        ]);
        var binding = bindings[Key.get("token").id];

        expect(binding.dependencies[0].key.token).toEqual("dep");
        expect(binding.dependencies[0].properties).toEqual([new CustomDependencyAnnotation()]);
      });
    });
  });
}
