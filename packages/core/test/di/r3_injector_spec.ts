/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InjectionToken, INJECTOR, Injector, Optional, ɵɵdefineInjectable, ɵɵdefineInjector, ɵɵinject} from '@angular/core';
import {createInjector, R3Injector} from '@angular/core/src/di/r3_injector';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('InjectorDef-based createInjector()', () => {
  class CircularA {
    static ɵprov = ɵɵdefineInjectable({
      token: CircularA,
      providedIn: null,
      factory: () => ɵɵinject(CircularB),
    });
  }

  class CircularB {
    static ɵprov = ɵɵdefineInjectable({
      token: CircularB,
      providedIn: null,
      factory: () => ɵɵinject(CircularA),
    });
  }

  class Service {
    static ɵprov = ɵɵdefineInjectable({
      token: Service,
      providedIn: null,
      factory: () => new Service(),
    });
  }

  class OptionalService {
    static ɵprov = ɵɵdefineInjectable({
      token: OptionalService,
      providedIn: null,
      factory: () => new OptionalService(),
    });
  }

  class StaticService {
    constructor(readonly dep: Service) {}
  }

  const SERVICE_TOKEN = new InjectionToken<Service>('SERVICE_TOKEN');

  const STATIC_TOKEN = new InjectionToken<StaticService>('STATIC_TOKEN');

  const LOCALE = new InjectionToken<string[]>('LOCALE');

  const PRIMITIVE_VALUE = new InjectionToken<string>('PRIMITIVE_VALUE');
  const UNDEFINED_VALUE = new InjectionToken<undefined>('UNDEFINED_VALUE');

  class ServiceWithDep {
    constructor(readonly service: Service) {}

    static ɵprov = ɵɵdefineInjectable({
      token: ServiceWithDep,
      providedIn: null,
      // ChildService is derived from ServiceWithDep, so the factory function here must do the right
      // thing and create an instance of the requested type if one is given.
      factory: (t?: typeof ServiceWithDep) => new(t || ServiceWithDep)(ɵɵinject(Service)),
    });
  }

  class ServiceWithOptionalDep {
    constructor(@Optional() readonly service: OptionalService|null) {}

    static ɵprov = ɵɵdefineInjectable({
      token: ServiceWithOptionalDep,
      providedIn: null,
      factory: () => new ServiceWithOptionalDep(ɵɵinject(OptionalService, InjectFlags.Optional)),
    });
  }

  class ServiceWithMissingDep {
    constructor(readonly service: Service) {}

    static ɵprov = ɵɵdefineInjectable({
      token: ServiceWithMissingDep,
      providedIn: null,
      factory: () => new ServiceWithMissingDep(ɵɵinject(Service)),
    });
  }

  class ServiceWithMultiDep {
    constructor(readonly locale: string[]) {}

    static ɵprov = ɵɵdefineInjectable({
      token: ServiceWithMultiDep,
      providedIn: null,
      factory: () => new ServiceWithMultiDep(ɵɵinject(LOCALE)),
    });
  }

  class ServiceTwo {
    static ɵprov = ɵɵdefineInjectable({
      token: ServiceTwo,
      providedIn: null,
      factory: () => new ServiceTwo(),
    });
  }

  let deepServiceDestroyed = false;
  class DeepService {
    static ɵprov = ɵɵdefineInjectable({
      token: DeepService,
      providedIn: null,
      factory: () => new DeepService(),
    });

    ngOnDestroy(): void {
      deepServiceDestroyed = true;
    }
  }

  let eagerServiceCreated: boolean = false;
  class EagerService {
    static ɵprov = ɵɵdefineInjectable({
      token: EagerService,
      providedIn: undefined,
      factory: () => new EagerService(),
    });

    constructor() {
      eagerServiceCreated = true;
    }
  }

  let deepModuleCreated: boolean = false;
  class DeepModule {
    constructor(eagerService: EagerService) {
      deepModuleCreated = true;
    }

    static ɵfac = () => new DeepModule(ɵɵinject(EagerService));
    static ɵinj = ɵɵdefineInjector({
      imports: undefined,
      providers:
          [
            EagerService,
            {
              provide: DeepService,
              useFactory:
                  () => {
                    throw new Error('Not overridden!');
                  }
            },
          ],
    });

    static safe() {
      return {
        ngModule: DeepModule,
        providers: [{provide: DeepService}],
      };
    }
  }

  class IntermediateModule {
    static ɵinj = ɵɵdefineInjector({
      imports: [DeepModule.safe()],
      providers: [],
    });
  }

  class InjectorWithDep {
    constructor(readonly service: Service) {}

    static ɵfac = () => new InjectorWithDep(ɵɵinject(Service));
    static ɵinj = ɵɵdefineInjector({});
  }

  class ChildService extends ServiceWithDep {}

  abstract class AbstractService {
    static ɵprov = ɵɵdefineInjectable({
      token: AbstractService,
      providedIn: null,
      factory: () => new AbstractServiceImpl(),
    });
  }
  class AbstractServiceImpl extends AbstractService {}

  class Module {
    static ɵinj = ɵɵdefineInjector({
      imports: [IntermediateModule],
      providers:
          [
            ChildService,
            ServiceWithDep,
            ServiceWithOptionalDep,
            ServiceWithMultiDep,
            {provide: LOCALE, multi: true, useValue: 'en'},
            {provide: LOCALE, multi: true, useValue: 'es'},
            {provide: PRIMITIVE_VALUE, useValue: 'foo'},
            {provide: UNDEFINED_VALUE, useValue: undefined},
            Service,
            {provide: SERVICE_TOKEN, useExisting: Service},
            CircularA,
            CircularB,
            {provide: STATIC_TOKEN, useClass: StaticService, deps: [Service]},
            InjectorWithDep,
            AbstractService,
          ],
    });
  }

  const ABSTRACT_SERVICE_TOKEN_WITH_FACTORY =
      new InjectionToken<AbstractService>('ABSTRACT_SERVICE_TOKEN', {
        providedIn: Module,
        factory: () => ɵɵinject(AbstractService),
      });

  class OtherModule {
    static ɵinj = ɵɵdefineInjector({
      imports: undefined,
      providers: [],
    });
  }

  class ModuleWithMissingDep {
    static ɵinj = ɵɵdefineInjector({
      imports: undefined,
      providers: [ServiceWithMissingDep],
    });
  }

  class NotAModule {}

  class ImportsNotAModule {
    static ɵinj = ɵɵdefineInjector({
      imports: [NotAModule],
      providers: [],
    });
  }

  let scopedServiceDestroyed = false;
  class ScopedService {
    static ɵprov = ɵɵdefineInjectable({
      token: ScopedService,
      providedIn: Module,
      factory: () => new ScopedService(),
    });

    ngOnDestroy(): void {
      scopedServiceDestroyed = true;
    }
  }

  class WrongScopeService {
    static ɵprov = ɵɵdefineInjectable({
      token: WrongScopeService,
      providedIn: OtherModule,
      factory: () => new WrongScopeService(),
    });
  }

  class MultiProviderA {
    static ɵinj = ɵɵdefineInjector({
      providers: [{provide: LOCALE, multi: true, useValue: 'A'}],
    });
  }

  class MultiProviderB {
    static ɵinj = ɵɵdefineInjector({
      providers: [{provide: LOCALE, multi: true, useValue: 'B'}],
    });
  }

  class WithProvidersTest {
    static ɵinj = ɵɵdefineInjector({
      imports: [
        {ngModule: MultiProviderA, providers: [{provide: LOCALE, multi: true, useValue: 'C'}]},
        MultiProviderB
      ],
      providers: [],
    });
  }

  let injector: Injector;

  beforeEach(() => {
    deepModuleCreated = eagerServiceCreated = deepServiceDestroyed = false;
    injector = createInjector(Module);
  });

  it('initializes imported modules before the module being declared', () => {
    const moduleRegistrations: string[] = [];

    class ChildModule {
      static ɵinj = ɵɵdefineInjector({
        imports: undefined,
        providers: [],
      });
      constructor() {
        moduleRegistrations.push('ChildModule');
      }
    }

    class RootModule {
      static ɵinj = ɵɵdefineInjector({
        imports: [ChildModule],
        providers: [],
      });
      constructor() {
        moduleRegistrations.push('RootModule');
      }
    }
    createInjector(RootModule);
    expect(moduleRegistrations).toEqual(['ChildModule', 'RootModule']);
  });

  it('injects a simple class', () => {
    const instance = injector.get(Service);
    expect(instance instanceof Service).toBeTruthy();
    expect(injector.get(Service)).toBe(instance);
  });

  it('returns the default value if a provider isn\'t present', () => {
    expect(injector.get(ServiceTwo, null)).toBeNull();
  });

  it('should throw when no provider defined', () => {
    expect(() => injector.get(ServiceTwo))
        .toThrowError(
            `R3InjectorError(Module)[ServiceTwo]: \n` +
            `  NullInjectorError: No provider for ServiceTwo!`);
  });

  it('should throw without the module name when no module', () => {
    const injector = createInjector([ServiceTwo]);
    expect(() => injector.get(ServiceTwo))
        .toThrowError(
            `R3InjectorError[ServiceTwo]: \n` +
            `  NullInjectorError: No provider for ServiceTwo!`);
  });

  it('should throw with the full path when no provider', () => {
    const injector = createInjector(ModuleWithMissingDep);
    expect(() => injector.get(ServiceWithMissingDep))
        .toThrowError(
            `R3InjectorError(ModuleWithMissingDep)[ServiceWithMissingDep -> Service]: \n` +
            `  NullInjectorError: No provider for Service!`);
  });

  it('injects a service with dependencies', () => {
    const instance = injector.get(ServiceWithDep);
    expect(instance instanceof ServiceWithDep);
    expect(instance.service).toBe(injector.get(Service));
  });

  it('injects a service with optional dependencies', () => {
    const instance = injector.get(ServiceWithOptionalDep);
    expect(instance instanceof ServiceWithOptionalDep);
    expect(instance.service).toBe(null);
  });

  it('injects a service with dependencies on multi-providers', () => {
    const instance = injector.get(ServiceWithMultiDep);
    expect(instance instanceof ServiceWithMultiDep);
    expect(instance.locale).toEqual(['en', 'es']);
  });

  it('should process "InjectionTypeWithProviders" providers after imports injection type', () => {
    injector = createInjector(WithProvidersTest);
    expect(injector.get(LOCALE)).toEqual(['A', 'B', 'C']);
  });

  it('injects an injector with dependencies', () => {
    const instance = injector.get(InjectorWithDep);
    expect(instance instanceof InjectorWithDep);
    expect(instance.service).toBe(injector.get(Service));
  });

  it('injects a token with useExisting', () => {
    const instance = injector.get(SERVICE_TOKEN);
    expect(instance).toBe(injector.get(Service));
  });

  it('injects a useValue token with a primitive value', () => {
    const value = injector.get(PRIMITIVE_VALUE);
    expect(value).toEqual('foo');
  });

  it('injects a useValue token with value undefined', () => {
    const value = injector.get(UNDEFINED_VALUE);
    expect(value).toBeUndefined();
  });

  it('instantiates a class with useClass and deps', () => {
    const instance = injector.get(STATIC_TOKEN);
    expect(instance instanceof StaticService).toBeTruthy();
    expect(instance.dep).toBe(injector.get(Service));
  });

  it('allows injecting itself via INJECTOR', () => {
    expect(injector.get(INJECTOR)).toBe(injector);
  });

  it('allows injecting itself via Injector', () => {
    expect(injector.get(Injector)).toBe(injector);
  });

  it('allows injecting a deeply imported service', () => {
    expect(injector.get(DeepService) instanceof DeepService).toBeTruthy();
  });

  it('allows injecting a scoped service', () => {
    const instance = injector.get(ScopedService);
    expect(instance instanceof ScopedService).toBeTruthy();
    expect(instance).toBe(injector.get(ScopedService));
  });

  it('allows injecting an inherited service', () => {
    const instance = injector.get(ChildService);
    expect(instance instanceof ChildService).toBe(true);
  });

  it('does not create instances of a service not in scope', () => {
    expect(injector.get(WrongScopeService, null)).toBeNull();
  });

  it('eagerly instantiates the injectordef types', () => {
    expect(deepModuleCreated).toBe(true, 'DeepModule not instantiated');
    expect(eagerServiceCreated).toBe(true, 'EagerSerivce not instantiated');
  });

  it('calls ngOnDestroy on services when destroyed', () => {
    injector.get(DeepService);
    expect(deepServiceDestroyed).toBe(false, 'DeepService already destroyed');
    (injector as R3Injector).destroy();
    expect(deepServiceDestroyed).toBe(true, 'DeepService not destroyed');
  });

  it('calls ngOnDestroy on scoped providers', () => {
    injector.get(ScopedService);
    expect(scopedServiceDestroyed).toBe(false, 'ScopedService already destroyed');
    (injector as R3Injector).destroy();
    expect(scopedServiceDestroyed).toBe(true, 'ScopedService not destroyed');
  });

  it('does not allow injection after destroy', () => {
    (injector as R3Injector).destroy();
    expect(() => injector.get(DeepService)).toThrowError('Injector has already been destroyed.');
  });

  it('does not allow double destroy', () => {
    (injector as R3Injector).destroy();
    expect(() => (injector as R3Injector).destroy())
        .toThrowError('Injector has already been destroyed.');
  });

  it('should not crash when importing something that has no ɵinj', () => {
    injector = createInjector(ImportsNotAModule);
    expect(injector.get(ImportsNotAModule)).toBeDefined();
  });

  it('injects an abstract class', () => {
    const instance = injector.get(AbstractService);
    expect(instance instanceof AbstractServiceImpl).toBeTruthy();
    expect(injector.get(AbstractService)).toBe(instance);
  });

  it('injects an abstract class in an InjectionToken factory', () => {
    const instance = injector.get(ABSTRACT_SERVICE_TOKEN_WITH_FACTORY);
    expect(instance instanceof AbstractServiceImpl).toBeTruthy();
    expect(injector.get(ABSTRACT_SERVICE_TOKEN_WITH_FACTORY)).toBe(instance);
  });

  describe('error handling', () => {
    it('throws an error when a token is not found', () => {
      expect(() => injector.get(ServiceTwo)).toThrow();
    });

    it('throws an error on circular deps', () => {
      expect(() => injector.get(CircularA)).toThrow();
    });

    it('should throw when it can\'t resolve all arguments', () => {
      class MissingArgumentType {
        constructor(missingType: any) {}
      }
      class ErrorModule {
        static ɵinj = ɵɵdefineInjector({providers: [MissingArgumentType]});
      }
      expect(() => createInjector(ErrorModule).get(MissingArgumentType))
          .toThrowError('Can\'t resolve all parameters for MissingArgumentType: (?).');
    });
  });
});
