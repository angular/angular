/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Compiler,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  forwardRef,
  getModuleFactory,
  getNgModuleById,
  HostBinding,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  NgModuleRef,
  Optional,
  Pipe,
  Provider,
  Self,
  Type,
} from '../../src/core';
import {ɵɵdefineInjectable} from '../../src/di/interface/defs';
import {NgModuleType} from '../../src/render3';
import {getNgModuleDef} from '../../src/render3/def_getters';
import {ComponentFixture, inject, TestBed} from '../../testing';

import {InternalNgModuleRef, NgModuleFactory} from '../../src/linker/ng_module_factory';
import {
  clearModulesForTest,
  setAllowDuplicateNgModuleIdsForTest,
} from '../../src/linker/ng_module_registration';
import {stringify} from '../../src/util/stringify';

class Engine {}

class TurboEngine extends Engine {}

const CARS = new InjectionToken<Car[]>('Cars');
@Injectable()
class Car {
  constructor(public engine: Engine) {}
}

@Injectable()
class CarWithOptionalEngine {
  constructor(@Optional() public engine: Engine) {}
}

@Injectable()
class SportsCar extends Car {
  constructor(engine: Engine) {
    super(engine);
  }
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

@Component({
  selector: 'comp',
  template: '',
  standalone: false,
})
class SomeComp {}

@Directive({
  selector: '[someDir]',
  standalone: false,
})
class SomeDirective {
  @HostBinding('title') @Input() someDir: string | undefined;
}

@Pipe({
  name: 'somePipe',
  standalone: false,
})
class SomePipe {
  transform(value: string): any {
    return `transformed ${value}`;
  }
}

@Component({
  selector: 'comp',
  template: `<div  [someDir]="'someValue' | somePipe"></div>`,
  standalone: false,
})
class CompUsingModuleDirectiveAndPipe {}

describe('NgModule', () => {
  let compiler: Compiler;
  let injector: Injector;

  beforeEach(inject([Compiler, Injector], (_compiler: Compiler, _injector: Injector) => {
    compiler = _compiler;
    injector = _injector;
  }));

  function createModuleFactory<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return compiler.compileModuleSync(moduleType);
  }

  function createModule<T>(moduleType: Type<T>, parentInjector?: Injector | null): NgModuleRef<T> {
    // Read the `ngModuleDef` to cause it to be compiled and any errors thrown.
    getNgModuleDef(moduleType);
    return createModuleFactory(moduleType).create(parentInjector || null);
  }

  function createComp<T>(compType: Type<T>, moduleType: Type<any>): ComponentFixture<T> {
    const componentDef = (compType as any).ɵcmp;
    if (componentDef) {
      // Since we avoid Components/Directives/Pipes recompiling in case there are no overrides, we
      // may face a problem where previously compiled defs available to a given
      // Component/Directive are cached in TView and may become stale (in case any of these defs
      // gets recompiled). In order to avoid this problem, we force fresh TView to be created.
      componentDef.TView = null;
    }

    createModule(moduleType, injector);

    return TestBed.createComponent(compType);
  }

  describe('errors', () => {
    it('should error when exporting a directive that was neither declared nor imported', () => {
      @NgModule({exports: [SomeDirective]})
      class SomeModule {}

      expect(() => createModule(SomeModule)).toThrowError(
        `Can't export directive ${stringify(SomeDirective)} from ${stringify(
          SomeModule,
        )} as it was neither declared nor imported!`,
      );
    });

    it('should error when exporting a pipe that was neither declared nor imported', () => {
      @NgModule({exports: [SomePipe]})
      class SomeModule {}

      expect(() => createModule(SomeModule)).toThrowError(
        `Can't export pipe ${stringify(SomePipe)} from ${stringify(
          SomeModule,
        )} as it was neither declared nor imported!`,
      );
    });

    it('should error if a directive is declared in more than 1 module', () => {
      @NgModule({declarations: [SomeDirective]})
      class Module1 {}

      @NgModule({declarations: [SomeDirective]})
      class Module2 {}

      createModule(Module1);

      expect(() => createModule(Module2)).toThrowError(
        `Type ${stringify(SomeDirective)} is part of the declarations of 2 modules: ${stringify(
          Module1,
        )} and ${stringify(Module2)}! ` +
          `Please consider moving ${stringify(
            SomeDirective,
          )} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
          `You can also create a new NgModule that exports and includes ${stringify(
            SomeDirective,
          )} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`,
      );
    });

    it('should error if a directive is declared in more than 1 module also if the module declaring it is imported', () => {
      @NgModule({declarations: [SomeDirective], exports: [SomeDirective]})
      class Module1 {}

      @NgModule({declarations: [SomeDirective], imports: [Module1]})
      class Module2 {}

      expect(() => createModule(Module2)).toThrowError(
        `Type ${stringify(SomeDirective)} is part of the declarations of 2 modules: ${stringify(
          Module1,
        )} and ${stringify(Module2)}! ` +
          `Please consider moving ${stringify(
            SomeDirective,
          )} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
          `You can also create a new NgModule that exports and includes ${stringify(
            SomeDirective,
          )} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`,
      );
    });

    it('should error if a pipe is declared in more than 1 module', () => {
      @NgModule({declarations: [SomePipe]})
      class Module1 {}

      @NgModule({declarations: [SomePipe]})
      class Module2 {}

      createModule(Module1);

      expect(() => createModule(Module2)).toThrowError(
        `Type ${stringify(SomePipe)} is part of the declarations of 2 modules: ${stringify(
          Module1,
        )} and ${stringify(Module2)}! ` +
          `Please consider moving ${stringify(
            SomePipe,
          )} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
          `You can also create a new NgModule that exports and includes ${stringify(
            SomePipe,
          )} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`,
      );
    });

    it('should error if a pipe is declared in more than 1 module also if the module declaring it is imported', () => {
      @NgModule({declarations: [SomePipe], exports: [SomePipe]})
      class Module1 {}

      @NgModule({declarations: [SomePipe], imports: [Module1]})
      class Module2 {}

      expect(() => createModule(Module2)).toThrowError(
        `Type ${stringify(SomePipe)} is part of the declarations of 2 modules: ${stringify(
          Module1,
        )} and ${stringify(Module2)}! ` +
          `Please consider moving ${stringify(
            SomePipe,
          )} to a higher module that imports ${stringify(Module1)} and ${stringify(Module2)}. ` +
          `You can also create a new NgModule that exports and includes ${stringify(
            SomePipe,
          )} then import that NgModule in ${stringify(Module1)} and ${stringify(Module2)}.`,
      );
    });
  });

  describe('schemas', () => {
    it('should error on unknown bound properties on custom elements by default', () => {
      @Component({
        template: '<div [someUnknownProp]="true"></div>',
        standalone: false,
      })
      class ComponentUsingInvalidProperty {}

      @NgModule({declarations: [ComponentUsingInvalidProperty]})
      class SomeModule {}

      const spy = spyOn(console, 'error');
      const fixture = createComp(ComponentUsingInvalidProperty, SomeModule);
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toMatch(/Can't bind to 'someUnknownProp'/);
    });

    it('should not error on unknown bound properties on custom elements when using the CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        template: '<some-element [someUnknownProp]="true"></some-element>',
        standalone: false,
      })
      class ComponentUsingInvalidProperty {}

      @NgModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [ComponentUsingInvalidProperty],
      })
      class SomeModule {}

      expect(() => {
        const fixture = createComp(ComponentUsingInvalidProperty, SomeModule);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('id', () => {
    const token = 'myid';

    afterEach(() => clearModulesForTest());

    it('should register loaded modules', () => {
      @NgModule({id: token})
      class SomeModule {}
      createModule(SomeModule);

      const moduleType = getNgModuleById(token);
      expect(moduleType).toBeTruthy();
      expect(moduleType).toBe(SomeModule as NgModuleType);

      const factory = getModuleFactory(token);
      expect(factory).toBeTruthy();
      expect(factory.moduleType).toBe(SomeModule);
    });

    it('should throw when registering a duplicate module', () => {
      // TestBed disables the error that's being tested here, so temporarily re-enable it.
      setAllowDuplicateNgModuleIdsForTest(false);

      @NgModule({id: token})
      class SomeModule {}
      createModule(SomeModule);
      expect(() => {
        @NgModule({id: token})
        class SomeOtherModule {}
        createModule(SomeOtherModule);
      }).toThrowError(/Duplicate module registered/);

      // Re-disable the error.
      setAllowDuplicateNgModuleIdsForTest(true);
    });

    it('should register a module even if not importing the .ngfactory file or calling create()', () => {
      @NgModule({id: 'child'})
      class ChildModule {}

      @NgModule({
        id: 'test',
        imports: [ChildModule],
      })
      class Module {}

      // Verify that we can retrieve NgModule factory by id.
      expect(getModuleFactory('child')).toBeInstanceOf(NgModuleFactory);

      // Verify that we can also retrieve NgModule class by id.
      const moduleType = getNgModuleById('child');
      expect(moduleType).toBeTruthy();
      expect(moduleType).toBe(ChildModule as NgModuleType);
    });
  });

  describe('bootstrap components', () => {
    it('should create ComponentFactories', () => {
      @NgModule({declarations: [SomeComp], bootstrap: [SomeComp]})
      class SomeModule {}

      const ngModule = createModule(SomeModule);
      expect(
        ngModule.componentFactoryResolver.resolveComponentFactory(SomeComp).componentType,
      ).toBe(SomeComp);
    });

    it('should store the ComponentFactories in the NgModuleInjector', () => {
      @NgModule({declarations: [SomeComp], bootstrap: [SomeComp]})
      class SomeModule {}

      const ngModule = <InternalNgModuleRef<any>>createModule(SomeModule);
      expect(ngModule._bootstrapComponents.length).toBe(1);
      expect(ngModule._bootstrapComponents[0]).toBe(SomeComp);
    });
  });

  describe('directives and pipes', () => {
    describe('declarations', () => {
      it('should be supported in root modules', () => {
        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe, SomeDirective, SomePipe]})
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);

        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should be supported in imported modules', () => {
        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe, SomeDirective, SomePipe]})
        class SomeImportedModule {}

        @NgModule({imports: [SomeImportedModule]})
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should be supported in nested components', () => {
        @Component({
          selector: 'parent',
          template: '<comp></comp>',
          standalone: false,
        })
        class ParentCompUsingModuleDirectiveAndPipe {}

        @NgModule({
          declarations: [
            ParentCompUsingModuleDirectiveAndPipe,
            CompUsingModuleDirectiveAndPipe,
            SomeDirective,
            SomePipe,
          ],
        })
        class SomeModule {}

        const compFixture = createComp(ParentCompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });
    });

    describe('import/export', () => {
      it('should support exported directives and pipes', () => {
        @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
        class SomeImportedModule {}

        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe], imports: [SomeImportedModule]})
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should support exported directives and pipes if the module is wrapped into an `ModuleWithProviders`', () => {
        @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
        class SomeImportedModule {}

        @NgModule({
          declarations: [CompUsingModuleDirectiveAndPipe],
          imports: [{ngModule: SomeImportedModule}],
        })
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should support reexported modules', () => {
        @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
        class SomeReexportedModule {}

        @NgModule({exports: [SomeReexportedModule]})
        class SomeImportedModule {}

        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe], imports: [SomeImportedModule]})
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should support exporting individual directives of an imported module', () => {
        @NgModule({declarations: [SomeDirective, SomePipe], exports: [SomeDirective, SomePipe]})
        class SomeReexportedModule {}

        @NgModule({imports: [SomeReexportedModule], exports: [SomeDirective, SomePipe]})
        class SomeImportedModule {}

        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe], imports: [SomeImportedModule]})
        class SomeModule {}

        const compFixture = createComp(CompUsingModuleDirectiveAndPipe, SomeModule);
        compFixture.detectChanges();
        expect(compFixture.debugElement.children[0].properties['title']).toBe(
          'transformed someValue',
        );
      });

      it('should not use non exported pipes of an imported module', () => {
        @NgModule({
          declarations: [SomePipe],
        })
        class SomeImportedModule {}

        @NgModule({declarations: [CompUsingModuleDirectiveAndPipe], imports: [SomeImportedModule]})
        class SomeModule {}

        expect(() => createComp(CompUsingModuleDirectiveAndPipe, SomeModule)).toThrowError(
          /The pipe 'somePipe' could not be found/,
        );
      });
    });
  });

  describe('providers', function () {
    let moduleType: any = null;

    function createInjector(providers: Provider[], parent?: Injector | null): Injector {
      @NgModule({providers: providers})
      class SomeModule {}

      moduleType = SomeModule;

      return createModule(SomeModule, parent).injector;
    }

    it('should provide the module', () => {
      expect(createInjector([]).get(moduleType)).toBeInstanceOf(moduleType);
    });

    it('should instantiate a class without dependencies', () => {
      const injector = createInjector([Engine]);
      const engine = injector.get(Engine);

      expect(engine).toBeInstanceOf(Engine);
    });

    it('should resolve dependencies based on type information', () => {
      const injector = createInjector([Engine, Car]);
      const car = injector.get(Car);

      expect(car).toBeInstanceOf(Car);
      expect(car.engine).toBeInstanceOf(Engine);
    });

    it('should resolve dependencies based on @Inject annotation', () => {
      const injector = createInjector([TurboEngine, Engine, CarWithInject]);
      const car = injector.get(CarWithInject);

      expect(car).toBeInstanceOf(CarWithInject);
      expect(car.engine).toBeInstanceOf(TurboEngine);
    });

    it('should throw when no type and not @Inject (class case)', () => {
      expect(() => createInjector([NoAnnotations])).toThrowError(
        "NG0204: Can't resolve all parameters for NoAnnotations: (?).",
      );
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

    it('should provide to a factory', () => {
      function sportsCarFactory(e: Engine) {
        return new SportsCar(e);
      }

      const injector = createInjector([
        Engine,
        {provide: Car, useFactory: sportsCarFactory, deps: [Engine]},
      ]);

      const car = injector.get(Car);
      expect(car).toBeInstanceOf(SportsCar);
      expect(car.engine).toBeInstanceOf(Engine);
    });

    it('should supporting provider to null', () => {
      const injector = createInjector([{provide: Engine, useValue: null}]);
      const engine = injector.get(Engine);
      expect(engine).toBeNull();
    });

    it('should provide to an alias', () => {
      const injector = createInjector([
        Engine,
        {provide: SportsCar, useClass: SportsCar},
        {provide: Car, useExisting: SportsCar},
      ]);

      const car = injector.get(Car);
      const sportsCar = injector.get(SportsCar);
      expect(car).toBeInstanceOf(SportsCar);
      expect(car).toBe(sportsCar);
    });

    it('should support multiProviders', () => {
      const injector = createInjector([
        Engine,
        {provide: CARS, useClass: SportsCar, multi: true},
        {provide: CARS, useClass: CarWithOptionalEngine, multi: true},
      ]);

      const cars = injector.get(CARS);
      expect(cars.length).toEqual(2);
      expect(cars[0]).toBeInstanceOf(SportsCar);
      expect(cars[1]).toBeInstanceOf(CarWithOptionalEngine);
    });

    it('should support multiProviders that are created using useExisting', () => {
      const injector = createInjector([
        Engine,
        SportsCar,
        {provide: CARS, useExisting: SportsCar, multi: true},
      ]);

      const cars = injector.get(CARS);
      expect(cars.length).toEqual(1);
      expect(cars[0]).toBe(injector.get(SportsCar));
    });

    it('should throw when the aliased provider does not exist', () => {
      const injector = createInjector([{provide: 'car', useExisting: SportsCar}]);
      const errorMsg =
        `R3InjectorError(SomeModule)[car -> ${stringify(SportsCar)}]: \n  ` +
        `NullInjectorError: No provider for ${stringify(SportsCar)}!`;
      expect(() => injector.get('car')).toThrowError(errorMsg);
    });

    it('should handle forwardRef in useExisting', () => {
      const injector = createInjector([
        {provide: 'originalEngine', useClass: forwardRef(() => Engine)},
        {provide: 'aliasedEngine', useExisting: <any>forwardRef(() => 'originalEngine')},
      ]);
      expect(injector.get('aliasedEngine')).toBeInstanceOf(Engine);
    });

    it('should support overriding factory dependencies', () => {
      const injector = createInjector([
        Engine,
        {provide: Car, useFactory: (e: Engine) => new SportsCar(e), deps: [Engine]},
      ]);

      const car = injector.get(Car);
      expect(car).toBeInstanceOf(SportsCar);
      expect(car.engine).toBeInstanceOf(Engine);
    });

    it('should support optional dependencies', () => {
      const injector = createInjector([CarWithOptionalEngine]);

      const car = injector.get(CarWithOptionalEngine);
      expect(car.engine).toBeNull();
    });

    it('should flatten passed-in providers', () => {
      const injector = createInjector([[[Engine, Car]]]);

      const car = injector.get(Car);
      expect(car).toBeInstanceOf(Car);
    });

    it('should use the last provider when there are multiple providers for same token', () => {
      const injector = createInjector([
        {provide: Engine, useClass: Engine},
        {provide: Engine, useClass: TurboEngine},
      ]);

      expect(injector.get(Engine)).toBeInstanceOf(TurboEngine);
    });

    it('should use non-type tokens', () => {
      const injector = createInjector([{provide: 'token', useValue: 'value'}]);

      expect(injector.get('token')).toEqual('value');
    });

    it('should throw when given invalid providers', () => {
      expect(() => createInjector(<any>['blah'])).toThrowError(
        `Invalid provider for the NgModule 'SomeModule' - only instances of Provider and Type are allowed, got: [?blah?]`,
      );
    });

    it('should throw when given blank providers', () => {
      expect(() => createInjector(<any>[null, {provide: 'token', useValue: 'value'}])).toThrowError(
        `Invalid provider for the NgModule 'SomeModule' - only instances of Provider and Type are allowed, got: [?null?, ...]`,
      );
    });

    it('should provide itself', () => {
      const parent = createInjector([]);
      const child = createInjector([], parent);

      expect(child.get(Injector)).toBe(child);
    });

    it('should provide undefined', () => {
      let factoryCounter = 0;

      const injector = createInjector([
        {
          provide: 'token',
          useFactory: () => {
            factoryCounter++;
            return undefined;
          },
        },
      ]);

      expect(injector.get('token')).toBeUndefined();
      expect(injector.get('token')).toBeUndefined();
      expect(factoryCounter).toBe(1);
    });

    describe('injecting lazy providers into an eager provider via Injector.get', () => {
      it('should inject providers that were declared before it', () => {
        @NgModule({
          providers: [
            {provide: 'lazy', useFactory: () => 'lazyValue'},
            {
              provide: 'eager',
              useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
              deps: [Injector],
            },
          ],
        })
        class MyModule {
          // NgModule is eager, which makes all of its deps eager
          constructor(@Inject('eager') eager: any) {}
        }

        expect(createModule(MyModule).injector.get('eager')).toBe('eagerValue: lazyValue');
      });

      it('should inject providers that were declared after it', () => {
        @NgModule({
          providers: [
            {
              provide: 'eager',
              useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
              deps: [Injector],
            },
            {provide: 'lazy', useFactory: () => 'lazyValue'},
          ],
        })
        class MyModule {
          // NgModule is eager, which makes all of its deps eager
          constructor(@Inject('eager') eager: any) {}
        }

        expect(createModule(MyModule).injector.get('eager')).toBe('eagerValue: lazyValue');
      });
    });

    describe('injecting eager providers into an eager provider via Injector.get', () => {
      it('should inject providers that were declared before it', () => {
        @NgModule({
          providers: [
            {provide: 'eager1', useFactory: () => 'v1'},
            {
              provide: 'eager2',
              useFactory: (i: Injector) => `v2: ${i.get('eager1')}`,
              deps: [Injector],
            },
          ],
        })
        class MyModule {
          // NgModule is eager, which makes all of its deps eager
          constructor(@Inject('eager1') eager1: any, @Inject('eager2') eager2: any) {}
        }

        expect(createModule(MyModule).injector.get('eager2')).toBe('v2: v1');
      });

      it('should inject providers that were declared after it', () => {
        @NgModule({
          providers: [
            {
              provide: 'eager1',
              useFactory: (i: Injector) => `v1: ${i.get('eager2')}`,
              deps: [Injector],
            },
            {provide: 'eager2', useFactory: () => 'v2'},
          ],
        })
        class MyModule {
          // NgModule is eager, which makes all of its deps eager
          constructor(@Inject('eager1') eager1: any, @Inject('eager2') eager2: any) {}
        }

        expect(createModule(MyModule).injector.get('eager1')).toBe('v1: v2');
      });

      it('eager providers should get initialized only once', () => {
        @Injectable()
        class MyService1 {
          public innerService: MyService2;
          constructor(injector: Injector) {
            // Create MyService2 before it's initialized by TestModule.
            this.innerService = injector.get(MyService2);
          }
        }

        @Injectable()
        class MyService2 {
          constructor() {}
        }

        @NgModule({
          providers: [MyService1, MyService2],
        })
        class TestModule {
          constructor(
            public service1: MyService1,
            public service2: MyService2,
          ) {}
        }

        const moduleRef = createModule(TestModule, injector);
        const module = moduleRef.instance;

        // MyService2 should not get initialized twice.
        expect(module.service1.innerService).toBe(module.service2);
      });
    });

    it('should throw when no provider defined', () => {
      const injector = createInjector([]);
      const errorMsg =
        `R3InjectorError(SomeModule)[NonExisting]: \n  ` +
        'NullInjectorError: No provider for NonExisting!';
      expect(() => injector.get('NonExisting')).toThrowError(errorMsg);
    });

    it('should throw when trying to instantiate a cyclic dependency', () => {
      expect(() =>
        createInjector([Car, {provide: Engine, useClass: CyclicEngine}]).get(Car),
      ).toThrowError(/NG0200: Circular dependency in DI detected for Car/g);
    });

    it('should support null values', () => {
      const injector = createInjector([{provide: 'null', useValue: null}]);
      expect(injector.get('null')).toBe(null);
    });

    describe('child', () => {
      it('should load instances from parent injector', () => {
        const parent = createInjector([Engine]);
        const child = createInjector([], parent);

        const engineFromParent = parent.get(Engine);
        const engineFromChild = child.get(Engine);

        expect(engineFromChild).toBe(engineFromParent);
      });

      it('should not use the child providers when resolving the dependencies of a parent provider', () => {
        const parent = createInjector([Car, Engine]);
        const child = createInjector([{provide: Engine, useClass: TurboEngine}], parent);

        const carFromChild = child.get(Car);
        expect(carFromChild.engine).toBeInstanceOf(Engine);
      });

      it('should create new instance in a child injector', () => {
        const parent = createInjector([Engine]);
        const child = createInjector([{provide: Engine, useClass: TurboEngine}], parent);

        const engineFromParent = parent.get(Engine);
        const engineFromChild = child.get(Engine);

        expect(engineFromParent).not.toBe(engineFromChild);
        expect(engineFromChild).toBeInstanceOf(TurboEngine);
      });
    });

    describe('dependency resolution', () => {
      describe('@Self()', () => {
        it('should return a dependency from self', () => {
          const inj = createInjector([
            Engine,
            {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [[Engine, new Self()]]},
          ]);

          expect(inj.get(Car)).toBeInstanceOf(Car);
        });
      });

      describe('default', () => {
        it('should not skip self', () => {
          const parent = createInjector([Engine]);
          const child = createInjector(
            [
              {provide: Engine, useClass: TurboEngine},
              {provide: Car, useFactory: (e: Engine) => new Car(e), deps: [Engine]},
            ],
            parent,
          );

          expect(child.get(Car).engine).toBeInstanceOf(TurboEngine);
        });
      });
    });

    describe('lifecycle', () => {
      it('should instantiate modules eagerly', () => {
        let created = false;

        @NgModule()
        class ImportedModule {
          constructor() {
            created = true;
          }
        }

        @NgModule({imports: [ImportedModule]})
        class SomeModule {}

        createModule(SomeModule);

        expect(created).toBe(true);
      });

      it('should instantiate providers that are not used by a module lazily', () => {
        let created = false;

        createInjector([
          {
            provide: 'someToken',
            useFactory: () => {
              created = true;
              return true;
            },
          },
        ]);

        expect(created).toBe(false);
      });

      it('should support ngOnDestroy on any provider', () => {
        let destroyed = false;

        class SomeInjectable {
          ngOnDestroy() {
            destroyed = true;
          }
        }

        @NgModule({providers: [SomeInjectable]})
        class SomeModule {
          // Inject SomeInjectable to make it eager...
          constructor(i: SomeInjectable) {}
        }

        const moduleRef = createModule(SomeModule);
        expect(destroyed).toBe(false);
        moduleRef.destroy();
        expect(destroyed).toBe(true);
      });

      it('should support ngOnDestroy for lazy providers', () => {
        let created = false;
        let destroyed = false;

        class SomeInjectable {
          constructor() {
            created = true;
          }
          ngOnDestroy() {
            destroyed = true;
          }
        }

        @NgModule({providers: [SomeInjectable]})
        class SomeModule {}

        let moduleRef = createModule(SomeModule);
        expect(created).toBe(false);
        expect(destroyed).toBe(false);

        // no error if the provider was not yet created
        moduleRef.destroy();
        expect(created).toBe(false);
        expect(destroyed).toBe(false);

        moduleRef = createModule(SomeModule);
        moduleRef.injector.get(SomeInjectable);
        expect(created).toBe(true);
        moduleRef.destroy();
        expect(destroyed).toBe(true);
      });
    });

    describe('imported and exported modules', () => {
      it('should add the providers of imported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
        class ImportedModule {}

        @NgModule({imports: [ImportedModule]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;

        expect(injector.get(SomeModule)).toBeInstanceOf(SomeModule);
        expect(injector.get(ImportedModule)).toBeInstanceOf(ImportedModule);
        expect(injector.get('token1')).toBe('imported');
      });

      it('should add the providers of imported ModuleWithProviders', () => {
        @NgModule()
        class ImportedModule {}

        @NgModule({
          imports: [
            {ngModule: ImportedModule, providers: [{provide: 'token1', useValue: 'imported'}]},
          ],
        })
        class SomeModule {}

        const injector = createModule(SomeModule).injector;

        expect(injector.get(SomeModule)).toBeInstanceOf(SomeModule);
        expect(injector.get(ImportedModule)).toBeInstanceOf(ImportedModule);
        expect(injector.get('token1')).toBe('imported');
      });

      it('should overwrite the providers of imported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
        class ImportedModule {}

        @NgModule({providers: [{provide: 'token1', useValue: 'direct'}], imports: [ImportedModule]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('direct');
      });

      it('should overwrite the providers of imported ModuleWithProviders', () => {
        @NgModule()
        class ImportedModule {}

        @NgModule({
          providers: [{provide: 'token1', useValue: 'direct'}],
          imports: [
            {ngModule: ImportedModule, providers: [{provide: 'token1', useValue: 'imported'}]},
          ],
        })
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('direct');
      });

      it('should overwrite the providers of imported modules on the second import level', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
        class ImportedModuleLevel2 {}

        @NgModule({
          providers: [{provide: 'token1', useValue: 'direct'}],
          imports: [ImportedModuleLevel2],
        })
        class ImportedModuleLevel1 {}

        @NgModule({imports: [ImportedModuleLevel1]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('direct');
      });

      it('should add the providers of exported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
        class ExportedValue {}

        @NgModule({exports: [ExportedValue]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;

        expect(injector.get(SomeModule)).toBeInstanceOf(SomeModule);
        expect(injector.get(ExportedValue)).toBeInstanceOf(ExportedValue);
        expect(injector.get('token1')).toBe('exported');
      });

      it('should overwrite the providers of exported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
        class ExportedModule {}

        @NgModule({providers: [{provide: 'token1', useValue: 'direct'}], exports: [ExportedModule]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('direct');
      });

      it('should overwrite the providers of imported modules by following imported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
        class ImportedModule1 {}

        @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
        class ImportedModule2 {}

        @NgModule({imports: [ImportedModule1, ImportedModule2]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('imported2');
      });

      it('should overwrite the providers of exported modules by following exported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'exported1'}]})
        class ExportedModule1 {}

        @NgModule({providers: [{provide: 'token1', useValue: 'exported2'}]})
        class ExportedModule2 {}

        @NgModule({exports: [ExportedModule1, ExportedModule2]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('exported2');
      });

      it('should overwrite the providers of imported modules by exported modules', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported'}]})
        class ImportedModule {}

        @NgModule({providers: [{provide: 'token1', useValue: 'exported'}]})
        class ExportedModule {}

        @NgModule({imports: [ImportedModule], exports: [ExportedModule]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('exported');
      });

      it('should not overwrite the providers if a module was already used on the same level', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
        class ImportedModule1 {}

        @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
        class ImportedModule2 {}

        @NgModule({imports: [ImportedModule1, ImportedModule2, ImportedModule1]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('imported2');
      });

      it('should not overwrite the providers if a module was already used on a child level', () => {
        @NgModule({providers: [{provide: 'token1', useValue: 'imported1'}]})
        class ImportedModule1 {}

        @NgModule({imports: [ImportedModule1]})
        class ImportedModule3 {}

        @NgModule({providers: [{provide: 'token1', useValue: 'imported2'}]})
        class ImportedModule2 {}

        @NgModule({imports: [ImportedModule3, ImportedModule2, ImportedModule1]})
        class SomeModule {}

        const injector = createModule(SomeModule).injector;
        expect(injector.get('token1')).toBe('imported2');
      });

      it('should throw when given invalid providers in an imported ModuleWithProviders', () => {
        @NgModule()
        class ImportedModule1 {}

        @NgModule({imports: [{ngModule: ImportedModule1, providers: [<any>'broken']}]})
        class SomeModule {}

        expect(() => createModule(SomeModule).injector).toThrowError(
          `Invalid provider for the NgModule 'ImportedModule1' - only instances of Provider and Type are allowed, got: [?broken?]`,
        );
      });
    });

    describe('tree shakable providers', () => {
      it('definition should not persist across NgModuleRef instances', () => {
        @NgModule()
        class SomeModule {}

        class Bar {
          static ɵprov = ɵɵdefineInjectable({
            token: Bar,
            factory: () => new Bar(),
            providedIn: SomeModule,
          });
        }

        const factory = createModuleFactory(SomeModule);
        const ngModuleRef1 = factory.create(null);

        // Inject a tree shakeable provider token.
        ngModuleRef1.injector.get(Bar);

        // Tree Shakeable provider definition should be available.
        const providerDef1 = (ngModuleRef1 as any)._r3Injector.records.get(Bar);
        expect(providerDef1).not.toBeUndefined();

        // Instantiate the same module. The tree shakeable provider definition should not be
        // present.
        const ngModuleRef2 = factory.create(null);
        const providerDef2 = (ngModuleRef2 as any)._r3Injector.records.get(Bar);
        expect(providerDef2).toBeUndefined();
      });
    });
  });
});
