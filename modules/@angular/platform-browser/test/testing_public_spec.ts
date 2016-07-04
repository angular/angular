/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {CompilerConfig, XHR} from '@angular/compiler';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {AppModule, Component, ComponentFactoryResolver, Directive, Injectable, Input, Pipe, ViewMetadata, provide} from '@angular/core';
import {addProviders, async, configureCompiler, configureModule, fakeAsync, inject, tick, withModule, withProviders} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

import {stringify} from '../../http/src/facade/lang';
import {PromiseWrapper} from '../../http/src/facade/promise';

// Services, and components for the tests.

@Component(
    {selector: 'child-comp', template: `<span>Original {{childBinding}}</span>`, directives: []})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-comp', template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({
  selector: 'parent-comp',
  template: `Parent(<child-comp></child-comp>)`,
  directives: [ChildComp]
})
@Injectable()
class ParentComp {
}

@Component({
  selector: 'my-if-comp',
  template: `MyIf(<span *ngIf="showMore">More</span>)`,
  directives: [NgIf]
})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({selector: 'child-child-comp', template: `<span>ChildChild</span>`})
@Injectable()
class ChildChildComp {
}

@Component({
  selector: 'child-comp',
  template: `<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>`,
  directives: [ChildChildComp]
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-child-comp', template: `<span>ChildChild Mock</span>`})
@Injectable()
class MockChildChildComp {
}

class FancyService {
  value: string = 'real value';
  getAsyncValue() { return Promise.resolve('async value'); }
  getTimeoutValue() {
    return new Promise((resolve, reject) => { setTimeout(() => {resolve('timeout value')}, 10); })
  }
}

class MockFancyService extends FancyService {
  value: string = 'mocked out value';
}

@Component({
  selector: 'my-service-comp',
  providers: [FancyService],
  template: `injected value: {{fancyService.value}}`
})
class TestProvidersComp {
  constructor(private fancyService: FancyService) {}
}

@Component({
  selector: 'my-service-comp',
  viewProviders: [FancyService],
  template: `injected value: {{fancyService.value}}`
})
class TestViewProvidersComp {
  constructor(private fancyService: FancyService) {}
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

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
class CompUsingModuleDirectiveAndPipe {
}

@AppModule({})
class SomeNestedModule {
}

@Component({selector: 'comp', templateUrl: 'someTemplate.html'})
class CompWithUrlTemplate {
}

export function main() {
  describe('using the async helper', () => {
    var actuallyDone: boolean;

    beforeEach(() => { actuallyDone = false; });

    afterEach(() => { expect(actuallyDone).toEqual(true); });

    it('should run normal tests', () => { actuallyDone = true; });

    it('should run normal async tests', (done: any /** TODO #9100 */) => {
      setTimeout(() => {
        actuallyDone = true;
        done();
      }, 0);
    });

    it('should run async tests with tasks',
       async(() => { setTimeout(() => { actuallyDone = true; }, 0); }));

    it('should run async tests with promises', async(() => {
         var p = new Promise((resolve, reject) => { setTimeout(resolve, 10); });
         p.then(() => { actuallyDone = true; });
       }));
  });

  describe('using the test injector with the inject helper', () => {
    describe('setting up Providers', () => {
      beforeEach(() => addProviders([{provide: FancyService, useValue: new FancyService()}]));

      it('should use set up providers', inject([FancyService], (service: any /** TODO #9100 */) => {
           expect(service.value).toEqual('real value');
         }));

      it('should wait until returned promises',
         async(inject([FancyService], (service: any /** TODO #9100 */) => {
           service.getAsyncValue().then(
               (value: any /** TODO #9100 */) => { expect(value).toEqual('async value'); });
           service.getTimeoutValue().then(
               (value: any /** TODO #9100 */) => { expect(value).toEqual('timeout value'); });
         })));

      it('should allow the use of fakeAsync',
         fakeAsync(inject([FancyService], (service: any /** TODO #9100 */) => {
           var value: any /** TODO #9100 */;
           service.getAsyncValue().then(function(val: any /** TODO #9100 */) { value = val; });
           tick();
           expect(value).toEqual('async value');
         })));

      it('should allow use of "done"', (done: any /** TODO #9100 */) => {
        inject([FancyService], (service: any /** TODO #9100 */) => {
          let count = 0;
          let id = setInterval(() => {
            count++;
            if (count > 2) {
              clearInterval(id);
              done();
            }
          }, 5);
        })();  // inject needs to be invoked explicitly with ().
      });

      describe('using beforeEach', () => {
        beforeEach(inject([FancyService], (service: any /** TODO #9100 */) => {
          service.value = 'value modified in beforeEach';
        }));

        it('should use modified providers',
           inject([FancyService], (service: any /** TODO #9100 */) => {
             expect(service.value).toEqual('value modified in beforeEach');
           }));
      });

      describe('using async beforeEach', () => {
        beforeEach(async(inject([FancyService], (service: any /** TODO #9100 */) => {
          service.getAsyncValue().then(
              (value: any /** TODO #9100 */) => { service.value = value; });
        })));

        it('should use asynchronously modified value',
           inject([FancyService], (service: any /** TODO #9100 */) => {
             expect(service.value).toEqual('async value');
           }));
      });
    });

    describe('per test providers', () => {
      it('should allow per test providers',
         withProviders(() => [{provide: FancyService, useValue: new FancyService()}])
             .inject([FancyService], (service: any /** TODO #9100 */) => {
               expect(service.value).toEqual('real value');
             }));

      it('should return value from inject', () => {
        let retval = withProviders(() => [{provide: FancyService, useValue: new FancyService()}])
                         .inject([FancyService], (service: any /** TODO #9100 */) => {
                           expect(service.value).toEqual('real value');
                           return 10;
                         })();
        expect(retval).toBe(10);
      });
    });
  });

  describe('using the test injector with modules', () => {
    let moduleConfig: any;
    beforeEach(() => {
      moduleConfig = {
        providers: [FancyService],
        directives: [SomeDirective],
        pipes: [SomePipe],
        precompile: [CompUsingModuleDirectiveAndPipe],
        modules: [SomeNestedModule]
      };
    });

    describe('setting up a module', () => {
      beforeEach(() => configureModule(moduleConfig));

      it('should use set up providers', inject([FancyService], (service: FancyService) => {
           expect(service.value).toEqual('real value');
         }));

      it('should use set up directives and pipes',
         inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           let compFixture = tcb.createSync(CompUsingModuleDirectiveAndPipe);
           let el = compFixture.debugElement;

           compFixture.detectChanges();
           expect(el.children[0].properties['title']).toBe('transformed someValue');
         }));

      it('should use set up nested modules',
         inject([SomeNestedModule], (nestedModule: SomeNestedModule) => {
           expect(nestedModule).toBeAnInstanceOf(SomeNestedModule);
         }));

      it('should use set up precompile components',
         inject([ComponentFactoryResolver], (resolver: ComponentFactoryResolver) => {
           expect(resolver.resolveComponentFactory(CompUsingModuleDirectiveAndPipe).componentType)
               .toBe(CompUsingModuleDirectiveAndPipe);
         }));
    });

    describe('per test modules', () => {
      it('should use set up providers',
         withModule(() => moduleConfig).inject([FancyService], (service: FancyService) => {
           expect(service.value).toEqual('real value');
         }));

      it('should use set up directives and pipes',
         withModule(() => moduleConfig)
             .inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
               let compFixture = tcb.createSync(CompUsingModuleDirectiveAndPipe);
               let el = compFixture.debugElement;

               compFixture.detectChanges();
               expect(el.children[0].properties['title']).toBe('transformed someValue');
             }));

      it('should use set up nested modules',
         withModule(() => moduleConfig)
             .inject([SomeNestedModule], (nestedModule: SomeNestedModule) => {
               expect(nestedModule).toBeAnInstanceOf(SomeNestedModule);
             }));

      it('should use set up precompile components',
         withModule(() => moduleConfig)
             .inject([ComponentFactoryResolver], (resolver: ComponentFactoryResolver) => {
               expect(
                   resolver.resolveComponentFactory(CompUsingModuleDirectiveAndPipe).componentType)
                   .toBe(CompUsingModuleDirectiveAndPipe);
             }));
    });

    describe('precompile components with template url', () => {
      let xhrGet: jasmine.Spy;
      beforeEach(() => {
        xhrGet = jasmine.createSpy('xhrGet').and.returnValue(Promise.resolve('Hello world!'));
        configureCompiler({providers: [{provide: XHR, useValue: {get: xhrGet}}]});
      });

      it('should allow to precompile components with templateUrl using the async helper',
         async(withModule(() => {
                 return {precompile: [CompWithUrlTemplate]};
               }).inject([ComponentFactoryResolver], (resolver: ComponentFactoryResolver) => {
           expect(resolver.resolveComponentFactory(CompWithUrlTemplate).componentType)
               .toBe(CompWithUrlTemplate);
         })));

      it('should allow to precompile components with templateUrl using the fakeAsync helper',
         fakeAsync(withModule(() => {
                     return {precompile: [CompWithUrlTemplate]};
                   }).inject([ComponentFactoryResolver], (resolver: ComponentFactoryResolver) => {
           expect(resolver.resolveComponentFactory(CompWithUrlTemplate).componentType)
               .toBe(CompWithUrlTemplate);
         })));
    });

    describe('setting up the compiler', () => {

      describe('providers', () => {
        beforeEach(() => {
          let xhrGet = jasmine.createSpy('xhrGet').and.returnValue(Promise.resolve('Hello world!'));
          configureCompiler({providers: [{provide: XHR, useValue: {get: xhrGet}}]});
        });

        it('should use set up providers',
           fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
             let compFixture = tcb.createFakeAsync(CompWithUrlTemplate);
             expect(compFixture.nativeElement).toHaveText('Hello world!');
           })));
      });

      describe('useJit true', () => {
        beforeEach(() => { configureCompiler({useJit: true}); });
        it('should set the value into CompilerConfig',
           inject([CompilerConfig], (config: CompilerConfig) => {
             expect(config.useJit).toBe(true);
           }));
      });
      describe('useJit false', () => {
        beforeEach(() => { configureCompiler({useJit: false}); });
        it('should set the value into CompilerConfig',
           inject([CompilerConfig], (config: CompilerConfig) => {
             expect(config.useJit).toBe(false);
           }));
      });
    });
  });

  describe('errors', () => {
    var originalJasmineIt: any;
    var originalJasmineBeforeEach: any;

    var patchJasmineIt = () => {
      var deferred = PromiseWrapper.completer();
      originalJasmineIt = jasmine.getEnv().it;
      jasmine.getEnv().it = (description: string, fn: any /** TODO #9100 */) => {
        var done = () => { deferred.resolve() };
        (<any>done).fail = (err: any /** TODO #9100 */) => { deferred.reject(err) };
        fn(done);
        return null;
      };
      return deferred.promise;
    };

    var restoreJasmineIt = () => { jasmine.getEnv().it = originalJasmineIt; };

    var patchJasmineBeforeEach = () => {
      var deferred = PromiseWrapper.completer();
      originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
      jasmine.getEnv().beforeEach = (fn: any) => {
        var done = () => { deferred.resolve() };
        (<any>done).fail = (err: any /** TODO #9100 */) => { deferred.reject(err) };
        fn(done);
        return null;
      };
      return deferred.promise;
    };

    var restoreJasmineBeforeEach =
        () => { jasmine.getEnv().beforeEach = originalJasmineBeforeEach; };

    it('should fail when an asynchronous error is thrown', (done: any /** TODO #9100 */) => {
      var itPromise = patchJasmineIt();
      var barError = new Error('bar');

      it('throws an async error',
         async(inject([], () => { setTimeout(() => { throw barError; }, 0); })));

      itPromise.then(
          () => { done.fail('Expected test to fail, but it did not'); },
          (err) => {
            expect(err).toEqual(barError);
            done();
          });
      restoreJasmineIt();
    });

    it('should fail when a returned promise is rejected', (done: any /** TODO #9100 */) => {
      var itPromise = patchJasmineIt();

      it('should fail with an error from a promise', async(inject([], () => {
           var deferred = PromiseWrapper.completer();
           var p = deferred.promise.then(() => { expect(1).toEqual(2); });

           deferred.reject('baz');
           return p;
         })));

      itPromise.then(
          () => { done.fail('Expected test to fail, but it did not'); },
          (err) => {
            expect(err.message).toEqual('Uncaught (in promise): baz');
            done();
          });
      restoreJasmineIt();
    });

    describe('using addProviders', () => {
      beforeEach(() => addProviders([{provide: FancyService, useValue: new FancyService()}]));

      beforeEach(inject([FancyService], (service: any /** TODO #9100 */) => {
        expect(service.value).toEqual('real value');
      }));

      describe('nested addProviders', () => {

        it('should fail when the injector has already been used', () => {
          patchJasmineBeforeEach();
          expect(() => {
            beforeEach(() => addProviders([{provide: FancyService, useValue: new FancyService()}]));
          })
              .toThrowError(
                  'addProviders can\'t be called after the injector has been already created for this test. ' +
                  'This is most likely because you\'ve already used the injector to inject a beforeEach or the ' +
                  'current `it` function.');
          restoreJasmineBeforeEach();
        });
      });
    });

    describe('precompile', () => {
      let xhrGet: jasmine.Spy;
      beforeEach(() => {
        xhrGet = jasmine.createSpy('xhrGet').and.returnValue(Promise.resolve('Hello world!'));
        configureCompiler({providers: [{provide: XHR, useValue: {get: xhrGet}}]});
      });

      it('should report an error for precompile components with templateUrl and sync tests', () => {
        var itPromise = patchJasmineIt();

        expect(
            () => it(
                'should fail',
                withModule(() => { return {precompile: [CompWithUrlTemplate]}; })
                    .inject(
                        [ComponentFactoryResolver],
                        (resolver: ComponentFactoryResolver) => {
                          expect(
                              resolver.resolveComponentFactory(CompWithUrlTemplate).componentType)
                              .toBe(CompWithUrlTemplate);
                        })))
            .toThrowError(
                `This test module precompiles the component ${stringify(CompWithUrlTemplate)} which is using a "templateUrl", but the test is synchronous. ` +
                'Please use the "async(...)" or "fakeAsync(...)" helper functions to make the test asynchronous.');

        restoreJasmineIt();
      });

    });
  });

  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.createAsync(ChildComp).then((componentFixture) => {
           componentFixture.detectChanges();

           expect(componentFixture.debugElement.nativeElement).toHaveText('Original Child');
         });
       })));

    it('should allow changing members of the component',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.createAsync(MyIfComp).then((componentFixture) => {
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf()');

           componentFixture.debugElement.componentInstance.showMore = true;
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf(More)');
         });
       })));

    it('should override a template',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Mock');

             });
       })));

    it('should override a view',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideView(
                ChildComp, new ViewMetadata({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Modified Child');

             });
       })));

    it('should override component dependencies',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Parent(Mock)');

             });
       })));


    it('should override child component\'s dependencies',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
             .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('Parent(Original Child(ChildChild Mock))');

             });
       })));

    it('should override a provider',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideProviders(
                TestProvidersComp, [{provide: FancyService, useClass: MockFancyService}])
             .createAsync(TestProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       })));


    it('should override a viewProvider',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideViewProviders(
                TestViewProvidersComp, [{provide: FancyService, useClass: MockFancyService}])
             .createAsync(TestViewProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       })));
  });
}
