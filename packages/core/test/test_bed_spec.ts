/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵPLATFORM_BROWSER_ID} from '@angular/common';
import {
  APP_INITIALIZER,
  ChangeDetectorRef,
  Compiler,
  Component,
  Directive,
  ElementRef,
  ErrorHandler,
  getNgModuleById,
  inject,
  Inject,
  Injectable,
  InjectionToken,
  InjectOptions,
  Injector,
  Input,
  LOCALE_ID,
  ModuleWithProviders,
  NgModule,
  Optional,
  Pipe,
  PLATFORM_ID,
  Type,
  ViewChild,
  ɵsetClassMetadata as setClassMetadata,
  ɵɵdefineComponent as defineComponent,
  ɵɵdefineInjector as defineInjector,
  ɵɵdefineNgModule as defineNgModule,
  ɵɵelementEnd as elementEnd,
  ɵɵelementStart as elementStart,
  ɵɵsetNgModuleScope as setNgModuleScope,
  ɵɵtext as text,
  DOCUMENT,
  signal,
  provideZonelessChangeDetection,
  inputBinding,
  Output,
  EventEmitter,
  outputBinding,
  twoWayBinding,
} from '../src/core';
import {DeferBlockBehavior} from '../testing';
import {TestBed, TestBedImpl} from '../testing/src/test_bed';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/private/testing/matchers';

import {NgModuleType} from '../src/render3';
import {depsTracker} from '../src/render3/deps_tracker/deps_tracker';
import {setClassMetadataAsync} from '../src/render3/metadata';
import {
  ComponentFixtureAutoDetect,
  TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT,
  THROW_ON_UNKNOWN_ELEMENTS_DEFAULT,
  THROW_ON_UNKNOWN_PROPERTIES_DEFAULT,
} from '../testing/src/test_bed_common';

const NAME = new InjectionToken<string>('name');

@Injectable({providedIn: 'root'})
class SimpleService {
  static ngOnDestroyCalls: number = 0;
  id: number = 1;
  ngOnDestroy() {
    SimpleService.ngOnDestroyCalls++;
  }
}

// -- module: HWModule
@Component({
  selector: 'hello-world',
  template: '<greeting-cmp></greeting-cmp>',
  standalone: false,
})
export class HelloWorld {}

// -- module: Greeting
@Component({
  selector: 'greeting-cmp',
  template: 'Hello {{ name }}',
  standalone: false,
})
export class GreetingCmp {
  name: string;

  constructor(
    @Inject(NAME) @Optional() name: string,
    @Inject(SimpleService) @Optional() service: SimpleService,
  ) {
    this.name = name || 'nobody!';
  }
}

@Component({
  selector: 'cmp-with-providers',
  template: '<hello-world></hello-world>',
  providers: [
    SimpleService, //
    {provide: NAME, useValue: `from Component`},
  ],
  standalone: false,
})
class CmpWithProviders {}

@NgModule({
  declarations: [GreetingCmp],
  exports: [GreetingCmp],
})
export class GreetingModule {}

@Component({
  selector: 'simple-cmp',
  template: '<b>simple</b>',
  standalone: false,
})
export class SimpleCmp {}

@Component({
  selector: 'with-refs-cmp',
  template: '<div #firstDiv></div>',
  standalone: false,
})
export class WithRefsCmp {}

@Component({
  selector: 'inherited-cmp',
  template: 'inherited',
  standalone: false,
})
export class InheritedCmp extends SimpleCmp {}

@Directive({
  selector: '[hostBindingDir]',
  host: {'[id]': 'id'},
  standalone: false,
})
export class HostBindingDir {
  id = 'one';
}

@Component({
  selector: 'component-with-prop-bindings',
  template: `
    <div hostBindingDir [title]="title" [attr.aria-label]="label"></div>
    <p title="( {{ label }} - {{ title }} )" [attr.aria-label]="label" id="[ {{ label }} ] [ {{ title }} ]">
    </p>
  `,
  standalone: false,
})
export class ComponentWithPropBindings {
  title = 'some title';
  label = 'some label';
}

@Component({
  selector: 'simple-app',
  template: `
    <simple-cmp></simple-cmp> - <inherited-cmp></inherited-cmp>
  `,
  standalone: false,
})
export class SimpleApp {}

@Component({
  selector: 'inline-template',
  template: '<p>Hello</p>',
  standalone: false,
})
export class ComponentWithInlineTemplate {}

@NgModule({
  declarations: [
    HelloWorld,
    SimpleCmp,
    WithRefsCmp,
    InheritedCmp,
    SimpleApp,
    ComponentWithPropBindings,
    HostBindingDir,
    CmpWithProviders,
  ],
  imports: [GreetingModule],
  providers: [{provide: NAME, useValue: 'World!'}],
})
export class HelloWorldModule {}

describe('TestBed', () => {
  // This test is extracted to an individual `describe` block to avoid any extra TestBed
  // initialization logic that happens in the `beforeEach` functions in other `describe` sections.
  it('should apply scopes correctly for components in the lazy-loaded module', () => {
    // Reset TestBed to the initial state, emulating an invocation of a first test.
    // Check `TestBed.checkGlobalCompilationFinished` for additional info.
    TestBedImpl.INSTANCE.globalCompilationChecked = false;

    @Component({
      selector: 'root',
      template: '<div dirA></div>',
      standalone: false,
    })
    class Root {}
    @Directive({
      selector: '[dirA]',
      host: {'title': 'Test title'},
      standalone: false,
    })
    class DirA {}

    // Note: this module is not directly reference in the test intentionally.
    // Its presence triggers a side-effect of patching correct scopes on the declared components.
    @NgModule({
      declarations: [Root, DirA],
    })
    class Module {}

    TestBed.configureTestingModule({});
    // Trigger TestBed initialization.
    TestBed.inject(Injector);

    // Emulate the end of a test (trigger module scoping queue flush).
    TestBed.resetTestingModule();

    // Emulate a lazy-loading scenario by creating a component
    // without importing a module into a TestBed testing module.
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.getAttribute('title')).toEqual('Test title');
  });
});

