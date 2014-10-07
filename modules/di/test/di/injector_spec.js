import {describe, ddescribe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {Injector, Inject, InjectLazy, bind} from 'di/di';

class Engine {
}

class BrokenEngine {
  constructor() {
    throw "Broken Engine";
  }
}

class DashboardSoftware {
}

class Dashboard {
  constructor(software: DashboardSoftware) {}
}

class TurboEngine extends Engine {
}

class Car {
  constructor(engine:Engine) {
    this.engine = engine;
  }
}

class CarWithLazyEngine {
  constructor(@InjectLazy(Engine) engineFactory) {
    this.engineFactory = engineFactory;
  }
}

class CarWithDashboard {
  constructor(engine:Engine, dashboard:Dashboard) {
    this.engine = engine;
    this.dashboard = dashboard;
  }
}

class SportsCar extends Car {
  constructor(engine:Engine) {
    super(engine);
  }
}

class CarWithInject {
  constructor(@Inject(TurboEngine) engine:Engine) {
    this.engine = engine;
  }
}

class CyclicEngine {
  constructor(car:Car) {}
}

class NoAnnotations {
  constructor(secretDependency) {}
}

export function main() {
  describe('injector', function () {
    it('should instantiate a class without dependencies', function () {
      var injector = new Injector([Engine]);
      var engine = injector.get(Engine);

      expect(engine).toBeAnInstanceOf(Engine);
    });

    it('should resolve dependencies based on type information', function () {
      var injector = new Injector([Engine, Car]);
      var car = injector.get(Car);

      expect(car).toBeAnInstanceOf(Car);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });

    it('should resolve dependencies based on @Inject annotation', function () {
      var injector = new Injector([TurboEngine, Engine, CarWithInject]);
      var car = injector.get(CarWithInject);

      expect(car).toBeAnInstanceOf(CarWithInject);
      expect(car.engine).toBeAnInstanceOf(TurboEngine);
    });

    it('should throw when no type and not @Inject', function () {
      expect(() => new Injector([NoAnnotations])).toThrowError(
        'Cannot resolve all parameters for NoAnnotations');
    });

    it('should cache instances', function () {
      var injector = new Injector([Engine]);

      var e1 = injector.get(Engine);
      var e2 = injector.get(Engine);

      expect(e1).toBe(e2);
    });

    it('should bind to a value', function () {
      var injector = new Injector([
        bind(Engine).toValue("fake engine")
      ]);

      var engine = injector.get(Engine);
      expect(engine).toEqual("fake engine");
    });

    it('should bind to a factory', function () {
      var injector = new Injector([
        Engine,
        bind(Car).toFactory([Engine], (e) => new SportsCar(e))
      ]);

      var car = injector.get(Car);
      expect(car).toBeAnInstanceOf(SportsCar);
      expect(car.engine).toBeAnInstanceOf(Engine);
    });

    it('should use non-type tokens', function () {
      var injector = new Injector([
        bind('token').toValue('value')
      ]);

      expect(injector.get('token')).toEqual('value');
    });

    it('should throw when given invalid bindings', function () {
      expect(() => new Injector(["blah"])).toThrowError('Invalid binding blah');
      expect(() => new Injector([bind("blah")])).toThrowError('Invalid binding blah');
    });

    it('should provide itself', function () {
      var parent = new Injector([]);
      var child = parent.createChild([]);

      expect(child.get(Injector)).toBe(child);
    });

    it('should throw when no provider defined', function () {
      var injector = new Injector([]);
      expect(() => injector.get('NonExisting')).toThrowError('No provider for NonExisting!');
    });

    it('should show the full path when no provider', function () {
      var injector = new Injector([CarWithDashboard, Engine, Dashboard]);
      expect(() => injector.get(CarWithDashboard)).
        toThrowError('No provider for DashboardSoftware! (CarWithDashboard -> Dashboard -> DashboardSoftware)');
    });

    it('should throw when trying to instantiate a cyclic dependency', function () {
      var injector = new Injector([
        Car,
        bind(Engine).toClass(CyclicEngine)
      ]);

      expect(() => injector.get(Car))
        .toThrowError('Cannot instantiate cyclic dependency! (Car -> Engine -> Car)');

      expect(() => injector.asyncGet(Car))
        .toThrowError('Cannot instantiate cyclic dependency! (Car -> Engine -> Car)');
    });

    it('should show the full path when error happens in a constructor', function () {
      var injector = new Injector([
        Car,
        bind(Engine).toClass(BrokenEngine)
      ]);

      try {
        injector.get(Car);
        throw "Must throw";
      } catch (e) {
        expect(e.message).toContain("Error during instantiation of Engine! (Car -> Engine)");
      }
    });


    describe("child", function () {
      it('should load instances from parent injector', function () {
        var parent = new Injector([Engine]);
        var child = parent.createChild([]);

        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);

        expect(engineFromChild).toBe(engineFromParent);
      });

      it('should create new instance in a child injector', function () {
        var parent = new Injector([Engine]);
        var child = parent.createChild([
          bind(Engine).toClass(TurboEngine)
        ]);

        var engineFromParent = parent.get(Engine);
        var engineFromChild = child.get(Engine);

        expect(engineFromParent).not.toBe(engineFromChild);
        expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
      });
    });

    describe("lazy", function () {
      it("should create dependencies lazily", function () {
        var injector = new Injector([
          Engine,
          CarWithLazyEngine
        ]);

        var car = injector.get(CarWithLazyEngine);
        expect(car.engineFactory()).toBeAnInstanceOf(Engine);
      });

      it("should cache instance created lazily", function () {
        var injector = new Injector([
          Engine,
          CarWithLazyEngine
        ]);

        var car = injector.get(CarWithLazyEngine);
        var e1 = car.engineFactory();
        var e2 = car.engineFactory();

        expect(e1).toBe(e2);
      });
    });
  });
}