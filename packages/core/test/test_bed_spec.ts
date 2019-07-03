/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ErrorHandler, Inject, Injectable, InjectionToken, Input, ModuleWithProviders, NgModule, Optional, Pipe, ɵsetClassMetadata as setClassMetadata, ɵɵdefineComponent as defineComponent, ɵɵdefineNgModule as defineNgModule, ɵɵtext as text} from '@angular/core';
import {TestBed, getTestBed} from '@angular/core/testing/src/test_bed';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

const NAME = new InjectionToken<string>('name');

// -- module: HWModule
@Component({
  selector: 'hello-world',
  template: '<greeting-cmp></greeting-cmp>',
})
export class HelloWorld {
}

// -- module: Greeting
@Component({
  selector: 'greeting-cmp',
  template: 'Hello {{ name }}',
})
export class GreetingCmp {
  name: string;

  constructor(@Inject(NAME) @Optional() name: string) { this.name = name || 'nobody!'; }
}

@NgModule({
  declarations: [GreetingCmp],
  exports: [GreetingCmp],
})
export class GreetingModule {
}

@Component({selector: 'simple-cmp', template: '<b>simple</b>'})
export class SimpleCmp {
}

@Component({selector: 'with-refs-cmp', template: '<div #firstDiv></div>'})
export class WithRefsCmp {
}

@Component({selector: 'inherited-cmp', template: 'inherited'})
export class InheritedCmp extends SimpleCmp {
}

@Directive({selector: '[hostBindingDir]', host: {'[id]': 'id'}})
export class HostBindingDir {
  id = 'one';
}

@Component({
  selector: 'component-with-prop-bindings',
  template: `
    <div hostBindingDir [title]="title" [attr.aria-label]="label"></div>
    <p title="( {{ label }} - {{ title }} )" [attr.aria-label]="label" id="[ {{ label }} ] [ {{ title }} ]">
    </p>
  `
})
export class ComponentWithPropBindings {
  title = 'some title';
  label = 'some label';
}

@Component({
  selector: 'simple-app',
  template: `
    <simple-cmp></simple-cmp> - <inherited-cmp></inherited-cmp>
  `
})
export class SimpleApp {
}

@Component({selector: 'inline-template', template: '<p>Hello</p>'})
export class ComponentWithInlineTemplate {
}

@NgModule({
  declarations: [
    HelloWorld, SimpleCmp, WithRefsCmp, InheritedCmp, SimpleApp, ComponentWithPropBindings,
    HostBindingDir
  ],
  imports: [GreetingModule],
  providers: [
    {provide: NAME, useValue: 'World!'},
  ]
})
export class HelloWorldModule {
}

