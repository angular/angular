/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgComponentOutlet} from '@angular/common/src/directives/ng_component_outlet';
import {Compiler, Component, ComponentRef, Inject, InjectionToken, Injector, NgModule, NgModuleFactory, NO_ERRORS_SCHEMA, Optional, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
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
       expect(fixture.componentInstance.cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(fixture.componentInstance.cmpRef!.instance).toBeAnInstanceOf(InjectedComponent);
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
       expect(cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(cmpRef.instance).toBeAnInstanceOf(InjectedComponent);
       expect(cmpRef.instance.testToken).toBe(uniqueValue);
     }));


  it('should resolve with an injector', waitForAsync(() => {
       let fixture = TestBed.createComponent(TestComponent);

       // We are accessing a ViewChild (ngComponentOutlet) before change detection has run
       fixture.componentInstance.cmpRef = undefined;
       fixture.componentInstance.currentComponent = InjectedComponent;
       fixture.detectChanges();
       let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
       expect(cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(cmpRef.instance).toBeAnInstanceOf(InjectedComponent);
       expect(cmpRef.instance.testToken).toBeNull();
     }));

  it('should render projectable nodes, if supplied', waitForAsync(() => {
       const template = `<ng-template>projected foo</ng-template>${TEST_CMP_TEMPLATE}`;
       TestBed.overrideComponent(TestComponent, {set: {template: template}})
           .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});

       TestBed.overrideComponent(InjectedComponent, {set: {template: `<ng-content></ng-content>`}})
           .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});

       let fixture = TestBed.createComponent(TestComponent);

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('');

       fixture.componentInstance.currentComponent = InjectedComponent;
       fixture.componentInstance.projectables =
           [fixture.componentInstance.vcRef
                .createEmbeddedView(fixture.componentInstance.tplRefs.first)
                .rootNodes];


       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('projected foo');
     }));

  it('should resolve components from other modules, if supplied as an NgModuleFactory',
     waitForAsync(() => {
       const compiler = TestBed.inject(Compiler);
       let fixture = TestBed.createComponent(TestComponent);

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('');

       fixture.componentInstance.ngModuleFactory = compiler.compileModuleSync(TestModule2);
       fixture.componentInstance.currentComponent = Module2InjectedComponent;

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('baz');
     }));

  it('should resolve components from other modules, if supplied as an NgModule class reference',
     waitForAsync(() => {
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

  it('should not re-create moduleRef when it didn\'t actually change', waitForAsync(() => {
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
       TestBed.overrideComponent(
           TestComponent, {set: {providers: [{provide: TEST_TOKEN, useValue: 'parent'}]}});
       const fixture = TestBed.createComponent(TestComponent);
       fixture.componentInstance.currentComponent = InjectedComponent;
       fixture.componentInstance.injector = Injector.create({
         providers: [{provide: TEST_TOKEN, useValue: 'child'}],
         parent: fixture.componentInstance.vcRef.injector
       });
       fixture.detectChanges();

       expect(fixture.nativeElement).toHaveText('Value: child');
     }));

  it('should be available as a standalone directive', () => {
    @Component({
      standalone: true,
      template: 'Hello World',
    })
    class HelloWorldComp {
    }

    @Component({
      selector: 'test-component',
      imports: [NgComponentOutlet],
      template: `
        <ng-container *ngComponentOutlet="component"></ng-container>
      `,
      standalone: true,
    })
    class TestComponent {
      component = HelloWorldComp;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });
});

const TEST_TOKEN = new InjectionToken('TestToken');
@Component({selector: 'injected-component', template: 'foo'})
class InjectedComponent {
  constructor(@Optional() @Inject(TEST_TOKEN) public testToken: any) {}
}


@Component({selector: 'injected-component-again', template: 'bar'})
class InjectedComponentAgain {
}

const TEST_CMP_TEMPLATE = `<ng-template *ngComponentOutlet="
      currentComponent;
      injector: injector;
      content: projectables;
      ngModule: ngModule;
      ngModuleFactory: ngModuleFactory;
    "></ng-template>`;
@Component({selector: 'test-cmp', template: TEST_CMP_TEMPLATE})
class TestComponent {
  currentComponent: Type<unknown>|null = null;
  injector?: Injector;
  projectables?: any[][];
  ngModule?: Type<unknown>;
  ngModuleFactory?: NgModuleFactory<unknown>;

  get cmpRef(): ComponentRef<any>|undefined {
    return this.ngComponentOutlet?.['_componentRef'];
  }
  set cmpRef(value: ComponentRef<any>|undefined) {
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
  exports: [TestComponent, InjectedComponent, InjectedComponentAgain]
})
export class TestModule {
}

@Component({selector: 'module-2-injected-component', template: 'baz'})
class Module2InjectedComponent {
}

@Component({selector: 'module-2-injected-component-2', template: 'baz2'})
class Module2InjectedComponent2 {
}

@NgModule({
  imports: [CommonModule],
  declarations: [Module2InjectedComponent, Module2InjectedComponent2],
  exports: [Module2InjectedComponent, Module2InjectedComponent2]
})
export class TestModule2 {
}

@Component({selector: 'module-3-injected-component', template: 'bat'})
class Module3InjectedComponent {
}

@NgModule({
  imports: [CommonModule],
  declarations: [Module3InjectedComponent],
  exports: [Module3InjectedComponent]
})
export class TestModule3 {
}
