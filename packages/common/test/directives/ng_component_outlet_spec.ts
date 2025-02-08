/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {NgComponentOutlet} from '@angular/common/src/directives/ng_component_outlet';
import {
  Compiler,
  Component,
  ComponentRef,
  Inject,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  NgModuleFactory,
  NO_ERRORS_SCHEMA,
  Optional,
  QueryList,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('insert/remove', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TestModule]});
  });

  it('should do nothing if component is null', waitForAsync(() => {
    const template = `<ng-template *ngComponentOutlet="currentComponent"></ng-template>`;
    TestBed.overrideComponent(TestComponent, {set: {template: template}});
    let fixture = TestBed.createComponent(TestComponent);

    fixture.componentInstance.currentComponent = null;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('');
  }));

  it('should insert content specified by a component', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent = InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('foo');
  }));

  it('should emit a ComponentRef once a component was created', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.cmpRef = undefined;
    fixture.componentInstance.currentComponent = InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('foo');
    expect(fixture.componentInstance.cmpRef).toBeInstanceOf(ComponentRef);
    expect(fixture.componentInstance.cmpRef!.instance).toBeInstanceOf(InjectedComponent);
  }));

  it('should clear view if component becomes null', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent = InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('foo');

    fixture.componentInstance.currentComponent = null;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');
  }));

  it('should swap content if component changes', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent = InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('foo');

    fixture.componentInstance.currentComponent = InjectedComponentAgain;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('bar');
  }));

  it('should use the injector, if one supplied', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    const uniqueValue = {};
    fixture.componentInstance.currentComponent = InjectedComponent;
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: TEST_TOKEN, useValue: uniqueValue}],
      parent: fixture.componentRef.injector,
    });

    fixture.detectChanges();
    let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
    expect(cmpRef).toBeInstanceOf(ComponentRef);
    expect(cmpRef.instance).toBeInstanceOf(InjectedComponent);
    expect(cmpRef.instance.testToken).toBe(uniqueValue);
  }));

  it('should resolve with an injector', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    // We are accessing a ViewChild (ngComponentOutlet) before change detection has run
    fixture.componentInstance.cmpRef = undefined;
    fixture.componentInstance.currentComponent = InjectedComponent;
    fixture.detectChanges();
    let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
    expect(cmpRef).toBeInstanceOf(ComponentRef);
    expect(cmpRef.instance).toBeInstanceOf(InjectedComponent);
    expect(cmpRef.instance.testToken).toBeNull();
  }));

  it('should render projectable nodes, if supplied', waitForAsync(() => {
    const template = `<ng-template>projected foo</ng-template>${TEST_CMP_TEMPLATE}`;
    TestBed.overrideComponent(TestComponent, {set: {template: template}}).configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(InjectedComponent, {
      set: {template: `<ng-content></ng-content>`},
    }).configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});

    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent = InjectedComponent;
    fixture.componentInstance.projectables = [
      fixture.componentInstance.vcRef.createEmbeddedView(fixture.componentInstance.tplRefs.first)
        .rootNodes,
    ];

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('projected foo');
  }));

  it('should resolve components from other modules, if supplied as an NgModuleFactory', waitForAsync(() => {
    const compiler = TestBed.inject(Compiler);
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule2);
    fixture.componentInstance.currentComponent = Module2InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('baz');
  }));

  it('should resolve components from other modules, if supplied as an NgModule class reference', waitForAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.ngModule = TestModule2;
    fixture.componentInstance.currentComponent = Module2InjectedComponent;

    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('baz');
  }));

  it('should clean up moduleRef, if supplied as an NgModuleFactory', waitForAsync(() => {
    const compiler = TestBed.inject(Compiler);
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule2);
    fixture.componentInstance.currentComponent = Module2InjectedComponent;
    fixture.detectChanges();

    const moduleRef = fixture.componentInstance.ngComponentOutlet?.['_moduleRef']!;
    spyOn(moduleRef, 'destroy').and.callThrough();

    expect(moduleRef.destroy).not.toHaveBeenCalled();
    fixture.destroy();
    expect(moduleRef.destroy).toHaveBeenCalled();
  }));

  it('should clean up moduleRef, if supplied as an NgModule class reference', waitForAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModule = TestModule2;
    fixture.componentInstance.currentComponent = Module2InjectedComponent;
    fixture.detectChanges();

    const moduleRef = fixture.componentInstance.ngComponentOutlet?.['_moduleRef']!;
    spyOn(moduleRef, 'destroy').and.callThrough();

    expect(moduleRef.destroy).not.toHaveBeenCalled();
    fixture.destroy();
    expect(moduleRef.destroy).toHaveBeenCalled();
  }));

  it("should not re-create moduleRef when it didn't actually change", waitForAsync(() => {
    const compiler = TestBed.inject(Compiler);
    const fixture = TestBed.createComponent(TestComponent);

    fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule2);
    fixture.componentInstance.currentComponent = Module2InjectedComponent;
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('baz');
    const moduleRef = fixture.componentInstance.ngComponentOutlet?.['_moduleRef'];

    fixture.componentInstance.currentComponent = Module2InjectedComponent2;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('baz2');
    expect(moduleRef).toBe(fixture.componentInstance.ngComponentOutlet?.['_moduleRef']);
  }));

  it('should re-create moduleRef when changed (NgModuleFactory)', waitForAsync(() => {
    const compiler = TestBed.inject(Compiler);
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule2);
    fixture.componentInstance.currentComponent = Module2InjectedComponent;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('baz');

    fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule3);
    fixture.componentInstance.currentComponent = Module3InjectedComponent;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('bat');
  }));

  it('should re-create moduleRef when changed (NgModule class reference)', waitForAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModule = TestModule2;
    fixture.componentInstance.currentComponent = Module2InjectedComponent;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('baz');

    fixture.componentInstance.ngModule = TestModule3;
    fixture.componentInstance.currentComponent = Module3InjectedComponent;
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('bat');
  }));

  it('should override providers from parent component using custom injector', waitForAsync(() => {
    TestBed.overrideComponent(InjectedComponent, {set: {template: 'Value: {{testToken}}'}});
    TestBed.overrideComponent(TestComponent, {
      set: {providers: [{provide: TEST_TOKEN, useValue: 'parent'}]},
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.currentComponent = InjectedComponent;
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: TEST_TOKEN, useValue: 'child'}],
      parent: fixture.componentInstance.vcRef.injector,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('Value: child');
  }));

  it('should be available as a standalone directive', () => {
    @Component({
      template: 'Hello World',
    })
    class HelloWorldComp {}

    @Component({
      selector: 'test-component',
      imports: [NgComponentOutlet],
      template: ` <ng-container *ngComponentOutlet="component"></ng-container> `,
    })
    class TestComponent {
      component = HelloWorldComp;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });

  it('should be able to get the current component instance', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const outlet = fixture.componentInstance.ngComponentOutlet!;

    expect(outlet.componentInstance).toBeNull();

    fixture.componentInstance.currentComponent = InjectedComponent;
    fixture.detectChanges();

    expect(outlet.componentInstance).toBeInstanceOf(InjectedComponent);
  });
});

