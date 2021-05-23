/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, isPlatformBrowser, ɵgetDOM as getDOM} from '@angular/common';
import {APP_INITIALIZER, Compiler, Component, createPlatformFactory, CUSTOM_ELEMENTS_SCHEMA, Directive, ErrorHandler, Inject, Injector, Input, LOCALE_ID, NgModule, OnDestroy, Pipe, PLATFORM_ID, PLATFORM_INITIALIZER, Provider, Sanitizer, StaticProvider, Type, VERSION} from '@angular/core';
import {ApplicationRef, destroyPlatform} from '@angular/core/src/application_ref';
import {Console} from '@angular/core/src/console';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {Testability, TestabilityRegistry} from '@angular/core/src/testability/testability';
import {inject, TestBed} from '@angular/core/testing';
import {Log} from '@angular/core/testing/src/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, modifiedInIvy, onlyInIvy} from '@angular/private/testing';

@Component({selector: 'non-existent', template: ''})
class NonExistentComp {
}

@Component({selector: 'hello-app', template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting: string;
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({selector: 'hello-app', template: 'before: <ng-content></ng-content> after: done'})
class HelloRootCmpContent {
  constructor() {}
}

@Component({selector: 'hello-app-2', template: '{{greeting}} world, again!'})
class HelloRootCmp2 {
  greeting: string;
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({selector: 'hello-app', template: ''})
class HelloRootCmp3 {
  appBinding: any /** TODO #9100 */;

  constructor(@Inject('appBinding') appBinding: any /** TODO #9100 */) {
    this.appBinding = appBinding;
  }
}

@Component({selector: 'hello-app', template: ''})
class HelloRootCmp4 {
  appRef: any /** TODO #9100 */;

  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) {
    this.appRef = appRef;
  }
}

@Directive({selector: 'hello-app'})
class HelloRootDirectiveIsNotCmp {
}

@Component({selector: 'hello-app', template: ''})
class HelloOnDestroyTickCmp implements OnDestroy {
  appRef: ApplicationRef;
  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) {
    this.appRef = appRef;
  }

  ngOnDestroy(): void {
    this.appRef.tick();
  }
}

@Component({selector: 'hello-app', template: '<some-el [someProp]="true">hello world!</some-el>'})
class HelloCmpUsingCustomElement {
}

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


class TestModule {}
function bootstrap(
    cmpType: any, providers: Provider[] = [], platformProviders: StaticProvider[] = [],
    imports: Type<any>[] = []): Promise<any> {
  @NgModule({
    imports: [BrowserModule, ...imports],
    declarations: [cmpType],
    bootstrap: [cmpType],
    providers: providers,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  class TestModule {
  }
  return platformBrowserDynamic(platformProviders).bootstrapModule(TestModule);
}

{
  let el: any /** TODO #9100 */, el2: any /** TODO #9100 */, testProviders: Provider[],
      lightDom: any /** TODO #9100 */;

  describe('bootstrap factory method', () => {
    if (isNode) return;
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

    modifiedInIvy('bootstrapping non-Component throws in View Engine')
        .it('should throw if bootstrapped Directive is not a Component', done => {
          const logger = new MockConsole();
          const errorHandler = new ErrorHandler();
          (errorHandler as any)._console = logger as any;
          expect(
              () => bootstrap(
                  HelloRootDirectiveIsNotCmp, [{provide: ErrorHandler, useValue: errorHandler}]))
              .toThrowError(`HelloRootDirectiveIsNotCmp cannot be used as an entry component.`);
          done();
        });

    onlyInIvy('bootstrapping non-Component rejects Promise in Ivy')
        .it('should throw if bootstrapped Directive is not a Component', done => {
          const logger = new MockConsole();
          const errorHandler = new ErrorHandler();
          (errorHandler as any)._console = logger as any;
          bootstrap(HelloRootDirectiveIsNotCmp, [
            {provide: ErrorHandler, useValue: errorHandler}
          ]).catch((error: Error) => {
            expect(error).toEqual(
                new Error(`HelloRootDirectiveIsNotCmp cannot be used as an entry component.`));
            done();
          });
        });

    it('should retrieve sanitizer', inject([Injector], (injector: Injector) => {
         const sanitizer: Sanitizer|null = injector.get(Sanitizer, null);
         if (ivyEnabled) {
           // In Ivy we don't want to have sanitizer in DI. We use DI only to overwrite the
           // sanitizer, but not for default one. The default one is pulled in by the Ivy
           // instructions as needed.
           expect(sanitizer).toBe(null);
         } else {
           // In VE we always need to have Sanitizer available.
           expect(sanitizer).not.toBe(null);
         }
       }));

    it('should throw if no element is found', done => {
      const logger = new MockConsole();
      const errorHandler = new ErrorHandler();
      (errorHandler as any)._console = logger as any;
      bootstrap(NonExistentComp, [
        {provide: ErrorHandler, useValue: errorHandler}
      ]).then(null, (reason) => {
        expect(reason.message).toContain('The selector "non-existent" did not match any elements');
        done();
        return null;
      });
    });

    it('should throw if no provider', done => {
      const logger = new MockConsole();
      const errorHandler = new ErrorHandler();
      (errorHandler as any)._console = logger as any;

      class IDontExist {}

      @Component({selector: 'cmp', template: 'Cmp'})
      class CustomCmp {
        constructor(iDontExist: IDontExist) {}
      }

      @Component({
        selector: 'hello-app',
        template: '<cmp></cmp>',
      })
      class RootCmp {
      }

      @NgModule({declarations: [CustomCmp], exports: [CustomCmp]})
      class CustomModule {
      }

      bootstrap(RootCmp, [{provide: ErrorHandler, useValue: errorHandler}], [], [
        CustomModule
      ]).then(null, (e: Error) => {
        let errorMsg: string;
        if (ivyEnabled) {
          errorMsg = `R3InjectorError(TestModule)[IDontExist -> IDontExist -> IDontExist]: \n`;
        } else {
          errorMsg = `StaticInjectorError(TestModule)[CustomCmp -> IDontExist]: \n` +
              '  StaticInjectorError(Platform: core)[CustomCmp -> IDontExist]: \n' +
              '    NullInjectorError: No provider for IDontExist!';
        }
        expect(e.message).toContain(errorMsg);
        done();
        return null;
      });
    });

    if (getDOM().supportsDOMEvents) {
      it('should forward the error to promise when bootstrap fails', done => {
        const logger = new MockConsole();
        const errorHandler = new ErrorHandler();
        (errorHandler as any)._console = logger as any;

        const refPromise =
            bootstrap(NonExistentComp, [{provide: ErrorHandler, useValue: errorHandler}]);
        refPromise.then(null, (reason: any) => {
          expect(reason.message)
              .toContain('The selector "non-existent" did not match any elements');
          done();
        });
      });

      it('should invoke the default exception handler when bootstrap fails', done => {
        const logger = new MockConsole();
        const errorHandler = new ErrorHandler();
        (errorHandler as any)._console = logger as any;

        const refPromise =
            bootstrap(NonExistentComp, [{provide: ErrorHandler, useValue: errorHandler}]);
        refPromise.then(null, (reason) => {
          expect(logger.res[0].join('#'))
              .toContain('ERROR#Error: The selector "non-existent" did not match any elements');
          done();
          return null;
        });
      });
    }

    it('should create an injector promise', () => {
      const refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).toEqual(jasmine.any(Promise));
    });

    it('should set platform name to browser', done => {
      const refPromise = bootstrap(HelloRootCmp, testProviders);
      refPromise.then((ref) => {
        expect(isPlatformBrowser(ref.injector.get(PLATFORM_ID))).toBe(true);
        done();
      }, done.fail);
    });

    it('should display hello world', done => {
      const refPromise = bootstrap(HelloRootCmp, testProviders);
      refPromise.then((ref) => {
        expect(el).toHaveText('hello world!');
        expect(el.getAttribute('ng-version')).toEqual(VERSION.full);
        done();
      }, done.fail);
    });

    it('should throw a descriptive error if BrowserModule is installed again via a lazily loaded module',
       done => {
         @NgModule({imports: [BrowserModule]})
         class AsyncModule {
         }
         bootstrap(HelloRootCmp, testProviders)
             .then((ref: ComponentRef<HelloRootCmp>) => {
               const compiler: Compiler = ref.injector.get(Compiler);
               return compiler.compileModuleAsync(AsyncModule).then(factory => {
                 expect(() => factory.create(ref.injector))
                     .toThrowError(
                         `BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor from a lazy loaded module, import CommonModule instead.`);
               });
             })
             .then(() => done(), err => done.fail(err));
       });

    it('should support multiple calls to bootstrap', done => {
      const refPromise1 = bootstrap(HelloRootCmp, testProviders);
      const refPromise2 = bootstrap(HelloRootCmp2, testProviders);
      Promise.all([refPromise1, refPromise2]).then((refs) => {
        expect(el).toHaveText('hello world!');
        expect(el2).toHaveText('hello world, again!');
        done();
      }, done.fail);
    });

    it('should not crash if change detection is invoked when the root component is disposed',
       done => {
         bootstrap(HelloOnDestroyTickCmp, testProviders).then((ref) => {
           expect(() => ref.destroy()).not.toThrow();
           done();
         });
       });

    it('should unregister change detectors when components are disposed', done => {
      bootstrap(HelloRootCmp, testProviders).then((ref) => {
        const appRef = ref.injector.get(ApplicationRef);
        ref.destroy();
        expect(() => appRef.tick()).not.toThrow();
        done();
      }, done.fail);
    });

    it('should make the provided bindings available to the application component', done => {
      const refPromise = bootstrap(
          HelloRootCmp3, [testProviders, {provide: 'appBinding', useValue: 'BoundValue'}]);

      refPromise.then((ref) => {
        expect(ref.injector.get('appBinding')).toEqual('BoundValue');
        done();
      }, done.fail);
    });

    it('should not override locale provided during bootstrap', done => {
      const refPromise =
          bootstrap(HelloRootCmp, [testProviders], [{provide: LOCALE_ID, useValue: 'fr-FR'}]);

      refPromise.then(ref => {
        expect(ref.injector.get(LOCALE_ID)).toEqual('fr-FR');
        done();
      }, done.fail);
    });

    it('should avoid cyclic dependencies when root component requires Lifecycle through DI',
       done => {
         const refPromise = bootstrap(HelloRootCmp4, testProviders);

         refPromise.then((ref) => {
           const appRef = ref.injector.get(ApplicationRef);
           expect(appRef).toBeDefined();
           done();
         }, done.fail);
       });

    it('should run platform initializers', done => {
      inject([Log], (log: Log) => {
        const p = createPlatformFactory(platformBrowserDynamic, 'someName', [
          {provide: PLATFORM_INITIALIZER, useValue: log.fn('platform_init1'), multi: true},
          {provide: PLATFORM_INITIALIZER, useValue: log.fn('platform_init2'), multi: true}
        ])();

        @NgModule({
          imports: [BrowserModule],
          providers: [
            {provide: APP_INITIALIZER, useValue: log.fn('app_init1'), multi: true},
            {provide: APP_INITIALIZER, useValue: log.fn('app_init2'), multi: true}
          ]
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

    it('should remove styles when transitioning from a server render', done => {
      @Component({
        selector: 'root',
        template: 'root',
      })
      class RootCmp {
      }

      @NgModule({
        bootstrap: [RootCmp],
        declarations: [RootCmp],
        imports: [BrowserModule.withServerTransition({appId: 'my-app'})],
      })
      class TestModule {
      }

      // First, set up styles to be removed.
      const dom = getDOM();
      const platform = platformBrowserDynamic();
      const document = platform.injector.get(DOCUMENT);
      const style = dom.createElement('style', document);
      style.setAttribute('ng-transition', 'my-app');
      document.head.appendChild(style);

      const root = dom.createElement('root', document);
      document.body.appendChild(root);

      platform.bootstrapModule(TestModule).then(() => {
        const styles: HTMLElement[] =
            Array.prototype.slice.apply(document.getElementsByTagName('style') || []);
        styles.forEach(style => {
          expect(style.getAttribute('ng-transition')).not.toBe('my-app');
        });
        done();
      }, done.fail);
    });

    it('should register each application with the testability registry', done => {
      const refPromise1: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp, testProviders);
      const refPromise2: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp2, testProviders);

      Promise.all([refPromise1, refPromise2]).then((refs: ComponentRef<any>[]) => {
        const registry = refs[0].injector.get(TestabilityRegistry);
        const testabilities =
            [refs[0].injector.get(Testability), refs[1].injector.get(Testability)];

        Promise.all(testabilities).then((testabilities: Testability[]) => {
          expect(registry.findTestabilityInTree(el)).toEqual(testabilities[0]);
          expect(registry.findTestabilityInTree(el2)).toEqual(testabilities[1]);

          done();
        }, done.fail);
      }, done.fail);
    });

    it('should allow to pass schemas', done => {
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

      it('should be triggered for all bootstrapped components in case change happens in one of them',
         done => {
           @NgModule({
             imports: [BrowserModule],
             declarations: [CompA, CompB],
             bootstrap: [CompA, CompB],
             schemas: [CUSTOM_ELEMENTS_SCHEMA]
           })
           class TestModuleA {
           }
           platformBrowserDynamic().bootstrapModule(TestModuleA).then((ref) => {
             log.length = 0;
             el.querySelectorAll('#button-a')[0].click();
             expect(log).toContain('CompA:onClick');
             expect(log).toContain('CompA:ngDoCheck');
             expect(log).toContain('CompB:ngDoCheck');

             log.length = 0;
             el2.querySelectorAll('#button-b')[0].click();
             expect(log).toContain('CompB:onClick');
             expect(log).toContain('CompA:ngDoCheck');
             expect(log).toContain('CompB:ngDoCheck');

             done();
           }, done.fail);
         });


      it('should work in isolation for each component bootstrapped individually', done => {
        const refPromise1 = bootstrap(CompA);
        const refPromise2 = bootstrap(CompB);
        Promise.all([refPromise1, refPromise2]).then((refs) => {
          log.length = 0;
          el.querySelectorAll('#button-a')[0].click();
          expect(log).toContain('CompA:onClick');
          expect(log).toContain('CompA:ngDoCheck');
          expect(log).not.toContain('CompB:ngDoCheck');

          log.length = 0;
          el2.querySelectorAll('#button-b')[0].click();
          expect(log).toContain('CompB:onClick');
          expect(log).toContain('CompB:ngDoCheck');
          expect(log).not.toContain('CompA:ngDoCheck');

          done();
        }, done.fail);
      });
    });
  });
}
