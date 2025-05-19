/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler';
import {
  Compiler,
  Component,
  ComponentFactoryResolver,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  Optional,
  Pipe,
  TransferState,
  SkipSelf,
  Type,
} from '@angular/core';
import {
  fakeAsync,
  getTestBed,
  inject,
  TestBed,
  tick,
  waitForAsync,
  withModule,
} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {isBrowser} from '@angular/private/testing';

// Services, and components for the tests.

@Component({
  selector: 'child-comp',
  template: `<span>Original {{childBinding}}</span>`,
  standalone: false,
})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() {
    this.childBinding = 'Child';
  }
}

@Component({
  selector: 'child-comp',
  template: `<span>Mock</span>`,
  standalone: false,
})
@Injectable()
class MockChildComp {}

@Component({
  selector: 'parent-comp',
  template: `Parent(<child-comp></child-comp>)`,
  standalone: false,
})
@Injectable()
class ParentComp {}

@Component({
  selector: 'my-if-comp',
  template: `MyIf(<span *ngIf="showMore">More</span>)`,
  standalone: false,
})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({
  selector: 'child-child-comp',
  template: `<span>ChildChild</span>`,
  standalone: false,
})
@Injectable()
class ChildChildComp {}

class FancyService {
  value: string = 'real value';
  getAsyncValue() {
    return Promise.resolve('async value');
  }
  getTimeoutValue() {
    return new Promise<string>((resolve, reject) => setTimeout(() => resolve('timeout value'), 10));
  }
}

class MockFancyService extends FancyService {
  override value: string = 'mocked out value';
}

@Component({
  selector: 'my-service-comp',
  providers: [FancyService],
  template: `injected value: {{fancyService.value}}`,
  standalone: false,
})
class TestProvidersComp {
  constructor(private fancyService: FancyService) {}
}

@Component({
  selector: 'my-service-comp',
  viewProviders: [FancyService],
  template: `injected value: {{fancyService.value}}`,
  standalone: false,
})
class TestViewProvidersComp {
  constructor(private fancyService: FancyService) {}
}

@Directive({
  selector: '[someDir]',
  host: {'[title]': 'someDir'},
  standalone: false,
})
class SomeDirective {
  @Input() someDir!: string;
}

@Pipe({
  name: 'somePipe',
  standalone: false,
})
class SomePipe {
  transform(value: string) {
    return `transformed ${value}`;
  }
}

@Component({
  selector: 'comp',
  template: `<div  [someDir]="'someValue' | somePipe"></div>`,
  standalone: false,
})
class CompUsingModuleDirectiveAndPipe {}

@NgModule()
class SomeLibModule {}

const aTok = new InjectionToken<string>('a');
const bTok = new InjectionToken<string>('b');

