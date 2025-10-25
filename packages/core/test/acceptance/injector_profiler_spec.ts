/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgForOf, PercentPipe} from '@angular/common';
import {
  afterEveryRender,
  ClassProvider,
  Component,
  Directive,
  ElementRef,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  NgModuleRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '../../src/core';
import {InternalInjectFlags} from '../../src/di/interface/injector';
import {NullInjector} from '../../src/di/null_injector';
import {
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
  isTypeProvider,
  isValueProvider,
} from '../../src/di/provider_collection';
import {EnvironmentInjector, R3Injector} from '../../src/di/r3_injector';
import {setupFrameworkInjectorProfiler} from '../../src/render3/debug/framework_injector_profiler';
import {
  getInjectorProfilerContext,
  InjectedServiceEvent,
  InjectorToCreateInstanceEvent,
  InjectorCreatedInstanceEvent,
  InjectorProfilerEvent,
  InjectorProfilerEventType,
  ProviderConfiguredEvent,
  setInjectorProfiler,
  injectorProfiler,
  InjectorProfilerContext,
} from '../../src/render3/debug/injector_profiler';
import {getNodeInjectorLView, NodeInjector} from '../../src/render3/di';
import {
  getDependenciesFromInjectable,
  getInjectorMetadata,
  getInjectorProviders,
  getInjectorResolutionPath,
} from '../../src/render3/util/injector_discovery_utils';
import {fakeAsync, tick} from '../../testing';
import {TestBed} from '../../testing/src/test_bed';
import {BrowserModule} from '@angular/platform-browser';
import {Router, RouterModule, RouterOutlet} from '@angular/router';

describe('setProfiler', () => {
  let injectEvents: InjectedServiceEvent[] = [];
  let aboutToCreateEvents: InjectorToCreateInstanceEvent[] = [];
  let createEvents: InjectorCreatedInstanceEvent[] = [];
  let providerConfiguredEvents: ProviderConfiguredEvent[] = [];

  function searchForProfilerEvent<T extends InjectorProfilerEvent>(
    events: T[],
    condition: (event: T) => boolean,
  ): T | undefined {
    return events.find((event) => condition(event)) as T;
  }

  beforeEach(() => {
    injectEvents = [];
    aboutToCreateEvents = [];
    createEvents = [];
    providerConfiguredEvents = [];

    setInjectorProfiler(null);
    setInjectorProfiler((injectorProfilerEvent: InjectorProfilerEvent) => {
      const {type} = injectorProfilerEvent;
      if (type === InjectorProfilerEventType.Inject) {
        injectEvents.push({
          service: injectorProfilerEvent.service,
          context: getInjectorProfilerContext(),
          type,
        });
      } else if (type === InjectorProfilerEventType.InstanceCreatedByInjector) {
        createEvents.push({
          instance: injectorProfilerEvent.instance,
          context: getInjectorProfilerContext(),
          type,
        });
      } else if (type === InjectorProfilerEventType.ProviderConfigured) {
        providerConfiguredEvents.push({
          providerRecord: injectorProfilerEvent.providerRecord,
          context: getInjectorProfilerContext(),
          type,
        });
      } else if (type === InjectorProfilerEventType.InjectorToCreateInstanceEvent) {
        aboutToCreateEvents.push(injectorProfilerEvent);
      } else {
        throw new Error('Unexpected event type: ' + type);
      }
    });
  });

  afterEach(() => setInjectorProfiler(null));

  it('should emit DI events when a component contains a provider and injects it', () => {
    class MyService {}

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      providers: [MyService],
      standalone: false,
    })
    class MyComponent {
      myService = inject(MyService);
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);
    const myComp = fixture.componentInstance;

    // MyService should have been configured
    const myServiceProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyService,
    );
    expect(myServiceProviderConfiguredEvent).toBeTruthy();

    // inject(MyService) was called
    const myServiceInjectEvent = searchForProfilerEvent<InjectedServiceEvent>(
      injectEvents,
      (event) => event.service.token === MyService,
    );
    expect(myServiceInjectEvent).toBeTruthy();
    expect(myServiceInjectEvent!.service.value).toBe(myComp.myService);
    expect(myServiceInjectEvent!.service.flags).toBe(InternalInjectFlags.Default);

    // myComp is an angular instance that is able to call `inject` in it's constructor, so a
    // create event should have been emitted for it
    const componentCreateEvent = searchForProfilerEvent<InjectorCreatedInstanceEvent>(
      createEvents,
      (event) => event.instance.value === myComp,
    );
    const componentAboutToCreateEvent = searchForProfilerEvent<InjectorToCreateInstanceEvent>(
      aboutToCreateEvents,
      (event) => event.token === MyComponent,
    );
    expect(componentAboutToCreateEvent).toBeDefined();
    expect(componentCreateEvent).toBeTruthy();
  });

  it('should emit the correct DI events when a service is injected with injection flags', () => {
    class MyService {}
    class MyServiceB {}
    class MyServiceC {}

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      providers: [MyService, {provide: MyServiceB, useValue: 0}],
      standalone: false,
    })
    class MyComponent {
      myService = inject(MyService, {self: true});
      myServiceD = inject(MyServiceB, {skipSelf: true});
      myServiceC = inject(MyServiceC, {optional: true});
    }

    TestBed.configureTestingModule({
      providers: [MyServiceB, MyServiceC, {provide: MyServiceB, useValue: 1}],
      declarations: [MyComponent],
    });
    TestBed.createComponent(MyComponent);

    const myServiceInjectEvent = searchForProfilerEvent<InjectedServiceEvent>(
      injectEvents,
      (event) => event.service.token === MyService,
    );
    const myServiceBInjectEvent = searchForProfilerEvent(
      injectEvents,
      (event) => event.service.token === MyServiceB,
    );
    const myServiceCInjectEvent = searchForProfilerEvent(
      injectEvents,
      (event) => event.service.token === MyServiceC,
    );

    expect(myServiceInjectEvent!.service.flags).toBe(InternalInjectFlags.Self);
    expect(myServiceBInjectEvent!.service.flags).toBe(InternalInjectFlags.SkipSelf);
    expect(myServiceBInjectEvent!.service.value).toBe(1);
    expect(myServiceCInjectEvent!.service.flags).toBe(InternalInjectFlags.Optional);
  });

  it('should emit correct DI events when providers are configured with useFactory, useExisting, useClass, useValue', () => {
    class MyService {}
    class MyServiceB {}
    class MyServiceC {}
    class MyServiceD {}
    class MyServiceE {}

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      providers: [
        MyService,
        {provide: MyServiceB, useFactory: () => new MyServiceB()},
        {provide: MyServiceC, useExisting: MyService},
        {provide: MyServiceD, useValue: 'hello world'},
        {provide: MyServiceE, useClass: class MyExampleClass {}},
      ],
      standalone: false,
    })
    class MyComponent {
      myService = inject(MyService);
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    TestBed.createComponent(MyComponent);

    // MyService should have been configured
    const myServiceProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyService,
    );
    const myServiceBProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyServiceB,
    );
    const myServiceCProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyServiceC,
    );
    const myServiceDProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyServiceD,
    );
    const myServiceEProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyServiceE,
    );

    expect(isTypeProvider(myServiceProviderConfiguredEvent!.providerRecord.provider!)).toBeTrue();
    expect(
      isFactoryProvider(myServiceBProviderConfiguredEvent!.providerRecord.provider!),
    ).toBeTrue();
    expect(
      isExistingProvider(myServiceCProviderConfiguredEvent!.providerRecord.provider!),
    ).toBeTrue();
    expect(isValueProvider(myServiceDProviderConfiguredEvent!.providerRecord.provider!)).toBeTrue();
    expect(isClassProvider(myServiceEProviderConfiguredEvent!.providerRecord.provider!)).toBeTrue();
  });

  it('should emit correct DI events when providers are configured with multi', () => {
    class MyService {}

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      providers: [
        {provide: MyService, useClass: MyService, multi: true},
        {provide: MyService, useFactory: () => new MyService(), multi: true},
        {provide: MyService, useValue: 'hello world', multi: true},
      ],
      standalone: false,
    })
    class MyComponent {
      myService = inject(MyService);
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    TestBed.createComponent(MyComponent);

    // MyService should have been configured
    const myServiceProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === MyService,
    );

    expect(
      (myServiceProviderConfiguredEvent!.providerRecord?.provider as ClassProvider).multi,
    ).toBeTrue();
  });

  it('should emit correct DI events when service providers are configured with providedIn', () => {
    @Injectable({providedIn: 'root'})
    class RootService {}

    @Injectable({providedIn: 'platform'})
    class PlatformService {}

    const providedInRootInjectionToken = new InjectionToken('providedInRootInjectionToken', {
      providedIn: 'root',
      factory: () => 'hello world',
    });

    const providedInPlatformToken = new InjectionToken('providedInPlatformToken', {
      providedIn: 'platform',
      factory: () => 'hello world',
    });

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      standalone: false,
    })
    class MyComponent {
      rootService = inject(RootService);
      platformService = inject(PlatformService);
      fromRoot = inject(providedInRootInjectionToken);
      fromPlatform = inject(providedInPlatformToken);
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    TestBed.createComponent(MyComponent);

    // MyService should have been configured
    const rootServiceProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === RootService,
    );

    expect(rootServiceProviderConfiguredEvent).toBeTruthy();
    expect(rootServiceProviderConfiguredEvent!.context).toBeTruthy();
    expect(rootServiceProviderConfiguredEvent!.context!.injector).toBeInstanceOf(R3Injector);
    expect(
      (rootServiceProviderConfiguredEvent!.context!.injector as R3Injector).scopes.has('root'),
    ).toBeTrue();

    const platformServiceProviderConfiguredEvent = searchForProfilerEvent<ProviderConfiguredEvent>(
      providerConfiguredEvents,
      (event) => event.providerRecord.token === PlatformService,
    );
    expect(platformServiceProviderConfiguredEvent).toBeTruthy();
    expect(platformServiceProviderConfiguredEvent!.context).toBeTruthy();
    expect(platformServiceProviderConfiguredEvent!.context!.injector).toBeInstanceOf(R3Injector);
    expect(
      (platformServiceProviderConfiguredEvent!.context!.injector as R3Injector).scopes.has(
        'platform',
      ),
    ).toBeTrue();

    const providedInRootInjectionTokenProviderConfiguredEvent =
      searchForProfilerEvent<ProviderConfiguredEvent>(
        providerConfiguredEvents,
        (event) => event.providerRecord.token === providedInRootInjectionToken,
      );
    expect(providedInRootInjectionTokenProviderConfiguredEvent).toBeTruthy();
    expect(providedInRootInjectionTokenProviderConfiguredEvent!.context).toBeTruthy();
    expect(providedInRootInjectionTokenProviderConfiguredEvent!.context!.injector).toBeInstanceOf(
      R3Injector,
    );
    expect(
      (
        providedInRootInjectionTokenProviderConfiguredEvent!.context!.injector as R3Injector
      ).scopes.has('root'),
    ).toBeTrue();
    expect(providedInRootInjectionTokenProviderConfiguredEvent!.providerRecord.token).toBe(
      providedInRootInjectionToken,
    );

    const providedInPlatformTokenProviderConfiguredEvent =
      searchForProfilerEvent<ProviderConfiguredEvent>(
        providerConfiguredEvents,
        (event) => event.providerRecord.token === providedInPlatformToken,
      );
    expect(providedInPlatformTokenProviderConfiguredEvent).toBeTruthy();
    expect(providedInPlatformTokenProviderConfiguredEvent!.context).toBeTruthy();
    expect(providedInPlatformTokenProviderConfiguredEvent!.context!.injector).toBeInstanceOf(
      R3Injector,
    );
    expect(
      (providedInPlatformTokenProviderConfiguredEvent!.context!.injector as R3Injector).scopes.has(
        'platform',
      ),
    ).toBeTrue();
    expect(providedInPlatformTokenProviderConfiguredEvent!.providerRecord.token).toBe(
      providedInPlatformToken,
    );
  });
});

