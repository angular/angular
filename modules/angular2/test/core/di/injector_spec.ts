import {isBlank, BaseException, stringify} from 'angular2/src/core/facade/lang';
import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {SpyDependencyProvider} from '../spies';
import {
  Injector,
  ProtoInjector,
  bind,
  ResolvedBinding,
  Key,
  forwardRef,
  DependencyMetadata,
  Injectable,
  InjectMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata,
  Optional,
  Inject,
  BindingWithVisibility,
  Visibility,
  Binding
} from 'angular2/core';

import {InjectorInlineStrategy, InjectorDynamicStrategy} from 'angular2/src/core/di/injector';

class CustomDependencyMetadata extends DependencyMetadata {}

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
  var dynamicBindings = [
    bind('binding0')
        .toValue(1),
    bind('binding1').toValue(1),
    bind('binding2').toValue(1),
    bind('binding3').toValue(1),
    bind('binding4').toValue(1),
    bind('binding5').toValue(1),
    bind('binding6').toValue(1),
    bind('binding7').toValue(1),
    bind('binding8').toValue(1),
    bind('binding9').toValue(1),
    bind('binding10').toValue(1)
  ];

  [{strategy: 'inline', bindings: [], strategyClass: InjectorInlineStrategy},
   {
     strategy: 'dynamic',
     bindings: dynamicBindings,
     strategyClass: InjectorDynamicStrategy
   }].forEach((context) => {
    function createInjector(bindings: any[], dependencyProvider = null) {
      return Injector.resolveAndCreate(bindings.concat(context['bindings']), dependencyProvider);
    }

    describe(`injector ${context['strategy']}`, () => {
      it("should use the right strategy", () => {
        var injector = createInjector([]);
        expect(injector.internalStrategy).toBeAnInstanceOf(context['strategyClass']);
      });

      it('should instantiate a class without dependencies', () => {
        var injector = createInjector([Engine]);
        var engine = injector.get(Engine);

        expect(engine).toBeAnInstanceOf(Engine);
      });

      it('should resolve dependencies based on type information', () => {
        var injector = createInjector([Engine, Car]);
        var car = injector.get(Car);

        expect(car).toBeAnInstanceOf(Car);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should resolve dependencies based on @Inject annotation', () => {
        var injector = createInjector([TurboEngine, Engine, CarWithInject]);
        var car = injector.get(CarWithInject);

        expect(car).toBeAnInstanceOf(CarWithInject);
        expect(car.engine).toBeAnInstanceOf(TurboEngine);
      });

      it('should throw when no type and not @Inject', () => {
        expect(() => createInjector([NoAnnotations]))
            .toThrowError('Cannot resolve all parameters for NoAnnotations(?). ' +
                          'Make sure they all have valid type or annotations.');
      });

      it('should cache instances', () => {
        var injector = createInjector([Engine]);

        var e1 = injector.get(Engine);
        var e2 = injector.get(Engine);

        expect(e1).toBe(e2);
      });

      it('should bind to a value', () => {
        var injector = createInjector([bind(Engine).toValue("fake engine")]);

        var engine = injector.get(Engine);
        expect(engine).toEqual("fake engine");
      });

      it('should bind to a factory', () => {
        function sportsCarFactory(e) { return new SportsCar(e); }

        var injector = createInjector([Engine, bind(Car).toFactory(sportsCarFactory, [Engine])]);

        var car = injector.get(Car);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should supporting binding to null', () => {
        var injector = createInjector([bind(Engine).toValue(null)]);
        var engine = injector.get(Engine);
        expect(engine).toBeNull();
      });

      it('should bind to an alias', () => {
        var injector = createInjector(
            [Engine, bind(SportsCar).toClass(SportsCar), bind(Car).toAlias(SportsCar)]);

        var car = injector.get(Car);
        var sportsCar = injector.get(SportsCar);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car).toBe(sportsCar);
      });

      it('should support multibindings', () => {
        var injector = createInjector([
          Engine,
          new Binding(Car, {toClass: SportsCar, multi: true}),
          new Binding(Car, {toClass: CarWithOptionalEngine, multi: true})
        ]);

        var cars = injector.get(Car);
        expect(cars.length).toEqual(2);
        expect(cars[0]).toBeAnInstanceOf(SportsCar);
        expect(cars[1]).toBeAnInstanceOf(CarWithOptionalEngine);
      });

      it('should support multibindings that are created using toAlias', () => {
        var injector = createInjector(
            [Engine, SportsCar, new Binding(Car, {toAlias: SportsCar, multi: true})]);

        var cars = injector.get(Car);
        expect(cars.length).toEqual(1);
        expect(cars[0]).toBe(injector.get(SportsCar));
      });

      it('should throw when the aliased binding does not exist', () => {
        var injector = createInjector([bind('car').toAlias(SportsCar)]);
        var e = `No provider for ${stringify(SportsCar)}! (car -> ${stringify(SportsCar)})`;
        expect(() => injector.get('car')).toThrowError(e);
      });

      it('should throw with a meaningful message when the aliased binding is blank', () => {
        expect(() => bind('car').toAlias(null)).toThrowError('Can not alias car to a blank value!');
      });

      it('should handle forwardRef in toAlias', () => {
        var injector = createInjector([
          bind('originalEngine')
              .toClass(forwardRef(() => Engine)),
          bind('aliasedEngine').toAlias(<any>forwardRef(() => 'originalEngine'))
        ]);
        expect(injector.get('aliasedEngine')).toBeAnInstanceOf(Engine);
      });

      it('should support overriding factory dependencies', () => {
        var injector =
            createInjector([Engine, bind(Car).toFactory((e) => new SportsCar(e), [Engine])]);

        var car = injector.get(Car);
        expect(car).toBeAnInstanceOf(SportsCar);
        expect(car.engine).toBeAnInstanceOf(Engine);
      });

      it('should support optional dependencies', () => {
        var injector = createInjector([CarWithOptionalEngine]);

        var car = injector.get(CarWithOptionalEngine);
        expect(car.engine).toEqual(null);
      });

      it("should flatten passed-in bindings", () => {
        var injector = createInjector([[[Engine, Car]]]);

        var car = injector.get(Car);
        expect(car).toBeAnInstanceOf(Car);
      });

      it("should use the last binding when there are multiple bindings for same token", () => {
        var injector =
            createInjector([bind(Engine).toClass(Engine), bind(Engine).toClass(TurboEngine)]);

        expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
      });

      it('should use non-type tokens', () => {
        var injector = createInjector([bind('token').toValue('value')]);

        expect(injector.get('token')).toEqual('value');
      });

      it('should throw when given invalid bindings', () => {
        expect(() => createInjector(<any>["blah"]))
            .toThrowError(
                'Invalid binding - only instances of Binding and Type are allowed, got: blah');
        expect(() => createInjector(<any>[bind("blah")]))
            .toThrowError('Invalid binding - only instances of Binding and Type are allowed, ' +
                          'got: blah');
      });

      it('should provide itself', () => {
        var parent = createInjector([]);
        var child = parent.resolveAndCreateChild([]);

        expect(child.get(Injector)).toBe(child);
      });

      it('should throw when no provider defined', () => {
        var injector = createInjector([]);
        expect(() => injector.get('NonExisting')).toThrowError('No provider for NonExisting!');
      });

      it('should show the full path when no provider', () => {
        var injector = createInjector([CarWithDashboard, Engine, Dashboard]);
        expect(() => injector.get(CarWithDashboard))
            .toThrowError(
                `No provider for DashboardSoftware! (${stringify(CarWithDashboard)} -> ${stringify(Dashboard)} -> DashboardSoftware)`);
      });

      it('should throw when trying to instantiate a cyclic dependency', () => {
        var injector = createInjector([Car, bind(Engine).toClass(CyclicEngine)]);

        expect(() => injector.get(Car))
            .toThrowError(
                `Cannot instantiate cyclic dependency! (${stringify(Car)} -> ${stringify(Engine)} -> ${stringify(Car)})`);
      });

      it('should show the full path when error happens in a constructor', () => {
        var bindings = Injector.resolve([Car, bind(Engine).toClass(BrokenEngine)]);
        var proto = new ProtoInjector([
          new BindingWithVisibility(bindings[0], Visibility.Public),
          new BindingWithVisibility(bindings[1], Visibility.Public)
        ]);
        var injector = new Injector(proto, null, null);

        try {
          injector.get(Car);
          throw "Must throw";
        } catch (e) {
          expect(e.message)
              .toContain(`Error during instantiation of Engine! (${stringify(Car)} -> Engine)`);
          expect(e.originalException instanceof BaseException).toBeTruthy();
          expect(e.causeKey.token).toEqual(Engine);
        }
      });

      it('should provide context when throwing an exception ', () => {
        var engineBinding = Injector.resolve([bind(Engine).toClass(BrokenEngine)])[0];
        var protoParent =
            new ProtoInjector([new BindingWithVisibility(engineBinding, Visibility.Public)]);

        var carBinding = Injector.resolve([Car])[0];
        var protoChild =
            new ProtoInjector([new BindingWithVisibility(carBinding, Visibility.Public)]);

        var parent = new Injector(protoParent, null, null, () => "parentContext");
        var child = new Injector(protoChild, parent, null, () => "childContext");

        try {
          child.get(Car);
          throw "Must throw";
        } catch (e) {
          expect(e.context).toEqual("childContext");
        }
      });

      it('should instantiate an object after a failed attempt', () => {
        var isBroken = true;

        var injector = createInjector(
            [Car, bind(Engine).toFactory(() => isBroken ? new BrokenEngine() : new Engine())]);

        expect(() => injector.get(Car)).toThrowError(new RegExp("Error"));

        isBroken = false;

        expect(injector.get(Car)).toBeAnInstanceOf(Car);
      });

      it('should support null values', () => {
        var injector = createInjector([bind('null').toValue(null)]);
        expect(injector.get('null')).toBe(null);
      });

      it('should use custom dependency provider', () => {
        var e = new Engine();

        var depProvider = <any>new SpyDependencyProvider();
        depProvider.spy("getDependency").andReturn(e);

        var bindings = Injector.resolve([Car]);
        var injector = Injector.fromResolvedBindings(bindings, depProvider);

        expect(injector.get(Car).engine).toEqual(e);
        expect(depProvider.spy("getDependency"))
            .toHaveBeenCalledWith(injector, bindings[0],
                                  bindings[0].resolvedFactories[0].dependencies[0]);
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

      it("should give access to parent", () => {
        var parent = Injector.resolveAndCreate([]);
        var child = parent.resolveAndCreateChild([]);
        expect(child.parent).toBe(parent);
      });
    });

    describe('resolveAndInstantiate', () => {
      it('should instantiate an object in the context of the injector', () => {
        var inj = Injector.resolveAndCreate([Engine]);
        var car = inj.resolveAndInstantiate(Car);
        expect(car).toBeAnInstanceOf(Car);
        expect(car.engine).toBe(inj.get(Engine));
      });

      it('should not store the instantiated object in the injector', () => {
        var inj = Injector.resolveAndCreate([Engine]);
        inj.resolveAndInstantiate(Car);
        expect(() => inj.get(Car)).toThrowError();
      });
    });

    describe('instantiate', () => {
      it('should instantiate an object in the context of the injector', () => {
        var inj = Injector.resolveAndCreate([Engine]);
        var car = inj.instantiateResolved(Injector.resolve([Car])[0]);
        expect(car).toBeAnInstanceOf(Car);
        expect(car.engine).toBe(inj.get(Engine));
      });
    });

    describe("depedency resolution", () => {
      describe("@Self()", () => {
        it("should return a dependency from self", () => {
          var inj = Injector.resolveAndCreate(
              [Engine, bind(Car).toFactory((e) => new Car(e), [[Engine, new SelfMetadata()]])]);

          expect(inj.get(Car)).toBeAnInstanceOf(Car);
        });

        it("should throw when not requested binding on self", () => {
          var parent = Injector.resolveAndCreate([Engine]);
          var child = parent.resolveAndCreateChild(
              [bind(Car).toFactory((e) => new Car(e), [[Engine, new SelfMetadata()]])]);

          expect(() => child.get(Car))
              .toThrowError(`No provider for Engine! (${stringify(Car)} -> ${stringify(Engine)})`);
        });
      });

      describe("@Host()", () => {
        it("should return a dependency from same host", () => {
          var parent = Injector.resolveAndCreate([Engine]);
          var child = parent.resolveAndCreateChild(
              [bind(Car).toFactory((e) => new Car(e), [[Engine, new HostMetadata()]])]);

          expect(child.get(Car)).toBeAnInstanceOf(Car);
        });

        it("should return a private dependency declared at the host", () => {
          var engine = Injector.resolve([Engine])[0];
          var protoParent =
              new ProtoInjector([new BindingWithVisibility(engine, Visibility.Private)]);
          var parent = new Injector(protoParent);

          var child = Injector.resolveAndCreate(
              [bind(Car).toFactory((e) => new Car(e), [[Engine, new HostMetadata()]])]);

          child.internalStrategy.attach(parent, true);  // host

          expect(child.get(Car)).toBeAnInstanceOf(Car);
        });

        it("should not return a public dependency declared at the host", () => {
          var engine = Injector.resolve([Engine])[0];
          var protoParent =
              new ProtoInjector([new BindingWithVisibility(engine, Visibility.Public)]);
          var parent = new Injector(protoParent);

          var child = Injector.resolveAndCreate(
              [bind(Car).toFactory((e) => new Car(e), [[Engine, new HostMetadata()]])]);

          child.internalStrategy.attach(parent, true);  // host

          expect(() => child.get(Car))
              .toThrowError(`No provider for Engine! (${stringify(Car)} -> ${stringify(Engine)})`);
        });

        it("should not skip self", () => {
          var parent = Injector.resolveAndCreate([Engine]);
          var child = parent.resolveAndCreateChild([
            bind(Engine)
                .toClass(TurboEngine),
            bind(Car).toFactory((e) => new Car(e), [[Engine, new HostMetadata()]])
          ]);

          expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
        });
      });

      describe("default", () => {
        it("should return a private dependency declared at the host", () => {
          var engine = Injector.resolve([Engine])[0];
          var protoParent =
              new ProtoInjector([new BindingWithVisibility(engine, Visibility.Private)]);
          var parent = new Injector(protoParent);

          var child = Injector.resolveAndCreate([
            bind(Engine)
                .toClass(BrokenEngine),
            bind(Car).toFactory((e) => new Car(e), [[Engine, new SkipSelfMetadata()]])
          ]);
          child.internalStrategy.attach(parent, true);  // boundary

          expect(child.get(Car)).toBeAnInstanceOf(Car);
        });

        it("should return a public dependency declared at the host", () => {
          var engine = Injector.resolve([Engine])[0];
          var protoParent =
              new ProtoInjector([new BindingWithVisibility(engine, Visibility.Public)]);
          var parent = new Injector(protoParent);

          var child = Injector.resolveAndCreate([
            bind(Engine)
                .toClass(BrokenEngine),
            bind(Car).toFactory((e) => new Car(e), [[Engine, new SkipSelfMetadata()]])
          ]);
          child.internalStrategy.attach(parent, true);  // boundary

          expect(child.get(Car)).toBeAnInstanceOf(Car);
        });

        it("should not return a private dependency declared NOT at the host", () => {
          var engine = Injector.resolve([Engine])[0];
          var protoParent =
              new ProtoInjector([new BindingWithVisibility(engine, Visibility.Private)]);
          var parent = new Injector(protoParent);

          var child = Injector.resolveAndCreate([
            bind(Engine)
                .toClass(BrokenEngine),
            bind(Car).toFactory((e) => new Car(e), [[Engine, new SkipSelfMetadata()]])
          ]);
          child.internalStrategy.attach(parent, false);

          expect(() => child.get(Car))
              .toThrowError(`No provider for Engine! (${stringify(Car)} -> ${stringify(Engine)})`);
        });

        it("should not skip self", () => {
          var parent = Injector.resolveAndCreate([Engine]);
          var child = parent.resolveAndCreateChild([
            bind(Engine)
                .toClass(TurboEngine),
            bind(Car).toFactory((e) => new Car(e), [Engine])
          ]);

          expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
        });
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

      it("should support multi bindings", () => {
        var binding = Injector.resolve([
          new Binding(Engine, {toClass: BrokenEngine, multi: true}),
          new Binding(Engine, {toClass: TurboEngine, multi: true})
        ])[0];

        expect(binding.key.token).toBe(Engine);
        expect(binding.multiBinding).toEqual(true);
        expect(binding.resolvedFactories.length).toEqual(2);
      });

      it("should support multi bindings with only one binding", () => {
        var binding =
            Injector.resolve([new Binding(Engine, {toClass: BrokenEngine, multi: true})])[0];

        expect(binding.key.token).toBe(Engine);
        expect(binding.multiBinding).toEqual(true);
        expect(binding.resolvedFactories.length).toEqual(1);
      });

      it("should throw when mixing multi bindings with regular bindings", () => {
        expect(() => {
          Injector.resolve([new Binding(Engine, {toClass: BrokenEngine, multi: true}), Engine]);
        }).toThrowErrorWith("Cannot mix multi bindings and regular bindings");

        expect(() => {
          Injector.resolve([Engine, new Binding(Engine, {toClass: BrokenEngine, multi: true})]);
        }).toThrowErrorWith("Cannot mix multi bindings and regular bindings");
      });

      it('should resolve forward references', () => {
        var bindings = Injector.resolve([
          forwardRef(() => Engine),
          [bind(forwardRef(() => BrokenEngine)).toClass(forwardRef(() => Engine))],
          bind(forwardRef(() => String)).toFactory(() => 'OK', [forwardRef(() => Engine)])
        ]);

        var engineBinding = bindings[0];
        var brokenEngineBinding = bindings[1];
        var stringBinding = bindings[2];

        expect(engineBinding.resolvedFactories[0].factory() instanceof Engine).toBe(true);
        expect(brokenEngineBinding.resolvedFactories[0].factory() instanceof Engine).toBe(true);
        expect(stringBinding.resolvedFactories[0].dependencies[0].key).toEqual(Key.get(Engine));
      });

      it('should support overriding factory dependencies with dependency annotations', () => {
        var bindings = Injector.resolve([
          bind("token")
              .toFactory((e) => "result",
                         [[new InjectMetadata("dep"), new CustomDependencyMetadata()]])
        ]);

        var binding = bindings[0];

        expect(binding.resolvedFactories[0].dependencies[0].key.token).toEqual("dep");
        expect(binding.resolvedFactories[0].dependencies[0].properties)
            .toEqual([new CustomDependencyMetadata()]);
      });
    });

    describe("displayName", () => {
      it("should work", () => {
        expect(Injector.resolveAndCreate([Engine, BrokenEngine]).displayName)
            .toEqual('Injector(bindings: [ "Engine" ,  "BrokenEngine" ])');
      });
    });
  });
}
