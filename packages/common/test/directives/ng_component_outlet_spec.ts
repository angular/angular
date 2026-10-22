/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  Inject,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  Optional,
  QueryList,
  signal,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {NgComponentOutlet} from '../../src/directives/ng_component_outlet';

describe('insert/remove', () => {
  it('should do nothing if component is null', async () => {
    const template = `<ng-template *ngComponentOutlet="currentComponent()"></ng-template>`;
    TestBed.overrideComponent(TestComponent, {set: {template: template}});
    let fixture = TestBed.createComponent(TestComponent);

    fixture.componentInstance.currentComponent.set(null);
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveText('');
  });

  it('should insert content specified by a component', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent.set(InjectedComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('foo');
  });

  it('should emit a ComponentRef once a component was created', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.cmpRef = undefined;
    fixture.componentInstance.currentComponent.set(InjectedComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('foo');
    expect(fixture.componentInstance.cmpRef).toBeInstanceOf(ComponentRef);
    expect(fixture.componentInstance.cmpRef!.instance).toBeInstanceOf(InjectedComponent);
  });

  it('should clear view if component becomes null', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent.set(InjectedComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('foo');

    fixture.componentInstance.currentComponent.set(null);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');
  });

  it('should swap content if component changes', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent.set(InjectedComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('foo');

    fixture.componentInstance.currentComponent.set(InjectedComponentAgain);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('bar');
  });

  it('should use the injector, if one supplied', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    const uniqueValue = {};
    fixture.componentInstance.currentComponent.set(InjectedComponent);
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: TEST_TOKEN, useValue: uniqueValue}],
      parent: fixture.componentRef.injector,
    });

    await fixture.whenStable();
    let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
    expect(cmpRef).toBeInstanceOf(ComponentRef);
    expect(cmpRef.instance).toBeInstanceOf(InjectedComponent);
    expect(cmpRef.instance.testToken).toBe(uniqueValue);
  });

  it('should use the environmentInjector, if one supplied', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    const uniqueValue = {};
    fixture.componentInstance.currentComponent.set(InjectedComponent);
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    fixture.componentInstance.environmentInjector = createEnvironmentInjector(
      [
        {
          provide: TEST_TOKEN,
          useValue: uniqueValue,
        },
      ],
      environmentInjector,
    );

    await fixture.whenStable();
    let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
    expect(cmpRef).toBeInstanceOf(ComponentRef);
    expect(cmpRef.instance).toBeInstanceOf(InjectedComponent);
    expect(cmpRef.instance.testToken).toBe(uniqueValue);
  });

  it('should resolve with an injector', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    // We are accessing a ViewChild (ngComponentOutlet) before change detection has run
    fixture.componentInstance.cmpRef = undefined;
    fixture.componentInstance.currentComponent.set(InjectedComponent);
    await fixture.whenStable();
    let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
    expect(cmpRef).toBeInstanceOf(ComponentRef);
    expect(cmpRef.instance).toBeInstanceOf(InjectedComponent);
    expect(cmpRef.instance.testToken).toBeNull();
  });

  it('should render projectable nodes, if supplied', async () => {
    const template = `<ng-template>projected foo</ng-template>${TEST_CMP_TEMPLATE}`;
    TestBed.overrideComponent(TestComponent, {set: {template}});

    TestBed.overrideComponent(InjectedComponent, {
      set: {template: `<ng-content></ng-content>`},
    });

    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.currentComponent.set(InjectedComponent);
    fixture.componentInstance.projectables = [
      fixture.componentInstance.vcRef.createEmbeddedView(fixture.componentInstance.tplRefs.first)
        .rootNodes,
    ];

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('projected foo');
  });

  it('should resolve components from other modules, if supplied as an NgModule class reference', async () => {
    let fixture = TestBed.createComponent(TestComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('');

    fixture.componentInstance.ngModule.set(TestModule2);
    fixture.componentInstance.currentComponent.set(Module2InjectedComponent);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('baz');
  });

  it('should clean up moduleRef, if supplied as an NgModule class reference', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModule.set(TestModule2);
    fixture.componentInstance.currentComponent.set(Module2InjectedComponent);
    await fixture.whenStable();

    const moduleRef = fixture.componentInstance.ngComponentOutlet?.['_moduleRef']!;
    spyOn(moduleRef, 'destroy').and.callThrough();

    expect(moduleRef.destroy).not.toHaveBeenCalled();
    fixture.destroy();
    expect(moduleRef.destroy).toHaveBeenCalled();
  });

  it('should re-create moduleRef when changed (NgModule class reference)', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.ngModule.set(TestModule2);
    fixture.componentInstance.currentComponent.set(Module2InjectedComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveText('baz');

    fixture.componentInstance.ngModule.set(TestModule3);
    fixture.componentInstance.currentComponent.set(Module3InjectedComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveText('bat');
  });

  it('should override providers from parent component using custom injector', async () => {
    TestBed.overrideComponent(InjectedComponent, {set: {template: 'Value: {{testToken}}'}});
    TestBed.overrideComponent(TestComponent, {
      set: {providers: [{provide: TEST_TOKEN, useValue: 'parent'}]},
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.currentComponent.set(InjectedComponent);
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: TEST_TOKEN, useValue: 'child'}],
      parent: fixture.componentInstance.vcRef.injector,
    });
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveText('Value: child');
  });

  it('should be available as a standalone directive', async () => {
    @Component({
      template: 'Hello World',
    })
    class HelloWorldComp {}

    @Component({
      imports: [NgComponentOutlet],
      template: ` <ng-container *ngComponentOutlet="component"></ng-container> `,
    })
    class TestComponent {
      component = HelloWorldComp;
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });

  it('should be able to get the current component instance', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();
    const outlet = fixture.componentInstance.ngComponentOutlet!;

    expect(outlet.componentInstance).toBeNull();

    fixture.componentInstance.currentComponent.set(InjectedComponent);
    await fixture.whenStable();

    expect(outlet.componentInstance).toBeInstanceOf(InjectedComponent);
  });
});