describe('public testing API', () => {
  describe('using the async helper with context passing', () => {
    type TestContext = {actuallyDone: boolean};

    beforeEach(function (this: TestContext) {
      this.actuallyDone = false;
    });

    afterEach(function (this: TestContext) {
      expect(this.actuallyDone).toEqual(true);
    });

    it('should run normal tests', function (this: TestContext) {
      this.actuallyDone = true;
    });

    it('should run normal async tests', function (this: TestContext, done) {
      setTimeout(() => {
        this.actuallyDone = true;
        done();
      }, 0);
    });

    it('should run async tests with tasks', waitForAsync(function (this: TestContext) {
      setTimeout(() => (this.actuallyDone = true), 0);
    }));

    it('should run async tests with promises', waitForAsync(function (this: TestContext) {
      const p = new Promise((resolve, reject) => setTimeout(resolve, 10));
      p.then(() => (this.actuallyDone = true));
    }));
  });

  describe('basic context passing to inject, fakeAsync and withModule helpers', () => {
    const moduleConfig = {
      providers: [FancyService],
    };

    type TestContext = {contextModified: boolean};

    beforeEach(function (this: TestContext) {
      this.contextModified = false;
    });

    afterEach(function (this: TestContext) {
      expect(this.contextModified).toEqual(true);
    });

    it('should pass context to inject helper', inject([], function (this: TestContext) {
      this.contextModified = true;
    }));

    it('should pass context to fakeAsync helper', fakeAsync(function (this: TestContext) {
      this.contextModified = true;
    }));

    it(
      'should pass context to withModule helper - simple',
      withModule(moduleConfig, function (this: TestContext) {
        this.contextModified = true;
      }),
    );

    it(
      'should pass context to withModule helper - advanced',
      withModule(moduleConfig).inject(
        [FancyService],
        function (this: TestContext, service: FancyService) {
          expect(service.value).toBe('real value');
          this.contextModified = true;
        },
      ),
    );

    it('should preserve context when async and inject helpers are combined', waitForAsync(
      inject([], function (this: TestContext) {
        setTimeout(() => (this.contextModified = true), 0);
      }),
    ));

    it('should preserve context when fakeAsync and inject helpers are combined', fakeAsync(
      inject([], function (this: TestContext) {
        setTimeout(() => (this.contextModified = true), 0);
        tick(1);
      }),
    ));
  });

  describe('using the test injector with the inject helper', () => {
    describe('setting up Providers', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: FancyService, useValue: new FancyService()}],
        });
      });

      it('should use set up providers', inject([FancyService], (service: FancyService) => {
        expect(service.value).toEqual('real value');
      }));

      it('should wait until returned promises', waitForAsync(
        inject([FancyService], (service: FancyService) => {
          service.getAsyncValue().then((value) => expect(value).toEqual('async value'));
          service.getTimeoutValue().then((value) => expect(value).toEqual('timeout value'));
        }),
      ));

      it('should allow the use of fakeAsync', fakeAsync(
        inject([FancyService], (service: FancyService) => {
          let value: string = undefined!;
          service.getAsyncValue().then((val) => (value = val));
          tick();
          expect(value).toEqual('async value');
        }),
      ));

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
        })(); // inject needs to be invoked explicitly with ().
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
        beforeEach(waitForAsync(
          inject([FancyService], (service: FancyService) => {
            service.getAsyncValue().then((value) => (service.value = value));
          }),
        ));

        it('should use asynchronously modified value', inject(
          [FancyService],
          (service: FancyService) => {
            expect(service.value).toEqual('async value');
          },
        ));
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
        expect(compFixture.componentInstance).toBeInstanceOf(CompUsingModuleDirectiveAndPipe);
      });

      it('should use set up directives and pipes', () => {
        const compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
        const el = compFixture.debugElement;

        compFixture.detectChanges();
        expect(el.children[0].properties['title']).toBe('transformed someValue');
      });

      it('should use set up imported modules', inject(
        [SomeLibModule],
        (libModule: SomeLibModule) => {
          expect(libModule).toBeInstanceOf(SomeLibModule);
        },
      ));

      describe('provided schemas', () => {
        @Component({
          template: '<some-element [someUnknownProp]="true"></some-element>',
          standalone: false,
        })
        class ComponentUsingInvalidProperty {}

        beforeEach(() => {
          TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ComponentUsingInvalidProperty],
          });
        });

        it('should not error on unknown bound properties on custom elements when using the CUSTOM_ELEMENTS_SCHEMA', () => {
          expect(
            TestBed.createComponent(ComponentUsingInvalidProperty).componentInstance,
          ).toBeInstanceOf(ComponentUsingInvalidProperty);
        });
      });
    });

    describe('per test modules', () => {
      it(
        'should use set up providers',
        withModule(moduleConfig).inject([FancyService], (service: FancyService) => {
          expect(service.value).toEqual('real value');
        }),
      );

      it(
        'should use set up directives and pipes',
        withModule(moduleConfig, () => {
          const compFixture = TestBed.createComponent(CompUsingModuleDirectiveAndPipe);
          const el = compFixture.debugElement;

          compFixture.detectChanges();
          expect(el.children[0].properties['title']).toBe('transformed someValue');
        }),
      );

      it(
        'should use set up library modules',
        withModule(moduleConfig).inject([SomeLibModule], (libModule: SomeLibModule) => {
          expect(libModule).toBeInstanceOf(SomeLibModule);
        }),
      );
    });

    xdescribe('components with template url', () => {
      let TestComponent!: Type<unknown>;

      beforeEach(waitForAsync(async () => {
        @Component({
          selector: 'comp',
          templateUrl: '/base/angular/packages/platform-browser/test/static_assets/test.html',
          standalone: false,
        })
        class CompWithUrlTemplate {}

        TestComponent = CompWithUrlTemplate;

        TestBed.configureTestingModule({declarations: [CompWithUrlTemplate]});
        await TestBed.compileComponents();
      }));

      isBrowser &&
        it('should allow to createSync components with templateUrl after explicit async compilation', () => {
          const fixture = TestBed.createComponent(TestComponent);
          expect(fixture.nativeElement).toHaveText('from external template');
        });

      it('should always pass to satisfy jasmine always wanting an `it` block under a `describe`', () => {});
    });

    describe('overwriting metadata', () => {
      @Pipe({
        name: 'undefined',
        standalone: false,
      })
      class SomePipe {
        transform(value: string): string {
          return `transformed ${value}`;
        }
      }

      @Directive({
        selector: '[undefined]',
        standalone: false,
      })
      class SomeDirective {
        someProp = 'hello';
      }

      @Component({
        selector: 'comp',
        template: 'someText',
        standalone: false,
      })
      class SomeComponent {}

      @Component({
        selector: 'comp',
        template: 'someOtherText',
        standalone: false,
      })
      class SomeOtherComponent {}

      @NgModule({declarations: [SomeComponent, SomeDirective, SomePipe]})
      class SomeModule {}

      beforeEach(() => TestBed.configureTestingModule({imports: [SomeModule]}));

      describe('module', () => {
        beforeEach(() => {
          TestBed.overrideModule(SomeModule, {set: {declarations: [SomeOtherComponent]}});
        });
        it('should work', () => {
          expect(TestBed.createComponent(SomeOtherComponent).componentInstance).toBeInstanceOf(
            SomeOtherComponent,
          );
        });
      });

      describe('component', () => {
        beforeEach(() => {
          TestBed.overrideComponent(SomeComponent, {set: {selector: 'comp', template: 'newText'}});
        });
        it('should work', () => {
          expect(TestBed.createComponent(SomeComponent).nativeElement).toHaveText('newText');
        });
      });

      describe('directive', () => {
        beforeEach(() => {
          TestBed.overrideComponent(SomeComponent, {
            set: {selector: 'comp', template: `<div someDir></div>`},
          }).overrideDirective(SomeDirective, {
            set: {selector: '[someDir]', host: {'[title]': 'someProp'}},
          });
        });
        it('should work', () => {
          const compFixture = TestBed.createComponent(SomeComponent);
          compFixture.detectChanges();
          expect(compFixture.debugElement.children[0].properties['title']).toEqual('hello');
        });
      });

      describe('pipe', () => {
        beforeEach(() => {
          TestBed.overrideComponent(SomeComponent, {
            set: {selector: 'comp', template: `{{'hello' | somePipe}}`},
          })
            .overridePipe(SomePipe, {set: {name: 'somePipe'}})
            .overridePipe(SomePipe, {add: {pure: false}});
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
            set: {template: 'newText', templateUrl: null},
          });
        });
      });
    });

    describe('overriding providers', () => {
      describe('in core', () => {
        it('ComponentFactoryResolver', () => {
          const componentFactoryMock = jasmine.createSpyObj('componentFactory', [
            'resolveComponentFactory',
          ]);
          TestBed.overrideProvider(ComponentFactoryResolver, {useValue: componentFactoryMock});
          expect(TestBed.get(ComponentFactoryResolver)).toEqual(componentFactoryMock);
        });
      });

      describe('in NgModules', () => {
        it('should support useValue', () => {
          TestBed.configureTestingModule({
            providers: [{provide: aTok, useValue: 'aValue'}],
          });
          TestBed.overrideProvider(aTok, {useValue: 'mockValue'});
          expect(TestBed.inject(aTok)).toBe('mockValue');
        });

        it('should support useFactory', () => {
          TestBed.configureTestingModule({
            providers: [
              {provide: 'dep', useValue: 'depValue'},
              {provide: aTok, useValue: 'aValue'},
            ],
          });
          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: ['dep'],
          });
          expect(TestBed.inject(aTok)).toBe('mockA: depValue');
        });

        it('should support @Optional without matches', () => {
          TestBed.configureTestingModule({
            providers: [{provide: aTok, useValue: 'aValue'}],
          });
          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new Optional(), 'dep']],
          });
          expect(TestBed.inject(aTok)).toBe('mockA: null');
        });

        it('should support Optional with matches', () => {
          TestBed.configureTestingModule({
            providers: [
              {provide: 'dep', useValue: 'depValue'},
              {provide: aTok, useValue: 'aValue'},
            ],
          });
          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new Optional(), 'dep']],
          });
          expect(TestBed.inject(aTok)).toBe('mockA: depValue');
        });

        it('should support SkipSelf', () => {
          @NgModule({
            providers: [
              {provide: aTok, useValue: 'aValue'},
              {provide: 'dep', useValue: 'depValue'},
            ],
          })
          class MyModule {}

          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new SkipSelf(), 'dep']],
          });
          TestBed.configureTestingModule({
            providers: [{provide: 'dep', useValue: 'parentDepValue'}],
          });

          const compiler = TestBed.inject(Compiler);
          const modFactory = compiler.compileModuleSync(MyModule);
          expect(modFactory.create(getTestBed()).injector.get(aTok)).toBe('mockA: parentDepValue');
        });

        it('should keep imported NgModules eager', () => {
          let someModule: SomeModule | undefined;

          @NgModule()
          class SomeModule {
            constructor() {
              someModule = this;
            }
          }

          TestBed.configureTestingModule({
            providers: [{provide: aTok, useValue: 'aValue'}],
            imports: [SomeModule],
          });
          TestBed.overrideProvider(aTok, {useValue: 'mockValue'});

          expect(TestBed.inject(aTok)).toBe('mockValue');
          expect(someModule).toBeInstanceOf(SomeModule);
        });

        describe('injecting eager providers into an eager overwritten provider', () => {
          @NgModule({
            providers: [
              {provide: aTok, useFactory: () => 'aValue'},
              {provide: bTok, useFactory: () => 'bValue'},
            ],
          })
          class MyModule {
            // NgModule is eager, which makes all of its deps eager
            constructor(@Inject(aTok) a: any, @Inject(bTok) b: any) {}
          }

          it('should inject providers that were declared before', () => {
            TestBed.configureTestingModule({imports: [MyModule]});
            TestBed.overrideProvider(bTok, {
              useFactory: (a: string) => `mockB: ${a}`,
              deps: [aTok],
            });

            expect(TestBed.inject(bTok)).toBe('mockB: aValue');
          });

          it('should inject providers that were declared afterwards', () => {
            TestBed.configureTestingModule({imports: [MyModule]});
            TestBed.overrideProvider(aTok, {
              useFactory: (b: string) => `mockA: ${b}`,
              deps: [bTok],
            });

            expect(TestBed.inject(aTok)).toBe('mockA: bValue');
          });
        });
      });

      describe('in Components', () => {
        it('should support useValue', () => {
          @Component({
            template: '',
            providers: [{provide: aTok, useValue: 'aValue'}],
            standalone: false,
          })
          class MComp {}

          TestBed.overrideProvider(aTok, {useValue: 'mockValue'});
          const ctx = TestBed.configureTestingModule({declarations: [MComp]}).createComponent(
            MComp,
          );

          expect(ctx.debugElement.injector.get(aTok)).toBe('mockValue');
        });

        it('should support useFactory', () => {
          @Component({
            template: '',
            providers: [
              {provide: 'dep', useValue: 'depValue'},
              {provide: aTok, useValue: 'aValue'},
            ],
            standalone: false,
          })
          class MyComp {}

          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: ['dep'],
          });
          const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(
            MyComp,
          );

          expect(ctx.debugElement.injector.get(aTok)).toBe('mockA: depValue');
        });

        it('should support @Optional without matches', () => {
          @Component({
            template: '',
            providers: [{provide: aTok, useValue: 'aValue'}],
            standalone: false,
          })
          class MyComp {}

          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new Optional(), 'dep']],
          });
          const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(
            MyComp,
          );

          expect(ctx.debugElement.injector.get(aTok)).toBe('mockA: null');
        });

        it('should support Optional with matches', () => {
          @Component({
            template: '',
            providers: [
              {provide: 'dep', useValue: 'depValue'},
              {provide: aTok, useValue: 'aValue'},
            ],
            standalone: false,
          })
          class MyComp {}

          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new Optional(), 'dep']],
          });
          const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(
            MyComp,
          );

          expect(ctx.debugElement.injector.get(aTok)).toBe('mockA: depValue');
        });

        it('should support SkipSelf', () => {
          @Directive({
            selector: '[myDir]',
            providers: [
              {provide: aTok, useValue: 'aValue'},
              {provide: 'dep', useValue: 'depValue'},
            ],
            standalone: false,
          })
          class MyDir {}

          @Component({
            template: '<div myDir></div>',
            providers: [{provide: 'dep', useValue: 'parentDepValue'}],
            standalone: false,
          })
          class MyComp {}

          TestBed.overrideProvider(aTok, {
            useFactory: (dep: any) => `mockA: ${dep}`,
            deps: [[new SkipSelf(), 'dep']],
          });
          const ctx = TestBed.configureTestingModule({
            declarations: [MyComp, MyDir],
          }).createComponent(MyComp);
          expect(ctx.debugElement.children[0].injector.get(aTok)).toBe('mockA: parentDepValue');
        });

        it('should support multiple providers in a template', () => {
          @Directive({
            selector: '[myDir1]',
            providers: [{provide: aTok, useValue: 'aValue1'}],
            standalone: false,
          })
          class MyDir1 {}

          @Directive({
            selector: '[myDir2]',
            providers: [{provide: aTok, useValue: 'aValue2'}],
            standalone: false,
          })
          class MyDir2 {}

          @Component({
            template: '<div myDir1></div><div myDir2></div>',
            standalone: false,
          })
          class MyComp {}

          TestBed.overrideProvider(aTok, {useValue: 'mockA'});
          const ctx = TestBed.configureTestingModule({
            declarations: [MyComp, MyDir1, MyDir2],
          }).createComponent(MyComp);
          expect(ctx.debugElement.children[0].injector.get(aTok)).toBe('mockA');
          expect(ctx.debugElement.children[1].injector.get(aTok)).toBe('mockA');
        });

        describe('injecting eager providers into an eager overwritten provider', () => {
          @Component({
            template: '',
            providers: [
              {provide: aTok, useFactory: () => 'aValue'},
              {provide: bTok, useFactory: () => 'bValue'},
            ],
            standalone: false,
          })
          class MyComp {
            // Component is eager, which makes all of its deps eager
            constructor(@Inject(aTok) a: any, @Inject(bTok) b: any) {}
          }

          it('should inject providers that were declared before it', () => {
            TestBed.overrideProvider(bTok, {
              useFactory: (a: string) => `mockB: ${a}`,
              deps: [aTok],
            });
            const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(
              MyComp,
            );

            expect(ctx.debugElement.injector.get(bTok)).toBe('mockB: aValue');
          });

          it('should inject providers that were declared after it', () => {
            TestBed.overrideProvider(aTok, {
              useFactory: (b: string) => `mockA: ${b}`,
              deps: [bTok],
            });
            const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(
              MyComp,
            );

            expect(ctx.debugElement.injector.get(aTok)).toBe('mockA: bValue');
          });
        });
      });

      it('should reset overrides when the testing modules is resetted', () => {
        TestBed.overrideProvider(aTok, {useValue: 'mockValue'});
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({providers: [{provide: aTok, useValue: 'aValue'}]});
        expect(TestBed.inject(aTok)).toBe('aValue');
      });
    });

    describe('overrideTemplateUsingTestingModule', () => {
      it('should compile the template in the context of the testing module', () => {
        @Component({
          selector: 'comp',
          template: 'a',
          standalone: false,
        })
        class MyComponent {
          prop = 'some prop';
        }

        let testDir: TestDir | undefined;

        @Directive({
          selector: '[test]',
          standalone: false,
        })
        class TestDir {
          constructor() {
            testDir = this;
          }

          @Input('test') test!: string;
        }

        TestBed.overrideTemplateUsingTestingModule(
          MyComponent,
          '<div [test]="prop">Hello world!</div>',
        );

        const fixture = TestBed.configureTestingModule({
          declarations: [MyComponent, TestDir],
        }).createComponent(MyComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('Hello world!');
        expect(testDir).toBeInstanceOf(TestDir);
        expect(testDir!.test).toBe('some prop');
      });

      it('should reset overrides when the testing module is resetted', () => {
        @Component({
          selector: 'comp',
          template: 'a',
          standalone: false,
        })
        class MyComponent {}

        TestBed.overrideTemplateUsingTestingModule(MyComponent, 'b');

        const fixture = TestBed.resetTestingModule()
          .configureTestingModule({declarations: [MyComponent]})
          .createComponent(MyComponent);
        expect(fixture.nativeElement).toHaveText('a');
      });
    });

    describe('setting up the compiler', () => {
      describe('providers', () => {
        // TODO(alxhub): disable while we figure out how this should work
        xit('should use set up providers', fakeAsync(() => {
          // Keeping this component inside the test is needed to make sure it's not resolved
          // prior to this test, thus having ɵcmp and a reference in resource
          // resolution queue. This is done to check external resoution logic in isolation by
          // configuring TestBed with the necessary ResourceLoader instance.
          @Component({
            selector: 'comp',
            templateUrl: '/base/angular/packages/platform-browser/test/static_assets/test.html',
            standalone: false,
          })
          class InternalCompWithUrlTemplate {}

          const resourceLoaderGet = jasmine
            .createSpy('resourceLoaderGet')
            .and.returnValue(Promise.resolve('Hello world!'));
          TestBed.configureTestingModule({declarations: [InternalCompWithUrlTemplate]});
          TestBed.configureCompiler({
            providers: [{provide: ResourceLoader, useValue: {get: resourceLoaderGet}}],
          });

          TestBed.compileComponents();
          tick();
          const compFixture = TestBed.createComponent(InternalCompWithUrlTemplate);
          expect(compFixture.nativeElement).toHaveText('Hello world!');
        }));
      });
    });
  });

  describe('errors', () => {
    let originalJasmineIt: (description: string, func: () => void) => jasmine.Spec;

    const patchJasmineIt = () => {
      let resolve: (result: any) => void;
      let reject: (error: any) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const jasmineEnv = jasmine.getEnv() as any;
      originalJasmineIt = jasmineEnv.it;
      jasmineEnv.it = (description: string, fn: (done: DoneFn) => void): any => {
        const done = <DoneFn>(() => resolve(null));
        done.fail = (err) => reject(err);
        fn(done);
        return null;
      };
      return promise;
    };

    const restoreJasmineIt = () => ((jasmine.getEnv() as any).it = originalJasmineIt);

    it('should fail when an asynchronous error is thrown', (done) => {
      const itPromise = patchJasmineIt();
      const barError = new Error('bar');

      it('throws an async error', waitForAsync(
        inject([], () =>
          setTimeout(() => {
            throw barError;
          }, 0),
        ),
      ));

      itPromise.then(
        () => done.fail('Expected test to fail, but it did not'),
        (err) => {
          expect(err).toEqual(barError);
          done();
        },
      );
      restoreJasmineIt();
    });

    it('should fail when a returned promise is rejected', (done) => {
      const itPromise = patchJasmineIt();

      it('should fail with an error from a promise', waitForAsync(
        inject([], () => {
          let reject: (error: any) => void = undefined!;
          const promise = new Promise((_, rej) => (reject = rej));
          const p = promise.then(() => expect(1).toEqual(2));

          reject('baz');
          return p;
        }),
      ));

      itPromise.then(
        () => done.fail('Expected test to fail, but it did not'),
        (err) => {
          expect(err.message).toEqual('baz');
          done();
        },
      );
      restoreJasmineIt();
    });

    describe('components', () => {
      let resourceLoaderGet: jasmine.Spy;
      beforeEach(() => {
        resourceLoaderGet = jasmine
          .createSpy('resourceLoaderGet')
          .and.returnValue(Promise.resolve('Hello world!'));
        TestBed.configureCompiler({
          providers: [{provide: ResourceLoader, useValue: {get: resourceLoaderGet}}],
        });
      });

      // TODO(alxhub): disable while we figure out how this should work
      xit('should report an error for declared components with templateUrl which never call TestBed.compileComponents', () => {
        @Component({
          selector: 'comp',
          templateUrl: '/base/angular/packages/platform-browser/test/static_assets/test.html',
          standalone: false,
        })
        class InlineCompWithUrlTemplate {}

        expect(
          withModule({declarations: [InlineCompWithUrlTemplate]}, () =>
            TestBed.createComponent(InlineCompWithUrlTemplate),
          ),
        ).toThrowError(`Component 'InlineCompWithUrlTemplate' is not resolved:
 - templateUrl: /base/angular/packages/platform-browser/test/static_assets/test.html
Did you run and wait for 'resolveComponentResources()'?`);
      });
    });

    it('should error on unknown bound properties on custom elements by default', () => {
      @Component({
        template: '<div [someUnknownProp]="true"></div>',
        standalone: false,
      })
      class ComponentUsingInvalidProperty {}

      const spy = spyOn(console, 'error');
      withModule({declarations: [ComponentUsingInvalidProperty]}, () => {
        const fixture = TestBed.createComponent(ComponentUsingInvalidProperty);
        fixture.detectChanges();
      })();
      expect(spy.calls.mostRecent().args[0]).toMatch(/Can't bind to 'someUnknownProp'/);
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
        ],
      });
    });

    it('should instantiate a component with valid DOM', waitForAsync(() => {
      const fixture = TestBed.createComponent(ChildComp);
      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('Original Child');
    }));

    it('should allow changing members of the component', waitForAsync(() => {
      const componentFixture = TestBed.createComponent(MyIfComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('MyIf()');

      componentFixture.componentInstance.showMore = true;
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('MyIf(More)');
    }));

    it('should override a template', waitForAsync(() => {
      TestBed.overrideComponent(ChildComp, {set: {template: '<span>Mock</span>'}});
      const componentFixture = TestBed.createComponent(ChildComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('Mock');
    }));

    it('should override a provider', waitForAsync(() => {
      TestBed.overrideComponent(TestProvidersComp, {
        set: {providers: [{provide: FancyService, useClass: MockFancyService}]},
      });
      const componentFixture = TestBed.createComponent(TestProvidersComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('injected value: mocked out value');
    }));

    it('should override a viewProvider', waitForAsync(() => {
      TestBed.overrideComponent(TestViewProvidersComp, {
        set: {viewProviders: [{provide: FancyService, useClass: MockFancyService}]},
      });

      const componentFixture = TestBed.createComponent(TestViewProvidersComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('injected value: mocked out value');
    }));
  });
  describe('using alternate components', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [MockChildComp, ParentComp],
      });
    });

    it('should override component dependencies', waitForAsync(() => {
      const componentFixture = TestBed.createComponent(ParentComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('Parent(Mock)');
    }));
  });

  describe('calling override methods after TestBed initialization', () => {
    const getExpectedErrorMessage = (methodName: string, methodDescription: string) =>
      `Cannot ${methodDescription} when the test module has already been instantiated. Make sure you are not using \`inject\` before \`${methodName}\`.`;

    it('should throw if TestBed.overrideProvider is called after TestBed initialization', () => {
      TestBed.inject(Injector);

      expect(() =>
        TestBed.overrideProvider(aTok, {
          useValue: 'mockValue',
        }),
      ).toThrowError(getExpectedErrorMessage('overrideProvider', 'override provider'));
    });

    it('should throw if TestBed.overrideModule is called after TestBed initialization', () => {
      @NgModule()
      class MyModule {}

      TestBed.inject(Injector);

      expect(() => TestBed.overrideModule(MyModule, {})).toThrowError(
        getExpectedErrorMessage('overrideModule', 'override module metadata'),
      );
    });

    it('should throw if TestBed.overridePipe is called after TestBed initialization', () => {
      @Pipe({
        name: 'myPipe',
        standalone: false,
      })
      class MyPipe {
        transform(value: any) {
          return value;
        }
      }

      TestBed.inject(Injector);

      expect(() => TestBed.overridePipe(MyPipe, {})).toThrowError(
        getExpectedErrorMessage('overridePipe', 'override pipe metadata'),
      );
    });

    it('should throw if TestBed.overrideDirective is called after TestBed initialization', () => {
      @Directive()
      class MyDirective {}

      TestBed.inject(Injector);

      expect(() => TestBed.overrideDirective(MyDirective, {})).toThrowError(
        getExpectedErrorMessage('overrideDirective', 'override directive metadata'),
      );
    });

    it('should throw if TestBed.overrideTemplateUsingTestingModule is called after TestBed initialization', () => {
      @Component({
        selector: 'comp',
        template: 'a',
        standalone: false,
      })
      class MyComponent {}

      TestBed.inject(Injector);

      expect(() => TestBed.overrideTemplateUsingTestingModule(MyComponent, 'b')).toThrowError(
        /Cannot override template when the test module has already been instantiated/,
      );
    });
  });

  it('TransferState re-export can be used as a type and contructor', () => {
    const transferState: TransferState = new TransferState();
    expect(transferState).toBeDefined();
  });
});
