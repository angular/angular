/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPlatformBrowser} from '@angular/common';
import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Compiler, Component, Directive, ErrorHandler, Inject, Input, LOCALE_ID, NgModule, OnDestroy, PLATFORM_ID, PLATFORM_INITIALIZER, Pipe, Provider, StaticProvider, Type, VERSION, createPlatformFactory} from '@angular/core';
import {ApplicationRef, destroyPlatform} from '@angular/core/src/application_ref';
import {Console} from '@angular/core/src/console';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {Testability, TestabilityRegistry} from '@angular/core/src/testability/testability';
import {AsyncTestCompleter, Log, afterEach, beforeEach, beforeEachProviders, describe, fit, inject, it} from '@angular/core/testing/src/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Component({selector: 'non-existent', template: ''})
class NonExistentComp {
}

@Component({selector: 'hello-app', template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'hello-app', template: 'before: <ng-content></ng-content> after: done'})
class HelloRootCmpContent {
  constructor() {}
}

@Component({selector: 'hello-app-2', template: '{{greeting}} world, again!'})
class HelloRootCmp2 {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
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

  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) { this.appRef = appRef; }
}

@Component({selector: 'hello-app'})
class HelloRootMissingTemplate {
}

@Directive({selector: 'hello-app'})
class HelloRootDirectiveIsNotCmp {
}

@Component({selector: 'hello-app', template: ''})
class HelloOnDestroyTickCmp implements OnDestroy {
  appRef: ApplicationRef;
  constructor(@Inject(ApplicationRef) appRef: ApplicationRef) { this.appRef = appRef; }

  ngOnDestroy(): void { this.appRef.tick(); }
}

@Component({selector: 'hello-app', templateUrl: './sometemplate.html'})
class HelloUrlCmp {
  greeting = 'hello';
}

@Directive({selector: '[someDir]', host: {'[title]': 'someDir'}})
class SomeDirective {
  // TODO(issue/24571): remove '!'.
  @Input()
  someDir !: string;
}

@Pipe({name: 'somePipe'})
class SomePipe {
  transform(value: string): any { return `transformed ${value}`; }
}