describe('inputs', () => {
  it('should be binding the component input', async () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent.set(ComponentWithInputs);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    fixture.componentInstance.inputs.set({});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    fixture.componentInstance.inputs.set({foo: 'Foo', bar: 'Bar'});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: Bar, baz: Baz');

    fixture.componentInstance.inputs.set({foo: 'Foo'});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: , baz: Baz');

    fixture.componentInstance.inputs.set({foo: 'Foo', baz: null});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: , baz: ');

    fixture.componentInstance.inputs.set(undefined);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: ');
  });

  it('should be binding the component input (with mutable inputs)', async () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent.set(ComponentWithInputs);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: , baz: Baz');

    const mutableInputs: Record<string, unknown> = {foo: 'Hello', bar: 'World'};
    fixture.componentInstance.inputs.set(mutableInputs);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Hello, bar: World, baz: Baz');

    mutableInputs['bar'] = 'Angular';
    fixture.componentInstance.cdr.markForCheck();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Hello, bar: Angular, baz: Baz');

    delete mutableInputs['foo'];
    fixture.componentInstance.cdr.markForCheck();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: , bar: Angular, baz: Baz');
  });

  it('should be binding the component input (with component type change)', async () => {
    const fixture = TestBed.createComponent(TestInputsComponent);
    fixture.componentInstance.currentComponent.set(ComponentWithInputs);
    fixture.componentInstance.inputs.set({foo: 'Foo', bar: 'Bar'});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('foo: Foo, bar: Bar, baz: Baz');

    fixture.componentInstance.currentComponent.set(AnotherComponentWithInputs);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('[ANOTHER] foo: Foo, bar: Bar, baz: Baz');
  });
});

const TEST_TOKEN = new InjectionToken('TestToken');
@Component({
  template: 'foo',
})
class InjectedComponent {
  constructor(@Optional() @Inject(TEST_TOKEN) public testToken: any) {}
}

@Component({
  template: 'bar',
})
class InjectedComponentAgain {}

const TEST_CMP_TEMPLATE = `<ng-template *ngComponentOutlet="
      currentComponent();
      injector: injector;
      environmentInjector: environmentInjector;
      inputs: inputs;
      content: projectables;
      ngModule: ngModule();
    "></ng-template>`;
@Component({
  template: TEST_CMP_TEMPLATE,
  imports: [NgComponentOutlet],
})
class TestComponent {
  currentComponent = signal<Type<unknown> | null>(null);
  injector?: Injector;
  environmentInjector?: EnvironmentInjector;
  inputs?: Record<string, unknown>;
  projectables?: any[][];
  ngModule = signal<Type<unknown> | undefined>(undefined);

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
  declarations: [Module3InjectedComponent],
  exports: [Module3InjectedComponent],
})
export class TestModule3 {}

@Component({
  template: `foo: {{ foo }}, bar: {{ bar }}, baz: {{ baz }}`,
})
class ComponentWithInputs {
  @Input() foo?: any;
  @Input() bar?: any;
  @Input() baz?: any = 'Baz';
}

@Component({
  template: `[ANOTHER] foo: {{ foo }}, bar: {{ bar }}, baz: {{ baz }}`,
})
class AnotherComponentWithInputs {
  @Input() foo?: any;
  @Input() bar?: any;
  @Input() baz?: any = 'Baz';
}

@Component({
  imports: [NgComponentOutlet],
  template: `<ng-template *ngComponentOutlet="currentComponent(); inputs: inputs()"></ng-template>`,
})
class TestInputsComponent {
  currentComponent = signal<Type<unknown> | null>(null);
  inputs = signal<Record<string, unknown> | undefined>(undefined);
  cdr = inject(ChangeDetectorRef);
}
