/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Compiler, Component, Directive, ErrorHandler, Inject, Input, NgModule, OnDestroy, PLATFORM_INITIALIZER, Pipe, Provider, createPlatformFactory} from '@angular/core';
import {ApplicationRef, destroyPlatform} from '@angular/core/src/application_ref';
import {Console} from '@angular/core/src/console';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {Testability, TestabilityRegistry} from '@angular/core/src/testability/testability';
import {AsyncTestCompleter, Log, afterEach, beforeEach, beforeEachProviders, describe, inject, it} from '@angular/core/testing/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {expect} from '@angular/platform-browser/testing/matchers';

import {stringify} from '../../src/facade/lang';

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
  @Input()
  someDir: string;
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
  res: any[] = [];
  error(s: any): void { this.res.push(s); }
}


class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}
  warn(message: string) { this.warnings.push(message); }
}


class TestModule {}
function bootstrap(cmpType: any, providers: Provider[] = []): Promise<any> {
  @NgModule({
    imports: [BrowserModule],
    declarations: [cmpType],
    bootstrap: [cmpType],
    providers: providers,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  class TestModule {
  }
  return platformBrowserDynamic().bootstrapModule(TestModule);
}

export function main() {
  var fakeDoc: any /** TODO #9100 */, el: any /** TODO #9100 */, el2: any /** TODO #9100 */,
      testProviders: Provider[], lightDom: any /** TODO #9100 */;

  describe('bootstrap factory method', () => {
    let compilerConsole: DummyConsole;

    beforeEachProviders(() => { return [Log]; });

    beforeEach(() => {
      destroyPlatform();

      fakeDoc = getDOM().createHtmlDocument();
      el = getDOM().createElement('hello-app', fakeDoc);
      el2 = getDOM().createElement('hello-app-2', fakeDoc);
      lightDom = getDOM().createElement('light-dom-el', fakeDoc);
      getDOM().appendChild(fakeDoc.body, el);
      getDOM().appendChild(fakeDoc.body, el2);
      getDOM().appendChild(el, lightDom);
      getDOM().setText(lightDom, 'loading');
      compilerConsole = new DummyConsole();
      testProviders =
          [{provide: DOCUMENT, useValue: fakeDoc}, {provide: Console, useValue: compilerConsole}];
    });

    afterEach(destroyPlatform);

    it('should throw if bootstrapped Directive is not a Component', () => {
      expect(() => bootstrap(HelloRootDirectiveIsNotCmp))
          .toThrowError(
              `Could not compile '${stringify(HelloRootDirectiveIsNotCmp)}' because it is not a component.`);
    });

    it('should throw if no element is found',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var logger = new MockConsole();
         var errorHandler = new ErrorHandler(false);
         errorHandler._console = logger as any;
         bootstrap(HelloRootCmp, [
           {provide: ErrorHandler, useValue: errorHandler}
         ]).then(null, (reason) => {
           expect(reason.message).toContain('The selector "hello-app" did not match any elements');
           async.done();
           return null;
         });
       }));

    if (getDOM().supportsDOMEvents()) {
      it('should forward the error to promise when bootstrap fails',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var logger = new MockConsole();
           var errorHandler = new ErrorHandler(false);
           errorHandler._console = logger as any;

           var refPromise =
               bootstrap(HelloRootCmp, [{provide: ErrorHandler, useValue: errorHandler}]);
           refPromise.then(null, (reason: any) => {
             expect(reason.message)
                 .toContain('The selector "hello-app" did not match any elements');
             async.done();
           });
         }));

      it('should invoke the default exception handler when bootstrap fails',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var logger = new MockConsole();
           var errorHandler = new ErrorHandler(false);
           errorHandler._console = logger as any;

           var refPromise =
               bootstrap(HelloRootCmp, [{provide: ErrorHandler, useValue: errorHandler}]);
           refPromise.then(null, (reason) => {
             expect(logger.res.join(''))
                 .toContain('The selector "hello-app" did not match any elements');
             async.done();
             return null;
           });
         }));
    }

    it('should create an injector promise', () => {
      var refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).not.toBe(null);
    });

    it('should display hello world', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var refPromise = bootstrap(HelloRootCmp, testProviders);
         refPromise.then((ref) => {
           expect(el).toHaveText('hello world!');
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
               let compiler: Compiler = ref.injector.get(Compiler);
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
         var refPromise1 = bootstrap(HelloRootCmp, testProviders);
         var refPromise2 = bootstrap(HelloRootCmp2, testProviders);
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
         var refPromise = bootstrap(
             HelloRootCmp3, [testProviders, {provide: 'appBinding', useValue: 'BoundValue'}]);

         refPromise.then((ref) => {
           expect(ref.injector.get('appBinding')).toEqual('BoundValue');
           async.done();
         });
       }));

    it('should avoid cyclic dependencies when root component requires Lifecycle through DI',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var refPromise = bootstrap(HelloRootCmp4, testProviders);

         refPromise.then((ref) => {
           const appRef = ref.injector.get(ApplicationRef);
           expect(appRef).toBeDefined();
           async.done();
         });
       }));

    it('should run platform initializers',
       inject([Log, AsyncTestCompleter], (log: Log, async: AsyncTestCompleter) => {
         let p = createPlatformFactory(platformBrowserDynamic, 'someName', [
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

    it('should register each application with the testability registry',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var refPromise1: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp, testProviders);
         var refPromise2: Promise<ComponentRef<any>> = bootstrap(HelloRootCmp2, testProviders);

         Promise.all([refPromise1, refPromise2]).then((refs: ComponentRef<any>[]) => {
           var registry = refs[0].injector.get(TestabilityRegistry);
           var testabilities =
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
