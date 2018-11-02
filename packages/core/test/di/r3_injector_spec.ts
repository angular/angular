/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, defineInjector} from '../../src/di/defs';
import {InjectionToken} from '../../src/di/injection_token';
import {INJECTOR, Injector} from '../../src/di/injector';
import {inject} from '../../src/di/injector_compatibility';
import {R3Injector, createInjector} from '../../src/di/r3_injector';

describe('InjectorDef-based createInjector()', () => {
  class CircularA {
    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => inject(CircularB),
    });
  }

  class CircularB {
    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => inject(CircularA),
    });
  }

  class Service {
    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => new Service(),
    });
  }

  class StaticService {
    constructor(readonly dep: Service) {}
  }

  const SERVICE_TOKEN = new InjectionToken<Service>('SERVICE_TOKEN');

  const STATIC_TOKEN = new InjectionToken<StaticService>('STATIC_TOKEN');

  const LOCALE = new InjectionToken<string[]>('LOCALE');

  class ServiceWithDep {
    constructor(readonly service: Service) {}

    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => new ServiceWithDep(inject(Service)),
    });
  }

  class ServiceWithMultiDep {
    constructor(readonly locale: string[]) {}

    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => new ServiceWithMultiDep(inject(LOCALE)),
    });
  }

  class ServiceTwo {
    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => new ServiceTwo(),
    });
  }

  let deepServiceDestroyed = false;
  class DeepService {
    static ngInjectableDef = defineInjectable({
      providedIn: null,
      factory: () => new DeepService(),
    });

    ngOnDestroy(): void { deepServiceDestroyed = true; }
  }

  let eagerServiceCreated: boolean = false;
  class EagerService {
    static ngInjectableDef = defineInjectable({
      providedIn: undefined,
      factory: () => new EagerService(),
    });

    constructor() { eagerServiceCreated = true; }
  }

  let deepModuleCreated: boolean = false;
  class DeepModule {
    constructor(eagerService: EagerService) { deepModuleCreated = true; }

    static ngInjectorDef = defineInjector({
      factory: () => new DeepModule(inject(EagerService)),
      imports: undefined,
      providers: [
        EagerService,
        {provide: DeepService, useFactory: () => { throw new Error('Not overridden!'); }},
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
    static ngInjectorDef = defineInjector({
      factory: () => new IntermediateModule(),
      imports: [DeepModule.safe()],
      providers: [],
    });
  }

  class Module {
    static ngInjectorDef = defineInjector({
      factory: () => new Module(),
      imports: [IntermediateModule],
      providers: [
        ServiceWithDep,
        ServiceWithMultiDep,
        {provide: LOCALE, multi: true, useValue: 'en'},
        {provide: LOCALE, multi: true, useValue: 'es'},
        Service,
        {provide: SERVICE_TOKEN, useExisting: Service},
        CircularA,
        CircularB,
        {provide: STATIC_TOKEN, useClass: StaticService, deps: [Service]},
      ],
    });
  }

  class OtherModule {
    static ngInjectorDef = defineInjector({
      factory: () => new OtherModule(),
      imports: undefined,
      providers: [],
    });
  }

  class NotAModule {}

  class ImportsNotAModule {
    static ngInjectorDef = defineInjector({
      factory: () => new ImportsNotAModule(),
      imports: [NotAModule],
      providers: [],
    });
  }

  class ScopedService {
    static ngInjectableDef = defineInjectable({
      providedIn: Module,
      factory: () => new ScopedService(),
    });
  }

  class WrongScopeService {
    static ngInjectableDef = defineInjectable({
      providedIn: OtherModule,
      factory: () => new WrongScopeService(),
    });
  }

  let injector: Injector;

  beforeEach(() => {
    deepModuleCreated = eagerServiceCreated = deepServiceDestroyed = false;
    injector = createInjector(Module);
  });

  it('injects a simple class', () => {
    const instance = injector.get(Service);
    expect(instance instanceof Service).toBeTruthy();
    expect(injector.get(Service)).toBe(instance);
  });

  it('throws an error when a token is not found',
     () => { expect(() => injector.get(ServiceTwo)).toThrow(); });

  it('returns the default value if a provider isn\'t present',
     () => { expect(injector.get(ServiceTwo, null)).toBeNull(); });

  it('injects a service with dependencies', () => {
    const instance = injector.get(ServiceWithDep);
    expect(instance instanceof ServiceWithDep);
    expect(instance.service).toBe(injector.get(Service));
  });

  it('injects a service with dependencies on multi-providers', () => {
    const instance = injector.get(ServiceWithMultiDep);
    expect(instance instanceof ServiceWithMultiDep);
    expect(instance.locale).toEqual(['en', 'es']);
  });

  it('injects a token with useExisting', () => {
    const instance = injector.get(SERVICE_TOKEN);
    expect(instance).toBe(injector.get(Service));
  });

  it('instantiates a class with useClass and deps', () => {
    const instance = injector.get(STATIC_TOKEN);
    expect(instance instanceof StaticService).toBeTruthy();
    expect(instance.dep).toBe(injector.get(Service));
  });

  it('throws an error on circular deps',
     () => { expect(() => injector.get(CircularA)).toThrow(); });

  it('allows injecting itself via INJECTOR',
     () => { expect(injector.get(INJECTOR)).toBe(injector); });

  it('allows injecting itself via Injector',
     () => { expect(injector.get(Injector)).toBe(injector); });

  it('allows injecting a deeply imported service',
     () => { expect(injector.get(DeepService) instanceof DeepService).toBeTruthy(); });

  it('allows injecting a scoped service', () => {
    const instance = injector.get(ScopedService);
    expect(instance instanceof ScopedService).toBeTruthy();
    expect(instance).toBe(injector.get(ScopedService));
  });

  it('does not create instances of a service not in scope',
     () => { expect(injector.get(WrongScopeService, null)).toBeNull(); });

  it('eagerly instantiates the injectordef types', () => {
    expect(deepModuleCreated).toBe(true, 'DeepModule not instantiated');
    expect(eagerServiceCreated).toBe(true, 'EagerSerivce not instantiated');
  });

  it('calls ngOnDestroy on services when destroyed', () => {
    injector.get(DeepService);
    (injector as R3Injector).destroy();
    expect(deepServiceDestroyed).toBe(true, 'DeepService not destroyed');
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

  it('should not crash when importing something that has no ngInjectorDef', () => {
    injector = createInjector(ImportsNotAModule);
    expect(injector.get(ImportsNotAModule)).toBeDefined();
  });
});