describe('TestBed', () => {
  beforeEach(() => {
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
  });

  it('should compile and render a component', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  it('should give access to the component instance', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.componentInstance).toBeAnInstanceOf(HelloWorld);
  });

  it('should give the ability to query by css', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByCss = hello.debugElement.query(By.css('greeting-cmp'));
    expect(greetingByCss.nativeElement).toHaveText('Hello World!');
    expect(greetingByCss.componentInstance).toBeAnInstanceOf(GreetingCmp);
  });

  it('should give the ability to trigger the change detection', () => {
    const hello = TestBed.createComponent(HelloWorld);

    hello.detectChanges();
    const greetingByCss = hello.debugElement.query(By.css('greeting-cmp'));
    expect(greetingByCss.nativeElement).toHaveText('Hello World!');

    greetingByCss.componentInstance.name = 'TestBed!';
    hello.detectChanges();
    expect(greetingByCss.nativeElement).toHaveText('Hello TestBed!');
  });

  it('should give the ability to access property bindings on a node', () => {
    const fixture = TestBed.createComponent(ComponentWithPropBindings);
    fixture.detectChanges();

    const divElement = fixture.debugElement.query(By.css('div'));
    expect(divElement.properties).toEqual({id: 'one', title: 'some title'});
  });

  it('should give the ability to access interpolated properties on a node', () => {
    const fixture = TestBed.createComponent(ComponentWithPropBindings);
    fixture.detectChanges();

    const paragraphEl = fixture.debugElement.query(By.css('p'));
    expect(paragraphEl.properties)
        .toEqual({title: '( some label - some title )', id: '[ some label ] [ some title ]'});
  });

  it('should give access to the node injector', () => {
    const fixture = TestBed.createComponent(HelloWorld);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.css('greeting-cmp')).injector;

    // from the node injector
    const greetingCmp = injector.get(GreetingCmp);
    expect(greetingCmp.constructor).toBe(GreetingCmp);

    // from the node injector (inherited from a parent node)
    const helloWorldCmp = injector.get(HelloWorld);
    expect(fixture.componentInstance).toBe(helloWorldCmp);

    const nameInjected = injector.get(NAME);
    expect(nameInjected).toEqual('World!');
  });

  it('should give access to the node injector for root node', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    const injector = hello.debugElement.injector;

    // from the node injector
    const helloInjected = injector.get(HelloWorld);
    expect(helloInjected).toBe(hello.componentInstance);

    // from the module injector
    const nameInjected = injector.get(NAME);
    expect(nameInjected).toEqual('World!');
  });

  it('should give access to local refs on a node', () => {
    const withRefsCmp = TestBed.createComponent(WithRefsCmp);
    const firstDivDebugEl = withRefsCmp.debugElement.query(By.css('div'));
    // assert that a native element is referenced by a local ref
    expect(firstDivDebugEl.references.firstDiv.tagName.toLowerCase()).toBe('div');
  });

  it('should give the ability to query by directive', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByDirective = hello.debugElement.query(By.directive(GreetingCmp));
    expect(greetingByDirective.componentInstance).toBeAnInstanceOf(GreetingCmp);
  });

  it('allow to override a template', () => {
    // use original template when there is no override
    let hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');

    // override the template
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    TestBed.overrideComponent(GreetingCmp, {set: {template: `Bonjour {{ name }}`}});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Bonjour World!');

    // restore the original template by calling `.resetTestingModule()`
    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  it('allow to override a provider', () => {
    TestBed.overrideProvider(NAME, {useValue: 'injected World !'});
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello injected World !');
  });

  it('should allow overriding a provider defined via ModuleWithProviders (using TestBed.overrideProvider)',
     () => {
       const serviceOverride = {
         get() { return 'override'; },
       };

       @Injectable({providedIn: 'root'})
       class MyService {
         get() { return 'original'; }
       }

       @NgModule({})
       class MyModule {
         static forRoot(): ModuleWithProviders<MyModule> {
           return {
             ngModule: MyModule,
             providers: [MyService],
           };
         }
       }
       TestBed.overrideProvider(MyService, {useValue: serviceOverride});
       TestBed.configureTestingModule({
         imports: [MyModule.forRoot()],
       });

       const service = TestBed.get(MyService);
       expect(service.get()).toEqual('override');
     });

  it('should allow overriding a provider defined via ModuleWithProviders (using TestBed.configureTestingModule)',
     () => {
       const serviceOverride = {
         get() { return 'override'; },
       };

       @Injectable({providedIn: 'root'})
       class MyService {
         get() { return 'original'; }
       }

       @NgModule({})
       class MyModule {
         static forRoot(): ModuleWithProviders<MyModule> {
           return {
             ngModule: MyModule,
             providers: [MyService],
           };
         }
       }
       TestBed.configureTestingModule({
         imports: [MyModule.forRoot()],
         providers: [{provide: MyService, useValue: serviceOverride}],
       });

       const service = TestBed.get(MyService);
       expect(service.get()).toEqual('override');
     });

  it('allow to override multi provider', () => {
    const MY_TOKEN = new InjectionToken('MyProvider');
    class MyProvider {}

    @Component({selector: 'my-comp', template: ``})
    class MyComp {
      constructor(@Inject(MY_TOKEN) public myProviders: MyProvider[]) {}
    }

    TestBed.configureTestingModule({
      declarations: [MyComp],
      providers: [{provide: MY_TOKEN, useValue: {value: 'old provider'}, multi: true}]
    });

    const multiOverride = {useValue: [{value: 'new provider'}], multi: true};
    TestBed.overrideProvider(MY_TOKEN, multiOverride as any);

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.myProviders).toEqual([{value: 'new provider'}]);
  });

  it('should resolve components that are extended by other components', () => {
    // SimpleApp uses SimpleCmp in its template, which is extended by InheritedCmp
    const simpleApp = TestBed.createComponent(SimpleApp);
    simpleApp.detectChanges();
    expect(simpleApp.nativeElement).toHaveText('simple - inherited');
  });

  it('should not trigger change detection for ComponentA while calling TestBed.createComponent for ComponentB',
     () => {
       const log: string[] = [];
       @Component({
         selector: 'comp-a',
         template: '...',
       })
       class CompA {
         @Input() inputA: string = '';
         ngOnInit() { log.push('CompA:ngOnInit', this.inputA); }
       }

       @Component({
         selector: 'comp-b',
         template: '...',
       })
       class CompB {
         @Input() inputB: string = '';
         ngOnInit() { log.push('CompB:ngOnInit', this.inputB); }
       }

       TestBed.configureTestingModule({declarations: [CompA, CompB]});

       log.length = 0;
       const appA = TestBed.createComponent(CompA);
       appA.componentInstance.inputA = 'a';
       appA.autoDetectChanges();
       expect(log).toEqual(['CompA:ngOnInit', 'a']);

       log.length = 0;
       const appB = TestBed.createComponent(CompB);
       appB.componentInstance.inputB = 'b';
       appB.autoDetectChanges();
       expect(log).toEqual(['CompB:ngOnInit', 'b']);
     });

  it('should resolve components without async resources synchronously', (done) => {
    TestBed
        .configureTestingModule({
          declarations: [ComponentWithInlineTemplate],
        })
        .compileComponents()
        .then(done)
        .catch(error => {
          // This should not throw any errors. If an error is thrown, the test will fail.
          // Specifically use `catch` here to mark the test as done and *then* throw the error
          // so that the test isn't treated as a timeout.
          done();
          throw error;
        });

    // Intentionally call `createComponent` before `compileComponents` is resolved. We want this to
    // work for components that don't have any async resources (templateUrl, styleUrls).
    TestBed.createComponent(ComponentWithInlineTemplate);
  });

  it('should be able to override the ErrorHandler via an import', () => {
    class CustomErrorHandler {}

    @NgModule({providers: [{provide: ErrorHandler, useClass: CustomErrorHandler}]})
    class ProvidesErrorHandler {
    }

    getTestBed().resetTestingModule();
    TestBed.configureTestingModule({imports: [ProvidesErrorHandler, HelloWorldModule]});

    expect(TestBed.get(ErrorHandler)).toEqual(jasmine.any(CustomErrorHandler));

  });

  it('should throw errors in CD', () => {
    @Component({selector: 'my-comp', template: ''})
    class MyComp {
      name !: {hello: string};

      ngOnInit() {
        // this should throw because this.name is undefined
        this.name.hello = 'hello';
      }
    }

    TestBed.configureTestingModule({declarations: [MyComp]});

    expect(() => {
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
    }).toThrowError();
  });

  // TODO(FW-1245): properly fix issue where errors in listeners aren't thrown and don't cause
  // tests to fail. This is an issue in both View Engine and Ivy, and may require a breaking
  // change to completely fix (since simple re-throwing breaks handlers in ngrx, etc).
  xit('should throw errors in listeners', () => {

    @Component({selector: 'my-comp', template: '<button (click)="onClick()">Click me</button>'})
    class MyComp {
      name !: {hello: string};

      onClick() {
        // this should throw because this.name is undefined
        this.name.hello = 'hello';
      }
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    expect(() => {
      const button = fixture.nativeElement.querySelector('button');
      button.click();
    }).toThrowError();
  });

  onlyInIvy('TestBed new feature to allow declaration and import of component')
      .it('should allow both the declaration and import of a component into the testing module',
          () => {
            // This test validates that a component (Outer) which is both declared and imported
            // (via its module) in the testing module behaves correctly. That is:
            //
            // 1) the component should be compiled in the scope of its original module.
            //
            // This condition is tested by having the component (Outer) use another component
            // (Inner) within its template. Thus, if it's compiled in the correct scope then the
            // text 'Inner' from the template of (Inner) should appear in the result.
            //
            // 2) the component should be available in the TestingModule scope.
            //
            // This condition is tested by attempting to use the component (Outer) inside a test
            // fixture component (Fixture) which is declared in the testing module only.

            @Component({
              selector: 'inner',
              template: 'Inner',
            })
            class Inner {
            }

            @Component({
              selector: 'outer',
              template: '<inner></inner>',
            })
            class Outer {
            }

            @NgModule({
              declarations: [Inner, Outer],
            })
            class Module {
            }

            @Component({
              template: '<outer></outer>',
              selector: 'fixture',
            })
            class Fixture {
            }

            TestBed.configureTestingModule({
              declarations: [Outer, Fixture],
              imports: [Module],
            });

            const fixture = TestBed.createComponent(Fixture);
            // The Outer component should have its template stamped out, and that template should
            // include a correct instance of the Inner component with the 'Inner' text from its
            // template.
            expect(fixture.nativeElement.innerHTML).toEqual('<outer><inner>Inner</inner></outer>');
          });

  onlyInIvy('TestBed should handle AOT pre-compiled Components')
      .describe('AOT pre-compiled components', () => {
        /**
         * Function returns a class that represents AOT-compiled version of the following Component:
         *
         * @Component({
         *  selector: 'comp',
         *  templateUrl: './template.ng.html',
         *  styleUrls: ['./style.css']
         * })
         * class ComponentClass {}
         *
         * This is needed to closer match the behavior of AOT pre-compiled components (compiled
         * outside of TestBed) without changing TestBed state and/or Component metadata to compile
         * them via TestBed with external resources.
         */
        const getAOTCompiledComponent = () => {
          class ComponentClass {
            static ngComponentDef = defineComponent({
              type: ComponentClass,
              selectors: [['comp']],
              factory: () => new ComponentClass(),
              consts: 1,
              vars: 0,
              template: (rf: any, ctx: any) => {
                if (rf & 1) {
                  text(0, 'Some template');
                }
              },
              styles: ['body { margin: 0; }']
            });
          }
          setClassMetadata(
              ComponentClass, [{
                type: Component,
                args: [{
                  selector: 'comp',
                  templateUrl: './template.ng.html',
                  styleUrls: ['./style.css'],
                }]
              }],
              null, null);
          return ComponentClass;
        };

        it('should have an ability to override template', () => {
          const SomeComponent = getAOTCompiledComponent();
          TestBed.configureTestingModule({declarations: [SomeComponent]});
          TestBed.overrideTemplateUsingTestingModule(SomeComponent, 'Template override');
          const fixture = TestBed.createComponent(SomeComponent);
          expect(fixture.nativeElement.innerHTML).toBe('Template override');
        });

        it('should have an ability to override template with empty string', () => {
          const SomeComponent = getAOTCompiledComponent();
          TestBed.configureTestingModule({declarations: [SomeComponent]});
          TestBed.overrideTemplateUsingTestingModule(SomeComponent, '');
          const fixture = TestBed.createComponent(SomeComponent);
          expect(fixture.nativeElement.innerHTML).toBe('');
        });

        it('should allow component in both in declarations and imports', () => {
          const SomeComponent = getAOTCompiledComponent();

          // This is an AOT compiled module which declares (but does not export) SomeComponent.
          class ModuleClass {
            static ngModuleDef = defineNgModule({
              type: ModuleClass,
              declarations: [SomeComponent],
            });
          }

          @Component({
            template: '<comp></comp>',

            selector: 'fixture',
          })
          class TestFixture {
          }

          TestBed.configureTestingModule({
            // Here, SomeComponent is both declared, and then the module which declares it is
            // also imported. This used to be a duplicate declaration error, but is now interpreted
            // to mean:
            // 1) Compile (or reuse) SomeComponent in the context of its original NgModule
            // 2) Make SomeComponent available in the scope of the testing module, even if it wasn't
            //    originally exported from its NgModule.
            //
            // This allows TestFixture to use SomeComponent, which is asserted below.
            declarations: [SomeComponent, TestFixture],
            imports: [ModuleClass],
          });
          const fixture = TestBed.createComponent(TestFixture);
          // The regex avoids any issues with styling attributes.
          expect(fixture.nativeElement.innerHTML).toMatch(/<comp[^>]*>Some template<\/comp>/);
        });
      });

  onlyInIvy('patched ng defs should be removed after resetting TestingModule')
      .describe('resetting ng defs', () => {
        it('should restore ng defs to their initial states', () => {
          @Pipe({name: 'somePipe', pure: true})
          class SomePipe {
            transform(value: string): string { return `transformed ${value}`; }
          }

          @Directive({selector: 'someDirective'})
          class SomeDirective {
            someProp = 'hello';
          }

          @Component({selector: 'comp', template: 'someText'})
          class SomeComponent {
          }

          @NgModule({declarations: [SomeComponent]})
          class SomeModule {
          }

          TestBed.configureTestingModule({imports: [SomeModule]});

          // adding Pipe and Directive via metadata override
          TestBed.overrideModule(
              SomeModule, {set: {declarations: [SomeComponent, SomePipe, SomeDirective]}});
          TestBed.overrideComponent(
              SomeComponent,
              {set: {template: `<span someDirective>{{'hello' | somePipe}}</span>`}});
          TestBed.createComponent(SomeComponent);

          const defBeforeReset = (SomeComponent as any).ngComponentDef;
          expect(defBeforeReset.pipeDefs().length).toEqual(1);
          expect(defBeforeReset.directiveDefs().length).toEqual(2);  // directive + component

          TestBed.resetTestingModule();

          const defAfterReset = (SomeComponent as any).ngComponentDef;
          expect(defAfterReset.pipeDefs).toBe(null);
          expect(defAfterReset.directiveDefs).toBe(null);
        });

        it('should cleanup ng defs for classes with no ng annotations (in case of inheritance)',
           () => {
             @Component({selector: 'someDirective', template: '...'})
             class SomeComponent {
             }

             class ComponentWithNoAnnotations extends SomeComponent {}

             @Directive({selector: 'some-directive'})
             class SomeDirective {
             }

             class DirectiveWithNoAnnotations extends SomeDirective {}

             @Pipe({name: 'some-pipe'})
             class SomePipe {
             }

             class PipeWithNoAnnotations extends SomePipe {}

             TestBed.configureTestingModule({
               declarations: [
                 ComponentWithNoAnnotations, DirectiveWithNoAnnotations, PipeWithNoAnnotations
               ]
             });
             TestBed.createComponent(ComponentWithNoAnnotations);

             expect(ComponentWithNoAnnotations.hasOwnProperty('ngComponentDef')).toBeTruthy();
             expect(SomeComponent.hasOwnProperty('ngComponentDef')).toBeTruthy();

             expect(DirectiveWithNoAnnotations.hasOwnProperty('ngDirectiveDef')).toBeTruthy();
             expect(SomeDirective.hasOwnProperty('ngDirectiveDef')).toBeTruthy();

             expect(PipeWithNoAnnotations.hasOwnProperty('ngPipeDef')).toBeTruthy();
             expect(SomePipe.hasOwnProperty('ngPipeDef')).toBeTruthy();

             TestBed.resetTestingModule();

             // ng defs should be removed from classes with no annotations
             expect(ComponentWithNoAnnotations.hasOwnProperty('ngComponentDef')).toBeFalsy();
             expect(DirectiveWithNoAnnotations.hasOwnProperty('ngDirectiveDef')).toBeFalsy();
             expect(PipeWithNoAnnotations.hasOwnProperty('ngPipeDef')).toBeFalsy();

             // ng defs should be preserved on super types
             expect(SomeComponent.hasOwnProperty('ngComponentDef')).toBeTruthy();
             expect(SomeDirective.hasOwnProperty('ngDirectiveDef')).toBeTruthy();
             expect(SomePipe.hasOwnProperty('ngPipeDef')).toBeTruthy();
           });

        it('should clean up overridden providers for modules that are imported more than once',
           () => {

             @Injectable()
             class Token {
               name: string = 'real';
             }

             @NgModule({
               providers: [Token],
             })
             class Module {
             }

             TestBed.configureTestingModule({imports: [Module, Module]});
             TestBed.overrideProvider(Token, {useValue: {name: 'fake'}});

             expect(TestBed.get(Token).name).toEqual('fake');

             TestBed.resetTestingModule();

             // The providers for the module should have been restored to the original array, with
             // no trace of the overridden providers.
             expect((Module as any).ngInjectorDef.providers).toEqual([Token]);
           });
      });
});
