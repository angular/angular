/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig, ResourceLoader} from '@angular/compiler';
import {CUSTOM_ELEMENTS_SCHEMA, Compiler, Component, Directive, Inject, Injectable, Injector, Input, NgModule, Optional, Pipe, SkipSelf, ɵstringify as stringify} from '@angular/core';
import {TestBed, async, fakeAsync, getTestBed, inject, tick, withModule} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

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
    return new Promise<string>((resolve, reject) => setTimeout(() => resolve('timeout value'), 10));
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
  transform(value: string) { return `transformed ${value}`; }
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
class CompUsingModuleDirectiveAndPipe {
}

@NgModule()
class SomeLibModule {
}

@Component(
    {selector: 'comp', templateUrl: '/base/packages/platform-browser/test/static_assets/test.html'})
class CompWithUrlTemplate {
}

export function main() {
  describe('public testing API', () => {
    describe('using the async helper with context passing', () => {
      beforeEach(function() { this.actuallyDone = false; });

      afterEach(function() { expect(this.actuallyDone).toEqual(true); });

      it('should run normal tests', function() { this.actuallyDone = true; });

      it('should run normal async tests', function(done) {
        setTimeout(() => {
          this.actuallyDone = true;
          done();
        }, 0);
      });

      it('should run async tests with tasks',
         async(function() { setTimeout(() => this.actuallyDone = true, 0); }));

      it('should run async tests with promises', async(function() {
           const p = new Promise((resolve, reject) => setTimeout(resolve, 10));
           p.then(() => this.actuallyDone = true);
         }));
    });

    describe('basic context passing to inject, fakeAsync and withModule helpers', () => {
      const moduleConfig = {
        providers: [FancyService],
      };

      beforeEach(function() { this.contextModified = false; });

      afterEach(function() { expect(this.contextModified).toEqual(true); });

      it('should pass context to inject helper',
         inject([], function() { this.contextModified = true; }));

      it('should pass context to fakeAsync helper',
         fakeAsync(function() { this.contextModified = true; }));

      it('should pass context to withModule helper - simple',
         withModule(moduleConfig, function() { this.contextModified = true; }));

      it('should pass context to withModule helper - advanced',
         withModule(moduleConfig).inject([FancyService], function(service: FancyService) {
           expect(service.value).toBe('real value');
           this.contextModified = true;
         }));

      it('should preserve context when async and inject helpers are combined',
         async(inject([], function() { setTimeout(() => this.contextModified = true, 0); })));

      it('should preserve context when fakeAsync and inject helpers are combined',
         fakeAsync(inject([], function() {
           setTimeout(() => this.contextModified = true, 0);
           tick(1);
         })));
    });

    describe('using the test injector with the inject helper', () => {
      describe('setting up Providers', () => {
        beforeEach(() => {
          TestBed.configureTestingModule(
              {providers: [{provide: FancyService, useValue: new FancyService()}]});

          it('should use set up providers', inject([FancyService], (service: FancyService) => {
               expect(service.value).toEqual('real value');
             }));

          it('should wait until returned promises',
             async(inject([FancyService], (service: FancyService) => {
               service.getAsyncValue().then((value) => expect(value).toEqual('async value'));
               service.getTimeoutValue().then((value) => expect(value).toEqual('timeout value'));
             })));

          it('should allow the use of fakeAsync',
             fakeAsync(inject([FancyService], (service: FancyService) => {
               let value: string = undefined !;
               service.getAsyncValue().then((val) => value = val);
               tick();
               expect(value).toEqual('async value');
             })));

          it('should allow use of "done"', (done) => {
            inject([FancyService], (service: FancyService) => {
              let count = 0;
              const id = setInterval(() => {
                count++;
                if (count > 2) {
                  clearInterval(id);
                  done();
                }
              }, 5);
            })();  // inject needs to be invoked explicitly with ().
          });

          describe('using beforeEach', () => {
            beforeEach(inject([FancyService], (service: FancyService) => {
              service.value = 'value modified in beforeEach';
            }));

            it('should use modified providers', inject([FancyService], (service: FancyService) => {
                 expect(service.value).toEqual('value modified in beforeEach');
               }));
          });

          describe('using async beforeEach', () => {
            beforeEach(async(inject([FancyService], (service: FancyService) => {
              service.getAsyncValue().then((value) => service.value = value);
            })));

            it('should use asynchronously modified value',
               inject([FancyService], (service: FancyService) => {
                 expect(service.value).toEqual('async value');
               }));
          });
        });
      });
    });

    describe('using the test injector with modules', () => {
      const moduleConfig = {
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
          const el = compFixture.debugElement;

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
             const compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
             const el = compFixture.debugElement;

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
             const fixture = TestBed.createComponent(CompWithUrlTemplate);
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

        beforeEach(() => TestBed.configureTestingModule({imports: [SomeModule]}));

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

        describe('template', () => {
          let testBedSpy: any;
          beforeEach(() => {
            testBedSpy = spyOn(getTestBed(), 'overrideComponent').and.callThrough();
            TestBed.overrideTemplate(SomeComponent, 'newText');
          });
          it(`should override component's template`, () => {
            const fixture = TestBed.createComponent(SomeComponent);
            expect(fixture.nativeElement).toHaveText('newText');
            expect(testBedSpy).toHaveBeenCalledWith(SomeComponent, {
              set: {template: 'newText', templateUrl: null}
            });
          });
        });
      });

      describe('overriding providers', () => {
        describe('in NgModules', () => {
          it('should support useValue', () => {
            TestBed.configureTestingModule({
              providers: [
                {provide: 'a', useValue: 'aValue'},
              ]
            });
            TestBed.overrideProvider('a', {useValue: 'mockValue'});
            expect(TestBed.get('a')).toBe('mockValue');
          });

          it('should support useFactory', () => {
            TestBed.configureTestingModule({
              providers: [
                {provide: 'dep', useValue: 'depValue'},
                {provide: 'a', useValue: 'aValue'},
              ]
            });
            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: ['dep']});
            expect(TestBed.get('a')).toBe('mockA: depValue');
          });

          it('should support @Optional without matches', () => {
            TestBed.configureTestingModule({
              providers: [
                {provide: 'a', useValue: 'aValue'},
              ]
            });
            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new Optional(), 'dep']]});
            expect(TestBed.get('a')).toBe('mockA: null');
          });

          it('should support Optional with matches', () => {
            TestBed.configureTestingModule({
              providers: [
                {provide: 'dep', useValue: 'depValue'},
                {provide: 'a', useValue: 'aValue'},
              ]
            });
            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new Optional(), 'dep']]});
            expect(TestBed.get('a')).toBe('mockA: depValue');
          });

          it('should support SkipSelf', () => {
            @NgModule({
              providers: [
                {provide: 'a', useValue: 'aValue'},
                {provide: 'dep', useValue: 'depValue'},
              ]
            })
            class MyModule {
            }

            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new SkipSelf(), 'dep']]});
            TestBed.configureTestingModule(
                {providers: [{provide: 'dep', useValue: 'parentDepValue'}]});

            const compiler = TestBed.get(Compiler) as Compiler;
            const modFactory = compiler.compileModuleSync(MyModule);
            expect(modFactory.create(getTestBed()).injector.get('a')).toBe('mockA: parentDepValue');
          });

          describe('injecting eager providers into an eager overwritten provider', () => {
            @NgModule({
              providers: [
                {provide: 'a', useFactory: () => 'aValue'},
                {provide: 'b', useFactory: () => 'bValue'},
              ]
            })
            class MyModule {
              // NgModule is eager, which makes all of its deps eager
              constructor(@Inject('a') a: any, @Inject('b') b: any) {}
            }

            it('should inject providers that were declared before', () => {
              TestBed.configureTestingModule({imports: [MyModule]});
              TestBed.overrideProvider(
                  'b', {useFactory: (a: string) => `mockB: ${a}`, deps: ['a']});

              expect(TestBed.get('b')).toBe('mockB: aValue');
            });

            it('should inject providers that were declared afterwards', () => {
              TestBed.configureTestingModule({imports: [MyModule]});
              TestBed.overrideProvider(
                  'a', {useFactory: (b: string) => `mockA: ${b}`, deps: ['b']});

              expect(TestBed.get('a')).toBe('mockA: bValue');
            });
          });
        });

        describe('in Components', () => {
          it('should support useValue', () => {
            @Component({
              template: '',
              providers: [
                {provide: 'a', useValue: 'aValue'},
              ]
            })
            class MComp {
            }

            TestBed.overrideProvider('a', {useValue: 'mockValue'});
            const ctx =
                TestBed.configureTestingModule({declarations: [MComp]}).createComponent(MComp);

            expect(ctx.debugElement.injector.get('a')).toBe('mockValue');
          });

          it('should support useFactory', () => {
            @Component({
              template: '',
              providers: [
                {provide: 'dep', useValue: 'depValue'},
                {provide: 'a', useValue: 'aValue'},
              ]
            })
            class MyComp {
            }

            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: ['dep']});
            const ctx =
                TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

            expect(ctx.debugElement.injector.get('a')).toBe('mockA: depValue');
          });

          it('should support @Optional without matches', () => {
            @Component({
              template: '',
              providers: [
                {provide: 'a', useValue: 'aValue'},
              ]
            })
            class MyComp {
            }

            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new Optional(), 'dep']]});
            const ctx =
                TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

            expect(ctx.debugElement.injector.get('a')).toBe('mockA: null');
          });

          it('should support Optional with matches', () => {
            @Component({
              template: '',
              providers: [
                {provide: 'dep', useValue: 'depValue'},
                {provide: 'a', useValue: 'aValue'},
              ]
            })
            class MyComp {
            }

            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new Optional(), 'dep']]});
            const ctx =
                TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

            expect(ctx.debugElement.injector.get('a')).toBe('mockA: depValue');
          });

          it('should support SkipSelf', () => {
            @Directive({
              selector: '[myDir]',
              providers: [
                {provide: 'a', useValue: 'aValue'},
                {provide: 'dep', useValue: 'depValue'},
              ]
            })
            class MyDir {
            }

            @Component({
              template: '<div myDir></div>',
              providers: [
                {provide: 'dep', useValue: 'parentDepValue'},
              ]
            })
            class MyComp {
            }

            TestBed.overrideProvider(
                'a', {useFactory: (dep: any) => `mockA: ${dep}`, deps: [[new SkipSelf(), 'dep']]});
            const ctx = TestBed.configureTestingModule({declarations: [MyComp, MyDir]})
                            .createComponent(MyComp);
            expect(ctx.debugElement.children[0].injector.get('a')).toBe('mockA: parentDepValue');
          });

          it('should support multiple providers in a template', () => {
            @Directive({
              selector: '[myDir1]',
              providers: [
                {provide: 'a', useValue: 'aValue1'},
              ]
            })
            class MyDir1 {
            }

            @Directive({
              selector: '[myDir2]',
              providers: [
                {provide: 'a', useValue: 'aValue2'},
              ]
            })
            class MyDir2 {
            }

            @Component({
              template: '<div myDir1></div><div myDir2></div>',
            })
            class MyComp {
            }

            TestBed.overrideProvider('a', {useValue: 'mockA'});
            const ctx = TestBed.configureTestingModule({declarations: [MyComp, MyDir1, MyDir2]})
                            .createComponent(MyComp);
            expect(ctx.debugElement.children[0].injector.get('a')).toBe('mockA');
            expect(ctx.debugElement.children[1].injector.get('a')).toBe('mockA');
          });

          describe('injecting eager providers into an eager overwritten provider', () => {
            @Component({
              template: '',
              providers: [
                {provide: 'a', useFactory: () => 'aValue'},
                {provide: 'b', useFactory: () => 'bValue'},
              ]
            })
            class MyComp {
              // Component is eager, which makes all of its deps eager
              constructor(@Inject('a') a: any, @Inject('b') b: any) {}
            }

            it('should inject providers that were declared before it', () => {
              TestBed.overrideProvider(
                  'b', {useFactory: (a: string) => `mockB: ${a}`, deps: ['a']});
              const ctx =
                  TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

              expect(ctx.debugElement.injector.get('b')).toBe('mockB: aValue');
            });

            it('should inject providers that were declared after it', () => {
              TestBed.overrideProvider(
                  'a', {useFactory: (b: string) => `mockA: ${b}`, deps: ['b']});
              const ctx =
                  TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

              expect(ctx.debugElement.injector.get('a')).toBe('mockA: bValue');
            });
          });
        });

        it('should reset overrides when the testing modules is resetted', () => {
          TestBed.overrideProvider('a', {useValue: 'mockValue'});
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({providers: [{provide: 'a', useValue: 'aValue'}]});
          expect(TestBed.get('a')).toBe('aValue');
        });
      });

      describe('setting up the compiler', () => {

        describe('providers', () => {
          beforeEach(() => {
            const resourceLoaderGet = jasmine.createSpy('resourceLoaderGet')
                                          .and.returnValue(Promise.resolve('Hello world!'));
            TestBed.configureTestingModule({declarations: [CompWithUrlTemplate]});
            TestBed.configureCompiler(
                {providers: [{provide: ResourceLoader, useValue: {get: resourceLoaderGet}}]});
          });

          it('should use set up providers', fakeAsync(() => {
               TestBed.compileComponents();
               tick();
               const compFixture = TestBed.createComponent(CompWithUrlTemplate);
               expect(compFixture.nativeElement).toHaveText('Hello world!');
             }));
        });

        describe('useJit true', () => {
          beforeEach(() => TestBed.configureCompiler({useJit: true}));
          it('should set the value into CompilerConfig',
             inject([CompilerConfig], (config: CompilerConfig) => {
               expect(config.useJit).toBe(true);
             }));
        });
        describe('useJit false', () => {
          beforeEach(() => TestBed.configureCompiler({useJit: false}));
          it('should set the value into CompilerConfig',
             inject([CompilerConfig], (config: CompilerConfig) => {
               expect(config.useJit).toBe(false);
             }));
        });
      });
    });

    describe('errors', () => {
      let originalJasmineIt: (description: string, func: () => void) => jasmine.Spec;
      let originalJasmineBeforeEach: (beforeEachFunction: () => void) => void;

      const patchJasmineIt = () => {
        let resolve: (result: any) => void;
        let reject: (error: any) => void;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        originalJasmineIt = jasmine.getEnv().it;
        jasmine.getEnv().it = (description: string, fn: (done: DoneFn) => void): any => {
          const done = <DoneFn>(() => resolve(null));
          done.fail = (err) => reject(err);
          fn(done);
          return null;
        };
        return promise;
      };

      const restoreJasmineIt = () => jasmine.getEnv().it = originalJasmineIt;

      const patchJasmineBeforeEach = () => {
        let resolve: (result: any) => void;
        let reject: (error: any) => void;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
        jasmine.getEnv().beforeEach = (fn: (done: DoneFn) => void) => {
          const done = <DoneFn>(() => resolve(null));
          done.fail = (err) => reject(err);
          fn(done);
        };
        return promise;
      };

      const restoreJasmineBeforeEach = () => jasmine.getEnv().beforeEach =
          originalJasmineBeforeEach;

      it('should fail when an asynchronous error is thrown', (done) => {
        const itPromise = patchJasmineIt();
        const barError = new Error('bar');

        it('throws an async error',
           async(inject([], () => setTimeout(() => { throw barError; }, 0))));

        itPromise.then(() => done.fail('Expected test to fail, but it did not'), (err) => {
          expect(err).toEqual(barError);
          done();
        });
        restoreJasmineIt();
      });

      it('should fail when a returned promise is rejected', (done) => {
        const itPromise = patchJasmineIt();

        it('should fail with an error from a promise', async(inject([], () => {
             let reject: (error: any) => void = undefined !;
             const promise = new Promise((_, rej) => reject = rej);
             const p = promise.then(() => expect(1).toEqual(2));

             reject('baz');
             return p;
           })));

        itPromise.then(() => done.fail('Expected test to fail, but it did not'), (err) => {
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
             const itPromise = patchJasmineIt();

             expect(
                 () =>
                     it('should fail', withModule(
                                           {declarations: [CompWithUrlTemplate]},
                                           () => TestBed.createComponent(CompWithUrlTemplate))))
                 .toThrowError(
                     `This test module uses the component ${stringify(CompWithUrlTemplate)} which is using a "templateUrl" or "styleUrls", but they were never compiled. ` +
                     `Please call "TestBed.compileComponents" before your test.`);

             restoreJasmineIt();
           });

      });

      it('should error on unknown bound properties on custom elements by default', () => {
        @Component({template: '<some-element [someUnknownProp]="true"></some-element>'})
        class ComponentUsingInvalidProperty {
        }

        const itPromise = patchJasmineIt();

        expect(
            () => it(
                'should fail', withModule(
                                   {declarations: [ComponentUsingInvalidProperty]},
                                   () => TestBed.createComponent(ComponentUsingInvalidProperty))))
            .toThrowError(/Can't bind to 'someUnknownProp'/);

        restoreJasmineIt();
      });
    });

    describe('creating components', () => {

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
           const fixture = TestBed.createComponent(ChildComp);
           fixture.detectChanges();

           expect(fixture.nativeElement).toHaveText('Original Child');
         }));

      it('should allow changing members of the component', async(() => {
           const componentFixture = TestBed.createComponent(MyIfComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('MyIf()');

           componentFixture.componentInstance.showMore = true;
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('MyIf(More)');
         }));

      it('should override a template', async(() => {
           TestBed.overrideComponent(ChildComp, {set: {template: '<span>Mock</span>'}});
           const componentFixture = TestBed.createComponent(ChildComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('Mock');

         }));

      it('should override a provider', async(() => {
           TestBed.overrideComponent(
               TestProvidersComp,
               {set: {providers: [{provide: FancyService, useClass: MockFancyService}]}});
           const componentFixture = TestBed.createComponent(TestProvidersComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('injected value: mocked out value');
         }));


      it('should override a viewProvider', async(() => {
           TestBed.overrideComponent(
               TestViewProvidersComp,
               {set: {viewProviders: [{provide: FancyService, useClass: MockFancyService}]}});

           const componentFixture = TestBed.createComponent(TestViewProvidersComp);
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

           const componentFixture = TestBed.createComponent(ParentComp);
           componentFixture.detectChanges();
           expect(componentFixture.nativeElement).toHaveText('Parent(Mock)');
         }));
    });
  });
}