describe('profiler activation and removal', () => {
  class SomeClass {}

  const fakeContext: InjectorProfilerContext = {
    injector: Injector.create({providers: []}),
    token: SomeClass,
  };

  const fakeEvent: InjectorCreatedInstanceEvent = {
    type: InjectorProfilerEventType.InstanceCreatedByInjector,
    context: fakeContext,
    instance: {value: new SomeClass()},
  };

  it('should allow adding and removing multiple profilers', () => {
    const events: string[] = [];
    const r1 = setInjectorProfiler((e) => events.push('P1: ' + e.type));
    const r2 = setInjectorProfiler((e) => events.push('P2: ' + e.type));

    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1', 'P2: 1']);

    r1();
    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1', 'P2: 1', 'P2: 1']);

    r2();
    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1', 'P2: 1', 'P2: 1']);
  });

  it('should not add / remove the same profiler twice', () => {
    const events: string[] = [];
    const p1 = (e: InjectorProfilerEvent) => events.push('P1: ' + e.type);
    const r1 = setInjectorProfiler(p1);
    const r2 = setInjectorProfiler(p1);

    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1']);

    r1();
    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1']);

    // subsequent removals should be noop
    r1();
    r2();
  });

  it('should clear all profilers when passing null', () => {
    const events: string[] = [];
    setInjectorProfiler((e) => events.push('P1: ' + e.type));
    setInjectorProfiler((e) => events.push('P2: ' + e.type));

    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1', 'P2: 1']);

    // clear all profilers
    setInjectorProfiler(null);
    injectorProfiler(fakeEvent);
    expect(events).toEqual(['P1: 1', 'P2: 1']);
  });
});

