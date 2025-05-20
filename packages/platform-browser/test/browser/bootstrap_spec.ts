/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {animate, style, transition, trigger} from '@angular/animations';
import {DOCUMENT, isPlatformBrowser, ɵgetDOM as getDOM} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  APP_INITIALIZER,
  Compiler,
  Component,
  createPlatformFactory,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  ErrorHandler,
  importProvidersFrom,
  Inject,
  inject as _inject,
  InjectionToken,
  Injector,
  LOCALE_ID,
  NgModule,
  NgModuleRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  Provider,
  provideZoneChangeDetection,
  Sanitizer,
  StaticProvider,
  Testability,
  TestabilityRegistry,
  TransferState,
  Type,
  VERSION,
  EnvironmentProviders,
} from '@angular/core';
import {ApplicationRef} from '@angular/core/src/application/application_ref';
import {Console} from '@angular/core/src/console';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {
  createOrReusePlatformInjector,
  destroyPlatform,
  providePlatformInitializer,
} from '@angular/core/src/platform/platform';
import {inject, TestBed} from '@angular/core/testing';
import {Log} from '@angular/core/testing/src/testing_internal';
import {BrowserModule} from '../../index';
import {provideAnimations, provideNoopAnimations} from '../../animations';
import {expect} from '@angular/private/testing/matchers';
import {isNode} from '@angular/private/testing';

import {bootstrapApplication, platformBrowser} from '../../src/browser';

@Component({
  selector: 'non-existent',
  template: '',
  standalone: false,
})
class NonExistentComp {}

@Component({
  selector: 'hello-app',
  template: '{{greeting}} world!',
  standalone: false,
})
class HelloRootCmp {
  greeting: string;

  constructor() {
    this.greeting = 'hello';
  }
}

@Component({
  selector: 'hello-app-2',
  template: '{{greeting}} world, again!',
  standalone: false,
})
class HelloRootCmp2 {
  greeting: string;

  constructor() {
    this.greeting = 'hello';
  }
}

@Component({
  selector: 'hello-app',
  template: '',
  standalone: false,
})
class HelloRootCmp3 {
  appBinding: string;

  constructor(@Inject('appBinding') appBinding: string) {
    this.appBinding = appBinding;
  }
}

@Component({
  selector: 'hello-app',
  template: '',
  standalone: false,
})
class HelloRootCmp4 {
  appRef: ApplicationRef;

  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) {
    this.appRef = appRef;
  }
}

@Directive({
  selector: 'hello-app',
  standalone: false,
})
class HelloRootDirectiveIsNotCmp {}

@Component({
  selector: 'hello-app',
  template: '',
  standalone: false,
})
class HelloOnDestroyTickCmp implements OnDestroy {
  appRef: ApplicationRef;

  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) {
    this.appRef = appRef;
  }

  ngOnDestroy(): void {
    this.appRef.tick();
  }
}

@Component({
  selector: 'hello-app',
  template: '<some-el [someProp]="true">hello world!</some-el>',
  standalone: false,
})
class HelloCmpUsingCustomElement {}

class MockConsole {
  res: any[][] = [];

  error(...s: any[]): void {
    this.res.push(s);
  }
}

class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}

  warn(message: string) {
    this.warnings.push(message);
  }
}