@Component({selector: 'hello-app', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
class HelloCmpUsingPlatformDirectiveAndPipe {
  show: boolean = false;
}

@Component({selector: 'hello-app', template: '<some-el [someProp]="true">hello world!</some-el>'})
class HelloCmpUsingCustomElement {
}

class MockConsole {
  res: any[][] = [];
  error(...s: any[]): void { this.res.push(s); }
}


class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}
  warn(message: string) { this.warnings.push(message); }
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

    beforeEachProviders(() => { return [Log]; });

    beforeEach(inject([DOCUMENT], (doc: any) => {
      destroyPlatform();
      compilerConsole = new DummyConsole();
      testProviders = [{provide: Console, useValue: compilerConsole}];

      const oldRoots = getDOM().querySelectorAll(doc, 'hello-app,hello-app-2,light-dom-el');
      for (let i = 0; i < oldRoots.length; i++) {
        getDOM().remove(oldRoots[i]);
      }

      el = getDOM().createElement('hello-app', doc);
      el2 = getDOM().createElement('hello-app-2', doc);
      lightDom = getDOM().createElement('light-dom-el', doc);
      getDOM().appendChild(doc.body, el);
      getDOM().appendChild(doc.body, el2);
      getDOM().appendChild(el, lightDom);
      getDOM().setText(lightDom, 'loading');
    }));

    afterEach(destroyPlatform);

    it('should throw if bootstrapped Directive is not a Component',
       inject([AsyncTestCompleter], (done: AsyncTestCompleter) => {
         const logger = new MockConsole();
         const errorHandler = new ErrorHandler();
         (errorHandler as any)._console = logger as any;
         expect(
             () => bootstrap(
                 HelloRootDirectiveIsNotCmp, [{provide: ErrorHandler, useValue: errorHandler}]))
             .toThrowError(`HelloRootDirectiveIsNotCmp cannot be used as an entry component.`);
         done.done();
       }));

    it('should throw if no element is found',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const logger = new MockConsole();
         const errorHandler = new ErrorHandler();
         (errorHandler as any)._console = logger as any;
         bootstrap(NonExistentComp, [
           {provide: ErrorHandler, useValue: errorHandler}
         ]).then(null, (reason) => {
           expect(reason.message)
               .toContain('The selector "non-existent" did not match any elements');
           async.done();
           return null;
         });
       }));

    it('should throw if no provider', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
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
           expect(e.message).toContain(
               'StaticInjectorError(TestModule)[CustomCmp -> IDontExist]: \n' +
               '  StaticInjectorError(Platform: core)[CustomCmp -> IDontExist]: \n' +
               '    NullInjectorError: No provider for IDontExist!');
           async.done();
           return null;
         });
       }));

    if (getDOM().supportsDOMEvents()) {
      it('should forward the error to promise when bootstrap fails',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const logger = new MockConsole();
           const errorHandler = new ErrorHandler();
           (errorHandler as any)._console = logger as any;

           const refPromise =
               bootstrap(NonExistentComp, [{provide: ErrorHandler, useValue: errorHandler}]);
           refPromise.then(null, (reason: any) => {
             expect(reason.message)
                 .toContain('The selector "non-existent" did not match any elements');
             async.done();
           });
         }));

      it('should invoke the default exception handler when bootstrap fails',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const logger = new MockConsole();
           const errorHandler = new ErrorHandler();
           (errorHandler as any)._console = logger as any;

           const refPromise =
               bootstrap(NonExistentComp, [{provide: ErrorHandler, useValue: errorHandler}]);
           refPromise.then(null, (reason) => {
             expect(logger.res[0].join('#'))
                 .toContain('ERROR#Error: The selector "non-existent" did not match any elements');
             async.done();
             return null;
           });
         }));
    }

    it('should create an injector promise', () => {
      const refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).toEqual(jasmine.any(Promise));
    });

    it('should set platform name to browser',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise = bootstrap(HelloRootCmp, testProviders);
         refPromise.then((ref) => {
           expect(isPlatformBrowser(ref.injector.get(PLATFORM_ID))).toBe(true);
           async.done();
         });
       }));

    it('should display hello world', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise = bootstrap(HelloRootCmp, testProviders);
         refPromise.then((ref) => {
           expect(el).toHaveText('hello world!');
           expect(el.getAttribute('ng-version')).toEqual(VERSION.full);
           async.done();
         });
       }));

    it('should throw a descriptive error if BrowserModule is installed again via a lazily loaded module',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
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
             .then(() => async.done(), err => async.fail(err));
       }));

    it('should support multiple calls to bootstrap',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise1 = bootstrap(HelloRootCmp, testProviders);
         const refPromise2 = bootstrap(HelloRootCmp2, testProviders);
         Promise.all([refPromise1, refPromise2]).then((refs) => {
           expect(el).toHaveText('hello world!');
           expect(el2).toHaveText('hello world, again!');
           async.done();
         });
       }));

    it('should not crash if change detection is invoked when the root component is disposed',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         bootstrap(HelloOnDestroyTickCmp, testProviders).then((ref) => {
           expect(() => ref.destroy()).not.toThrow();
           async.done();
         });
       }));

    it('should unregister change detectors when components are disposed',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         bootstrap(HelloRootCmp, testProviders).then((ref) => {
           const appRef = ref.injector.get(ApplicationRef);
           ref.destroy();
           expect(() => appRef.tick()).not.toThrow();
           async.done();
         });
       }));

    it('should make the provided bindings available to the application component',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise = bootstrap(
             HelloRootCmp3, [testProviders, {provide: 'appBinding', useValue: 'BoundValue'}]);

         refPromise.then((ref) => {
           expect(ref.injector.get('appBinding')).toEqual('BoundValue');
           async.done();
         });
       }));

    it('should not override locale provided during bootstrap',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise =
             bootstrap(HelloRootCmp, [testProviders], [{provide: LOCALE_ID, useValue: 'fr-FR'}]);

         refPromise.then(ref => {
           expect(ref.injector.get(LOCALE_ID)).toEqual('fr-FR');
           async.done();
         });
       }));

    it('should avoid cyclic dependencies when root component requires Lifecycle through DI',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise = bootstrap(HelloRootCmp4, testProviders);

         refPromise.then((ref) => {
           const appRef = ref.injector.get(ApplicationRef);
           expect(appRef).toBeDefined();
           async.done();
         });
       }));

    it('should run platform initializers',
       inject([Log, AsyncTestCompleter], (log: Log, async: AsyncTestCompleter) => {
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
           async.done();
         });
       }));

    it('should remove styles when transitioning from a server render',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

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
         dom.setAttribute(style, 'ng-transition', 'my-app');
         dom.appendChild(document.head, style);

         const root = dom.createElement('root', document);
         dom.appendChild(document.body, root);

         platform.bootstrapModule(TestModule).then(() => {
           const styles: HTMLElement[] =
               Array.prototype.slice.apply(dom.getElementsByTagName(document, 'style') || []);
           styles.forEach(
               style => { expect(dom.getAttribute(style, 'ng-transition')).not.toBe('my-app'); });
           async.done();
         });
       }));

    it('should register each application with the testability registry',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const refPromise1: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp, testProviders);
         const refPromise2: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp2, testProviders);

         Promise.all([refPromise1, refPromise2]).then((refs: ComponentRef<any>[]) => {
           const registry = refs[0].injector.get(TestabilityRegistry);
           const testabilities =
               [refs[0].injector.get(Testability), refs[1].injector.get(Testability)];
           Promise.all(testabilities).then((testabilities: Testability[]) => {
             expect(registry.findTestabilityInTree(el)).toEqual(testabilities[0]);
             expect(registry.findTestabilityInTree(el2)).toEqual(testabilities[1]);
             async.done();
           });
         });
       }));

    it('should allow to pass schemas', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         bootstrap(HelloCmpUsingCustomElement, testProviders).then((compRef) => {
           expect(el).toHaveText('hello world!');
           async.done();
         });
       }));

  });
}