describe('TestBed with Standalone types', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should override dependencies of standalone components', () => {
    @Component({
      selector: 'dep',
      template: 'main dep',
    })
    class MainDep {}

    @Component({
      selector: 'dep',
      template: 'mock dep',
    })
    class MockDep {}

    @Component({
      selector: 'app-root',
      imports: [MainDep],
      template: '<dep />',
    })
    class AppComponent {}

    TestBed.configureTestingModule({imports: [AppComponent]});

    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // No overrides defined, expecting main dependency to be used.
    expect(fixture.nativeElement.innerHTML).toBe('<dep>main dep</dep>');

    // Emulate an end of a test.
    TestBed.resetTestingModule();

    // Emulate the start of a next test, make sure previous overrides
    // are not persisted across tests.
    TestBed.configureTestingModule({imports: [AppComponent]});
    TestBed.overrideComponent(AppComponent, {set: {imports: [MockDep]}});

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Main dependency was overridden, expect to see a mock.
    expect(fixture.nativeElement.innerHTML).toBe('<dep>mock dep</dep>');
  });

  it('should override providers on standalone component itself', () => {
    const A = new InjectionToken('A');

    @Component({
      template: '{{ a }}',
      providers: [{provide: A, useValue: 'A'}],
    })
    class MyStandaloneComp {
      constructor(@Inject(A) public a: string) {}
    }

    // NOTE: the `TestBed.configureTestingModule` is load-bearing here: it instructs
    // TestBed to examine and override providers in dependencies.
    TestBed.configureTestingModule({imports: [MyStandaloneComp]});
    TestBed.overrideProvider(A, {useValue: 'Overridden A'});

    const fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('Overridden A');
  });

  it('should override providers on components used as standalone component dependency', () => {
    @Injectable()
    class Service {
      id = 'Service(original)';
    }

    @Injectable()
    class MockService {
      id = 'Service(mock)';
    }

    @Component({
      selector: 'dep',
      template: '{{ service.id }}',
      providers: [Service],
    })
    class Dep {
      service = inject(Service);
    }

    @Component({
      template: '<dep />',
      imports: [Dep],
    })
    class MyStandaloneComp {}

    TestBed.configureTestingModule({imports: [MyStandaloneComp]});
    TestBed.overrideProvider(Service, {useFactory: () => new MockService()});

    let fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<dep>Service(mock)</dep>');

    // Emulate an end of a test.
    TestBed.resetTestingModule();

    // Emulate the start of a next test, make sure previous overrides
    // are not persisted across tests.
    TestBed.configureTestingModule({imports: [MyStandaloneComp]});

    fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    // No provider overrides, expect original provider value to be used.
    expect(fixture.nativeElement.innerHTML).toBe('<dep>Service(original)</dep>');
  });

  it('should override providers in standalone component dependencies via overrideProvider', () => {
    const A = new InjectionToken('A');
    @NgModule({
      providers: [{provide: A, useValue: 'A'}],
    })
    class ComponentDependenciesModule {}

    @Component({
      template: '{{ a }}',
      imports: [ComponentDependenciesModule],
    })
    class MyStandaloneComp {
      constructor(@Inject(A) public a: string) {}
    }

    // NOTE: the `TestBed.configureTestingModule` is load-bearing here: it instructs
    // TestBed to examine and override providers in dependencies.
    TestBed.configureTestingModule({imports: [MyStandaloneComp]});
    TestBed.overrideProvider(A, {useValue: 'Overridden A'});

    const fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('Overridden A');
  });

  it('should override providers in standalone component dependencies via overrideModule', () => {
    const A = new InjectionToken('A');
    @NgModule({
      providers: [{provide: A, useValue: 'A'}],
    })
    class ComponentDependenciesModule {}

    @Component({
      template: '{{ a }}',
      imports: [ComponentDependenciesModule],
    })
    class MyStandaloneComp {
      constructor(@Inject(A) public a: string) {}
    }

    // NOTE: the `TestBed.configureTestingModule` is *not* needed here, since the TestBed
    // knows which NgModule was overridden and needs re-compilation.
    TestBed.overrideModule(ComponentDependenciesModule, {
      set: {providers: [{provide: A, useValue: 'Overridden A'}]},
    });

    const fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('Overridden A');
  });

  it('should allow overriding a template of a standalone component', () => {
    @Component({
      template: 'Original',
    })
    class MyStandaloneComp {}

    // NOTE: the `TestBed.configureTestingModule` call is *not* required here, since TestBed already
    // knows that the `MyStandaloneComp` should be overridden/recompiled.
    TestBed.overrideComponent(MyStandaloneComp, {set: {template: 'Overridden'}});

    const fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('Overridden');
  });

  it('should allow overriding the set of directives and pipes used in a standalone component', () => {
    @Directive({
      selector: '[dir]',
      host: {'[id]': 'id'},
    })
    class MyStandaloneDirectiveA {
      id = 'A';
    }

    @Directive({
      selector: '[dir]',
      host: {'[id]': 'id'},
    })
    class MyStandaloneDirectiveB {
      id = 'B';
    }

    @Pipe({name: 'pipe'})
    class MyStandalonePipeA {
      transform(value: string): string {
        return `transformed ${value} (A)`;
      }
    }
    @Pipe({name: 'pipe'})
    class MyStandalonePipeB {
      transform(value: string): string {
        return `transformed ${value} (B)`;
      }
    }

    @Component({
      template: '<div dir>{{ name | pipe }}</div>',
      imports: [MyStandalonePipeA, MyStandaloneDirectiveA],
    })
    class MyStandaloneComp {
      name = 'MyStandaloneComp';
    }

    // NOTE: the `TestBed.configureTestingModule` call is *not* required here, since TestBed
    // already knows that the `MyStandaloneComp` should be overridden/recompiled.
    TestBed.overrideComponent(MyStandaloneComp, {
      set: {imports: [MyStandalonePipeB, MyStandaloneDirectiveB]},
    });

    const fixture = TestBed.createComponent(MyStandaloneComp);
    fixture.detectChanges();

    const rootElement = fixture.nativeElement.firstChild;
    expect(rootElement.id).toBe('B');
    expect(rootElement.innerHTML).toBe('transformed MyStandaloneComp (B)');
  });

  it('should reflect overrides on imported standalone directive', () => {
    @Directive({
      selector: '[dir]',
      host: {'[id]': 'id'},
    })
    class DepStandaloneDirective {
      id = 'A';
    }

    @Component({
      selector: 'standalone-cmp',
      template: 'Original MyStandaloneComponent',
    })
    class DepStandaloneComponent {
      id = 'A';
    }

    @Component({
      template: '<standalone-cmp dir>Hello world!</standalone-cmp>',
      imports: [DepStandaloneDirective, DepStandaloneComponent],
    })
    class RootStandaloneComp {}

    // NOTE: the `TestBed.configureTestingModule` call is *not* required here, since TestBed
    // already knows which Components/Directives are overridden and should be recompiled.
    TestBed.overrideComponent(DepStandaloneComponent, {
      set: {template: 'Overridden MyStandaloneComponent'},
    });
    TestBed.overrideDirective(DepStandaloneDirective, {set: {host: {'[id]': "'Overridden'"}}});

    const fixture = TestBed.createComponent(RootStandaloneComp);
    fixture.detectChanges();

    const rootElement = fixture.nativeElement.firstChild;

    expect(rootElement.id).toBe('Overridden');
    expect(rootElement.innerHTML).toBe('Overridden MyStandaloneComponent');
  });

  it('should make overridden providers available in pipes', () => {
    const TOKEN_A = new InjectionToken('TOKEN_A');
    @Pipe({
      name: 'testPipe',
    })
    class TestPipe {
      constructor(@Inject(TOKEN_A) private token: string) {}

      transform(value: string): string {
        return `transformed ${value} using ${this.token} token`;
      }
    }
    @NgModule({
      imports: [TestPipe],
      exports: [TestPipe],
      providers: [{provide: TOKEN_A, useValue: 'A'}],
    })
    class TestNgModule {}

    @Component({
      selector: 'test-component',
      imports: [TestNgModule],
      template: `{{ 'original value' | testPipe }}`,
    })
    class TestComponent {}

    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
    TestBed.overrideProvider(TOKEN_A, {useValue: 'Overridden A'});

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const hostElement = fixture.nativeElement.firstChild;
    expect(hostElement.textContent).toBe('transformed original value using Overridden A token');
  });

  describe('NgModules as dependencies', () => {
    @Component({
      selector: 'test-cmp',
      template: '...',
      standalone: false,
    })
    class TestComponent {
      testField = 'default';
    }

    @Component({
      selector: 'test-cmp',
      template: '...',
      standalone: false,
    })
    class MockTestComponent {
      testField = 'overridden';
    }

    @NgModule({
      declarations: [TestComponent],
      exports: [TestComponent],
    })
    class TestModule {}

    @Component({
      selector: 'app-root',
      template: `<test-cmp #testCmpCtrl></test-cmp>`,
      imports: [TestModule],
    })
    class AppComponent {
      @ViewChild('testCmpCtrl', {static: true}) testCmpCtrl!: TestComponent;
    }

    it('should allow declarations and exports overrides on an imported NgModule', () => {
      // replace TestComponent with MockTestComponent
      TestBed.overrideModule(TestModule, {
        remove: {declarations: [TestComponent], exports: [TestComponent]},
        add: {declarations: [MockTestComponent], exports: [MockTestComponent]},
      });
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      const app = fixture.componentInstance;
      expect(app.testCmpCtrl.testField).toBe('overridden');
    });

    it('should allow removing an import via `overrideModule`', () => {
      const fooToken = new InjectionToken<string>('foo');

      @NgModule({
        providers: [{provide: fooToken, useValue: 'FOO'}],
      })
      class ImportedModule {}

      @NgModule({
        imports: [ImportedModule],
      })
      class ImportingModule {}

      TestBed.configureTestingModule({
        imports: [ImportingModule],
      });

      TestBed.overrideModule(ImportingModule, {
        remove: {
          imports: [ImportedModule],
        },
      });

      expect(TestBed.inject(fooToken, 'BAR')).toBe('BAR');

      // Emulate an end of a test.
      TestBed.resetTestingModule();

      // Emulate the start of a next test, make sure previous overrides
      // are not persisted across tests.
      TestBed.configureTestingModule({
        imports: [ImportingModule],
      });
      expect(TestBed.inject(fooToken, 'BAR')).toBe('FOO');
    });
  });
});

