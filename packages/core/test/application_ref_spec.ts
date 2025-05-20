/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {ResourceLoader} from '@angular/compiler';
import {
  BrowserModule,
  ɵDomRendererFactory2 as DomRendererFactory2,
} from '@angular/platform-browser';
import type {ServerModule} from '@angular/platform-server';
import {createTemplate, dispatchEvent, getContent, isNode} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  APP_BOOTSTRAP_LISTENER,
  APP_INITIALIZER,
  ChangeDetectionStrategy,
  Compiler,
  Component,
  EnvironmentInjector,
  InjectionToken,
  Injector,
  LOCALE_ID,
  NgModule,
  NgZone,
  PlatformRef,
  provideZoneChangeDetection,
  RendererFactory2,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '../src/core';
import {ErrorHandler} from '../src/error_handler';
import {ComponentRef} from '../src/linker/component_factory';
import {createEnvironmentInjector, getLocaleId} from '../src/render3';

import {take} from 'rxjs/operators';
import {compileNgModuleFactory} from '../src/application/application_ngmodule_factory_compiler';
import {ApplicationRef} from '../src/application/application_ref';
import {NoopNgZone} from '../src/zone/ng_zone';
import {ComponentFixtureNoNgZone, inject, TestBed, waitForAsync, withModule} from '../testing';

let serverPlatformModule: Promise<Type<ServerModule>> | null = null;
if (isNode) {
  // Only when we are in Node, we load the platform-server module. It will
  // be required later in specs for declaring the platform module.
  serverPlatformModule = import('@angular/platform-server').then((m) => m.ServerModule);
}

@Component({
  selector: 'bootstrap-app',
  template: 'hello',
  standalone: false,
})
class SomeComponent {}