function bootstrap(
  cmpType: any,
  providers: Provider[] = [],
  platformProviders: StaticProvider[] = [],
  imports: Type<any>[] = [],
): Promise<any> {
  @NgModule({
    imports: [BrowserModule, ...imports],
    declarations: [cmpType],
    bootstrap: [cmpType],
    providers: providers,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
  class TestModule {}
  return platformBrowser(platformProviders).bootstrapModule(TestModule);
}

describe('bootstrap factory method', () => {
  let el: HTMLElement;
  let el2: HTMLElement;
  let testProviders: Provider[];
  let lightDom: HTMLElement;

  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  let compilerConsole: DummyConsole;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [Log]});
  });

  beforeEach(inject([DOCUMENT], (doc: any) => {
    destroyPlatform();
    compilerConsole = new DummyConsole();
    testProviders = [{provide: Console, useValue: compilerConsole}];

    const oldRoots = doc.querySelectorAll('hello-app,hello-app-2,light-dom-el');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }

    el = getDOM().createElement('hello-app', doc);
    el2 = getDOM().createElement('hello-app-2', doc);
    lightDom = getDOM().createElement('light-dom-el', doc);
    doc.body.appendChild(el);
    doc.body.appendChild(el2);
    el.appendChild(lightDom);
    lightDom.textContent = 'loading';
  }));

  afterEach(destroyPlatform);

  describe('bootstrapApplication', () => {
    const NAME = new InjectionToken<string>('name');

    @Component({
      standalone: true,
      selector: 'hello-app',
      template: 'Hello from {{ name }}!',
    })
    class SimpleComp {
      name = 'SimpleComp';
    }

    @Component({
      standalone: true,
      selector: 'hello-app-2',
      template: 'Hello from {{ name }}!',
    })
    class SimpleComp2 {
      name = 'SimpleComp2';
    }

    @Component({
      standalone: true,
      selector: 'hello-app',
      template: 'Hello from {{ name }}!',
    })
    class ComponentWithDeps {
      constructor(@Inject(NAME) public name: string) {}
    }

    @Component({
      selector: 'hello-app-2',
      template: 'Hello from {{ name }}!',
      standalone: false,
    })
    class NonStandaloneComp {
      name = 'NonStandaloneComp';
    }

    @NgModule({
      declarations: [NonStandaloneComp],
    })
    class NonStandaloneCompModule {}

    it('should work for simple standalone components', async () => {
      await bootstrapApplication(SimpleComp);
      expect(el.innerText).toBe('Hello from SimpleComp!');
    });

    it('should allow passing providers during the bootstrap', async () => {
      const providers = [{provide: NAME, useValue: 'Name via DI'}];
      await bootstrapApplication(ComponentWithDeps, {providers});
      expect(el.innerText).toBe('Hello from Name via DI!');
    });

    it('should reuse existing platform', async () => {
      const platformProviders = [{provide: NAME, useValue: 'Name via DI (Platform level)'}];
      platformBrowser(platformProviders);

      await bootstrapApplication(ComponentWithDeps);
      expect(el.innerText).toBe('Hello from Name via DI (Platform level)!');
    });

    it('should allow bootstrapping multiple apps', async () => {
      await bootstrapApplication(SimpleComp);
      await bootstrapApplication(SimpleComp2);

      expect(el.innerText).toBe('Hello from SimpleComp!');
      expect(el2.innerText).toBe('Hello from SimpleComp2!');
    });

    it('should keep change detection isolated for separately bootstrapped apps', async () => {
      const appRef1 = await bootstrapApplication(SimpleComp);
      const appRef2 = await bootstrapApplication(SimpleComp2);

      expect(el.innerText).toBe('Hello from SimpleComp!');
      expect(el2.innerText).toBe('Hello from SimpleComp2!');

      // Update name in both components, but trigger change detection only in the first one.
      appRef1.components[0].instance.name = 'Updated SimpleComp';
      appRef2.components[0].instance.name = 'Updated SimpleComp2';

      // Trigger change detection for the first app.
      appRef1.tick();

      // Expect that the first component content is updated, but the second one remains the same.
      expect(el.innerText).toBe('Hello from Updated SimpleComp!');
      expect(el2.innerText).toBe('Hello from SimpleComp2!');

      // Trigger change detection for the second app.
      appRef2.tick();

      // Now the second component should be updated as well.
      expect(el.innerText).toBe('Hello from Updated SimpleComp!');
      expect(el2.innerText).toBe('Hello from Updated SimpleComp2!');
    });

    it('should allow bootstrapping multiple standalone components within the same app', async () => {
      const appRef = await bootstrapApplication(SimpleComp);
      appRef.bootstrap(SimpleComp2);

      expect(el.innerText).toBe('Hello from SimpleComp!');
      expect(el2.innerText).toBe('Hello from SimpleComp2!');

      // Update name in both components.
      appRef.components[0].instance.name = 'Updated SimpleComp';
      appRef.components[1].instance.name = 'Updated SimpleComp2';

      // Run change detection for the app.
      appRef.tick();

      // Expect both components to be updated, since they belong to the same app.
      expect(el.innerText).toBe('Hello from Updated SimpleComp!');
      expect(el2.innerText).toBe('Hello from Updated SimpleComp2!');
    });

    it('should allow bootstrapping non-standalone components within the same app', async () => {
      const appRef = await bootstrapApplication(SimpleComp);

      // ApplicationRef should still allow bootstrapping non-standalone
      // components into the same application.
      appRef.bootstrap(NonStandaloneComp);

      expect(el.innerText).toBe('Hello from SimpleComp!');
      expect(el2.innerText).toBe('Hello from NonStandaloneComp!');

      // Update name in both components.
      appRef.components[0].instance.name = 'Updated SimpleComp';
      appRef.components[1].instance.name = 'Updated NonStandaloneComp';

      // Run change detection for the app.
      appRef.tick();

      // Expect both components to be updated, since they belong to the same app.
      expect(el.innerText).toBe('Hello from Updated SimpleComp!');
      expect(el2.innerText).toBe('Hello from Updated NonStandaloneComp!');
    });

    it('should throw when trying to bootstrap a non-standalone component', async () => {
      const msg =
        'NG0907: The NonStandaloneComp component is not marked as standalone, ' +
        'but Angular expects to have a standalone component here. Please make sure the ' +
        'NonStandaloneComp component has the `standalone: true` flag in the decorator.';
      let bootstrapError: string | null = null;

      try {
        await bootstrapApplication(NonStandaloneComp);
      } catch (e) {
        bootstrapError = (e as Error).message;
      }

      expect(bootstrapError).toBe(msg);
    });

    it('should throw when trying to bootstrap a standalone directive', async () => {
      @Directive({
        standalone: true,
        selector: '[dir]',
      })
      class StandaloneDirective {}

      const msg = //
        'NG0906: The StandaloneDirective is not an Angular component, ' +
        'make sure it has the `@Component` decorator.';
      let bootstrapError: string | null = null;

      try {
        await bootstrapApplication(StandaloneDirective);
      } catch (e) {
        bootstrapError = (e as Error).message;
      }

      expect(bootstrapError).toBe(msg);
    });

    it('should throw when trying to bootstrap a non-annotated class', async () => {
      class NonAnnotatedClass {}
      const msg = //
        'NG0906: The NonAnnotatedClass is not an Angular component, ' +
        'make sure it has the `@Component` decorator.';
      let bootstrapError: string | null = null;

      try {
        await bootstrapApplication(NonAnnotatedClass);
      } catch (e) {
        bootstrapError = (e as Error).message;
      }

      expect(bootstrapError).toBe(msg);
    });

    it('should have the TransferState token available', async () => {
      let state: TransferState | undefined;
      @Component({
        selector: 'hello-app',
        standalone: true,
        template: '...',
      })
      class StandaloneComponent {
        constructor() {
          state = _inject(TransferState);
        }
      }

      await bootstrapApplication(StandaloneComponent);
      expect(state).toBeInstanceOf(TransferState);
    });

    it('should reject the bootstrapApplication promise if an imported module throws', (done) => {
      @NgModule()
      class ErrorModule {
        constructor() {
          throw new Error('This error should be in the promise rejection');
        }
      }

      bootstrapApplication(SimpleComp, {
        providers: [importProvidersFrom(ErrorModule)],
      }).then(
        () => done.fail('Expected bootstrap promised to be rejected'),
        () => done(),
      );
    });

    describe('with animations', () => {
      @Component({
        standalone: true,
        selector: 'hello-app',
        template:
          '<div @myAnimation (@myAnimation.start)="onStart($event)">Hello from AnimationCmp!</div>',
        animations: [
          trigger('myAnimation', [transition('void => *', [style({opacity: 1}), animate(5)])]),
        ],
      })
      class AnimationCmp {
        renderer = _inject(ANIMATION_MODULE_TYPE, {optional: true}) ?? 'not found';
        startEvent?: {};

        onStart(event: {}) {
          this.startEvent = event;
        }
      }

      it('should enable animations when using provideAnimations()', async () => {
        const appRef = await bootstrapApplication(AnimationCmp, {
          providers: [provideAnimations()],
        });
        const cmp = appRef.components[0].instance;

        // Wait until animation is completed.
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(cmp.renderer).toBe('BrowserAnimations');
        expect(cmp.startEvent.triggerName).toEqual('myAnimation');
        expect(cmp.startEvent.phaseName).toEqual('start');

        expect(el.innerText).toBe('Hello from AnimationCmp!');
      });

      it('should use noop animations renderer when using provideNoopAnimations()', async () => {
        const appRef = await bootstrapApplication(AnimationCmp, {
          providers: [provideNoopAnimations()],
        });
        const cmp = appRef.components[0].instance;

        // Wait until animation is completed.
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(cmp.renderer).toBe('NoopAnimations');
        expect(cmp.startEvent.triggerName).toEqual('myAnimation');
        expect(cmp.startEvent.phaseName).toEqual('start');

        expect(el.innerText).toBe('Hello from AnimationCmp!');
      });
    });

    it('initializes modules inside the NgZone when using `provideZoneChangeDetection`', async () => {
      let moduleInitialized = false;
      @NgModule({})
      class SomeModule {
        constructor() {
          expect(NgZone.isInAngularZone()).toBe(true);
          moduleInitialized = true;
        }
      }
      @Component({
        template: '',
        selector: 'hello-app',
        imports: [SomeModule],
        standalone: true,
      })
      class AnimationCmp {}

      await bootstrapApplication(AnimationCmp, {
        providers: [provideZoneChangeDetection({eventCoalescing: true})],
      });
      expect(moduleInitialized).toBe(true);
    });
  });

  it('should throw if bootstrapped Directive is not a Component', (done) => {
    const logger = new MockConsole();
    const errorHandler = new ErrorHandler();
    (errorHandler as any)._console = logger as any;
    bootstrap(HelloRootDirectiveIsNotCmp, [{provide: ErrorHandler, useValue: errorHandler}]).catch(
      (error: Error) => {
        expect(error).toEqual(
          new Error(`HelloRootDirectiveIsNotCmp cannot be used as an entry component.`),
        );
        done();
      },
    );
  });

  it('should have the TransferState token available in NgModule bootstrap', async () => {
    let state: TransferState | undefined;
    @Component({
      selector: 'hello-app',
      template: '...',
      standalone: false,
    })
    class NonStandaloneComponent {
      constructor() {
        state = _inject(TransferState);
      }
    }

    await bootstrap(NonStandaloneComponent);
    expect(state).toBeInstanceOf(TransferState);
  });

  it('should retrieve sanitizer', inject([Injector], (injector: Injector) => {
    const sanitizer: Sanitizer | null = injector.get(Sanitizer, null);
    // We don't want to have sanitizer in DI. We use DI only to overwrite the
    // sanitizer, but not for default one. The default one is pulled in by the Ivy
    // instructions as needed.
    expect(sanitizer).toBe(null);
  }));

  it('should throw if no element is found', (done) => {
    const logger = new MockConsole();
    const errorHandler = new ErrorHandler();
    (errorHandler as any)._console = logger as any;
    bootstrap(NonExistentComp, [{provide: ErrorHandler, useValue: errorHandler}]).then(
      null,
      (reason) => {
        expect(reason.message).toContain('The selector "non-existent" did not match any elements');
        done();
        return null;
      },
    );
  });

  it('should throw if no provider', async () => {
    const logger = new MockConsole();
    const errorHandler = new ErrorHandler();
    (errorHandler as any)._console = logger as any;

    class IDontExist {}

    @Component({
      selector: 'cmp',
      template: 'Cmp',
      standalone: false,
    })
    class CustomCmp {
      constructor(iDontExist: IDontExist) {}
    }

    @Component({
      selector: 'hello-app',
      template: '<cmp></cmp>',
      standalone: false,
    })
    class RootCmp {}

    @NgModule({declarations: [CustomCmp], exports: [CustomCmp]})
    class CustomModule {}

    await expectAsync(
      bootstrap(RootCmp, [{provide: ErrorHandler, useValue: errorHandler}], [], [CustomModule]),
    ).toBeRejected();
  });

  if (getDOM().supportsDOMEvents) {
    it('should forward the error to promise when bootstrap fails', (done) => {
      const logger = new MockConsole();
      const errorHandler = new ErrorHandler();
      (errorHandler as any)._console = logger as any;

      const refPromise = bootstrap(NonExistentComp, [
        {provide: ErrorHandler, useValue: errorHandler},
      ]);
      refPromise.then(null, (reason: any) => {
        expect(reason.message).toContain('The selector "non-existent" did not match any elements');
        done();
      });
    });

    it('should invoke the default exception handler when bootstrap fails', (done) => {
      const logger = new MockConsole();
      const errorHandler = new ErrorHandler();
      (errorHandler as any)._console = logger as any;

      const refPromise = bootstrap(NonExistentComp, [
        {provide: ErrorHandler, useValue: errorHandler},
      ]);
      refPromise.then(null, (reason) => {
        expect(logger.res[0].join('#')).toContain(
          'ERROR#Error: NG05104: The selector "non-existent" did not match any elements',
        );
        done();
        return null;
      });
    });
  }

  it('should create an injector promise', async () => {
    const refPromise = bootstrap(HelloRootCmp, testProviders);
    expect(refPromise).toEqual(jasmine.any(Promise));
    await refPromise; // complete component initialization before switching to the next test
  });

  it('should set platform name to browser', (done) => {
    const refPromise = bootstrap(HelloRootCmp, testProviders);
    refPromise.then((ref) => {
      expect(isPlatformBrowser(ref.injector.get(PLATFORM_ID))).toBe(true);
      done();
    }, done.fail);
  });

  it('should display hello world', (done) => {
    const refPromise = bootstrap(HelloRootCmp, testProviders);
    refPromise.then((ref) => {
      expect(el).toHaveText('hello world!');
      expect(el.getAttribute('ng-version')).toEqual(VERSION.full);
      done();
    }, done.fail);
  });

  it('should throw a descriptive error if BrowserModule is installed again via a lazily loaded module', (done) => {
    @NgModule({imports: [BrowserModule]})
    class AsyncModule {}
    bootstrap(HelloRootCmp, testProviders)
      .then((ref: ComponentRef<HelloRootCmp>) => {
        const compiler: Compiler = ref.injector.get(Compiler);
        return compiler.compileModuleAsync(AsyncModule).then((factory) => {
          expect(() => factory.create(ref.injector)).toThrowError(
            'NG05100: Providers from the `BrowserModule` have already been loaded. ' +
              'If you need access to common directives such as NgIf and NgFor, ' +
              'import the `CommonModule` instead.',
          );
        });
      })
      .then(
        () => done(),
        (err) => done.fail(err),
      );
  });

  it('should support multiple calls to bootstrap', (done) => {
    const refPromise1 = bootstrap(HelloRootCmp, testProviders);
    const refPromise2 = bootstrap(HelloRootCmp2, testProviders);
    Promise.all([refPromise1, refPromise2]).then((refs) => {
      expect(el).toHaveText('hello world!');
      expect(el2).toHaveText('hello world, again!');
      done();
    }, done.fail);
  });

  it('should not crash if change detection is invoked when the root component is disposed', (done) => {
    bootstrap(HelloOnDestroyTickCmp, testProviders).then((ref) => {
      expect(() => ref.destroy()).not.toThrow();
      done();
    });
  });

  it('should unregister change detectors when components are disposed', (done) => {
    bootstrap(HelloRootCmp, testProviders).then((ref) => {
      const appRef = ref.injector.get(ApplicationRef);
      ref.destroy();
      expect(() => appRef.tick()).not.toThrow();
      done();
    }, done.fail);
  });

  it('should make the provided bindings available to the application component', (done) => {
    const refPromise = bootstrap(HelloRootCmp3, [
      testProviders,
      {provide: 'appBinding', useValue: 'BoundValue'},
    ]);

    refPromise.then((ref) => {
      expect(ref.injector.get('appBinding')).toEqual('BoundValue');
      done();
    }, done.fail);
  });

  it('should not override locale provided during bootstrap', (done) => {
    const refPromise = bootstrap(
      HelloRootCmp,
      [testProviders],
      [{provide: LOCALE_ID, useValue: 'fr-FR'}],
    );

    refPromise.then((ref) => {
      expect(ref.injector.get(LOCALE_ID)).toEqual('fr-FR');
      done();
    }, done.fail);
  });

  it('should avoid cyclic dependencies when root component requires Lifecycle through DI', (done) => {
    const refPromise = bootstrap(HelloRootCmp4, testProviders);

    refPromise.then((ref) => {
      const appRef = ref.injector.get(ApplicationRef);
      expect(appRef).toBeDefined();
      done();
    }, done.fail);
  });

  it('should run platform initializers', (done) => {
    inject([Log], (log: Log) => {
      const p = createPlatformFactory(platformBrowser, 'someName', [
        {provide: PLATFORM_INITIALIZER, useValue: log.fn('platform_init1'), multi: true},
        {provide: PLATFORM_INITIALIZER, useValue: log.fn('platform_init2'), multi: true},
      ])();

      @NgModule({
        imports: [BrowserModule],
        providers: [
          {provide: APP_INITIALIZER, useValue: log.fn('app_init1'), multi: true},
          {provide: APP_INITIALIZER, useValue: log.fn('app_init2'), multi: true},
        ],
      })
      class SomeModule {
        ngDoBootstrap() {}
      }

      expect(log.result()).toEqual('platform_init1; platform_init2');
      log.clear();
      p.bootstrapModule(SomeModule).then(() => {
        expect(log.result()).toEqual('app_init1; app_init2');
        done();
      }, done.fail);
    })();
  });

  it('should allow provideZoneChangeDetection in bootstrapModule', async () => {
    @NgModule({imports: [BrowserModule], providers: [provideZoneChangeDetection()]})
    class SomeModule {
      ngDoBootstrap() {}
    }

    await expectAsync(platformBrowser().bootstrapModule(SomeModule)).toBeResolved();
  });

  it('should register each application with the testability registry', async () => {
    const ngModuleRef1: NgModuleRef<unknown> = await bootstrap(HelloRootCmp, testProviders);
    const ngModuleRef2: NgModuleRef<unknown> = await bootstrap(HelloRootCmp2, testProviders);

    // The `TestabilityRegistry` is provided in the "platform", so the same instance is available
    // to both `NgModuleRef`s and it can be retrieved from any ref (we use the first one).
    const registry = ngModuleRef1.injector.get(TestabilityRegistry);

    expect(registry.findTestabilityInTree(el)).toEqual(ngModuleRef1.injector.get(Testability));
    expect(registry.findTestabilityInTree(el2)).toEqual(ngModuleRef2.injector.get(Testability));
  });

  it('should allow to pass schemas', (done) => {
    bootstrap(HelloCmpUsingCustomElement, testProviders).then(() => {
      expect(el).toHaveText('hello world!');
      done();
    }, done.fail);
  });

  describe('change detection', () => {
    const log: string[] = [];

    @Component({
      selector: 'hello-app',
      template: '<div id="button-a" (click)="onClick()">{{title}}</div>',
      standalone: false,
    })
    class CompA {
      title: string = '';

      ngDoCheck() {
        log.push('CompA:ngDoCheck');
      }

      onClick() {
        this.title = 'CompA';
        log.push('CompA:onClick');
      }
    }

    @Component({
      selector: 'hello-app-2',
      template: '<div id="button-b" (click)="onClick()">{{title}}</div>',
      standalone: false,
    })
    class CompB {
      title: string = '';

      ngDoCheck() {
        log.push('CompB:ngDoCheck');
      }

      onClick() {
        this.title = 'CompB';
        log.push('CompB:onClick');
      }
    }

    it('should be triggered for all bootstrapped components in case change happens in one of them', (done) => {
      @NgModule({
        imports: [BrowserModule],
        declarations: [CompA, CompB],
        bootstrap: [CompA, CompB],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      })
      class TestModuleA {}
      platformBrowser()
        .bootstrapModule(TestModuleA)
        .then((ref) => {
          log.length = 0;
          el.querySelectorAll<HTMLElement>('#button-a')[0].click();
          expect(log).toContain('CompA:onClick');
          expect(log).toContain('CompA:ngDoCheck');
          expect(log).toContain('CompB:ngDoCheck');

          log.length = 0;
          el2.querySelectorAll<HTMLElement>('#button-b')[0].click();
          expect(log).toContain('CompB:onClick');
          expect(log).toContain('CompA:ngDoCheck');
          expect(log).toContain('CompB:ngDoCheck');

          done();
        }, done.fail);
    });

    it('should work in isolation for each component bootstrapped individually', (done) => {
      const refPromise1 = bootstrap(CompA);
      const refPromise2 = bootstrap(CompB);
      Promise.all([refPromise1, refPromise2]).then((refs) => {
        log.length = 0;
        el.querySelectorAll<HTMLElement>('#button-a')[0].click();
        expect(log).toContain('CompA:onClick');
        expect(log).toContain('CompA:ngDoCheck');
        expect(log).not.toContain('CompB:ngDoCheck');

        log.length = 0;
        el2.querySelectorAll<HTMLElement>('#button-b')[0].click();
        expect(log).toContain('CompB:onClick');
        expect(log).toContain('CompB:ngDoCheck');
        expect(log).not.toContain('CompA:ngDoCheck');

        done();
      }, done.fail);
    });
  });
});

describe('providePlatformInitializer', () => {
  beforeEach(() => destroyPlatform());
  afterEach(() => destroyPlatform());

  it('should call the provided function when platform is initialized', () => {
    let initialized = false;

    createPlatformInjector([providePlatformInitializer(() => (initialized = true))]);

    expect(initialized).toBe(true);
  });

  it('should be able to inject dependencies', () => {
    const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN');
    let injectedValue!: string;

    createPlatformInjector([
      {provide: TEST_TOKEN, useValue: 'test'},
      providePlatformInitializer(() => {
        injectedValue = _inject(TEST_TOKEN);
      }),
    ]);

    expect(injectedValue).toBe('test');
  });

  function createPlatformInjector(providers: Array<EnvironmentProviders | Provider>) {
    /* TODO: should we change `createOrReusePlatformInjector` type to allow `EnvironmentProviders`?
     */
    return createOrReusePlatformInjector(providers as any);
  }
});

/**
 * Typing tests.
 */
@Component({
  template: '',
  // @ts-expect-error: `providePlatformInitializer()` should not work with Component.providers, as
  // it wouldn't be executed anyway.
  providers: [providePlatformInitializer(() => {})],
})
class Test {}