describe('TestBed', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
  });

  it('should compile and render a component', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  it('should not allow overrides of the `standalone` field', () => {
    @Component({
      selector: 'standalone-comp',
      template: '...',
    })
    class StandaloneComponent {}

    @Component({
      selector: 'non-standalone-comp',
      template: '...',
      standalone: false,
    })
    class NonStandaloneComponent {}

    @Directive()
    class StandaloneDirective {}

    @Directive({
      standalone: false,
    })
    class NonStandaloneDirective {}

    @Pipe({name: 'test'})
    class StandalonePipe {}

    @Pipe({
      name: 'test',
      standalone: false,
    })
    class NonStandalonePipe {}

    const getExpectedError = (typeName: string) =>
      `An override for the ${typeName} class has the \`standalone\` flag. ` +
      `Changing the \`standalone\` flag via TestBed overrides is not supported.`;

    const overrides = [
      {set: {standalone: false}},
      {add: {standalone: false}},
      {remove: {standalone: true}},
    ];

    const scenarios = [
      [TestBed.overrideComponent, StandaloneComponent, NonStandaloneComponent],
      [TestBed.overrideDirective, StandaloneDirective, NonStandaloneDirective],
      [TestBed.overridePipe, StandalonePipe, NonStandalonePipe],
    ];

    overrides.forEach((override) => {
      scenarios.forEach(([fn, standaloneType, nonStandaloneType]) => {
        expect(() => (fn as Function)(standaloneType, override)).toThrowError(
          getExpectedError(standaloneType.name),
        );
        expect(() => (fn as Function)(nonStandaloneType, override)).toThrowError(
          getExpectedError(nonStandaloneType.name),
        );
      });
    });
  });

  it('should give access to the component instance', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    expect(hello.componentInstance).toBeInstanceOf(HelloWorld);
  });

  it('should give the ability to query by css', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByCss = hello.debugElement.query(By.css('greeting-cmp'));
    expect(greetingByCss.nativeElement).toHaveText('Hello World!');
    expect(greetingByCss.componentInstance).toBeInstanceOf(GreetingCmp);
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
    expect(divElement.properties['id']).toEqual('one');
    expect(divElement.properties['title']).toEqual('some title');
  });

  it('should give the ability to access interpolated properties on a node', () => {
    const fixture = TestBed.createComponent(ComponentWithPropBindings);
    fixture.detectChanges();

    const paragraphEl = fixture.debugElement.query(By.css('p'));
    expect(paragraphEl.properties['title']).toEqual('( some label - some title )');
    expect(paragraphEl.properties['id']).toEqual('[ some label ] [ some title ]');
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
    expect(firstDivDebugEl.references['firstDiv'].tagName.toLowerCase()).toBe('div');
  });

  it('should give the ability to query by directive', () => {
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();

    const greetingByDirective = hello.debugElement.query(By.directive(GreetingCmp));
    expect(greetingByDirective.componentInstance).toBeInstanceOf(GreetingCmp);
  });

  it('should allow duplicate NgModule registrations with the same id', () => {
    const id = 'registered';
    @NgModule({id})
    class ModuleA {}

    expect(getNgModuleById(id)).toBe(ModuleA);

    // This would ordinarily error, if not in a test scenario.
    @NgModule({id})
    class ModuleB {}
    expect(getNgModuleById(id)).toBe(ModuleB);
  });

  it('allow to override a template', () => {
    // use original template when there is no override
    let hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');

    // override the template
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    TestBed.overrideComponent(GreetingCmp, {set: {template: `Bonjour {{ name }}`}});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Bonjour World!');

    // restore the original template by calling `.resetTestingModule()`
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [HelloWorldModule]});
    hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello World!');
  });

  // https://github.com/angular/angular/issues/42734
  it('should override a component which is declared in an NgModule which is imported as a `ModuleWithProviders`', () => {
    // This test verifies that an overridden component that is declared in an NgModule that has
    // been imported as a `ModuleWithProviders` continues to have access to the declaration scope
    // of the NgModule.
    TestBed.resetTestingModule();

    const moduleWithProviders: ModuleWithProviders<HelloWorldModule> = {ngModule: HelloWorldModule};
    TestBed.configureTestingModule({imports: [moduleWithProviders]});
    TestBed.overrideComponent(HelloWorld, {
      set: {template: 'Overridden <greeting-cmp></greeting-cmp>'},
    });

    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Overridden Hello World!');
  });

  it('should run `APP_INITIALIZER` before accessing `LOCALE_ID` provider', () => {
    let locale: string = '';
    @NgModule({
      providers: [
        {provide: APP_INITIALIZER, useValue: () => (locale = 'fr-FR'), multi: true},
        {provide: LOCALE_ID, useFactory: () => locale},
      ],
    })
    class TestModule {}

    TestBed.configureTestingModule({imports: [TestModule]});
    expect(TestBed.inject(LOCALE_ID)).toBe('fr-FR');
  });

  it('allow to override a provider', () => {
    TestBed.overrideProvider(NAME, {useValue: 'injected World!'});
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello injected World!');
  });

  it('uses the most recent provider override', () => {
    TestBed.overrideProvider(NAME, {useValue: 'injected World!'});
    TestBed.overrideProvider(NAME, {useValue: 'injected World a second time!'});
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello injected World a second time!');
  });

  it('overrides a providers in an array', () => {
    TestBed.configureTestingModule({
      imports: [HelloWorldModule],
      providers: [[{provide: NAME, useValue: 'injected World!'}]],
    });
    TestBed.overrideProvider(NAME, {useValue: 'injected World a second time!'});
    const hello = TestBed.createComponent(HelloWorld);
    hello.detectChanges();
    expect(hello.nativeElement).toHaveText('Hello injected World a second time!');
  });

  it('should not call ngOnDestroy for a service that was overridden', () => {
    SimpleService.ngOnDestroyCalls = 0;

    TestBed.overrideProvider(SimpleService, {useValue: {id: 2, ngOnDestroy: () => {}}});
    const fixture = TestBed.createComponent(CmpWithProviders);
    fixture.detectChanges();

    const service = TestBed.inject(SimpleService);
    expect(service.id).toBe(2);

    fixture.destroy();

    // verify that original `ngOnDestroy` was not called
    expect(SimpleService.ngOnDestroyCalls).toBe(0);
  });

  it('should be able to create a fixture if a test module is reset mid-compilation', async () => {
    const token = new InjectionToken<number>('value');

    @Component({
      template: 'hello {{_token}}',
      standalone: false,
    })
    class TestComponent {
      constructor(@Inject(token) public _token: number) {}
    }

    TestBed.resetTestingModule(); // Reset the state from `beforeEach`.

    function compile(tokenValue: number) {
      return TestBed.configureTestingModule({
        declarations: [TestComponent],
        providers: [{provide: token, useValue: tokenValue}],
        teardown: {destroyAfterEach: true},
      }).compileComponents();
    }

    const initialCompilation = compile(1);
    TestBed.resetTestingModule();
    await initialCompilation;
    await compile(2);
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('hello 2');
  });

  describe('module overrides using TestBed.overrideModule', () => {
    @Component({
      selector: 'test-cmp',
      template: '...',
      standalone: false,
    })
    class TestComponent {
      testField = 'default';
    }

    @NgModule({
      declarations: [TestComponent],
      exports: [TestComponent],
    })
    class TestModule {}

    @Component({
      selector: 'app-root',
      template: `<test-cmp #testCmpCtrl></test-cmp>`,
      standalone: false,
    })
    class AppComponent {
      @ViewChild('testCmpCtrl', {static: true}) testCmpCtrl!: TestComponent;
    }

    @NgModule({
      declarations: [AppComponent],
      imports: [TestModule],
    })
    class AppModule {}
    @Component({
      selector: 'test-cmp',
      template: '...',
      standalone: false,
    })
    class MockTestComponent {
      testField = 'overwritten';
    }

    it('should allow declarations override', () => {
      TestBed.configureTestingModule({
        imports: [AppModule],
      });
      // replace TestComponent with MockTestComponent
      TestBed.overrideModule(TestModule, {
        remove: {declarations: [TestComponent], exports: [TestComponent]},
        add: {declarations: [MockTestComponent], exports: [MockTestComponent]},
      });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app.testCmpCtrl.testField).toBe('overwritten');
    });
  });

  describe('nested module overrides using TestBed.overrideModule', () => {
    // Set up an NgModule hierarchy with two modules, A and B, each with their own component.
    // Module B additionally re-exports module A. Also declare two mock components which can be
    // used in tests to verify that overrides within this hierarchy are working correctly.

    // ModuleA content:

    @Component({
      selector: 'comp-a',
      template: 'comp-a content',
      standalone: false,
    })
    class CompA {}

    @Component({
      selector: 'comp-a',
      template: 'comp-a mock content',
      standalone: false,
    })
    class MockCompA {}

    @NgModule({
      declarations: [CompA],
      exports: [CompA],
    })
    class ModuleA {}

    // ModuleB content:

    @Component({
      selector: 'comp-b',
      template: 'comp-b content',
      standalone: false,
    })
    class CompB {}

    @Component({
      selector: 'comp-b',
      template: 'comp-b mock content',
      standalone: false,
    })
    class MockCompB {}

    @NgModule({
      imports: [ModuleA],
      declarations: [CompB],
      exports: [CompB, ModuleA],
    })
    class ModuleB {}

    // AppModule content:

    @Component({
      selector: 'app',
      template: `
        <comp-a></comp-a>
        <comp-b></comp-b>
      `,
      standalone: false,
    })
    class App {}

    @NgModule({
      imports: [ModuleB],
      exports: [ModuleB],
    })
    class AppModule {}

    it('should detect nested module override', () => {
      TestBed.configureTestingModule({
        declarations: [App],
        // AppModule -> ModuleB -> ModuleA (to be overridden)
        imports: [AppModule],
      }).overrideModule(ModuleA, {
        remove: {declarations: [CompA], exports: [CompA]},
        add: {declarations: [MockCompA], exports: [MockCompA]},
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      // CompA is overridden, expect mock content.
      expect(fixture.nativeElement.textContent).toContain('comp-a mock content');

      // CompB is not overridden, expect original content.
      expect(fixture.nativeElement.textContent).toContain('comp-b content');
    });

    it('should detect chained modules override', () => {
      TestBed.configureTestingModule({
        declarations: [App],
        // AppModule -> ModuleB (to be overridden) -> ModuleA (to be overridden)
        imports: [AppModule],
      })
        .overrideModule(ModuleA, {
          remove: {declarations: [CompA], exports: [CompA]},
          add: {declarations: [MockCompA], exports: [MockCompA]},
        })
        .overrideModule(ModuleB, {
          remove: {declarations: [CompB], exports: [CompB]},
          add: {declarations: [MockCompB], exports: [MockCompB]},
        });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      // Both CompA and CompB are overridden, expect mock content for both.
      expect(fixture.nativeElement.textContent).toContain('comp-a mock content');
      expect(fixture.nativeElement.textContent).toContain('comp-b mock content');
    });
  });

  describe('multi providers', () => {
    const multiToken = new InjectionToken<string[]>('multiToken');
    const singleToken = new InjectionToken<string>('singleToken');
    const multiTokenToOverrideAtModuleLevel = new InjectionToken<string[]>(
      'moduleLevelMultiOverride',
    );
    @NgModule({providers: [{provide: multiToken, useValue: 'valueFromModule', multi: true}]})
    class MyModule {}

    @NgModule({
      providers: [
        {provide: singleToken, useValue: 't1'},
        {
          provide: multiTokenToOverrideAtModuleLevel,
          useValue: 'multiTokenToOverrideAtModuleLevelOriginal',
          multi: true,
        },
        {provide: multiToken, useValue: 'valueFromModule2', multi: true},
        {provide: multiToken, useValue: 'secondValueFromModule2', multi: true},
      ],
    })
    class MyModule2 {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          MyModule,
          {
            ngModule: MyModule2,
            providers: [
              {provide: multiTokenToOverrideAtModuleLevel, useValue: 'override', multi: true},
            ],
          },
        ],
      });
    });

    it('is preserved when other provider is overridden', () => {
      TestBed.overrideProvider(singleToken, {useValue: ''});
      expect(TestBed.inject(multiToken).length).toEqual(3);
      expect(TestBed.inject(multiTokenToOverrideAtModuleLevel).length).toEqual(2);
      expect(TestBed.inject(multiTokenToOverrideAtModuleLevel)).toEqual([
        'multiTokenToOverrideAtModuleLevelOriginal',
        'override',
      ]);
    });

    it('overridden with an array', () => {
      const overrideValue = ['override'];
      TestBed.overrideProvider(multiToken, {useValue: overrideValue, multi: true});

      const value = TestBed.inject(multiToken);
      expect(value.length).toEqual(overrideValue.length);
      expect(value).toEqual(overrideValue);
    });

    it('overridden with a non-array', () => {
      // This is actually invalid because multi providers return arrays. We have this here so we can
      // ensure Ivy behaves the same as VE does currently.
      const overrideValue = 'override';
      TestBed.overrideProvider(multiToken, {useValue: overrideValue, multi: true});

      const value = TestBed.inject(multiToken);
      expect(value.length).toEqual(overrideValue.length);
      expect(value).toEqual(overrideValue as {} as string[]);
    });
  });

  describe('overrides providers in ModuleWithProviders', () => {
    const TOKEN = new InjectionToken<string[]>('token');
    @NgModule()
    class MyMod {
      static multi = false;

      static forRoot() {
        return {
          ngModule: MyMod,
          providers: [{provide: TOKEN, multi: MyMod.multi, useValue: 'forRootValue'}],
        };
      }
    }

    beforeEach(() => (MyMod.multi = true));

    it('when provider is a "regular" provider', () => {
      MyMod.multi = false;
      @NgModule({imports: [MyMod.forRoot()]})
      class MyMod2 {}
      TestBed.configureTestingModule({imports: [MyMod2]});
      TestBed.overrideProvider(TOKEN, {useValue: ['override']});
      expect(TestBed.inject(TOKEN)).toEqual(['override']);
    });

    it('when provider is multi', () => {
      @NgModule({imports: [MyMod.forRoot()]})
      class MyMod2 {}
      TestBed.configureTestingModule({imports: [MyMod2]});
      TestBed.overrideProvider(TOKEN, {useValue: ['override']});
      expect(TestBed.inject(TOKEN)).toEqual(['override']);
    });

    it('restores the original value', () => {
      @NgModule({imports: [MyMod.forRoot()]})
      class MyMod2 {}
      TestBed.configureTestingModule({imports: [MyMod2]});
      TestBed.overrideProvider(TOKEN, {useValue: ['override']});
      expect(TestBed.inject(TOKEN)).toEqual(['override']);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({imports: [MyMod2]});
      expect(TestBed.inject(TOKEN)).toEqual(['forRootValue']);
    });
  });

  describe('bindings', () => {
    it('should be able to bind to inputs', () => {
      @Component({template: ''})
      class TestComp {
        @Input() value = 0;
      }

      const value = signal(1);
      const fixture = TestBed.createComponent(TestComp, {
        bindings: [inputBinding('value', value)],
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(1);

      value.set(2);
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(2);
    });

    it('should be able to bind to outputs', () => {
      let count = 0;

      @Component({template: '<button (click)="event.emit()">Click me</button>'})
      class TestComp {
        @Output() event = new EventEmitter<void>();
      }

      const fixture = TestBed.createComponent(TestComp, {
        bindings: [outputBinding('event', () => count++)],
      });
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(count).toBe(0);

      button.click();
      fixture.detectChanges();
      expect(count).toBe(1);
    });

    it('should be able to bind two-way bindings', () => {
      @Component({template: 'Value: {{value}}'})
      class TestComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const fixture = TestBed.createComponent(TestComp, {
        bindings: [twoWayBinding('value', value)],
      });
      fixture.detectChanges();
      expect(value()).toBe('initial');
      expect(fixture.nativeElement.textContent).toBe('Value: initial');

      value.set('1');
      fixture.detectChanges();
      expect(value()).toBe('1');
      expect(fixture.nativeElement.textContent).toBe('Value: 1');

      fixture.componentInstance.value = '2';
      fixture.componentInstance.valueChange.emit('2');
      fixture.detectChanges();
      expect(value()).toBe('2');
      expect(fixture.nativeElement.textContent).toBe('Value: 2');
    });
  });

  it('should allow overriding a provider defined via ModuleWithProviders (using TestBed.overrideProvider)', () => {
    const serviceOverride = {
      get() {
        return 'override';
      },
    };

    @Injectable({providedIn: 'root'})
    class MyService {
      get() {
        return 'original';
      }
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

    const service = TestBed.inject(MyService);
    expect(service.get()).toEqual('override');
  });

  it('should handle overrides for a provider that has `ChangeDetectorRef` as a dependency', () => {
    @Injectable({providedIn: 'root'})
    class MyService {
      token = 'original';
      constructor(public cdr: ChangeDetectorRef) {}
    }

    TestBed.configureTestingModule({});
    TestBed.overrideProvider(MyService, {useValue: {token: 'override'}});

    const service = TestBed.inject(MyService);
    expect(service.token).toBe('override');
  });

  it('should allow overriding a provider defined via ModuleWithProviders (using TestBed.configureTestingModule)', () => {
    const serviceOverride = {
      get() {
        return 'override';
      },
    };

    @Injectable({providedIn: 'root'})
    class MyService {
      get() {
        return 'original';
      }
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

    const service = TestBed.inject(MyService);
    expect(service.get()).toEqual('override');
  });

  it('should allowing overriding a module with a cyclic structure in its metadata', () => {
    class Cyclic {
      cycle = this;

      constructor(public name: string) {}
    }

    const CYCLES = new InjectionToken<Cyclic[]>('cycles', {factory: () => []});

    @NgModule({
      providers: [
        {provide: CYCLES, useValue: new Cyclic('a'), multi: true},
        {provide: CYCLES, useValue: new Cyclic('b'), multi: true},
      ],
    })
    class TestModule {}

    TestBed.configureTestingModule({
      imports: [TestModule],
    }).overrideModule(TestModule, {
      remove: {
        providers: [
          // Removing the cycle named "a" should result in removing the provider for "a".
          // Note: although this removes a different instance than the one provided, metadata
          // overrides compare objects by value, not by reference.
          {provide: CYCLES, useValue: new Cyclic('a'), multi: true},

          // Also attempt to remove a cycle named "B" (which does not exist) to verify that
          // objects are correctly compared by value.
          {provide: CYCLES, useValue: new Cyclic('B'), multi: true},
        ],
      },
      add: {
        providers: [{provide: CYCLES, useValue: new Cyclic('c'), multi: true}],
      },
    });

    const values = TestBed.inject(CYCLES);
    expect(values.map((v) => v.name)).toEqual(['b', 'c']);
  });

  it('overrides injectable that is using providedIn: AModule', () => {
    @NgModule()
    class ServiceModule {}
    @Injectable({providedIn: ServiceModule})
    class Service {}

    const fake = 'fake';
    TestBed.overrideProvider(Service, {useValue: fake});
    // Create an injector whose source is the ServiceModule, not DynamicTestModule.
    const ngModuleFactory = TestBed.inject(Compiler).compileModuleSync(ServiceModule);
    const injector = ngModuleFactory.create(TestBed.inject(Injector)).injector;

    const service = injector.get(Service);
    expect(service).toBe(fake);
  });

  it('allow to override multi provider', () => {
    const MY_TOKEN = new InjectionToken('MyProvider');
    class MyProvider {}

    @Component({
      selector: 'my-comp',
      template: ``,
      standalone: false,
    })
    class MyComp {
      constructor(@Inject(MY_TOKEN) public myProviders: MyProvider[]) {}
    }

    TestBed.configureTestingModule({
      declarations: [MyComp],
      providers: [{provide: MY_TOKEN, useValue: {value: 'old provider'}, multi: true}],
    });

    const multiOverride = {useValue: [{value: 'new provider'}], multi: true};
    TestBed.overrideProvider(MY_TOKEN, multiOverride);

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.myProviders).toEqual([{value: 'new provider'}]);
  });

  it('should resolve components that are extended by other components', () => {
    // SimpleApp uses SimpleCmp in its template, which is extended by InheritedCmp
    const simpleApp = TestBed.createComponent(SimpleApp);
    simpleApp.detectChanges();
    expect(simpleApp.nativeElement).toHaveText('simple - inherited');
  });

  it('should not trigger change detection for ComponentA while calling TestBed.createComponent for ComponentB', () => {
    const log: string[] = [];
    @Component({
      selector: 'comp-a',
      template: '...',
      standalone: false,
    })
    class CompA {
      @Input() inputA: string = '';
      ngOnInit() {
        log.push('CompA:ngOnInit', this.inputA);
      }
    }

    @Component({
      selector: 'comp-b',
      template: '...',
      standalone: false,
    })
    class CompB {
      @Input() inputB: string = '';
      ngOnInit() {
        log.push('CompB:ngOnInit', this.inputB);
      }
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
    TestBed.configureTestingModule({
      declarations: [ComponentWithInlineTemplate],
    })
      .compileComponents()
      .then(done)
      .catch((error) => {
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
    class ProvidesErrorHandler {}

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [ProvidesErrorHandler, HelloWorldModule]});

    expect(TestBed.inject(ErrorHandler)).toEqual(jasmine.any(CustomErrorHandler));
  });

  it('should throw errors in CD', () => {
    @Component({
      selector: 'my-comp',
      template: '',
      standalone: false,
    })
    class MyComp {
      name!: {hello: string};

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
    @Component({
      selector: 'my-comp',
      template: '<button (click)="onClick()">Click me</button>',
      standalone: false,
    })
    class MyComp {
      name!: {hello: string};

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

  it('should allow both the declaration and import of a component into the testing module', () => {
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
      standalone: false,
    })
    class Inner {}

    @Component({
      selector: 'outer',
      template: '<inner></inner>',
      standalone: false,
    })
    class Outer {}

    @NgModule({
      declarations: [Inner, Outer],
    })
    class Module {}

    @Component({
      template: '<outer></outer>',
      selector: 'fixture',
      standalone: false,
    })
    class Fixture {}

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

  describe('checking types before compiling them', () => {
    @Directive({
      selector: 'my-dir',
      standalone: false,
    })
    class MyDir {}

    @NgModule()
    class MyModule {}

    // [decorator, type, overrideFn]
    const cases: [string, Type<any>, string][] = [
      ['Component', MyDir, 'overrideComponent'],
      ['NgModule', MyDir, 'overrideModule'],
      ['Pipe', MyModule, 'overridePipe'],
      ['Directive', MyModule, 'overrideDirective'],
    ];
    cases.forEach(([decorator, type, overrideFn]) => {
      it(`should throw an error in case invalid type is used in ${overrideFn} function`, () => {
        TestBed.configureTestingModule({declarations: [MyDir]});
        expect(() => {
          (TestBed as any)[overrideFn](type, {});
          TestBed.createComponent(type);
        }).toThrowError(new RegExp(`class doesn't have @${decorator} decorator`, 'g'));
      });
    });
  });

  describe('defer blocks', () => {
    /**
     * Function returns a class that represents AOT-compiled version of the following Component:
     *
     * @Component({
     *       *  imports: [...],
     *  selector: '...',
     *  template: '...',
     * })
     * class ComponentClass {}
     *
     * This is needed to closer match the behavior of AOT pre-compiled components (compiled
     * outside of TestBed) for cases when defer blocks are used.
     */
    const getAOTCompiledComponent = (
      selector: string,
      dependencies: Array<Type<unknown>> = [],
      deferrableDependencies: Array<Type<unknown>> = [],
    ) => {
      class ComponentClass {
        static ɵfac = () => new ComponentClass();
        static ɵcmp = defineComponent({
          type: ComponentClass,
          selectors: [[selector]],
          decls: 2,
          vars: 0,
          dependencies,
          consts: [['dir']],
          template: (rf: any, ctx: any) => {
            if (rf & 1) {
              elementStart(0, 'div', 0);
              text(1, `${selector} cmp!`);
              elementEnd();
            }
          },
        });
      }
      setClassMetadataAsync(
        ComponentClass,
        function () {
          const promises: Array<Promise<Type<unknown>>> = deferrableDependencies.map(
            // Emulates a dynamic import, e.g. `import('./cmp-a').then(m => m.CmpA)`
            (dep) => new Promise((resolve) => setTimeout(() => resolve(dep))),
          );
          return promises;
        },
        function (...deferrableSymbols) {
          setClassMetadata(
            ComponentClass,
            [
              {
                type: Component,
                args: [
                  {
                    selector,
                    imports: [...dependencies, ...deferrableSymbols],
                    template: `<div>root cmp!</div>`,
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
      return ComponentClass;
    };

    it('should handle async metadata on root and nested components', async () => {
      @Component({
        selector: 'cmp-a',
        template: 'CmpA!',
      })
      class CmpA {}

      const NestedAotComponent = getAOTCompiledComponent('nested-cmp', [], [CmpA]);
      const RootAotComponent = getAOTCompiledComponent('root', [], [NestedAotComponent]);

      TestBed.configureTestingModule({imports: [RootAotComponent]});

      TestBed.overrideComponent(RootAotComponent, {
        set: {template: `Override of a root template! <nested-cmp />`},
      });
      TestBed.overrideComponent(NestedAotComponent, {
        set: {template: `Override of a nested template! <cmp-a />`},
      });

      // This is only required because the components are AOT compiled and thus include setClassMetadataAsync
      await TestBed.compileComponents();

      const fixture = TestBed.createComponent(RootAotComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe(
        'Override of a root template! Override of a nested template! CmpA!',
      );
    });

    it('should override providers on dependencies of dynamically loaded components', async () => {
      function timer(delay: number): Promise<void> {
        return new Promise<void>((resolve) => {
          setTimeout(() => resolve(), delay);
        });
      }

      @Injectable({providedIn: 'root'})
      class ImportantService {
        value = 'original';
      }

      @NgModule({
        providers: [ImportantService],
      })
      class ThisModuleProvidesService {}

      @Component({
        selector: 'child',
        imports: [ThisModuleProvidesService],
        template: '<h1>{{value}}</h1>',
      })
      class ChildCmp {
        service = inject(ImportantService);
        value = this.service.value;
      }

      @Component({
        selector: 'parent',
        imports: [ChildCmp],
        template: `
          @defer (when true) {
            <child />
          }
        `,
      })
      class ParentCmp {}

      const deferrableDependencies = [ChildCmp];
      setClassMetadataAsync(
        ParentCmp,
        function () {
          const promises: Array<Promise<Type<unknown>>> = deferrableDependencies.map(
            // Emulates a dynamic import, e.g. `import('./cmp-a').then(m => m.CmpA)`
            (dep) => new Promise((resolve) => setTimeout(() => resolve(dep))),
          );
          return promises;
        },
        function (...deferrableSymbols) {
          setClassMetadata(
            ParentCmp,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'parent',
                    imports: [...deferrableSymbols],
                    template: `<div>root cmp!</div>`,
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );

      // Set `PLATFORM_ID` to a browser platform value to trigger defer loading
      // while running tests in Node.
      const COMMON_PROVIDERS = [{provide: PLATFORM_ID, useValue: ɵPLATFORM_BROWSER_ID}];

      TestBed.configureTestingModule({imports: [ParentCmp], providers: [COMMON_PROVIDERS]});
      TestBed.overrideProvider(ImportantService, {useValue: {value: 'overridden'}});

      // This is only required because the component has setClassMetadataAsync
      await TestBed.compileComponents();

      const fixture = TestBed.createComponent(ParentCmp);
      fixture.detectChanges();

      await timer(10);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('overridden');
    });

    it('should allow import overrides on components with async metadata', async () => {
      const NestedAotComponent = getAOTCompiledComponent('nested-cmp', [], []);
      const RootAotComponent = getAOTCompiledComponent('root', [], []);

      TestBed.configureTestingModule({imports: [RootAotComponent]});

      TestBed.overrideComponent(RootAotComponent, {
        set: {
          // Adding an import that was not present originally
          imports: [NestedAotComponent],
          template: `Override of a root template! <nested-cmp />`,
        },
      });

      // This is only required because the components are AOT compiled and thus include setClassMetadataAsync
      await TestBed.compileComponents();

      const fixture = TestBed.createComponent(RootAotComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe(
        'Override of a root template! nested-cmp cmp!',
      );
    });
  });

  describe('AOT pre-compiled components', () => {
    /**
     * Function returns a class that represents AOT-compiled version of the following Component:
     *
     * @Component({
     *  standalone: true|false,
     *  imports: [...],  // for standalone only
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
    const getAOTCompiledComponent = (standalone: boolean = false, dependencies: any[] = []) => {
      class ComponentClass {
        static ɵfac = () => new ComponentClass();
        static ɵcmp = defineComponent({
          standalone,
          type: ComponentClass,
          selectors: [['comp']],
          decls: 2,
          vars: 0,
          dependencies,
          consts: [['dir']],
          template: (rf: any, ctx: any) => {
            if (rf & 1) {
              elementStart(0, 'div', 0);
              text(1, 'Some template');
              elementEnd();
            }
          },
          styles: ['body { margin: 0; }'],
        });
      }
      setClassMetadata(
        ComponentClass,
        [
          {
            type: Component,
            args: [
              {
                standalone,
                imports: dependencies,
                selector: 'comp',
                templateUrl: './template.ng.html',
                styleUrls: ['./style.css'],
              },
            ],
          },
        ],
        null,
        null,
      );
      return ComponentClass;
    };

    it('should allow to override a provider used in a dependency of a standalone component', () => {
      const A = new InjectionToken('A');

      @Directive({
        selector: '[dir]',
        providers: [{provide: A, useValue: 'A'}],
        standalone: false,
      })
      class SomeDir {
        constructor(
          @Inject(A) private tokenA: string,
          private elementRef: ElementRef,
        ) {}

        ngAfterViewInit() {
          this.elementRef.nativeElement.innerHTML = this.tokenA;
        }
      }

      const SomeComponent = getAOTCompiledComponent(true, [SomeDir]);
      TestBed.configureTestingModule({imports: [SomeComponent]});
      TestBed.overrideProvider(A, {useValue: 'Overridden A'});
      const fixture = TestBed.createComponent(SomeComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Overridden A');
    });

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
        static ɵmod = defineNgModule({
          type: ModuleClass,
          declarations: [SomeComponent],
        });
      }

      @Component({
        template: '<comp></comp>',
        selector: 'fixture',
        standalone: false,
      })
      class TestFixture {}

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
      expect(fixture.nativeElement.innerHTML).toMatch(
        /<comp[^>]*><div[^>]*>Some template<\/div><\/comp>/,
      );
    });
  });

  describe('resetting ng defs', () => {
    it('should restore ng defs to their initial states', () => {
      @Pipe({
        name: 'somePipe',
        pure: true,
        standalone: false,
      })
      class SomePipe {
        transform(value: string): string {
          return `transformed ${value}`;
        }
      }

      @Directive({
        selector: 'someDirective',
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

      @NgModule({declarations: [SomeComponent]})
      class SomeModule {}

      TestBed.configureTestingModule({imports: [SomeModule]});

      // adding Pipe and Directive via metadata override
      TestBed.overrideModule(SomeModule, {
        set: {declarations: [SomeComponent, SomePipe, SomeDirective]},
      });
      TestBed.overrideComponent(SomeComponent, {
        set: {template: `<span someDirective>{{'hello' | somePipe}}</span>`},
      });
      TestBed.createComponent(SomeComponent);

      const cmpDefBeforeReset = (SomeComponent as any).ɵcmp;
      expect(cmpDefBeforeReset.pipeDefs().length).toEqual(1);
      expect(cmpDefBeforeReset.directiveDefs().length).toEqual(2); // directive + component

      const scopeBeforeReset = depsTracker.getNgModuleScope(SomeModule as NgModuleType);
      expect(scopeBeforeReset.compilation.pipes.size).toEqual(1);
      expect(scopeBeforeReset.compilation.directives.size).toEqual(2);

      TestBed.resetTestingModule();

      const cmpDefAfterReset = (SomeComponent as any).ɵcmp;
      expect(cmpDefAfterReset.pipeDefs).toBe(null);
      expect(cmpDefAfterReset.directiveDefs).toBe(null);

      const scopeAfterReset = depsTracker.getNgModuleScope(SomeModule as NgModuleType);

      expect(scopeAfterReset).toEqual({
        compilation: {
          pipes: new Set(),
          directives: new Set([SomeComponent]),
        },
        exported: {
          pipes: new Set(),
          directives: new Set(),
        },
      });
    });

    it('should cleanup ng defs for classes with no ng annotations (in case of inheritance)', () => {
      @Component({
        selector: 'someDirective',
        template: '...',
        standalone: false,
      })
      class SomeComponent {}

      class ComponentWithNoAnnotations extends SomeComponent {}

      @Directive({
        selector: 'some-directive',
        standalone: false,
      })
      class SomeDirective {}

      class DirectiveWithNoAnnotations extends SomeDirective {}

      @Pipe({
        name: 'some-pipe',
        standalone: false,
      })
      class SomePipe {}

      class PipeWithNoAnnotations extends SomePipe {}

      TestBed.configureTestingModule({
        declarations: [
          ComponentWithNoAnnotations,
          DirectiveWithNoAnnotations,
          PipeWithNoAnnotations,
        ],
      });
      TestBed.createComponent(ComponentWithNoAnnotations);

      expect(ComponentWithNoAnnotations.hasOwnProperty('ɵcmp')).toBeTruthy();
      expect(SomeComponent.hasOwnProperty('ɵcmp')).toBeTruthy();

      expect(DirectiveWithNoAnnotations.hasOwnProperty('ɵdir')).toBeTruthy();
      expect(SomeDirective.hasOwnProperty('ɵdir')).toBeTruthy();

      expect(PipeWithNoAnnotations.hasOwnProperty('ɵpipe')).toBeTruthy();
      expect(SomePipe.hasOwnProperty('ɵpipe')).toBeTruthy();

      TestBed.resetTestingModule();

      // ng defs should be removed from classes with no annotations
      expect(ComponentWithNoAnnotations.hasOwnProperty('ɵcmp')).toBeFalsy();
      expect(DirectiveWithNoAnnotations.hasOwnProperty('ɵdir')).toBeFalsy();
      expect(PipeWithNoAnnotations.hasOwnProperty('ɵpipe')).toBeFalsy();

      // ng defs should be preserved on super types
      expect(SomeComponent.hasOwnProperty('ɵcmp')).toBeTruthy();
      expect(SomeDirective.hasOwnProperty('ɵdir')).toBeTruthy();
      expect(SomePipe.hasOwnProperty('ɵpipe')).toBeTruthy();
    });

    it('should cleanup scopes (configured via `TestBed.configureTestingModule`) between tests', () => {
      @Component({
        selector: 'child',
        template: 'Child comp',
        standalone: false,
      })
      class ChildCmp {}

      @Component({
        selector: 'root',
        template: '<child></child>',
        standalone: false,
      })
      class RootCmp {}

      // Case #1: `RootCmp` and `ChildCmp` are both included in the `declarations` field of
      // the testing module, so `ChildCmp` is in the scope of `RootCmp`.
      TestBed.configureTestingModule({
        declarations: [RootCmp, ChildCmp],
      });

      let fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      let childCmpInstance = fixture.debugElement.query(By.directive(ChildCmp));
      expect(childCmpInstance.componentInstance).toBeInstanceOf(ChildCmp);
      expect(fixture.nativeElement.textContent).toBe('Child comp');

      TestBed.resetTestingModule();

      const spy = spyOn(console, 'error');

      // Case #2: the `TestBed.configureTestingModule` was not invoked, thus the `ChildCmp`
      // should not be available in the `RootCmp` scope and no child content should be
      // rendered.
      fixture = TestBed.createComponent(RootCmp);
      // also an error should be logged to the user informing them that
      // the child component is not part of the module
      expect(spy).toHaveBeenCalledTimes(1);
      fixture.detectChanges();

      childCmpInstance = fixture.debugElement.query(By.directive(ChildCmp));
      expect(childCmpInstance).toBeNull();
      expect(fixture.nativeElement.textContent).toBe('');

      TestBed.resetTestingModule();

      // Case #3: `ChildCmp` is included in the `declarations` field, but `RootCmp` is not,
      // so `ChildCmp` is NOT in the scope of `RootCmp` component.
      TestBed.configureTestingModule({
        declarations: [ChildCmp],
      });

      fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      childCmpInstance = fixture.debugElement.query(By.directive(ChildCmp));
      expect(childCmpInstance).toBeNull();
      expect(fixture.nativeElement.textContent).toBe('');
    });

    it('should clean up overridden providers for modules that are imported more than once', () => {
      @Injectable()
      class Token {
        name: string = 'real';
      }

      @NgModule({
        providers: [Token],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module, Module]});
      TestBed.overrideProvider(Token, {useValue: {name: 'fake'}});

      expect(TestBed.inject(Token).name).toEqual('fake');

      TestBed.resetTestingModule();

      // The providers for the module should have been restored to the original array, with
      // no trace of the overridden providers.
      expect((Module as any).ɵinj.providers).toEqual([Token]);
    });

    it('should clean up overridden providers on components whose modules are compiled more than once', async () => {
      @Injectable()
      class SomeInjectable {
        id: string | undefined;
      }

      @Component({
        providers: [SomeInjectable],
        standalone: false,
      })
      class ComponentWithProvider {
        constructor(readonly injectable: SomeInjectable) {}
      }

      @NgModule({declarations: [ComponentWithProvider]})
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});
      const originalResolver = (ComponentWithProvider as any).ɵcmp.providersResolver;
      TestBed.overrideProvider(SomeInjectable, {useValue: {id: 'fake'}});

      const compiler = TestBed.inject(Compiler);
      await compiler.compileModuleAsync(MyModule);
      compiler.compileModuleSync(MyModule);

      TestBed.resetTestingModule();
      expect((ComponentWithProvider as any).ɵcmp.providersResolver).toEqual(originalResolver);
    });
  });

  describe('overrides provider', () => {
    it('with empty provider object', () => {
      @Injectable()
      class Service {}
      TestBed.overrideProvider(Service, {});
      // Should be able to get a Service instance because it has no dependencies that can't be
      // resolved
      expect(TestBed.inject(Service)).toBeDefined();
    });
  });

  it('should handle provider overrides when module imports are provided as a function', () => {
    class InjectedString {
      value?: string;
    }

    @Component({
      template: '{{injectedString.value}}',
      standalone: false,
    })
    class AppComponent {
      constructor(public injectedString: InjectedString) {}
    }

    @NgModule({})
    class DependencyModule {}

    // We need to write the compiler output manually here,
    // because it depends on code generated by ngcc.
    class TestingModule {
      static ɵmod = defineNgModule({type: TestingModule});
      static ɵinj = defineInjector({imports: [DependencyModule]});
    }
    setNgModuleScope(TestingModule, {imports: () => [DependencyModule]});

    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [AppComponent],
      providers: [{provide: InjectedString, useValue: {value: 'initial'}}],
    });

    TestBed.overrideProvider(InjectedString, {useValue: {value: 'changed'}});

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture!.nativeElement.textContent).toContain('changed');
  });

  describe('TestBed.inject', () => {
    describe('injection flags', () => {
      it('should be able to optionally inject a token', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');
        expect(TestBed.inject(TOKEN, undefined, {optional: true})).toBeNull();
        expect(TestBed.inject(TOKEN, undefined, {optional: true})).toBeNull();
      });

      it('should include `null` into the result type when the optional flag is used', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        const flags: InjectOptions = {optional: true};
        let result = TestBed.inject(TOKEN, undefined, flags);
        expect(result).toBe(null);

        // Verify that `null` can be a valid value (from typing standpoint),
        // the line below would fail a type check in case the result doesn't
        // have `null` in the type.
        result = null;
      });

      it('should be able to use skipSelf injection', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');
        TestBed.configureTestingModule({
          providers: [{provide: TOKEN, useValue: 'from TestBed'}],
        });

        expect(TestBed.inject(TOKEN)).toBe('from TestBed');
        expect(TestBed.inject(TOKEN, undefined, {skipSelf: true, optional: true})).toBeNull();
      });
    });
  });

  it('should be able to call Testbed.runInInjectionContext in tests', () => {
    const expectedValue = 'testValue';
    @Injectable({providedIn: 'root'})
    class SomeInjectable {
      readonly instanceValue = expectedValue;
    }

    function functionThatUsesInject(): string {
      return inject(SomeInjectable).instanceValue;
    }

    expect(TestBed.runInInjectionContext(functionThatUsesInject)).toEqual(expectedValue);
  });

  describe('TestBed.tick', () => {
    @Component({
      template: '{{state()}}',
    })
    class Thing1 {
      state = signal(1);
    }

    describe('with zone change detection', () => {
      it('should update fixtures with autoDetect', () => {
        TestBed.configureTestingModule({
          providers: [{provide: ComponentFixtureAutoDetect, useValue: true}],
        });
        const {nativeElement, componentInstance} = TestBed.createComponent(Thing1);
        expect(nativeElement.textContent).toBe('1');

        componentInstance.state.set(2);
        TestBed.tick();
        expect(nativeElement.textContent).toBe('2');
      });

      it('should update fixtures without autoDetect', () => {
        const {nativeElement, componentInstance} = TestBed.createComponent(Thing1);
        expect(nativeElement.textContent).toBe(''); // change detection didn't run yet

        componentInstance.state.set(2);
        TestBed.tick();
        expect(nativeElement.textContent).toBe('2');
      });
    });

    describe('with zoneless change detection', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection()],
        });
      });

      it('should update fixtures with zoneless', async () => {
        const fixture = TestBed.createComponent(Thing1);
        await fixture.whenStable();

        const {nativeElement, componentInstance} = fixture;
        expect(nativeElement.textContent).toBe('1');

        componentInstance.state.set(2);
        TestBed.tick();
        expect(nativeElement.textContent).toBe('2');
      });
    });
  });
});

describe('TestBed defer block behavior', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should default defer block behavior to playthrough', () => {
    expect(TestBedImpl.INSTANCE.getDeferBlockBehavior()).toBe(DeferBlockBehavior.Playthrough);
  });

  it('should be able to configure defer block behavior', () => {
    TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
    expect(TestBedImpl.INSTANCE.getDeferBlockBehavior()).toBe(DeferBlockBehavior.Manual);
  });

  it('should reset the defer block behavior back to the default when TestBed is reset', () => {
    TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
    expect(TestBedImpl.INSTANCE.getDeferBlockBehavior()).toBe(DeferBlockBehavior.Manual);
    TestBed.resetTestingModule();
    expect(TestBedImpl.INSTANCE.getDeferBlockBehavior()).toBe(DeferBlockBehavior.Playthrough);
  });
});

describe('TestBed module teardown', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should tear down the test module by default', () => {
    expect(TestBedImpl.INSTANCE.shouldTearDownTestingModule()).toBe(true);
  });

  it('should be able to configure the teardown behavior', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: false}});
    expect(TestBedImpl.INSTANCE.shouldTearDownTestingModule()).toBe(false);
  });

  it('should reset the teardown behavior back to the default when TestBed is reset', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: false}});
    expect(TestBedImpl.INSTANCE.shouldTearDownTestingModule()).toBe(false);
    TestBed.resetTestingModule();
    expect(TestBedImpl.INSTANCE.shouldTearDownTestingModule()).toBe(true);
  });

  it('should destroy test module providers when test module teardown is enabled', () => {
    SimpleService.ngOnDestroyCalls = 0;
    TestBed.configureTestingModule({
      providers: [SimpleService],
      declarations: [GreetingCmp],
      teardown: {destroyAfterEach: true},
    });
    TestBed.createComponent(GreetingCmp);

    expect(SimpleService.ngOnDestroyCalls).toBe(0);
    TestBed.resetTestingModule();
    expect(SimpleService.ngOnDestroyCalls).toBe(1);
  });

  it('should not error on mocked and partially-implemented `DOCUMENT`', () => {
    SimpleService.ngOnDestroyCalls = 0;
    TestBed.configureTestingModule({
      providers: [SimpleService, {provide: DOCUMENT, useValue: {}}],
      teardown: {destroyAfterEach: true},
    });
    TestBed.inject(SimpleService);

    expect(SimpleService.ngOnDestroyCalls).toBe(0);
    TestBed.resetTestingModule();
    expect(SimpleService.ngOnDestroyCalls).toBe(1);
  });

  it('should remove the fixture root element from the DOM when module teardown is enabled', () => {
    TestBed.configureTestingModule({
      declarations: [SimpleCmp],
      teardown: {destroyAfterEach: true},
    });
    const fixture = TestBed.createComponent(SimpleCmp);
    const fixtureDocument = fixture.nativeElement.ownerDocument;

    expect(fixtureDocument.body.contains(fixture.nativeElement)).toBe(true);
    TestBed.resetTestingModule();
    expect(fixtureDocument.body.contains(fixture.nativeElement)).toBe(false);
  });

  it('should re-throw errors that were thrown during fixture cleanup', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class ThrowsOnDestroy {
      ngOnDestroy() {
        throw Error('oh no');
      }
    }

    TestBed.configureTestingModule({
      declarations: [ThrowsOnDestroy],
      teardown: {destroyAfterEach: true},
    });
    TestBed.createComponent(ThrowsOnDestroy);

    const spy = spyOn(console, 'error');
    expect(() => TestBed.resetTestingModule()).toThrowError(
      '1 component threw errors during cleanup',
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not interrupt fixture destruction if an error is thrown', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class ThrowsOnDestroy {
      ngOnDestroy() {
        throw Error('oh no');
      }
    }

    TestBed.configureTestingModule({
      declarations: [ThrowsOnDestroy],
      teardown: {destroyAfterEach: true},
    });

    for (let i = 0; i < 3; i++) {
      TestBed.createComponent(ThrowsOnDestroy);
    }

    const spy = spyOn(console, 'error');
    expect(() => TestBed.resetTestingModule()).toThrowError(
      '3 components threw errors during cleanup',
    );
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should re-throw errors that were thrown during module teardown by default', () => {
    @Injectable()
    class ThrowsOnDestroy {
      ngOnDestroy() {
        throw Error('oh no');
      }
    }

    @Component({
      template: '',
      standalone: false,
    })
    class App {
      constructor(_service: ThrowsOnDestroy) {}
    }

    TestBed.configureTestingModule({
      providers: [ThrowsOnDestroy],
      declarations: [App],
      teardown: {destroyAfterEach: true},
    });
    TestBed.createComponent(App);

    expect(() => TestBed.resetTestingModule()).toThrowError('oh no');
  });

  it('should be able to opt out of rethrowing of errors coming from module teardown', () => {
    @Injectable()
    class ThrowsOnDestroy {
      ngOnDestroy() {
        throw Error('oh no');
      }
    }

    @Component({
      template: '',
      standalone: false,
    })
    class App {
      constructor(_service: ThrowsOnDestroy) {}
    }

    TestBed.configureTestingModule({
      providers: [ThrowsOnDestroy],
      declarations: [App],
      teardown: {destroyAfterEach: true, rethrowErrors: false},
    });
    TestBed.createComponent(App);

    const spy = spyOn(console, 'error');
    expect(() => TestBed.resetTestingModule()).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should remove the styles associated with a test component when the test module is torn down', () => {
    @Component({
      template: '<span>Hello</span>',
      styles: [`span {color: hotpink;}`],
      standalone: false,
    })
    class StyledComp1 {}

    @Component({
      template: '<div>Hello</div>',
      styles: [`div {color: red;}`],
      standalone: false,
    })
    class StyledComp2 {}

    TestBed.configureTestingModule({
      declarations: [StyledComp1, StyledComp2],
      teardown: {destroyAfterEach: true},
    });

    const fixtures = [TestBed.createComponent(StyledComp1), TestBed.createComponent(StyledComp2)];
    const fixtureDocument = fixtures[0].nativeElement.ownerDocument;
    const styleCountBefore = fixtureDocument.querySelectorAll('style').length;

    // Note that we can only assert that the behavior works as expected by checking that the
    // number of stylesheets has decreased. We can't expect that they'll be zero, because there
    // may by stylesheets leaking in from other tests that don't use the module teardown
    // behavior.
    expect(styleCountBefore).toBeGreaterThan(0);
    TestBed.resetTestingModule();
    expect(fixtureDocument.querySelectorAll('style').length).toBeLessThan(styleCountBefore);
  });

  it('should remove the fixture root element from the DOM when module teardown is enabled', () => {
    TestBed.configureTestingModule({
      declarations: [SimpleCmp],
      teardown: {destroyAfterEach: true},
    });
    const fixture = TestBed.createComponent(SimpleCmp);
    const fixtureDocument = fixture.nativeElement.ownerDocument;

    expect(fixtureDocument.body.contains(fixture.nativeElement)).toBe(true);
    TestBed.resetTestingModule();
    expect(fixtureDocument.body.contains(fixture.nativeElement)).toBe(false);
  });

  it('should rethrow errors based on the default teardown behavior', () => {
    expect(TestBedImpl.INSTANCE.shouldRethrowTeardownErrors()).toBe(
      TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT,
    );
  });

  it('should rethrow errors if the option is omitted and test teardown is enabled', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: true}});
    expect(TestBedImpl.INSTANCE.shouldRethrowTeardownErrors()).toBe(true);
  });

  it('should not rethrow errors if the option is omitted and test teardown is disabled', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: false}});
    expect(TestBedImpl.INSTANCE.shouldRethrowTeardownErrors()).toBe(false);
  });

  it('should rethrow errors if the option is enabled, but teardown is disabled', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: false, rethrowErrors: true}});
    expect(TestBedImpl.INSTANCE.shouldRethrowTeardownErrors()).toBe(true);
  });

  it('should not rethrow errors if the option is disabled, but teardown is enabled', () => {
    TestBed.configureTestingModule({teardown: {destroyAfterEach: true, rethrowErrors: false}});
    expect(TestBedImpl.INSTANCE.shouldRethrowTeardownErrors()).toBe(false);
  });
});

describe('TestBed module `errorOnUnknownElements`', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should not throw based on the default behavior', () => {
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownElements()).toBe(
      THROW_ON_UNKNOWN_ELEMENTS_DEFAULT,
    );
  });

  it('should not throw if the option is omitted', () => {
    TestBed.configureTestingModule({});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownElements()).toBe(false);
  });

  it('should be able to configure the option', () => {
    TestBed.configureTestingModule({errorOnUnknownElements: true});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownElements()).toBe(true);
  });

  it('should reset the option back to the default when TestBed is reset', () => {
    TestBed.configureTestingModule({errorOnUnknownElements: true});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownElements()).toBe(true);
    TestBed.resetTestingModule();
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownElements()).toBe(false);
  });
});

describe('TestBed module `errorOnUnknownProperties`', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should not throw based on the default behavior', () => {
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownProperties()).toBe(
      THROW_ON_UNKNOWN_PROPERTIES_DEFAULT,
    );
  });

  it('should not throw if the option is omitted', () => {
    TestBed.configureTestingModule({});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownProperties()).toBe(false);
  });

  it('should be able to configure the option', () => {
    TestBed.configureTestingModule({errorOnUnknownProperties: true});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownProperties()).toBe(true);
  });

  it('should reset the option back to the default when TestBed is reset', () => {
    TestBed.configureTestingModule({errorOnUnknownProperties: true});
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownProperties()).toBe(true);
    TestBed.resetTestingModule();
    expect(TestBedImpl.INSTANCE.shouldThrowErrorOnUnknownProperties()).toBe(false);
  });
});