describe('getInjectorMetadata', () => {
  beforeEach(() => {
    setInjectorProfiler(null);
    setupFrameworkInjectorProfiler();
  });
  afterEach(() => setInjectorProfiler(null));

  it('should be able to determine injector type and name', async () => {
    class MyServiceA {}
    @NgModule({providers: [MyServiceA]})
    class ModuleA {}

    class MyServiceB {}
    @NgModule({providers: [MyServiceB]})
    class ModuleB {}

    @Component({
      selector: 'lazy-comp',
      template: `lazy component`,
      imports: [ModuleB],
    })
    class LazyComponent {
      lazyComponentNodeInjector = inject(Injector);
      elementRef = inject(ElementRef);

      constructor() {
        afterEveryRender(() => afterLazyComponentRendered(this));
      }
    }

    @Component({
      imports: [RouterOutlet, ModuleA],
      template: `<router-outlet/>`,
    })
    class MyStandaloneComponent {
      @ViewChild(RouterOutlet, {read: ElementRef}) routerOutlet: ElementRef | undefined;
      elementRef = inject(ElementRef);
    }

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            loadComponent: () => LazyComponent,
          },
        ]),
      ],
    });

    const root = TestBed.createComponent(MyStandaloneComponent);
    await TestBed.inject(Router).navigateByUrl('/lazy');
    root.detectChanges();

    function afterLazyComponentRendered(lazyComponent: LazyComponent) {
      const {lazyComponentNodeInjector} = lazyComponent;
      const myStandaloneComponent = lazyComponentNodeInjector.get(MyStandaloneComponent, null, {
        skipSelf: true,
      })!;
      expect(myStandaloneComponent).toBeInstanceOf(MyStandaloneComponent);
      expect(myStandaloneComponent.routerOutlet).toBeInstanceOf(ElementRef);

      const injectorPath = getInjectorResolutionPath(lazyComponentNodeInjector);
      const injectorMetadata = injectorPath.map((injector) => getInjectorMetadata(injector));

      expect(injectorMetadata[0]).toBeDefined();
      expect(injectorMetadata[1]).toBeDefined();
      expect(injectorMetadata[2]).toBeDefined();
      expect(injectorMetadata[3]).toBeDefined();
      expect(injectorMetadata[4]).toBeDefined();
      expect(injectorMetadata[5]).toBeDefined();
      expect(injectorMetadata[6]).toBeDefined();

      expect(injectorMetadata[0]!.source).toBe(lazyComponent.elementRef.nativeElement);
      expect(injectorMetadata[1]!.source).toBe(myStandaloneComponent.routerOutlet!.nativeElement);
      expect(injectorMetadata[2]!.source).toBe(myStandaloneComponent.elementRef.nativeElement);
      expect(injectorMetadata[3]!.source).toBe('Standalone[LazyComponent]');
      expect(injectorMetadata[4]!.source).toBe('DynamicTestModule');
      expect(injectorMetadata[5]!.source).toBe('Platform: core');

      expect(injectorMetadata[0]!.type).toBe('element');
      expect(injectorMetadata[1]!.type).toBe('element');
      expect(injectorMetadata[2]!.type).toBe('element');
      expect(injectorMetadata[3]!.type).toBe('environment');
      expect(injectorMetadata[4]!.type).toBe('environment');
      expect(injectorMetadata[5]!.type).toBe('environment');
    }
  });

  it('should return null for injectors it does not recognize', () => {
    class MockInjector extends Injector {
      override get(): void {
        throw new Error('Method not implemented.');
      }
    }
    const mockInjector = new MockInjector();
    expect(getInjectorMetadata(mockInjector)).toBeNull();
  });

  it('should return null as the source for an R3Injector with no source.', () => {
    const emptyR3Injector = new R3Injector([], new NullInjector(), null, new Set());
    const r3InjectorMetadata = getInjectorMetadata(emptyR3Injector);
    expect(r3InjectorMetadata).toBeDefined();
    expect(r3InjectorMetadata!.source).toBeNull();
    expect(r3InjectorMetadata!.type).toBe('environment');
  });
});