describe('inputs', () => {
  it('should be binding the component input', () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent = ComponentWithInputs;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    fixture.componentInstance.inputs = {};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    fixture.componentInstance.inputs = {foo: 'Foo', bar: 'Bar'};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: Bar, baz: Baz');

    fixture.componentInstance.inputs = {foo: 'Foo'};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: , baz: Baz');

    fixture.componentInstance.inputs = {foo: 'Foo', baz: null};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: , baz: ');

    fixture.componentInstance.inputs = undefined;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: ');
  });

  it('should be binding the component input (with mutable inputs)', () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent = ComponentWithInputs;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    fixture.componentInstance.inputs = {foo: 'Hello', bar: 'World'};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Hello, bar: World, baz: Baz');

    fixture.componentInstance.inputs['bar'] = 'Angular';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Hello, bar: Angular, baz: Baz');

    delete fixture.componentInstance.inputs['foo'];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: Angular, baz: Baz');
  });

  it('should be binding the component input (with component type change)', () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent = ComponentWithInputs;
    fixture.componentInstance.inputs = {foo: 'Foo', bar: 'Bar'};
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: Bar, baz: Baz');

    fixture.componentInstance.currentComponent = AnotherComponentWithInputs;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('[ANOTHER] foo: Foo, bar: Bar, baz: Baz');
  });
});

