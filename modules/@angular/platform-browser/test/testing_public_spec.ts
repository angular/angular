/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig, ResourceLoader} from '@angular/compiler';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Directive, Injectable, Input, NgModule, Pipe} from '@angular/core';
import {TestBed, async, fakeAsync, inject, tick, withModule} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

import {stringify} from '../src/facade/lang';

// Services, and components for the tests.

@Component({selector: 'child-comp', template: `<span>Original {{childBinding}}</span>`})
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
})
@Injectable()
class ParentComp {
}

@Component({selector: 'my-if-comp', template: `MyIf(<span *ngIf="showMore">More</span>)`})
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
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

class FancyService {
  value: string = 'real value';
  getAsyncValue() { return Promise.resolve('async value'); }
  getTimeoutValue() {
    return new Promise(
        (resolve, reject) => { setTimeout(() => { resolve('timeout value'); }, 10); });
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

@NgModule()
class SomeLibModule {
}

@Component({
  selector: 'comp',
  templateUrl: '/base/modules/@angular/platform-browser/test/static_assets/test.html'
})
class CompWithUrlTemplate {
}

export function main() {
  describe('public testing API', () => {
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
        beforeEach(() => {
          TestBed.configureTestingModule(
              {providers: [{provide: FancyService, useValue: new FancyService()}]});

          it('should use set up providers',
             inject([FancyService], (service: any /** TODO #9100 */) => {
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
      });
    });

    describe('using the test injector with modules', () => {
      let moduleConfig = {
        providers: [FancyService],
        imports: [SomeLibModule],
        declarations: [SomeDirective, SomePipe, CompUsingModuleDirectiveAndPipe],
      };

      describe('setting up a module', () => {
        beforeEach(() => TestBed.configureTestingModule(moduleConfig));

        it('should use set up providers', inject([FancyService], (service: FancyService) => {
             expect(service.value).toEqual('real value');
           }));

        it('should be able to create any declared components', () => {
          const compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
          expect(compFixture.componentInstance).toBeAnInstanceOf(CompUsingModuleDirectiveAndPipe);
        });

        it('should use set up directives and pipes', () => {
          const compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
          let el = compFixture.debugElement;

          compFixture.detectChanges();
          expect(el.children[0].properties['title']).toBe('transformed someValue');
        });

        it('should use set up imported modules',
           inject([SomeLibModule], (libModule: SomeLibModule) => {
             expect(libModule).toBeAnInstanceOf(SomeLibModule);
           }));

        describe('provided schemas', () => {
          @Component({template: '<some-element [someUnknownProp]="true"></some-element>'})
          class ComponentUsingInvalidProperty {
          }

          beforeEach(() => {
            TestBed.configureTestingModule(
                {schemas: [CUSTOM_ELEMENTS_SCHEMA], declarations: [ComponentUsingInvalidProperty]});
          });

          it('should not error on unknown bound properties on custom elements when using the CUSTOM_ELEMENTS_SCHEMA',
             () => {
               expect(TestBed.createComponent(ComponentUsingInvalidProperty).componentInstance)
                   .toBeAnInstanceOf(ComponentUsingInvalidProperty);
             });
        });
      });

      describe('per test modules', () => {
        it('should use set up providers',
           withModule(moduleConfig).inject([FancyService], (service: FancyService) => {
             expect(service.value).toEqual('real value');
           }));

        it('should use set up directives and pipes', withModule(moduleConfig, () => {
             let compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
             let el = compFixture.debugElement;

             compFixture.detectChanges();
             expect(el.children[0].properties['title']).toBe('transformed someValue');
           }));

        it('should use set up library modules',
           withModule(moduleConfig).inject([SomeLibModule], (libModule: SomeLibModule) => {
             expect(libModule).toBeAnInstanceOf(SomeLibModule);
           }));
      });

      describe('components with template url', () => {
        beforeEach(async(() => {
          TestBed.configureTestingModule({declarations: [CompWithUrlTemplate]});
          TestBed.compileComponents();
        }));

        it('should allow to createSync components with templateUrl after explicit async compilation',
           () => {
             let fixture = TestBed.createComponent(CompWithUrlTemplate);
             expect(fixture.nativeElement).toHaveText('from external template\n');
           });
      });

      describe('overwriting metadata', () => {
        @Pipe({name: 'undefined'})
        class SomePipe {
          transform(value: string): string { return `transformed ${value}`; }
        }

        @Directive({selector: '[undefined]'})
        class SomeDirective {
          someProp = 'hello';
        }

        @Component({selector: 'comp', template: 'someText'})
        class SomeComponent {
        }

        @Component({selector: 'comp', template: 'someOtherText'})
        class SomeOtherComponent {
        }

        @NgModule({declarations: [SomeComponent, SomeDirective, SomePipe]})
        class SomeModule {
        }

        beforeEach(() => { TestBed.configureTestingModule({imports: [SomeModule]}); });

        describe('module', () => {
          beforeEach(() => {
            TestBed.overrideModule(SomeModule, {set: {declarations: [SomeOtherComponent]}});
          });
          it('should work', () => {
            expect(TestBed.createComponent(SomeOtherComponent).componentInstance)
                .toBeAnInstanceOf(SomeOtherComponent);
          });
        });

        describe('component', () => {
          beforeEach(() => {
            TestBed.overrideComponent(
                SomeComponent, {set: {selector: 'comp', template: 'newText'}});
          });
          it('should work', () => {
            expect(TestBed.createComponent(SomeComponent).nativeElement).toHaveText('newText');
          });
        });

        describe('directive', () => {
          beforeEach(() => {
            TestBed
                .overrideComponent(
                    SomeComponent, {set: {selector: 'comp', template: `<div someDir></div>`}})
                .overrideDirective(
                    SomeDirective, {set: {selector: '[someDir]', host: {'[title]': 'someProp'}}});
          });
          it('should work', () => {
            const compFixture = TestBed.createComponent(SomeComponent);
            compFixture.detectChanges();
            expect(compFixture.debugElement.children[0].properties['title']).toEqual('hello');
          });
        });

        describe('pipe', () => {
          beforeEach(() => {
            TestBed
                .overrideComponent(
                    SomeComponent, {set: {selector: 'comp', template: `{{'hello' | somePipe}}`}})
                .overridePipe(SomePipe, {set: {name: 'somePipe'}});
          });
          it('should work', () => {
            const compFixture = TestBed.createComponent(SomeComponent);
            compFixture.detectChanges();
            expect(compFixture.nativeElement).toHaveText('transformed hello');
          });
        });
      });

      describe('setting up the compiler', () => {

        describe('providers', () => {
          beforeEach(() => {
            let resourceLoaderGet = jasmine.createSpy('resourceLoaderGet')
                                        .and.returnValue(Promise.resolve('Hello world!'));
            TestBed.configureTestingModule({declarations: [CompWithUrlTemplate]});
            TestBed.configureCompiler(
                {providers: [{provide: ResourceLoader, useValue: {get: resourceLoaderGet}}]});
          });

          it('should use set up providers', fakeAsync(() => {
               TestBed.compileComponents();
               tick();
               let compFixture = TestBed.createComponent(CompWithUrlTemplate);
               expect(compFixture.nativeElement).toHaveText('Hello world!');
             }));
        });

        describe('useJit true', () => {
          beforeEach(() => { TestBed.configureCompiler({useJit: true}); });
          it('should set the value into CompilerConfig',
             inject([CompilerConfig], (config: CompilerConfig) => {
               expect(config.useJit).toBe(true);
             }));
        });
        describe('useJit false', () => {
          beforeEach(() => { TestBed.configureCompiler({useJit: false}); });
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
        var resolve: (result: any) => void;
        var reject: (error: any) => void;
        var promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        originalJasmineIt = jasmine.getEnv().it;
        jasmine.getEnv().it = (description: string, fn: any /** TODO #9100 */) => {
          var done = () => { resolve(null); };
          (<any>done).fail = (err: any /** TODO #9100 */) => { reject(err); };
          fn(done);
          return null;
        };
        return promise;
      };

      var restoreJasmineIt = () => { jasmine.getEnv().it = originalJasmineIt; };

      var patchJasmineBeforeEach = () => {
        var resolve: (result: any) => void;
        var reject: (error: any) => void;
        var promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
        jasmine.getEnv().beforeEach = (fn: any) => {
          var done = () => { resolve(null); };
          (<any>done).fail = (err: any /** TODO #9100 */) => { reject(err); };
          fn(done);
          return null;
        };
        return promise;
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
             var reject: (error: any) => void;
             var promise = new Promise((_, rej) => { reject = rej; });
             var p = promise.then(() => { expect(1).toEqual(2); });

             reject('baz');
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

      describe('components', () => {
        let resourceLoaderGet: jasmine.Spy;
        beforeEach(() => {
          resourceLoaderGet = jasmine.createSpy('resourceLoaderGet')
                                  .and.returnValue(Promise.resolve('Hello world!'));
          TestBed.configureCompiler(
              {providers: [{provide: ResourceLoader, useValue: {get: resourceLoaderGet}}]});
        });

        it('should report an error for declared components with templateUrl which never call TestBed.compileComponents',
           () => {
             var itPromise = patchJasmineIt();

             expect(
                 () => it(
                     'should fail', withModule(
                                        {declarations: [CompWithUrlTemplate]},
                                        () => { TestBed.createComponent(CompWithUrlTemplate); })))
                 .toThrowError(
                     `This test module uses the component ${stringify(CompWithUrlTemplate)} which is using a "templateUrl", but they were never compiled. ` +
                     `Please call "TestBed.compileComponents" before your test.`);

             restoreJasmineIt();
           });

      });

      it('should error on unknown bound properties on custom elements by default', () => {
        @Component({template: '<some-element [someUnknownProp]="true"></some-element>'})
        class ComponentUsingInvalidProperty {
        }

        var itPromise = patchJasmineIt();

        expect(
            () =>
                it('should fail',
                   withModule(
                       {declarations: [ComponentUsingInvalidProperty]},
                       () => { TestBed.createComponent(ComponentUsingInvalidProperty); })))
            .toThrowError(/Can't bind to 'someUnknownProp'/);

        restoreJasmineIt();
      });
    });

    describe('creating components', function() {

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [
            ChildComp,
            MyIfComp,
            ChildChildComp,
            ParentComp,
            TestProvidersComp,
            TestViewProvidersComp,
          ]
        });
      });

      it('should instantiate a component with valid DOM', async(() => {
           var fixture = TestBed.createComponent(ChildComp);
           fixture.detectChanges();

           expect(fixture.nativeElement).toHaveText('Original Child');
         }));

      it('should allow changing members of the component', async(() => {

           var componentFixture = TestBed.createComponent(MyIfComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('MyIf()');

           componentFixture.componentInstance.showMore = true;
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('MyIf(More)');
         }));

      it('should override a template', async(() => {
           TestBed.overrideComponent(ChildComp, {set: {template: '<span>Mock</span>'}});
           let componentFixture = TestBed.createComponent(ChildComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('Mock');

         }));

      it('should override a provider', async(() => {
           TestBed.overrideComponent(
               TestProvidersComp,
               {set: {providers: [{provide: FancyService, useClass: MockFancyService}]}});
           var componentFixture = TestBed.createComponent(TestProvidersComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('injected value: mocked out value');
         }));


      it('should override a viewProvider', async(() => {
           TestBed.overrideComponent(
               TestViewProvidersComp,
               {set: {viewProviders: [{provide: FancyService, useClass: MockFancyService}]}});

           var componentFixture = TestBed.createComponent(TestViewProvidersComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('injected value: mocked out value');
         }));
    });
    describe('using alternate components', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [
            MockChildComp,
            ParentComp,
          ]
        });
      });

      it('should override component dependencies', async(() => {

           let componentFixture = TestBed.createComponent(ParentComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('Parent(Mock)');
         }));
    });
  });
}