describe('bootstrap', () => {
  let mockConsole: MockConsole;

  beforeEach(() => {
    mockConsole = new MockConsole();
  });

  function createRootEl(selector = 'bootstrap-app') {
    const doc = TestBed.inject(DOCUMENT);
    const rootEl = <HTMLElement>(
      getContent(createTemplate(`<${selector}></${selector}>`)).firstChild
    );
    const oldRoots = doc.querySelectorAll(selector);
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
    doc.body.appendChild(rootEl);
  }

  type CreateModuleOptions = {
    providers?: any[];
    ngDoBootstrap?: any;
    bootstrap?: any[];
    component?: Type<any>;
  };

  async function createModule(providers?: any[]): Promise<Type<any>>;
  async function createModule(options: CreateModuleOptions): Promise<Type<any>>;
  async function createModule(
    providersOrOptions: any[] | CreateModuleOptions | undefined,
  ): Promise<Type<any>> {
    let options: CreateModuleOptions = {};
    if (Array.isArray(providersOrOptions)) {
      options = {providers: providersOrOptions};
    } else {
      options = providersOrOptions || {};
    }
    const errorHandler = new ErrorHandler();
    (errorHandler as any)._console = mockConsole as any;

    const platformModule = getDOM().supportsDOMEvents ? BrowserModule : await serverPlatformModule!;

    @NgModule({
      providers: [{provide: ErrorHandler, useValue: errorHandler}, options.providers || []],
      imports: [platformModule],
      declarations: [options.component || SomeComponent],
      bootstrap: options.bootstrap || [],
    })
    class MyModule {}
    if (options.ngDoBootstrap !== false) {
      (<any>MyModule.prototype).ngDoBootstrap = options.ngDoBootstrap || (() => {});
    }
    return MyModule;
  }

  it('should bootstrap a component from a child module', waitForAsync(
    inject([ApplicationRef, Compiler], (app: ApplicationRef, compiler: Compiler) => {
      @Component({
        selector: 'bootstrap-app',
        template: '',
        standalone: false,
      })
      class SomeComponent {}

      const helloToken = new InjectionToken<string>('hello');

      @NgModule({
        providers: [{provide: helloToken, useValue: 'component'}],
        declarations: [SomeComponent],
      })
      class SomeModule {}

      createRootEl();
      const modFactory = compiler.compileModuleSync(SomeModule);
      const module = modFactory.create(TestBed.inject(Injector));
      const cmpFactory = module.componentFactoryResolver.resolveComponentFactory(SomeComponent);
      const component = app.bootstrap(cmpFactory);

      // The component should see the child module providers
      expect(component.injector.get(helloToken)).toEqual('component');
    }),
  ));

  it('should bootstrap a component with a custom selector', waitForAsync(
    inject([ApplicationRef, Compiler], (app: ApplicationRef, compiler: Compiler) => {
      @Component({
        selector: 'bootstrap-app',
        template: '',
        standalone: false,
      })
      class SomeComponent {}

      const helloToken = new InjectionToken<string>('hello');

      @NgModule({
        providers: [{provide: helloToken, useValue: 'component'}],
        declarations: [SomeComponent],
      })
      class SomeModule {}

      createRootEl('custom-selector');
      const modFactory = compiler.compileModuleSync(SomeModule);
      const module = modFactory.create(TestBed.inject(Injector));
      const cmpFactory = module.componentFactoryResolver.resolveComponentFactory(SomeComponent);
      const component = app.bootstrap(cmpFactory, 'custom-selector');

      // The component should see the child module providers
      expect(component.injector.get(helloToken)).toEqual('component');
    }),
  ));

  describe('ApplicationRef', () => {
    beforeEach(async () => {
      TestBed.configureTestingModule({imports: [await createModule()]});
    });

    it('should throw when reentering tick', () => {
      @Component({
        template: '{{reenter()}}',
        standalone: false,
      })
      class ReenteringComponent {
        reenterCount = 1;
        reenterErr: any;

        constructor(private appRef: ApplicationRef) {}

        reenter() {
          if (this.reenterCount--) {
            try {
              this.appRef.tick();
            } catch (e) {
              this.reenterErr = e;
            }
          }
        }
      }

      const fixture = TestBed.configureTestingModule({
        declarations: [ReenteringComponent],
      }).createComponent(ReenteringComponent);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      appRef.tick();
      expect(fixture.componentInstance.reenterErr.message).toBe(
        'NG0101: ApplicationRef.tick is called recursively',
      );
    });

    describe('APP_BOOTSTRAP_LISTENER', () => {
      let capturedCompRefs: ComponentRef<any>[];
      beforeEach(() => {
        capturedCompRefs = [];
        TestBed.configureTestingModule({
          providers: [
            {
              provide: APP_BOOTSTRAP_LISTENER,
              multi: true,
              useValue: (compRef: any) => {
                capturedCompRefs.push(compRef);
              },
            },
          ],
        });
      });

      it('should be called when a component is bootstrapped', inject(
        [ApplicationRef],
        (ref: ApplicationRef) => {
          createRootEl();
          const compRef = ref.bootstrap(SomeComponent);
          expect(capturedCompRefs).toEqual([compRef]);
        },
      ));
    });

    describe('bootstrap', () => {
      it(
        'should throw if an APP_INITIIALIZER is not yet resolved',
        withModule(
          {
            providers: [
              {provide: APP_INITIALIZER, useValue: () => new Promise(() => {}), multi: true},
            ],
          },
          inject([ApplicationRef], (ref: ApplicationRef) => {
            createRootEl();
            expect(() => ref.bootstrap(SomeComponent)).toThrowError(
              'NG0405: Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.',
            );
          }),
        ),
      );

      it('runs in `NgZone`', inject([ApplicationRef], async (ref: ApplicationRef) => {
        @Component({
          selector: 'zone-comp',
          template: `
            <div>{{ name }}</div>
          `,
        })
        class ZoneComp {
          readonly inNgZone = NgZone.isInAngularZone();
        }

        createRootEl('zone-comp');
        const comp = ref.bootstrap(ZoneComp);
        expect(comp.instance.inNgZone).toBeTrue();
      }));
    });

    describe('bootstrapImpl', () => {
      it('should use a provided injector', inject([ApplicationRef], (ref: ApplicationRef) => {
        class MyService {}
        const myService = new MyService();

        @Component({
          selector: 'injecting-component',
          template: `<div>Hello, World!</div>`,
        })
        class InjectingComponent {
          constructor(readonly myService: MyService) {}
        }

        const injector = Injector.create({
          providers: [{provide: MyService, useValue: myService}],
        });

        createRootEl('injecting-component');
        const appRef = ref as unknown as {bootstrapImpl: ApplicationRef['bootstrapImpl']};
        const compRef = appRef.bootstrapImpl(
          InjectingComponent,
          /* rootSelectorOrNode */ undefined,
          injector,
        );
        expect(compRef.instance.myService).toBe(myService);
      }));
    });
  });

  describe('destroy', () => {
    const providers = [
      {provide: DOCUMENT, useFactory: () => document, deps: []},
      // Use the `DomRendererFactory2` as a renderer factory instead of the
      // `AnimationRendererFactory` one, which is configured as a part of the `ServerModule`, see
      // platform module setup above. This simplifies the tests (so they are sync vs async when
      // animations are in use) that verify that the DOM has been cleaned up after tests.
      {provide: RendererFactory2, useClass: DomRendererFactory2},
    ];
    // This function creates a new Injector instance with the `ApplicationRef` as a provider, so
    // that the instance of the `ApplicationRef` class is created on that injector (vs in the
    // app-level injector). It is needed to verify `ApplicationRef.destroy` scenarios, which
    // includes destroying an underlying injector.
    function createApplicationRefInjector(parentInjector: EnvironmentInjector) {
      const extraProviders = [{provide: ApplicationRef, useClass: ApplicationRef}];

      return createEnvironmentInjector(extraProviders, parentInjector);
    }

    function createApplicationRef(parentInjector: EnvironmentInjector) {
      const injector = createApplicationRefInjector(parentInjector);
      return injector.get(ApplicationRef);
    }

    it(
      'should cleanup the DOM',
      withModule(
        {providers},
        waitForAsync(
          inject(
            [EnvironmentInjector, DOCUMENT],
            (parentInjector: EnvironmentInjector, doc: Document) => {
              createRootEl();

              const appRef = createApplicationRef(parentInjector);
              appRef.bootstrap(SomeComponent);

              // The component template content (`hello`) is present in the document body.
              expect(doc.body.textContent!.indexOf('hello') > -1).toBeTrue();

              appRef.destroy();

              // The component template content (`hello`) is *not* present in the document
              // body, i.e. the DOM has been cleaned up.
              expect(doc.body.textContent!.indexOf('hello') === -1).toBeTrue();
            },
          ),
        ),
      ),
    );

    it(
      'should throw when trying to call `destroy` method on already destroyed ApplicationRef',
      withModule(
        {providers},
        waitForAsync(
          inject([EnvironmentInjector], (parentInjector: EnvironmentInjector) => {
            createRootEl();
            const appRef = createApplicationRef(parentInjector);
            appRef.bootstrap(SomeComponent);
            appRef.destroy();

            expect(() => appRef.destroy()).toThrowError(
              'NG0406: This instance of the `ApplicationRef` has already been destroyed.',
            );
          }),
        ),
      ),
    );

    it(
      'should invoke all registered `onDestroy` callbacks (internal API)',
      withModule(
        {providers},
        waitForAsync(
          inject([EnvironmentInjector], (parentInjector: EnvironmentInjector) => {
            const onDestroyA = jasmine.createSpy('onDestroyA');
            const onDestroyB = jasmine.createSpy('onDestroyB');
            createRootEl();

            const appRef = createApplicationRef(parentInjector) as unknown as ApplicationRef & {
              onDestroy: Function;
            };
            appRef.bootstrap(SomeComponent);
            appRef.onDestroy(onDestroyA);
            appRef.onDestroy(onDestroyB);
            appRef.destroy();

            expect(onDestroyA).toHaveBeenCalledTimes(1);
            expect(onDestroyB).toHaveBeenCalledTimes(1);
          }),
        ),
      ),
    );

    it(
      'should allow to unsubscribe a registered `onDestroy` callback (internal API)',
      withModule(
        {providers},
        waitForAsync(
          inject([EnvironmentInjector], (parentInjector: EnvironmentInjector) => {
            createRootEl();

            const appRef = createApplicationRef(parentInjector) as unknown as ApplicationRef & {
              onDestroy: Function;
            };
            appRef.bootstrap(SomeComponent);

            const onDestroyA = jasmine.createSpy('onDestroyA');
            const onDestroyB = jasmine.createSpy('onDestroyB');
            const unsubscribeOnDestroyA = appRef.onDestroy(onDestroyA);
            const unsubscribeOnDestroyB = appRef.onDestroy(onDestroyB);

            // Unsubscribe registered listeners.
            unsubscribeOnDestroyA();
            unsubscribeOnDestroyB();

            appRef.destroy();

            expect(onDestroyA).not.toHaveBeenCalled();
            expect(onDestroyB).not.toHaveBeenCalled();
          }),
        ),
      ),
    );

    it(
      'should correctly update the `destroyed` flag',
      withModule(
        {providers},
        waitForAsync(
          inject([EnvironmentInjector], (parentInjector: EnvironmentInjector) => {
            createRootEl();

            const appRef = createApplicationRef(parentInjector);
            appRef.bootstrap(SomeComponent);

            expect(appRef.destroyed).toBeFalse();

            appRef.destroy();

            expect(appRef.destroyed).toBeTrue();
          }),
        ),
      ),
    );

    it(
      'should also destroy underlying injector',
      withModule(
        {providers},
        waitForAsync(
          inject([EnvironmentInjector], (parentInjector: EnvironmentInjector) => {
            // This is a temporary type to represent an instance of an R3Injector, which
            // can be destroyed.
            // The type will be replaced with a different one once destroyable injector
            // type is available.
            type DestroyableInjector = EnvironmentInjector & {destroyed?: boolean};

            createRootEl();

            const injector = createApplicationRefInjector(parentInjector) as DestroyableInjector;

            const appRef = injector.get(ApplicationRef);
            appRef.bootstrap(SomeComponent);

            expect(appRef.destroyed).toBeFalse();
            expect(injector.destroyed).toBeFalse();

            appRef.destroy();

            expect(appRef.destroyed).toBeTrue();
            expect(injector.destroyed).toBeTrue();
          }),
        ),
      ),
    );
  });

  describe('bootstrapModule', () => {
    let defaultPlatform: PlatformRef;
    beforeEach(inject([PlatformRef], (_platform: PlatformRef) => {
      createRootEl();
      defaultPlatform = _platform;
    }));

    it('should wait for asynchronous app initializers', waitForAsync(async () => {
      let resolve: (result: any) => void;
      const promise: Promise<any> = new Promise((res) => {
        resolve = res;
      });
      let initializerDone = false;
      setTimeout(() => {
        resolve(true);
        initializerDone = true;
      }, 1);

      defaultPlatform
        .bootstrapModule(
          await createModule([{provide: APP_INITIALIZER, useValue: () => promise, multi: true}]),
        )
        .then((_) => {
          expect(initializerDone).toBe(true);
        });
    }));

    it('should rethrow sync errors even if the exceptionHandler is not rethrowing', waitForAsync(async () => {
      defaultPlatform
        .bootstrapModule(
          await createModule([
            {
              provide: APP_INITIALIZER,
              useValue: () => {
                throw 'Test';
              },
              multi: true,
            },
          ]),
        )
        .then(
          () => expect(false).toBe(true),
          (e) => {
            expect(e).toBe('Test');
            // Error rethrown will be seen by the exception handler since it's after
            // construction.
            expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
          },
        );
    }));

    it('should rethrow promise errors even if the exceptionHandler is not rethrowing', waitForAsync(async () => {
      defaultPlatform
        .bootstrapModule(
          await createModule([
            {provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true},
          ]),
        )
        .then(
          () => expect(false).toBe(true),
          (e) => {
            expect(e).toBe('Test');
            expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
          },
        );
    }));

    it('should throw useful error when ApplicationRef is not configured', waitForAsync(() => {
      @NgModule()
      class EmptyModule {}

      return defaultPlatform.bootstrapModule(EmptyModule).then(
        () => fail('expecting error'),
        (error) => {
          expect(error.message).toMatch(/NG0402/);
        },
      );
    }));

    it('should call the `ngDoBootstrap` method with `ApplicationRef` on the main module', waitForAsync(async () => {
      const ngDoBootstrap = jasmine.createSpy('ngDoBootstrap');
      defaultPlatform
        .bootstrapModule(await createModule({ngDoBootstrap: ngDoBootstrap}))
        .then((moduleRef) => {
          const appRef = moduleRef.injector.get(ApplicationRef);
          expect(ngDoBootstrap).toHaveBeenCalledWith(appRef);
        });
    }));

    it('should auto bootstrap components listed in @NgModule.bootstrap', waitForAsync(async () => {
      defaultPlatform
        .bootstrapModule(await createModule({bootstrap: [SomeComponent]}))
        .then((moduleRef) => {
          const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
          expect(appRef.componentTypes).toEqual([SomeComponent]);
        });
    }));

    it('should error if neither `ngDoBootstrap` nor @NgModule.bootstrap was specified', waitForAsync(async () => {
      defaultPlatform.bootstrapModule(await createModule({ngDoBootstrap: false})).then(
        () => expect(false).toBe(true),
        (e) => {
          const expectedErrMsg =
            `NG0403: The module MyModule was bootstrapped, ` +
            `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
            `Please define one of these. ` +
            `Find more at https://angular.dev/errors/NG0403`;
          expect(e.message).toEqual(expectedErrMsg);
          expect(mockConsole.res[0].join('#')).toEqual('ERROR#Error: ' + expectedErrMsg);
        },
      );
    }));

    it('should add bootstrapped module into platform modules list', waitForAsync(async () => {
      defaultPlatform
        .bootstrapModule(await createModule({bootstrap: [SomeComponent]}))
        .then((module) => expect((<any>defaultPlatform)._modules).toContain(module));
    }));

    it('should bootstrap with NoopNgZone', waitForAsync(async () => {
      defaultPlatform
        .bootstrapModule(await createModule({bootstrap: [SomeComponent]}), {ngZone: 'noop'})
        .then((module) => {
          const ngZone = module.injector.get(NgZone);
          expect(ngZone instanceof NoopNgZone).toBe(true);
        });
    }));

    it('should resolve component resources when creating module factory', async () => {
      @Component({
        selector: 'with-templates-app',
        templateUrl: '/test-template.html',
        standalone: false,
      })
      class WithTemplateUrlComponent {}

      const loadResourceSpy = jasmine.createSpy('load resource').and.returnValue('fakeContent');
      const testModule = await createModule({component: WithTemplateUrlComponent});

      await defaultPlatform.bootstrapModule(testModule, {
        providers: [{provide: ResourceLoader, useValue: {get: loadResourceSpy}}],
      });

      expect(loadResourceSpy).toHaveBeenCalledTimes(1);
      expect(loadResourceSpy).toHaveBeenCalledWith('/test-template.html');
    });

    it('should define `LOCALE_ID`', async () => {
      @Component({
        selector: 'i18n-app',
        templateUrl: '',
        standalone: false,
      })
      class I18nComponent {}

      const testModule = await createModule({
        component: I18nComponent,
        providers: [{provide: LOCALE_ID, useValue: 'ro'}],
      });
      await defaultPlatform.bootstrapModule(testModule);

      expect(getLocaleId()).toEqual('ro');
    });

    it('should wait for APP_INITIALIZER to set providers for `LOCALE_ID`', async () => {
      let locale: string = '';

      const testModule = await createModule({
        providers: [
          {provide: APP_INITIALIZER, useValue: () => (locale = 'fr-FR'), multi: true},
          {provide: LOCALE_ID, useFactory: () => locale},
        ],
      });
      const app = await defaultPlatform.bootstrapModule(testModule);
      expect(app.injector.get(LOCALE_ID)).toEqual('fr-FR');
    });
  });

  describe('bootstrapModuleFactory', () => {
    let defaultPlatform: PlatformRef;
    beforeEach(inject([PlatformRef], (_platform: PlatformRef) => {
      createRootEl();
      defaultPlatform = _platform;
    }));
    it('should wait for asynchronous app initializers', waitForAsync(async () => {
      let resolve: (result: any) => void;
      const promise: Promise<any> = new Promise((res) => {
        resolve = res;
      });
      let initializerDone = false;
      setTimeout(() => {
        resolve(true);
        initializerDone = true;
      }, 1);

      const moduleType = await createModule([
        {provide: APP_INITIALIZER, useValue: () => promise, multi: true},
      ]);
      const moduleFactory = await compileNgModuleFactory(defaultPlatform.injector, {}, moduleType);

      defaultPlatform.bootstrapModuleFactory(moduleFactory).then((_) => {
        expect(initializerDone).toBe(true);
      });
    }));

    it('should rethrow sync errors even if the exceptionHandler is not rethrowing', waitForAsync(async () => {
      const moduleType = await createModule([
        {
          provide: APP_INITIALIZER,
          useValue: () => {
            throw 'Test';
          },
          multi: true,
        },
      ]);
      const moduleFactory = await compileNgModuleFactory(defaultPlatform.injector, {}, moduleType);
      expect(() => defaultPlatform.bootstrapModuleFactory(moduleFactory)).toThrow('Test');
      // Error rethrown will be seen by the exception handler since it's after
      // construction.
      expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
    }));

    it('should rethrow promise errors even if the exceptionHandler is not rethrowing', waitForAsync(async () => {
      const moduleType = await createModule([
        {provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true},
      ]);
      const moduleFactory = await compileNgModuleFactory(defaultPlatform.injector, {}, moduleType);
      defaultPlatform.bootstrapModuleFactory(moduleFactory).then(
        () => expect(false).toBe(true),
        (e) => {
          expect(e).toBe('Test');
          expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
        },
      );
    }));
  });

  describe('attachView / detachView', () => {
    @Component({
      template: '{{name}}',
      standalone: false,
    })
    class MyComp {
      name = 'Initial';
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
      standalone: false,
    })
    class ContainerComp {
      @ViewChild('vc', {read: ViewContainerRef}) vc!: ViewContainerRef;
    }

    @Component({
      template: '<ng-template #t>Dynamic content</ng-template>',
      standalone: false,
    })
    class EmbeddedViewComp {
      @ViewChild(TemplateRef, {static: true}) tplRef!: TemplateRef<Object>;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [MyComp, ContainerComp, EmbeddedViewComp],
        providers: [{provide: ComponentFixtureNoNgZone, useValue: true}],
      });
    });

    it('should dirty check attached views', () => {
      const comp = TestBed.createComponent(MyComp);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
      expect(appRef.viewCount).toBe(0);

      appRef.tick();
      expect(comp.nativeElement).toHaveText('');

      appRef.attachView(comp.componentRef.hostView);
      appRef.tick();
      expect(appRef.viewCount).toBe(1);
      expect(comp.nativeElement).toHaveText('Initial');
    });

    it('should not dirty check detached views', () => {
      const comp = TestBed.createComponent(MyComp);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

      appRef.attachView(comp.componentRef.hostView);
      appRef.tick();
      expect(comp.nativeElement).toHaveText('Initial');

      appRef.detachView(comp.componentRef.hostView);
      comp.componentInstance.name = 'New';
      appRef.tick();
      expect(appRef.viewCount).toBe(0);
      expect(comp.nativeElement).toHaveText('Initial');
    });

    it('should not dirty host bindings of views not marked for check', () => {
      @Component({
        template: '',
        host: {'[class]': 'clazz'},
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class HostBindingComp {
        clazz = 'initial';
      }
      const comp = TestBed.createComponent(HostBindingComp);
      const appRef = TestBed.inject(ApplicationRef);

      appRef.attachView(comp.componentRef.hostView);
      appRef.tick();
      expect(comp.nativeElement.outerHTML).toContain('initial');

      comp.componentInstance.clazz = 'new';
      appRef.tick();
      expect(comp.nativeElement.outerHTML).toContain('initial');

      comp.changeDetectorRef.markForCheck();
      appRef.tick();
      expect(comp.nativeElement.outerHTML).toContain('new');
    });

    it('should detach attached views if they are destroyed', () => {
      const comp = TestBed.createComponent(MyComp);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

      appRef.attachView(comp.componentRef.hostView);
      comp.destroy();

      expect(appRef.viewCount).toBe(0);
    });

    it('should detach attached embedded views if they are destroyed', () => {
      const comp = TestBed.createComponent(EmbeddedViewComp);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

      const embeddedViewRef = comp.componentInstance.tplRef.createEmbeddedView({});

      appRef.attachView(embeddedViewRef);
      embeddedViewRef.destroy();

      expect(appRef.viewCount).toBe(0);
    });

    it('should not allow to attach a view to both, a view container and the ApplicationRef', () => {
      const comp = TestBed.createComponent(MyComp);
      let hostView = comp.componentRef.hostView;
      const containerComp = TestBed.createComponent(ContainerComp);
      containerComp.detectChanges();
      const vc = containerComp.componentInstance.vc;
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

      vc.insert(hostView);
      expect(() => appRef.attachView(hostView)).toThrowError(
        'NG0902: This view is already attached to a ViewContainer!',
      );
      hostView = vc.detach(0)!;

      appRef.attachView(hostView);
      expect(() => vc.insert(hostView)).toThrowError(
        'NG0902: This view is already attached directly to the ApplicationRef!',
      );
    });
  });
});

