var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var core_1 = require('angular2/core');
var metadata_1 = require('angular2/src/core/di/metadata');
var provider_1 = require('angular2/src/core/di/provider');
var injector_1 = require('angular2/src/core/di/injector');
var CustomDependencyMetadata = (function (_super) {
    __extends(CustomDependencyMetadata, _super);
    function CustomDependencyMetadata() {
        _super.apply(this, arguments);
    }
    return CustomDependencyMetadata;
})(metadata_1.DependencyMetadata);
var Engine = (function () {
    function Engine() {
    }
    return Engine;
})();
var BrokenEngine = (function () {
    function BrokenEngine() {
        throw new exceptions_1.BaseException("Broken Engine");
    }
    return BrokenEngine;
})();
var DashboardSoftware = (function () {
    function DashboardSoftware() {
    }
    return DashboardSoftware;
})();
var Dashboard = (function () {
    function Dashboard(software) {
    }
    Dashboard = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [DashboardSoftware])
    ], Dashboard);
    return Dashboard;
})();
var TurboEngine = (function (_super) {
    __extends(TurboEngine, _super);
    function TurboEngine() {
        _super.apply(this, arguments);
    }
    return TurboEngine;
})(Engine);
var Car = (function () {
    function Car(engine) {
        this.engine = engine;
    }
    Car = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Engine])
    ], Car);
    return Car;
})();
var CarWithOptionalEngine = (function () {
    function CarWithOptionalEngine(engine) {
        this.engine = engine;
    }
    CarWithOptionalEngine = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [Engine])
    ], CarWithOptionalEngine);
    return CarWithOptionalEngine;
})();
var CarWithDashboard = (function () {
    function CarWithDashboard(engine, dashboard) {
        this.engine = engine;
        this.dashboard = dashboard;
    }
    CarWithDashboard = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Engine, Dashboard])
    ], CarWithDashboard);
    return CarWithDashboard;
})();
var SportsCar = (function (_super) {
    __extends(SportsCar, _super);
    function SportsCar(engine) {
        _super.call(this, engine);
    }
    SportsCar = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Engine])
    ], SportsCar);
    return SportsCar;
})(Car);
var CarWithInject = (function () {
    function CarWithInject(engine) {
        this.engine = engine;
    }
    CarWithInject = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(TurboEngine)), 
        __metadata('design:paramtypes', [Engine])
    ], CarWithInject);
    return CarWithInject;
})();
var CyclicEngine = (function () {
    function CyclicEngine(car) {
    }
    CyclicEngine = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Car])
    ], CyclicEngine);
    return CyclicEngine;
})();
var NoAnnotations = (function () {
    function NoAnnotations(secretDependency) {
    }
    return NoAnnotations;
})();
function main() {
    var dynamicProviders = [
        core_1.provide('provider0', { useValue: 1 }),
        core_1.provide('provider1', { useValue: 1 }),
        core_1.provide('provider2', { useValue: 1 }),
        core_1.provide('provider3', { useValue: 1 }),
        core_1.provide('provider4', { useValue: 1 }),
        core_1.provide('provider5', { useValue: 1 }),
        core_1.provide('provider6', { useValue: 1 }),
        core_1.provide('provider7', { useValue: 1 }),
        core_1.provide('provider8', { useValue: 1 }),
        core_1.provide('provider9', { useValue: 1 }),
        core_1.provide('provider10', { useValue: 1 })
    ];
    [{ strategy: 'inline', providers: [], strategyClass: injector_1.InjectorInlineStrategy },
        {
            strategy: 'dynamic',
            providers: dynamicProviders,
            strategyClass: injector_1.InjectorDynamicStrategy
        }].forEach(function (context) {
        function createInjector(providers) {
            return core_1.Injector.resolveAndCreate(providers.concat(context['providers']));
        }
        testing_internal_1.describe("injector " + context['strategy'], function () {
            testing_internal_1.it("should use the right strategy", function () {
                var injector = createInjector([]);
                testing_internal_1.expect(injector.internalStrategy).toBeAnInstanceOf(context['strategyClass']);
            });
            testing_internal_1.it('should instantiate a class without dependencies', function () {
                var injector = createInjector([Engine]);
                var engine = injector.get(Engine);
                testing_internal_1.expect(engine).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should resolve dependencies based on type information', function () {
                var injector = createInjector([Engine, Car]);
                var car = injector.get(Car);
                testing_internal_1.expect(car).toBeAnInstanceOf(Car);
                testing_internal_1.expect(car.engine).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should resolve dependencies based on @Inject annotation', function () {
                var injector = createInjector([TurboEngine, Engine, CarWithInject]);
                var car = injector.get(CarWithInject);
                testing_internal_1.expect(car).toBeAnInstanceOf(CarWithInject);
                testing_internal_1.expect(car.engine).toBeAnInstanceOf(TurboEngine);
            });
            testing_internal_1.it('should throw when no type and not @Inject', function () {
                testing_internal_1.expect(function () { return createInjector([NoAnnotations]); })
                    .toThrowError('Cannot resolve all parameters for NoAnnotations(?). ' +
                    'Make sure they all have valid type or annotations.');
            });
            testing_internal_1.it('should cache instances', function () {
                var injector = createInjector([Engine]);
                var e1 = injector.get(Engine);
                var e2 = injector.get(Engine);
                testing_internal_1.expect(e1).toBe(e2);
            });
            testing_internal_1.it('should provide to a value', function () {
                var injector = createInjector([core_1.provide(Engine, { useValue: "fake engine" })]);
                var engine = injector.get(Engine);
                testing_internal_1.expect(engine).toEqual("fake engine");
            });
            testing_internal_1.it('should provide to a factory', function () {
                function sportsCarFactory(e) { return new SportsCar(e); }
                var injector = createInjector([Engine, core_1.provide(Car, { useFactory: sportsCarFactory, deps: [Engine] })]);
                var car = injector.get(Car);
                testing_internal_1.expect(car).toBeAnInstanceOf(SportsCar);
                testing_internal_1.expect(car.engine).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should supporting provider to null', function () {
                var injector = createInjector([core_1.provide(Engine, { useValue: null })]);
                var engine = injector.get(Engine);
                testing_internal_1.expect(engine).toBeNull();
            });
            testing_internal_1.it('should provide to an alias', function () {
                var injector = createInjector([
                    Engine,
                    core_1.provide(SportsCar, { useClass: SportsCar }),
                    core_1.provide(Car, { useExisting: SportsCar })
                ]);
                var car = injector.get(Car);
                var sportsCar = injector.get(SportsCar);
                testing_internal_1.expect(car).toBeAnInstanceOf(SportsCar);
                testing_internal_1.expect(car).toBe(sportsCar);
            });
            testing_internal_1.it('should support multiProviders', function () {
                var injector = createInjector([
                    Engine,
                    new core_1.Provider(Car, { useClass: SportsCar, multi: true }),
                    new core_1.Provider(Car, { useClass: CarWithOptionalEngine, multi: true })
                ]);
                var cars = injector.get(Car);
                testing_internal_1.expect(cars.length).toEqual(2);
                testing_internal_1.expect(cars[0]).toBeAnInstanceOf(SportsCar);
                testing_internal_1.expect(cars[1]).toBeAnInstanceOf(CarWithOptionalEngine);
            });
            testing_internal_1.it('should support multiProviders that are created using useExisting', function () {
                var injector = createInjector([Engine, SportsCar, new core_1.Provider(Car, { useExisting: SportsCar, multi: true })]);
                var cars = injector.get(Car);
                testing_internal_1.expect(cars.length).toEqual(1);
                testing_internal_1.expect(cars[0]).toBe(injector.get(SportsCar));
            });
            testing_internal_1.it('should throw when the aliased provider does not exist', function () {
                var injector = createInjector([core_1.provide('car', { useExisting: SportsCar })]);
                var e = "No provider for " + lang_1.stringify(SportsCar) + "! (car -> " + lang_1.stringify(SportsCar) + ")";
                testing_internal_1.expect(function () { return injector.get('car'); }).toThrowError(e);
            });
            testing_internal_1.it('should handle forwardRef in useExisting', function () {
                var injector = createInjector([
                    core_1.provide('originalEngine', { useClass: core_1.forwardRef(function () { return Engine; }) }),
                    core_1.provide('aliasedEngine', { useExisting: core_1.forwardRef(function () { return 'originalEngine'; }) })
                ]);
                testing_internal_1.expect(injector.get('aliasedEngine')).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should support overriding factory dependencies', function () {
                var injector = createInjector([Engine, core_1.provide(Car, { useFactory: function (e) { return new SportsCar(e); }, deps: [Engine] })]);
                var car = injector.get(Car);
                testing_internal_1.expect(car).toBeAnInstanceOf(SportsCar);
                testing_internal_1.expect(car.engine).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should support optional dependencies', function () {
                var injector = createInjector([CarWithOptionalEngine]);
                var car = injector.get(CarWithOptionalEngine);
                testing_internal_1.expect(car.engine).toEqual(null);
            });
            testing_internal_1.it("should flatten passed-in providers", function () {
                var injector = createInjector([[[Engine, Car]]]);
                var car = injector.get(Car);
                testing_internal_1.expect(car).toBeAnInstanceOf(Car);
            });
            testing_internal_1.it("should use the last provider when there are multiple providers for same token", function () {
                var injector = createInjector([core_1.provide(Engine, { useClass: Engine }), core_1.provide(Engine, { useClass: TurboEngine })]);
                testing_internal_1.expect(injector.get(Engine)).toBeAnInstanceOf(TurboEngine);
            });
            testing_internal_1.it('should use non-type tokens', function () {
                var injector = createInjector([core_1.provide('token', { useValue: 'value' })]);
                testing_internal_1.expect(injector.get('token')).toEqual('value');
            });
            testing_internal_1.it('should throw when given invalid providers', function () {
                testing_internal_1.expect(function () { return createInjector(["blah"]); })
                    .toThrowError('Invalid provider - only instances of Provider and Type are allowed, got: blah');
            });
            testing_internal_1.it('should provide itself', function () {
                var parent = createInjector([]);
                var child = parent.resolveAndCreateChild([]);
                testing_internal_1.expect(child.get(core_1.Injector)).toBe(child);
            });
            testing_internal_1.it('should throw when no provider defined', function () {
                var injector = createInjector([]);
                testing_internal_1.expect(function () { return injector.get('NonExisting'); }).toThrowError('No provider for NonExisting!');
            });
            testing_internal_1.it('should show the full path when no provider', function () {
                var injector = createInjector([CarWithDashboard, Engine, Dashboard]);
                testing_internal_1.expect(function () { return injector.get(CarWithDashboard); })
                    .toThrowError("No provider for DashboardSoftware! (" + lang_1.stringify(CarWithDashboard) + " -> " + lang_1.stringify(Dashboard) + " -> DashboardSoftware)");
            });
            testing_internal_1.it('should throw when trying to instantiate a cyclic dependency', function () {
                var injector = createInjector([Car, core_1.provide(Engine, { useClass: CyclicEngine })]);
                testing_internal_1.expect(function () { return injector.get(Car); })
                    .toThrowError("Cannot instantiate cyclic dependency! (" + lang_1.stringify(Car) + " -> " + lang_1.stringify(Engine) + " -> " + lang_1.stringify(Car) + ")");
            });
            testing_internal_1.it('should show the full path when error happens in a constructor', function () {
                var providers = core_1.Injector.resolve([Car, core_1.provide(Engine, { useClass: BrokenEngine })]);
                var proto = new injector_1.ProtoInjector([
                    new injector_1.ProviderWithVisibility(providers[0], injector_1.Visibility.Public),
                    new injector_1.ProviderWithVisibility(providers[1], injector_1.Visibility.Public)
                ]);
                var injector = new core_1.Injector(proto, null, null);
                try {
                    injector.get(Car);
                    throw "Must throw";
                }
                catch (e) {
                    testing_internal_1.expect(e.message)
                        .toContain("Error during instantiation of Engine! (" + lang_1.stringify(Car) + " -> Engine)");
                    testing_internal_1.expect(e.originalException instanceof exceptions_1.BaseException).toBeTruthy();
                    testing_internal_1.expect(e.causeKey.token).toEqual(Engine);
                }
            });
            testing_internal_1.it('should provide context when throwing an exception ', function () {
                var engineProvider = core_1.Injector.resolve([core_1.provide(Engine, { useClass: BrokenEngine })])[0];
                var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engineProvider, injector_1.Visibility.Public)]);
                var carProvider = core_1.Injector.resolve([Car])[0];
                var protoChild = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(carProvider, injector_1.Visibility.Public)]);
                var parent = new core_1.Injector(protoParent, null, null, function () { return "parentContext"; });
                var child = new core_1.Injector(protoChild, parent, null, function () { return "childContext"; });
                try {
                    child.get(Car);
                    throw "Must throw";
                }
                catch (e) {
                    testing_internal_1.expect(e.context).toEqual("childContext");
                }
            });
            testing_internal_1.it('should instantiate an object after a failed attempt', function () {
                var isBroken = true;
                var injector = createInjector([
                    Car,
                    core_1.provide(Engine, { useFactory: (function () { return isBroken ? new BrokenEngine() : new Engine(); }) })
                ]);
                testing_internal_1.expect(function () { return injector.get(Car); }).toThrowError(new RegExp("Error"));
                isBroken = false;
                testing_internal_1.expect(injector.get(Car)).toBeAnInstanceOf(Car);
            });
            testing_internal_1.it('should support null values', function () {
                var injector = createInjector([core_1.provide('null', { useValue: null })]);
                testing_internal_1.expect(injector.get('null')).toBe(null);
            });
            testing_internal_1.it('should use custom dependency provider', function () {
                var e = new Engine();
                var depProvider = new spies_1.SpyDependencyProvider();
                depProvider.spy("getDependency").andReturn(e);
                var providers = core_1.Injector.resolve([Car]);
                var proto = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(providers[0], injector_1.Visibility.Public)]);
                var injector = new core_1.Injector(proto, null, depProvider);
                testing_internal_1.expect(injector.get(Car).engine).toEqual(e);
                testing_internal_1.expect(depProvider.spy("getDependency"))
                    .toHaveBeenCalledWith(injector, providers[0], providers[0].resolvedFactories[0].dependencies[0]);
            });
        });
        testing_internal_1.describe("child", function () {
            testing_internal_1.it('should load instances from parent injector', function () {
                var parent = core_1.Injector.resolveAndCreate([Engine]);
                var child = parent.resolveAndCreateChild([]);
                var engineFromParent = parent.get(Engine);
                var engineFromChild = child.get(Engine);
                testing_internal_1.expect(engineFromChild).toBe(engineFromParent);
            });
            testing_internal_1.it("should not use the child providers when resolving the dependencies of a parent provider", function () {
                var parent = core_1.Injector.resolveAndCreate([Car, Engine]);
                var child = parent.resolveAndCreateChild([core_1.provide(Engine, { useClass: TurboEngine })]);
                var carFromChild = child.get(Car);
                testing_internal_1.expect(carFromChild.engine).toBeAnInstanceOf(Engine);
            });
            testing_internal_1.it('should create new instance in a child injector', function () {
                var parent = core_1.Injector.resolveAndCreate([Engine]);
                var child = parent.resolveAndCreateChild([core_1.provide(Engine, { useClass: TurboEngine })]);
                var engineFromParent = parent.get(Engine);
                var engineFromChild = child.get(Engine);
                testing_internal_1.expect(engineFromParent).not.toBe(engineFromChild);
                testing_internal_1.expect(engineFromChild).toBeAnInstanceOf(TurboEngine);
            });
            testing_internal_1.it("should give access to parent", function () {
                var parent = core_1.Injector.resolveAndCreate([]);
                var child = parent.resolveAndCreateChild([]);
                testing_internal_1.expect(child.parent).toBe(parent);
            });
        });
        testing_internal_1.describe('resolveAndInstantiate', function () {
            testing_internal_1.it('should instantiate an object in the context of the injector', function () {
                var inj = core_1.Injector.resolveAndCreate([Engine]);
                var car = inj.resolveAndInstantiate(Car);
                testing_internal_1.expect(car).toBeAnInstanceOf(Car);
                testing_internal_1.expect(car.engine).toBe(inj.get(Engine));
            });
            testing_internal_1.it('should not store the instantiated object in the injector', function () {
                var inj = core_1.Injector.resolveAndCreate([Engine]);
                inj.resolveAndInstantiate(Car);
                testing_internal_1.expect(function () { return inj.get(Car); }).toThrowError();
            });
        });
        testing_internal_1.describe('instantiate', function () {
            testing_internal_1.it('should instantiate an object in the context of the injector', function () {
                var inj = core_1.Injector.resolveAndCreate([Engine]);
                var car = inj.instantiateResolved(core_1.Injector.resolve([Car])[0]);
                testing_internal_1.expect(car).toBeAnInstanceOf(Car);
                testing_internal_1.expect(car.engine).toBe(inj.get(Engine));
            });
        });
        testing_internal_1.describe("depedency resolution", function () {
            testing_internal_1.describe("@Self()", function () {
                testing_internal_1.it("should return a dependency from self", function () {
                    var inj = core_1.Injector.resolveAndCreate([
                        Engine,
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.SelfMetadata()]] })
                    ]);
                    testing_internal_1.expect(inj.get(Car)).toBeAnInstanceOf(Car);
                });
                testing_internal_1.it("should throw when not requested provider on self", function () {
                    var parent = core_1.Injector.resolveAndCreate([Engine]);
                    var child = parent.resolveAndCreateChild([
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.SelfMetadata()]] })
                    ]);
                    testing_internal_1.expect(function () { return child.get(Car); })
                        .toThrowError("No provider for Engine! (" + lang_1.stringify(Car) + " -> " + lang_1.stringify(Engine) + ")");
                });
            });
            testing_internal_1.describe("@Host()", function () {
                testing_internal_1.it("should return a dependency from same host", function () {
                    var parent = core_1.Injector.resolveAndCreate([Engine]);
                    var child = parent.resolveAndCreateChild([
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.HostMetadata()]] })
                    ]);
                    testing_internal_1.expect(child.get(Car)).toBeAnInstanceOf(Car);
                });
                testing_internal_1.it("should return a private dependency declared at the host", function () {
                    var engine = core_1.Injector.resolve([Engine])[0];
                    var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engine, injector_1.Visibility.Private)]);
                    var parent = new core_1.Injector(protoParent);
                    var child = core_1.Injector.resolveAndCreate([
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.HostMetadata()]] })
                    ]);
                    child.internalStrategy.attach(parent, true); // host
                    testing_internal_1.expect(child.get(Car)).toBeAnInstanceOf(Car);
                });
                testing_internal_1.it("should not return a public dependency declared at the host", function () {
                    var engine = core_1.Injector.resolve([Engine])[0];
                    var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engine, injector_1.Visibility.Public)]);
                    var parent = new core_1.Injector(protoParent);
                    var child = core_1.Injector.resolveAndCreate([
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.HostMetadata()]] })
                    ]);
                    child.internalStrategy.attach(parent, true); // host
                    testing_internal_1.expect(function () { return child.get(Car); })
                        .toThrowError("No provider for Engine! (" + lang_1.stringify(Car) + " -> " + lang_1.stringify(Engine) + ")");
                });
                testing_internal_1.it("should not skip self", function () {
                    var parent = core_1.Injector.resolveAndCreate([Engine]);
                    var child = parent.resolveAndCreateChild([
                        core_1.provide(Engine, { useClass: TurboEngine }),
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.HostMetadata()]] })
                    ]);
                    testing_internal_1.expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
                });
            });
            testing_internal_1.describe("default", function () {
                testing_internal_1.it("should return a private dependency declared at the host", function () {
                    var engine = core_1.Injector.resolve([Engine])[0];
                    var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engine, injector_1.Visibility.Private)]);
                    var parent = new core_1.Injector(protoParent);
                    var child = core_1.Injector.resolveAndCreate([
                        core_1.provide(Engine, { useClass: BrokenEngine }),
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.SkipSelfMetadata()]] })
                    ]);
                    child.internalStrategy.attach(parent, true); // boundary
                    testing_internal_1.expect(child.get(Car)).toBeAnInstanceOf(Car);
                });
                testing_internal_1.it("should return a public dependency declared at the host", function () {
                    var engine = core_1.Injector.resolve([Engine])[0];
                    var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engine, injector_1.Visibility.Public)]);
                    var parent = new core_1.Injector(protoParent);
                    var child = core_1.Injector.resolveAndCreate([
                        core_1.provide(Engine, { useClass: BrokenEngine }),
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.SkipSelfMetadata()]] })
                    ]);
                    child.internalStrategy.attach(parent, true); // boundary
                    testing_internal_1.expect(child.get(Car)).toBeAnInstanceOf(Car);
                });
                testing_internal_1.it("should not return a private dependency declared NOT at the host", function () {
                    var engine = core_1.Injector.resolve([Engine])[0];
                    var protoParent = new injector_1.ProtoInjector([new injector_1.ProviderWithVisibility(engine, injector_1.Visibility.Private)]);
                    var parent = new core_1.Injector(protoParent);
                    var child = core_1.Injector.resolveAndCreate([
                        core_1.provide(Engine, { useClass: BrokenEngine }),
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [[Engine, new core_1.SkipSelfMetadata()]] })
                    ]);
                    child.internalStrategy.attach(parent, false);
                    testing_internal_1.expect(function () { return child.get(Car); })
                        .toThrowError("No provider for Engine! (" + lang_1.stringify(Car) + " -> " + lang_1.stringify(Engine) + ")");
                });
                testing_internal_1.it("should not skip self", function () {
                    var parent = core_1.Injector.resolveAndCreate([Engine]);
                    var child = parent.resolveAndCreateChild([
                        core_1.provide(Engine, { useClass: TurboEngine }),
                        core_1.provide(Car, { useFactory: function (e) { return new Car(e); }, deps: [Engine] })
                    ]);
                    testing_internal_1.expect(child.get(Car).engine).toBeAnInstanceOf(TurboEngine);
                });
            });
        });
        testing_internal_1.describe('resolve', function () {
            testing_internal_1.it('should resolve and flatten', function () {
                var providers = core_1.Injector.resolve([Engine, [BrokenEngine]]);
                providers.forEach(function (b) {
                    if (lang_1.isBlank(b))
                        return; // the result is a sparse array
                    testing_internal_1.expect(b instanceof provider_1.ResolvedProvider_).toBe(true);
                });
            });
            testing_internal_1.it("should support multi providers", function () {
                var provider = core_1.Injector.resolve([
                    new core_1.Provider(Engine, { useClass: BrokenEngine, multi: true }),
                    new core_1.Provider(Engine, { useClass: TurboEngine, multi: true })
                ])[0];
                testing_internal_1.expect(provider.key.token).toBe(Engine);
                testing_internal_1.expect(provider.multiProvider).toEqual(true);
                testing_internal_1.expect(provider.resolvedFactories.length).toEqual(2);
            });
            testing_internal_1.it("should support multi providers with only one provider", function () {
                var provider = core_1.Injector.resolve([new core_1.Provider(Engine, { useClass: BrokenEngine, multi: true })])[0];
                testing_internal_1.expect(provider.key.token).toBe(Engine);
                testing_internal_1.expect(provider.multiProvider).toEqual(true);
                testing_internal_1.expect(provider.resolvedFactories.length).toEqual(1);
            });
            testing_internal_1.it("should throw when mixing multi providers with regular providers", function () {
                testing_internal_1.expect(function () {
                    core_1.Injector.resolve([new core_1.Provider(Engine, { useClass: BrokenEngine, multi: true }), Engine]);
                }).toThrowErrorWith("Cannot mix multi providers and regular providers");
                testing_internal_1.expect(function () {
                    core_1.Injector.resolve([Engine, new core_1.Provider(Engine, { useClass: BrokenEngine, multi: true })]);
                }).toThrowErrorWith("Cannot mix multi providers and regular providers");
            });
            testing_internal_1.it('should resolve forward references', function () {
                var providers = core_1.Injector.resolve([
                    core_1.forwardRef(function () { return Engine; }),
                    [core_1.provide(core_1.forwardRef(function () { return BrokenEngine; }), { useClass: core_1.forwardRef(function () { return Engine; }) })],
                    core_1.provide(core_1.forwardRef(function () { return String; }), { useFactory: function () { return 'OK'; }, deps: [core_1.forwardRef(function () { return Engine; })] })
                ]);
                var engineProvider = providers[0];
                var brokenEngineProvider = providers[1];
                var stringProvider = providers[2];
                testing_internal_1.expect(engineProvider.resolvedFactories[0].factory() instanceof Engine).toBe(true);
                testing_internal_1.expect(brokenEngineProvider.resolvedFactories[0].factory() instanceof Engine).toBe(true);
                testing_internal_1.expect(stringProvider.resolvedFactories[0].dependencies[0].key).toEqual(core_1.Key.get(Engine));
            });
            testing_internal_1.it('should support overriding factory dependencies with dependency annotations', function () {
                var providers = core_1.Injector.resolve([
                    core_1.provide("token", {
                        useFactory: function (e) { return "result"; },
                        deps: [[new core_1.InjectMetadata("dep"), new CustomDependencyMetadata()]]
                    })
                ]);
                var provider = providers[0];
                testing_internal_1.expect(provider.resolvedFactories[0].dependencies[0].key.token).toEqual("dep");
                testing_internal_1.expect(provider.resolvedFactories[0].dependencies[0].properties)
                    .toEqual([new CustomDependencyMetadata()]);
            });
            testing_internal_1.it('should allow declaring dependencies with flat arrays', function () {
                var resolved = core_1.Injector.resolve([core_1.provide('token', { useFactory: function (e) { return e; }, deps: [new core_1.InjectMetadata("dep")] })]);
                var nestedResolved = core_1.Injector.resolve([core_1.provide('token', { useFactory: function (e) { return e; }, deps: [[new core_1.InjectMetadata("dep")]] })]);
                testing_internal_1.expect(resolved[0].resolvedFactories[0].dependencies[0].key.token)
                    .toEqual(nestedResolved[0].resolvedFactories[0].dependencies[0].key.token);
            });
        });
        testing_internal_1.describe("displayName", function () {
            testing_internal_1.it("should work", function () {
                testing_internal_1.expect(core_1.Injector.resolveAndCreate([Engine, BrokenEngine]).displayName)
                    .toEqual('Injector(providers: [ "Engine" ,  "BrokenEngine" ])');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=injector_spec.js.map