describe('getInjectorProviders', () => {
  beforeEach(() => {
    setInjectorProfiler(null);
    setupFrameworkInjectorProfiler();
  });
  afterEach(() => setInjectorProfiler(null));

  it('should be able to get the providers from a components injector', () => {
    class MyService {}
    @Component({
      selector: 'my-comp',
      template: `
      {{b | percent:'4.3-5' }}
    `,
      providers: [MyService],
      standalone: false,
    })
    class MyComponent {
      b = 1.3495;
    }
    TestBed.configureTestingModule({declarations: [MyComponent], imports: [PercentPipe]});
    const fixture = TestBed.createComponent(MyComponent);

    const providers = getInjectorProviders(fixture.debugElement.injector);
    expect(providers.length).toBe(1);
    expect(providers[0].token).toBe(MyService);
    expect(providers[0].provider).toBe(MyService);
    expect(providers[0].isViewProvider).toBe(false);
  });

  it('should be able to get determine if a provider is a view provider', () => {
    class MyService {}
    @Component({
      selector: 'my-comp',
      template: `
      {{b | percent:'4.3-5' }}
    `,
      viewProviders: [MyService],
      standalone: false,
    })
    class MyComponent {
      b = 1.3495;
    }
    TestBed.configureTestingModule({declarations: [MyComponent], imports: [PercentPipe]});
    const fixture = TestBed.createComponent(MyComponent);

    const providers = getInjectorProviders(fixture.debugElement.injector);
    expect(providers.length).toBe(1);
    expect(providers[0].token).toBe(MyService);
    expect(providers[0].provider).toBe(MyService);
    expect(providers[0].isViewProvider).toBe(true);
  });

  it('should be able to determine import paths after module provider flattening in the NgModule bootstrap case', () => {
    //                ┌─────────┐
    //                │AppModule│
    //                └────┬────┘
    //                     │
    //                  imports
    //                     │
    //                ┌────▼────┐
    //      ┌─imports─┤ ModuleD ├──imports─┐
    //      │         └─────────┘          │
    //      │                        ┌─────▼─────┐
    //  ┌───▼───┐                    │  ModuleC  │
    //  │ModuleB│                    │-MyServiceB│
    //  └───┬───┘                    └───────────┘
    //      │
    //   imports
    //      │
    // ┌────▼─────┐
    // │ ModuleA  │
    // │-MyService│
    // └──────────┘

    class MyService {}
    class MyServiceB {}

    @NgModule({providers: [MyService]})
    class ModuleA {}
    @NgModule({
      imports: [ModuleA],
    })
    class ModuleB {}

    @NgModule({providers: [MyServiceB]})
    class ModuleC {}

    @NgModule({
      imports: [ModuleB, ModuleC],
    })
    class ModuleD {}

    @Component({
      selector: 'my-comp',
      template: 'hello world',
      standalone: false,
    })
    class MyComponent {}

    @NgModule({
      imports: [ModuleD, BrowserModule],
      declarations: [MyComponent],
    })
    class AppModule {}

    TestBed.configureTestingModule({imports: [AppModule]});
    const root = TestBed.createComponent(MyComponent);
    root.detectChanges();

    const appModuleInjector = root.componentRef.injector.get(EnvironmentInjector);
    const providers = getInjectorProviders(appModuleInjector);

    const myServiceProvider = providers.find((provider) => provider.token === MyService);
    const myServiceBProvider = providers.find((provider) => provider.token === MyServiceB);

    const testModuleType = root.componentRef.injector.get(NgModuleRef).instance.constructor;

    expect(myServiceProvider).toBeTruthy();
    expect(myServiceBProvider).toBeTruthy();

    expect(myServiceProvider!.importPath).toBeInstanceOf(Array);
    expect(myServiceProvider!.importPath!.length).toBe(5);
    expect(myServiceProvider!.importPath![0]).toBe(testModuleType);
    expect(myServiceProvider!.importPath![1]).toBe(AppModule);
    expect(myServiceProvider!.importPath![2]).toBe(ModuleD);
    expect(myServiceProvider!.importPath![3]).toBe(ModuleB);
    expect(myServiceProvider!.importPath![4]).toBe(ModuleA);

    expect(myServiceBProvider!.importPath).toBeInstanceOf(Array);
    expect(myServiceBProvider!.importPath!.length).toBe(4);
    expect(myServiceBProvider!.importPath![0]).toBe(testModuleType);
    expect(myServiceBProvider!.importPath![1]).toBe(AppModule);
    expect(myServiceBProvider!.importPath![2]).toBe(ModuleD);
    expect(myServiceBProvider!.importPath![3]).toBe(ModuleC);
  });

  it('should be able to determine import paths after module provider flattening in the standalone component case', () => {
    //            ┌────────────────────imports───────────────────────┐
    //            │                                                  │
    //            │ ┌───────imports────────┐                         │
    //            │ │                      │                         │
    //            │ │                      │                         │
    //  ┌─────────┴─┴─────────┐  ┌─────────▼────────────┐ ┌──────────▼───────────┐
    //  │MyStandaloneComponent│  │MyStandaloneComponentB│ │MyStandaloneComponentC│
    //  └──────────┬──────────┘  └──────────┬────┬──────┘ └────┬────────┬────────┘
    //             │                        │    │             │        │
    //             └──imports─┐     ┌imports┘    └────┐        │        │
    //                        │     │                 │        │     imports
    //                       ┌▼─────▼┐             imports     │        │
    //                  ┌────┤ModuleD├─────┐          │     imports     │
    //               imports └───────┘     │          │        │    ┌───▼────────┐
    //                  │                imports   ┌──▼─────┐  │    │ ModuleE    │
    //               ┌──▼────┐             │       │ModuleF │  │    │-MyServiceC │
    //               │ModuleB│             │       └────────┘  │    └────────────┘
    //               └──┬────┘       ┌─────▼─────┐             │
    //               imports         │ ModuleC   │             │
    //             ┌────▼─────┐      │-MyServiceB│◄────────────┘
    //             │ ModuleA  │      └───────────┘
    //             │-MyService│
    //             └──────────┘

    class MyService {}
    class MyServiceB {}
    class MyServiceC {}

    @NgModule({providers: [MyService]})
    class ModuleA {}
    @NgModule({
      imports: [ModuleA],
    })
    class ModuleB {}

    @NgModule({providers: [MyServiceB]})
    class ModuleC {}

    @NgModule({
      imports: [ModuleB, ModuleC],
    })
    class ModuleD {}

    @NgModule({
      providers: [MyServiceC],
    })
    class ModuleE {}

    @NgModule({})
    class ModuleF {}

    @Component({
      selector: 'my-comp-c',
      template: 'hello world',
      imports: [ModuleE, ModuleC],
    })
    class MyStandaloneComponentC {}

    @Component({
      selector: 'my-comp-b',
      template: 'hello world',
      imports: [ModuleD, ModuleF],
    })
    class MyStandaloneComponentB {}

    @Component({
      selector: 'my-comp',
      template: `
         <my-comp-b/>
         <my-comp-c/>
        `,
      imports: [ModuleD, MyStandaloneComponentB, MyStandaloneComponentC],
    })
    class MyStandaloneComponent {}

    const root = TestBed.createComponent(MyStandaloneComponent);
    root.detectChanges();

    const appComponentEnvironmentInjector = root.componentRef.injector.get(EnvironmentInjector);
    const providers = getInjectorProviders(appComponentEnvironmentInjector);

    // There are 2 paths from MyStandaloneComponent to MyService
    //
    // path 1: MyStandaloneComponent -> ModuleD => ModuleB -> ModuleA
    // path 2: MyStandaloneComponent -> MyStandaloneComponentB -> ModuleD => ModuleB -> ModuleA
    //
    // Angular discovers this provider through the first path it visits
    // during it's postorder traversal (in this case path 1). Therefore
    // we expect myServiceProvider.importPath to have 4 DI containers
    //
    const myServiceProvider = providers.find((provider) => provider.token === MyService);
    expect(myServiceProvider).toBeTruthy();
    expect(myServiceProvider!.importPath).toBeInstanceOf(Array);
    expect(myServiceProvider!.importPath!.length).toBe(4);
    expect(myServiceProvider!.importPath![0]).toBe(MyStandaloneComponent);
    expect(myServiceProvider!.importPath![1]).toBe(ModuleD);
    expect(myServiceProvider!.importPath![2]).toBe(ModuleB);
    expect(myServiceProvider!.importPath![3]).toBe(ModuleA);

    // Similarly to above there are multiple paths from MyStandaloneComponent MyServiceB
    //
    // path 1: MyStandaloneComponent -> ModuleD => ModuleC
    // path 2: MyStandaloneComponent -> MyStandaloneComponentB -> ModuleD => ModuleC
    // path 3: MyStandaloneComponent -> MyStandaloneComponentC -> ModuleC
    //
    // Angular discovers this provider through the first path it visits
    // during it's postorder traversal (in this case path 1). Therefore
    // we expect myServiceProvider.importPath to have 4 DI containers
    //
    const myServiceBProvider = providers.find((provider) => provider.token === MyServiceB);
    expect(myServiceBProvider).toBeTruthy();
    expect(myServiceBProvider!.importPath).toBeInstanceOf(Array);
    expect(myServiceBProvider!.importPath!.length).toBe(3);
    expect(myServiceBProvider!.importPath![0]).toBe(MyStandaloneComponent);
    expect(myServiceBProvider!.importPath![1]).toBe(ModuleD);
    expect(myServiceBProvider!.importPath![2]).toBe(ModuleC);
  });

  it('should be able to determine import paths after module provider flattening in the standalone component case with lazy components', async () => {
    class MyService {}

    @NgModule({providers: [MyService]})
    class ModuleA {}

    @Component({
      selector: 'my-comp-b',
      template: 'hello world',
      imports: [ModuleA],
    })
    class MyStandaloneComponentB {
      injector = inject(Injector);
    }

    @Component({
      selector: 'my-comp',
      template: `<router-outlet/>`,
      imports: [MyStandaloneComponentB, RouterOutlet],
    })
    class MyStandaloneComponent {
      injector = inject(Injector);
      @ViewChild(RouterOutlet) routerOutlet: RouterOutlet | undefined;
    }

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            loadComponent: () => MyStandaloneComponentB,
          },
        ]),
      ],
    });
    const root = TestBed.createComponent(MyStandaloneComponent);
    await TestBed.inject(Router).navigateByUrl('/lazy');
    root.detectChanges();

    const myStandaloneComponentNodeInjector = root.componentRef.injector;
    const myStandaloneComponentEnvironmentInjector =
      myStandaloneComponentNodeInjector.get(EnvironmentInjector);
    const myStandalonecomponentB = root.componentRef.instance!.routerOutlet!
      .component as MyStandaloneComponentB;
    const myComponentBNodeInjector = myStandalonecomponentB.injector;
    const myComponentBEnvironmentInjector = myComponentBNodeInjector.get(EnvironmentInjector);
    const myStandaloneComponentEnvironmentInjectorProviders = getInjectorProviders(
      myStandaloneComponentEnvironmentInjector,
    );
    const myComponentBEnvironmentInjectorProviders = getInjectorProviders(
      myComponentBEnvironmentInjector,
    );

    // Lazy component should have its own environment injector and therefore different
    // providers
    expect(myStandaloneComponentEnvironmentInjectorProviders).not.toEqual(
      myComponentBEnvironmentInjectorProviders,
    );

    const myServiceProviderRecord = myComponentBEnvironmentInjectorProviders.find(
      (provider) => provider.token === MyService,
    );

    expect(myServiceProviderRecord).toBeTruthy();
    expect(myServiceProviderRecord!.importPath).toBeInstanceOf(Array);
    expect(myServiceProviderRecord!.importPath!.length).toBe(2);
    expect(myServiceProviderRecord!.importPath![0]).toBe(MyStandaloneComponentB);
    expect(myServiceProviderRecord!.importPath![1]).toBe(ModuleA);
  });

  it('should be able to determine providers in a lazy route that has providers', async () => {
    class MyService {}

    @Component({selector: 'my-comp-b', template: 'hello world'})
    class MyStandaloneComponentB {
      injector = inject(Injector);
    }

    @Component({
      selector: 'my-comp',
      template: `<router-outlet/>`,
      imports: [MyStandaloneComponentB, RouterOutlet],
    })
    class MyStandaloneComponent {
      injector = inject(Injector);
      @ViewChild(RouterOutlet) routerOutlet: RouterOutlet | undefined;
    }

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            loadComponent: () => MyStandaloneComponentB,
            providers: [MyService],
          },
        ]),
      ],
    });
    const root = TestBed.createComponent(MyStandaloneComponent);
    await TestBed.inject(Router).navigateByUrl('/lazy');
    root.detectChanges();

    const myStandalonecomponentB = root.componentRef.instance!.routerOutlet!
      .component as MyStandaloneComponentB;
    const routeEnvironmentInjector = myStandalonecomponentB.injector.get(
      EnvironmentInjector,
    ) as R3Injector;
    expect(routeEnvironmentInjector).toBeTruthy();
    expect(routeEnvironmentInjector.source).toBeTruthy();
    expect(routeEnvironmentInjector.source!.startsWith('Route:')).toBeTrue();

    const myComponentBEnvironmentInjectorProviders = getInjectorProviders(routeEnvironmentInjector);
    const myServiceProviderRecord = myComponentBEnvironmentInjectorProviders.find(
      (provider) => provider.token === MyService,
    );
    expect(myServiceProviderRecord).toBeTruthy();
    expect(myServiceProviderRecord!.provider).toBe(MyService);
    expect(myServiceProviderRecord!.token).toBe(MyService);
  });

  it('should be able to determine providers in an injector that was created manually', fakeAsync(() => {
    class MyService {}
    const injector = Injector.create({providers: [MyService]}) as EnvironmentInjector;
    const providers = getInjectorProviders(injector);
    expect(providers.length).toBe(1);
    expect(providers[0].token).toBe(MyService);
    expect(providers[0].provider).toBe(MyService);
  }));

  it('should be able to get injector providers for element injectors created by components rendering in an ngFor', () => {
    class MyService {}

    @Component({selector: 'item-cmp', template: 'item', providers: [MyService]})
    class ItemComponent {
      injector = inject(Injector);
    }

    @Component({
      selector: 'my-comp',
      template: `
        <item-cmp *ngFor="let item of items"></item-cmp>
       `,
      imports: [ItemComponent, NgForOf],
    })
    class MyStandaloneComponent {
      injector = inject(Injector);
      items = [1, 2, 3];

      @ViewChildren(ItemComponent) itemComponents: QueryList<ItemComponent> | undefined;
    }

    const root = TestBed.createComponent(MyStandaloneComponent);
    root.detectChanges();

    const myStandaloneComponent = root.componentRef.instance;
    const itemComponents = myStandaloneComponent.itemComponents;
    expect(itemComponents).toBeInstanceOf(QueryList);
    expect(itemComponents?.length).toBe(3);
    itemComponents!.forEach((item) => {
      const itemProviders = getInjectorProviders(item.injector);
      expect(itemProviders).toBeInstanceOf(Array);
      expect(itemProviders.length).toBe(1);
      expect(itemProviders[0].token).toBe(MyService);
      expect(itemProviders[0].provider).toBe(MyService);
      expect(itemProviders[0].isViewProvider).toBe(false);
    });
  });

  it('should be able to get injector providers for element injectors created by components rendering in a @for', () => {
    class MyService {}

    @Component({selector: 'item-cmp', template: 'item', providers: [MyService]})
    class ItemComponent {
      injector = inject(Injector);
    }

    @Component({
      selector: 'my-comp',
      template: `
        @for (item of items; track item) {
          <item-cmp></item-cmp>
        }
       `,
      imports: [ItemComponent],
    })
    class MyStandaloneComponent {
      injector = inject(Injector);
      items = [1, 2, 3];

      @ViewChildren(ItemComponent) itemComponents: QueryList<ItemComponent> | undefined;
    }

    const root = TestBed.createComponent(MyStandaloneComponent);
    root.detectChanges();

    const myStandaloneComponent = root.componentRef.instance;
    const itemComponents = myStandaloneComponent.itemComponents;
    expect(itemComponents).toBeInstanceOf(QueryList);
    expect(itemComponents?.length).toBe(3);
    itemComponents!.forEach((item) => {
      const itemProviders = getInjectorProviders(item.injector);
      expect(itemProviders).toBeInstanceOf(Array);
      expect(itemProviders.length).toBe(1);
      expect(itemProviders[0].token).toBe(MyService);
      expect(itemProviders[0].provider).toBe(MyService);
      expect(itemProviders[0].isViewProvider).toBe(false);
    });
  });
});