describe('AppRef', () => {
  describe('stability', () => {
    @Component({
      selector: 'sync-comp',
      template: `<span>{{text}}</span>`,
      standalone: false,
    })
    class SyncComp {
      text: string = '1';
    }

    @Component({
      selector: 'click-comp',
      template: `<span (click)="onClick()">{{text}}</span>`,
      standalone: false,
    })
    class ClickComp {
      text: string = '1';

      onClick() {
        this.text += '1';
      }
    }

    @Component({
      selector: 'micro-task-comp',
      template: `<span>{{text}}</span>`,
      standalone: false,
    })
    class MicroTaskComp {
      text: string = '1';

      ngOnInit() {
        Promise.resolve(null).then((_) => {
          this.text += '1';
        });
      }
    }

    @Component({
      selector: 'macro-task-comp',
      template: `<span>{{text}}</span>`,
      standalone: false,
    })
    class MacroTaskComp {
      text: string = '1';

      ngOnInit() {
        setTimeout(() => {
          this.text += '1';
        }, 10);
      }
    }

    @Component({
      selector: 'micro-macro-task-comp',
      template: `<span>{{text}}</span>`,
      standalone: false,
    })
    class MicroMacroTaskComp {
      text: string = '1';

      ngOnInit() {
        Promise.resolve(null).then((_) => {
          this.text += '1';
          setTimeout(() => {
            this.text += '1';
          }, 10);
        });
      }
    }

    @Component({
      selector: 'macro-micro-task-comp',
      template: `<span>{{text}}</span>`,
      standalone: false,
    })
    class MacroMicroTaskComp {
      text: string = '1';

      ngOnInit() {
        setTimeout(() => {
          this.text += '1';
          Promise.resolve(null).then((_: any) => {
            this.text += '1';
          });
        }, 10);
      }
    }

    let stableCalled = false;

    beforeEach(() => {
      stableCalled = false;
      TestBed.configureTestingModule({
        providers: [provideZoneChangeDetection({ignoreChangesOutsideZone: true})],
        declarations: [
          SyncComp,
          MicroTaskComp,
          MacroTaskComp,
          MicroMacroTaskComp,
          MacroMicroTaskComp,
          ClickComp,
        ],
      });
    });

    afterEach(() => {
      expect(stableCalled).toBe(true, 'isStable did not emit true on stable');
    });

    function expectStableTexts(component: Type<any>, expected: string[]) {
      const fixture = TestBed.createComponent(component);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
      const zone: NgZone = TestBed.inject(NgZone);
      appRef.attachView(fixture.componentRef.hostView);
      zone.run(() => appRef.tick());

      let i = 0;
      appRef.isStable.subscribe({
        next: (stable: boolean) => {
          if (stable) {
            expect(i).toBeLessThan(expected.length);
            expect(fixture.nativeElement).toHaveText(expected[i++]);
            stableCalled = true;
          }
        },
      });
    }

    it('isStable should fire on synchronous component loading', waitForAsync(() => {
      expectStableTexts(SyncComp, ['1']);
    }));

    it('isStable should fire after a microtask on init is completed', waitForAsync(() => {
      expectStableTexts(MicroTaskComp, ['11']);
    }));

    it('isStable should fire after a macrotask on init is completed', waitForAsync(() => {
      expectStableTexts(MacroTaskComp, ['11']);
    }));

    it('isStable should fire only after chain of micro and macrotasks on init are completed', waitForAsync(() => {
      expectStableTexts(MicroMacroTaskComp, ['111']);
    }));

    it('isStable should fire only after chain of macro and microtasks on init are completed', waitForAsync(() => {
      expectStableTexts(MacroMicroTaskComp, ['111']);
    }));

    it('isStable can be subscribed to many times', async () => {
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
      // Create stable subscription but do not unsubscribe before the second subscription is made
      appRef.isStable.subscribe();
      await expectAsync(appRef.isStable.pipe(take(1)).toPromise()).toBeResolved();
      stableCalled = true;
    });

    describe('unstable', () => {
      let unstableCalled = false;

      afterEach(() => {
        expect(unstableCalled).toBe(true, 'isStable did not emit false on unstable');
      });

      function expectUnstable(appRef: ApplicationRef) {
        appRef.isStable.subscribe({
          next: (stable: boolean) => {
            if (stable) {
              stableCalled = true;
            }
            if (!stable) {
              unstableCalled = true;
            }
          },
        });
      }

      it('should be fired after app becomes unstable', waitForAsync(() => {
        const fixture = TestBed.createComponent(ClickComp);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
        const zone: NgZone = TestBed.inject(NgZone);
        appRef.attachView(fixture.componentRef.hostView);
        zone.run(() => appRef.tick());

        fixture.whenStable().then(() => {
          expectUnstable(appRef);
          const element = fixture.debugElement.children[0];
          dispatchEvent(element.nativeElement, 'click');
        });
      }));
    });
  });
});

describe('injector', () => {
  it('should expose an EnvironmentInjector', () => {
    @Component({
      standalone: false,
    })
    class TestCmp {
      constructor(readonly envInjector: EnvironmentInjector) {}
    }

    const fixture = TestBed.createComponent(TestCmp);
    const appRef = TestBed.inject(ApplicationRef);

    expect(appRef.injector).toBe(fixture.componentInstance.envInjector);
  });
});

class MockConsole {
  res: any[][] = [];
  log(...args: any[]): void {
    // Logging from ErrorHandler should run outside of the Angular Zone.
    NgZone.assertNotInAngularZone();
    this.res.push(args);
  }
  error(...args: any[]): void {
    // Logging from ErrorHandler should run outside of the Angular Zone.
    NgZone.assertNotInAngularZone();
    this.res.push(args);
  }
}