const TEST_TOKEN = new InjectionToken('TestToken');
@Component({
  selector: 'injected-component',
  template: 'foo',
  standalone: false,
})
class InjectedComponent {
  constructor(@Optional() @Inject(TEST_TOKEN) public testToken: any) {}
}

@Component({
  selector: 'injected-component-again',
  template: 'bar',
  standalone: false,
})
class InjectedComponentAgain {}

const TEST_CMP_TEMPLATE = `<ng-template *ngComponentOutlet="
      currentComponent;
      injector: injector;
      inputs: inputs;
      content: projectables;
      ngModule: ngModule;
      ngModuleFactory: ngModuleFactory;
    "></ng-template>`;
@Component({
  selector: 'test-cmp',
  template: TEST_CMP_TEMPLATE,
  standalone: false,
})
class TestComponent {
  currentComponent: Type<unknown> | null = null;
  injector?: Injector;
  inputs?: Record<string, unknown>;
  projectables?: any[][];
  ngModule?: Type<unknown>;
  ngModuleFactory?: NgModuleFactory<unknown>;

  get cmpRef(): ComponentRef<any> | undefined {
    return this.ngComponentOutlet?.['_componentRef'];
  }
  set cmpRef(value: ComponentRef<any> | undefined) {
    if (this.ngComponentOutlet) {
      this.ngComponentOutlet['_componentRef'] = value;
    }
  }

  @ViewChildren(TemplateRef) tplRefs: QueryList<TemplateRef<any>> = new QueryList();
  @ViewChild(NgComponentOutlet, {static: true}) ngComponentOutlet?: NgComponentOutlet;

  constructor(public vcRef: ViewContainerRef) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [TestComponent, InjectedComponent, InjectedComponentAgain],
  exports: [TestComponent, InjectedComponent, InjectedComponentAgain],
})
export class TestModule {}

@Component({
  selector: 'module-2-injected-component',
  template: 'baz',
  standalone: false,
})
class Module2InjectedComponent {}

@Component({
  selector: 'module-2-injected-component-2',
  template: 'baz2',
  standalone: false,
})
class Module2InjectedComponent2 {}

@NgModule({
  imports: [CommonModule],
  declarations: [Module2InjectedComponent, Module2InjectedComponent2],
  exports: [Module2InjectedComponent, Module2InjectedComponent2],
})
export class TestModule2 {}

@Component({
  selector: 'module-3-injected-component',
  template: 'bat',
  standalone: false,
})
class Module3InjectedComponent {}

@NgModule({
  imports: [CommonModule],
  declarations: [Module3InjectedComponent],
  exports: [Module3InjectedComponent],
})
export class TestModule3 {}

@Component({
  selector: 'cmp-with-inputs',
  template: `foo: {{ foo }}, bar: {{ bar }}, baz: {{ baz }}`,
})
class ComponentWithInputs {
  @Input() foo?: any;
  @Input() bar?: any;
  @Input() baz?: any = 'Baz';
}

@Component({
  selector: 'another-cmp-with-inputs',
  template: `[ANOTHER] foo: {{ foo }}, bar: {{ bar }}, baz: {{ baz }}`,
})
class AnotherComponentWithInputs {
  @Input() foo?: any;
  @Input() bar?: any;
  @Input() baz?: any = 'Baz';
}

@Component({
  selector: 'test-cmp',
  imports: [NgComponentOutlet],
  template: `<ng-template *ngComponentOutlet="currentComponent; inputs: inputs"></ng-template>`,
})
class TestInputsComponent {
  currentComponent: Type<unknown> | null = null;
  inputs?: Record<string, unknown>;
}