describe('getDependenciesFromInjectable', () => {
  beforeEach(() => {
    setInjectorProfiler(null);
    setupFrameworkInjectorProfiler();
  });
  afterEach(() => setInjectorProfiler(null));

  it('should be able to determine which injector dependencies come from', async () => {
    class MyService {}
    class MyServiceB {}
    class MyServiceC {}
    class MyServiceD {}
    class MyServiceG {}
    class MyServiceH {}

    const myInjectionToken = new InjectionToken('myInjectionToken');
    const myServiceCInstance = new MyServiceC();

    @NgModule({
      providers: [
        MyService,
        {provide: MyServiceB, useValue: 'hello world'},
        {provide: MyServiceC, useFactory: () => 123},
        {provide: myInjectionToken, useValue: myServiceCInstance},
      ],
    })
    class ModuleA {}

    @Directive({
      selector: '[my-directive]',
    })
    class MyStandaloneDirective {
      serviceFromHost = inject(MyServiceH, {host: true, optional: true});
      injector = inject(Injector);

      ngOnInit() {
        onMyStandaloneDirectiveCreated(this);
      }
    }

    @Component({
      selector: 'my-comp-c',
      template: 'hello world',
      imports: [],
    })
    class MyStandaloneComponentC {}

    @Component({
      selector: 'my-comp-b',
      template: '<my-comp-c my-directive/>',
      imports: [MyStandaloneComponentC, MyStandaloneDirective],
    })
    class MyStandaloneComponentB {
      myService = inject(MyService, {optional: true});
      myServiceB = inject(MyServiceB, {optional: true});
      myServiceC = inject(MyServiceC, {skipSelf: true, optional: true});
      myInjectionTokenValue = inject(myInjectionToken, {optional: true});
      injector = inject(Injector, {self: true, host: true});
      myServiceD = inject(MyServiceD);
      myServiceG = inject(MyServiceG);
      parentComponent = inject(MyStandaloneComponent);
    }

    @Component({
      selector: 'my-comp',
      template: `<router-outlet/>`,
      imports: [RouterOutlet, ModuleA],
      providers: [MyServiceG, {provide: MyServiceH, useValue: 'MyStandaloneComponent'}],
    })
    class MyStandaloneComponent {
      injector = inject(Injector);
      @ViewChild(RouterOutlet) routerOutlet: RouterOutlet | undefined;
    }

    TestBed.configureTestingModule({
      providers: [{provide: MyServiceD, useValue: '123'}],
      imports: [
        RouterModule.forRoot([{path: 'lazy', loadComponent: () => MyStandaloneComponentB}]),
      ],
    });

    const root = TestBed.createComponent(MyStandaloneComponent);
    await TestBed.inject(Router).navigateByUrl('/lazy');
    root.detectChanges();

    const myStandalonecomponentB = root.componentRef.instance!.routerOutlet!
      .component as MyStandaloneComponentB;

    const {dependencies: dependenciesOfMyStandaloneComponentB} = getDependenciesFromInjectable(
      myStandalonecomponentB.injector,
      MyStandaloneComponentB,
    )!;
    const standaloneInjector = root.componentInstance.injector.get(
      EnvironmentInjector,
    ) as EnvironmentInjector;

    expect(dependenciesOfMyStandaloneComponentB).toBeInstanceOf(Array);
    expect(dependenciesOfMyStandaloneComponentB.length).toBe(8);

    const myServiceDep = dependenciesOfMyStandaloneComponentB[0];
    const myServiceBDep = dependenciesOfMyStandaloneComponentB[1];
    const myServiceCDep = dependenciesOfMyStandaloneComponentB[2];
    const myInjectionTokenValueDep = dependenciesOfMyStandaloneComponentB[3];
    const injectorDep = dependenciesOfMyStandaloneComponentB[4];
    const myServiceDDep = dependenciesOfMyStandaloneComponentB[5];
    const myServiceGDep = dependenciesOfMyStandaloneComponentB[6];
    const parentComponentDep = dependenciesOfMyStandaloneComponentB[7];

    expect(myServiceDep.token).toBe(MyService);
    expect(myServiceBDep.token).toBe(MyServiceB);
    expect(myServiceCDep.token).toBe(MyServiceC);
    expect(myInjectionTokenValueDep.token).toBe(myInjectionToken);
    expect(injectorDep.token).toBe(Injector);
    expect(myServiceDDep.token).toBe(MyServiceD);
    expect(myServiceGDep.token).toBe(MyServiceG);
    expect(parentComponentDep.token).toBe(MyStandaloneComponent);

    expect(dependenciesOfMyStandaloneComponentB[0].flags).toEqual({
      optional: true,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(myServiceBDep.flags).toEqual({
      optional: true,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(myServiceCDep.flags).toEqual({
      optional: true,
      skipSelf: true,
      self: false,
      host: false,
    });
    expect(myInjectionTokenValueDep.flags).toEqual({
      optional: true,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(injectorDep.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: true,
      host: true,
    });
    expect(myServiceDDep.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(myServiceGDep.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(parentComponentDep.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });

    expect(dependenciesOfMyStandaloneComponentB[0].value).toBe(myStandalonecomponentB.myService);
    expect(myServiceBDep.value).toBe(null);
    expect(myServiceCDep.value).toBe(null);
    expect(myInjectionTokenValueDep.value).toBe(null);
    expect(injectorDep.value).toBe(myStandalonecomponentB.injector);
    expect(myServiceDDep.value).toBe('123');
    expect(myServiceGDep.value).toBe(myStandalonecomponentB.myServiceG);
    expect(parentComponentDep.value).toBe(myStandalonecomponentB.parentComponent);

    expect(dependenciesOfMyStandaloneComponentB[0].providedIn).toBe(undefined);
    expect(myServiceBDep.providedIn).toBe(undefined);
    expect(myServiceCDep.providedIn).toBe(undefined);
    expect(myInjectionTokenValueDep.providedIn).toBe(undefined);
    expect(injectorDep.providedIn).toBe(myStandalonecomponentB.injector);
    expect(myServiceDDep.providedIn).toBe(
      standaloneInjector.get(Injector, null, {
        skipSelf: true,
      }) as Injector,
    );
    expect(getNodeInjectorLView(myServiceGDep.providedIn as NodeInjector)).toBe(
      getNodeInjectorLView(myStandalonecomponentB.parentComponent.injector as NodeInjector),
    );

    function onMyStandaloneDirectiveCreated(myStandaloneDirective: MyStandaloneDirective) {
      const injector = myStandaloneDirective.injector;
      const deps = getDependenciesFromInjectable(injector, MyStandaloneDirective);
      expect(deps).not.toBeNull();
      expect(deps!.dependencies.length).toBe(2); // MyServiceH, Injector
      expect(deps!.dependencies[0].token).toBe(MyServiceH);
      expect(deps!.dependencies[0].flags).toEqual({
        optional: true,
        host: true,
        self: false,
        skipSelf: false,
      });
      // The NodeInjector that provides MyService is not in the host path of this injector.
      expect(deps!.dependencies[0].providedIn).toBeUndefined();
    }
  });

  it('should be able to recursively determine dependencies of dependencies by using the providedIn field', async () => {
    @Injectable()
    class MyService {
      myServiceB = inject(MyServiceB);
    }

    @Injectable()
    class MyServiceB {
      router = inject(Router);
    }

    @NgModule({providers: [MyService]})
    class ModuleA {}

    @NgModule({imports: [ModuleA]})
    class ModuleB {}

    @NgModule({providers: [MyServiceB]})
    class ModuleC {}

    @NgModule({imports: [ModuleB, ModuleC]})
    class ModuleD {}

    @Component({selector: 'my-comp', template: 'hello world', imports: [ModuleD]})
    class MyStandaloneComponent {
      myService = inject(MyService);
    }

    TestBed.configureTestingModule({imports: [RouterModule]});
    const root = TestBed.createComponent(MyStandaloneComponent);

    const {instance, dependencies} = getDependenciesFromInjectable(
      root.componentRef.injector,
      root.componentRef.componentType,
    )!;
    const standaloneInjector = root.componentRef.injector.get(EnvironmentInjector);

    expect(instance).toBeInstanceOf(MyStandaloneComponent);
    expect(dependencies).toBeInstanceOf(Array);
    expect(dependencies.length).toBe(1);

    const myServiceDependency = dependencies[0];

    expect(myServiceDependency.token).toBe(MyService);
    expect(myServiceDependency.value).toBe((instance as MyStandaloneComponent).myService);
    expect(myServiceDependency.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(myServiceDependency.providedIn).toBe(standaloneInjector);

    const {instance: myServiceInstance, dependencies: myServiceDependencies} =
      getDependenciesFromInjectable(myServiceDependency.providedIn!, myServiceDependency.token!)!;
    expect(myServiceDependencies).toBeInstanceOf(Array);
    expect(myServiceDependencies.length).toBe(1);
    const myServiceBDependency = myServiceDependencies[0];

    expect(myServiceBDependency.token).toBe(MyServiceB);
    expect(myServiceBDependency.value).toBe((myServiceInstance as MyService).myServiceB);
    expect(myServiceBDependency.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(myServiceBDependency.providedIn).toBe(standaloneInjector);

    const {instance: myServiceBInstance, dependencies: myServiceBDependencies} =
      getDependenciesFromInjectable(myServiceBDependency.providedIn!, myServiceBDependency.token!)!;
    expect(myServiceBDependencies).toBeInstanceOf(Array);
    expect(myServiceBDependencies.length).toBe(1);
    const routerDependency = myServiceBDependencies[0];

    expect(routerDependency.token).toBe(Router);
    expect(routerDependency.value).toBe((myServiceBInstance as MyServiceB).router);
    expect(routerDependency.flags).toEqual({
      optional: false,
      skipSelf: false,
      self: false,
      host: false,
    });
    expect(routerDependency.providedIn).toBe((standaloneInjector as R3Injector).parent);
  });
});

describe('getInjectorResolutionPath', () => {
  beforeEach(() => {
    setInjectorProfiler(null);
    setupFrameworkInjectorProfiler();
  });
  afterEach(() => setInjectorProfiler(null));

  it('should be able to inspect injector hierarchy structure', async () => {
    class MyServiceA {}
    @NgModule({providers: [MyServiceA]})
    class ModuleA {}

    class MyServiceB {}
    @NgModule({providers: [MyServiceB]})
    class ModuleB {}

    @Component({
      selector: 'lazy-comp',
      template: `lazy component`,
      imports: [ModuleB],
    })
    class LazyComponent {
      constructor() {
        onLazyComponentCreated();
      }
    }

    @Component({
      imports: [RouterOutlet, ModuleA],
      template: `<router-outlet/>`,
    })
    class MyStandaloneComponent {
      nodeInjector = inject(Injector);
      envInjector = inject(EnvironmentInjector);
    }

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            loadComponent: () => LazyComponent,
          },
        ]),
      ],
    });
    const root = TestBed.createComponent(MyStandaloneComponent);
    await TestBed.inject(Router).navigateByUrl('/lazy');
    root.detectChanges();

    function onLazyComponentCreated() {
      const lazyComponentNodeInjector = inject(Injector);
      const lazyComponentEnvironmentInjector = inject(EnvironmentInjector);

      const routerOutletNodeInjector = inject(Injector, {skipSelf: true}) as NodeInjector;

      const myStandaloneComponent = inject(MyStandaloneComponent);
      const myStandaloneComponentNodeInjector = myStandaloneComponent.nodeInjector as NodeInjector;

      const path = getInjectorResolutionPath(lazyComponentNodeInjector);

      /**
       *
       * Here is a diagram of the injectors in our application:
       *
       *
       *
       *                                ┌────────────┐
       *                                │NullInjector│
       *                                └─────▲──────┘
       *                                      │
       *                         ┌────────────┴────────────────┐
       *                         │EnvironmentInjector(Platform)│
       *                         └────────────▲────────────────┘
       *                                      │
       *                         ┌────────────┴────────────┐
       *                         │EnvironmentInjector(Root)│
       *                         └───────────────▲─────────┘
       *                                         │
       *                                         │
       *                                         │
       *┌────────────────────────────────────┐  ┌─┴────────────────────────────────────────┐
       *│ NodeInjector(MyStandaloneComponent)├─►| EnvironmentInjector(MyStandaloneComponent│
       *└────────────────▲───────────────────┘  └────────────▲─────────────────────────────┘
       *                 │                                   │
       *                 │                                   │
       *                 │                                   │
       *    ┌────────────┴─────────────┐                     │
       *    │NodeInjector(RouterOutlet)├──────────┐          │
       *    └────────────▲─────────────┘          │          │
       *                 │                        │          │
       *                 │                        │          │
       *                 │                        │          │
       *                 │                        │          │
       *   ┌─────────────┴──────────────┐  ┌──────▼──────────┴────────────────┐
       *   │ NodeInjector(LazyComponent)├──►EnvironmentInjector(LazyComponent)│
       *   └────────────────────────────┘  └──────────────────────────────────┘
       *
       *
       *
       *
       *
       * The Resolution path if we start at NodeInjector(LazyComponent) should be
       * [
       *    NodeInjector[LazyComponent],
       *    NodeInjector[RouterOutlet],
       *    NodeInjector[MyStandaloneComponent],
       *    R3Injector[LazyComponent],
       *    R3Injector[Root],
       *    R3Injector[Platform],
       *    NullInjector
       * ]
       */
      expect(path.length).toBe(7);

      expect(path[0]).toBe(lazyComponentNodeInjector);

      expect(path[1]).toBeInstanceOf(NodeInjector);
      expect(getNodeInjectorLView(path[1] as NodeInjector)).toBe(
        getNodeInjectorLView(routerOutletNodeInjector),
      );

      expect(path[2]).toBeInstanceOf(NodeInjector);
      expect(getNodeInjectorLView(path[2] as NodeInjector)).toBe(
        getNodeInjectorLView(myStandaloneComponentNodeInjector),
      );

      expect(path[3]).toBeInstanceOf(R3Injector);
      expect(path[3]).toBe(lazyComponentEnvironmentInjector);
      expect((path[3] as R3Injector).scopes.has('environment')).toBeTrue();
      expect((path[3] as R3Injector).source).toBe('Standalone[LazyComponent]');

      expect(path[4]).toBeInstanceOf(R3Injector);
      expect((path[4] as R3Injector).scopes.has('environment')).toBeTrue();
      expect((path[4] as R3Injector).source).toBe('DynamicTestModule');
      expect((path[4] as R3Injector).scopes.has('root')).toBeTrue();

      expect(path[5]).toBeInstanceOf(R3Injector);
      expect((path[5] as R3Injector).scopes.has('platform')).toBeTrue();

      expect(path[6]).toBeInstanceOf(NullInjector);
    }
  });
});
