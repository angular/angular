/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgComponentOutlet} from '@angular/common/src/directives/ng_component_outlet';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Compiler, Component, ComponentRef, DoCheck, EventEmitter, Inject, InjectionToken, Injector, Input, NgModule, NgModuleFactory, NO_ERRORS_SCHEMA, OnChanges, OnInit, Optional, Output, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {Log} from '@angular/core/testing/src/testing_internal';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('insert/remove', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TestModule], providers: [Log]});
  });

  it('should do nothing if component is null', async(() => {
       const template = `<ng-template *ngComponentOutlet="currentComponent"></ng-template>`;
       TestBed.overrideComponent(TestComponent, {set: {template: template}});
       let fixture = TestBed.createComponent(TestComponent);

       fixture.componentInstance.currentComponent = null;
       fixture.detectChanges();

       expect(fixture.nativeElement).toHaveText('');
     }));

  it('should insert content specified by a component', async(() => {
       let fixture = TestBed.createComponent(TestComponent);

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('');

       fixture.componentInstance.currentComponent = InjectedComponent;

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('foo');
     }));

  it('should emit a ComponentRef once a component was created', async(() => {
       let fixture = TestBed.createComponent(TestComponent);

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('');

       fixture.componentInstance.cmpRef = null;
       fixture.componentInstance.currentComponent = InjectedComponent;

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('foo');
       expect(fixture.componentInstance.cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(fixture.componentInstance.cmpRef!.instance).toBeAnInstanceOf(InjectedComponent);
     }));


  it('should clear view if component becomes null', async(() => {
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


  it('should swap content if component changes', async(() => {
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

  it('should use the injector, if one supplied', async(() => {
       let fixture = TestBed.createComponent(TestComponent);

       const uniqueValue = {};
       fixture.componentInstance.currentComponent = InjectedComponent;
       fixture.componentInstance.injector = Injector.create(
           [{provide: TEST_TOKEN, useValue: uniqueValue}], fixture.componentRef.injector);

       fixture.detectChanges();
       let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
       expect(cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(cmpRef.instance).toBeAnInstanceOf(InjectedComponent);
       expect(cmpRef.instance.testToken).toBe(uniqueValue);
     }));


  it('should resolve with an injector', async(() => {
       let fixture = TestBed.createComponent(TestComponent);

       // We are accessing a ViewChild (ngComponentOutlet) before change detection has run
       fixture.componentInstance.cmpRef = null;
       fixture.componentInstance.currentComponent = InjectedComponent;
       fixture.detectChanges();
       let cmpRef: ComponentRef<InjectedComponent> = fixture.componentInstance.cmpRef!;
       expect(cmpRef).toBeAnInstanceOf(ComponentRef);
       expect(cmpRef.instance).toBeAnInstanceOf(InjectedComponent);
       expect(cmpRef.instance.testToken).toBeNull();
     }));

  it('should render projectable nodes, if supplied', async(() => {
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

  it('should resolve components from other modules, if supplied', async(() => {
       const compiler = TestBed.inject(Compiler);
       let fixture = TestBed.createComponent(TestComponent);

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('');

       fixture.componentInstance.module = compiler.compileModuleSync(TestModule2);
       fixture.componentInstance.currentComponent = Module2InjectedComponent;

       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('baz');
     }));

  it('should clean up moduleRef, if supplied', async(() => {
       let destroyed = false;
       const compiler = TestBed.inject(Compiler);
       const fixture = TestBed.createComponent(TestComponent);
       fixture.componentInstance.module = compiler.compileModuleSync(TestModule2);
       fixture.componentInstance.currentComponent = Module2InjectedComponent;
       fixture.detectChanges();

       const moduleRef = fixture.componentInstance.ngComponentOutlet['_moduleRef']!;
       spyOn(moduleRef, 'destroy').and.callThrough();

       expect(moduleRef.destroy).not.toHaveBeenCalled();
       fixture.destroy();
       expect(moduleRef.destroy).toHaveBeenCalled();
     }));

  it('should not re-create moduleRef when it didn\'t actually change', async(() => {
       const compiler = TestBed.inject(Compiler);
       const fixture = TestBed.createComponent(TestComponent);

       fixture.componentInstance.module = compiler.compileModuleSync(TestModule2);
       fixture.componentInstance.currentComponent = Module2InjectedComponent;
       fixture.detectChanges();
       expect(fixture.nativeElement).toHaveText('baz');
       const moduleRef = fixture.componentInstance.ngComponentOutlet['_moduleRef'];

       fixture.componentInstance.currentComponent = Module2InjectedComponent2;
       fixture.detectChanges();

       expect(fixture.nativeElement).toHaveText('baz2');
       expect(moduleRef).toBe(fixture.componentInstance.ngComponentOutlet['_moduleRef']);
     }));

  it('should re-create moduleRef when changed', async(() => {
       const compiler = TestBed.inject(Compiler);
       const fixture = TestBed.createComponent(TestComponent);
       fixture.componentInstance.module = compiler.compileModuleSync(TestModule2);
       fixture.componentInstance.currentComponent = Module2InjectedComponent;
       fixture.detectChanges();

       expect(fixture.nativeElement).toHaveText('baz');

       fixture.componentInstance.module = compiler.compileModuleSync(TestModule3);
       fixture.componentInstance.currentComponent = Module3InjectedComponent;
       fixture.detectChanges();

       expect(fixture.nativeElement).toHaveText('bat');
     }));

  describe('binding', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
      const template =
          `<ng-template *ngComponentOutlet="currentComponent; input: inputs; output: outputs;"></ng-template>`;
      TestBed.overrideComponent(TestComponent, {set: {template: template}});
      fixture = TestBed.createComponent(TestComponent);
    });

    it('should bind inputs to the component according to its metadata', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('');

      fixture.componentInstance.currentComponent = InjectedBindingComponent;
      fixture.componentInstance
          .inputs = {content: 'angular', shouldNotBeBound: 'mistake', alias: 'useDifferentName'};

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('angular');
      expect(fixture.componentInstance.cmpRef!.instance['shouldNotBeBound']).toBeUndefined();
      expect(fixture.componentInstance.cmpRef!.instance['innerRepresentation'])
          .toBe('useDifferentName');
    });

    it('should trigger the change on the component, if the input object changes', () => {
      fixture.detectChanges();
      fixture.componentInstance.currentComponent = InjectedBindingComponent;
      fixture.componentInstance.inputs = {content: 'angular'};

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('angular');

      fixture.componentInstance.inputs = {content: 'changed'};

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('changed');

      fixture.componentInstance.inputs = {content: 'changed again'};

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('changed again');
    });

    it('should not trigger the change on the component, if the reference of the input object does not change',
       () => {
         fixture.detectChanges();

         const inputs = {content: 'angular'};
         fixture.componentInstance.currentComponent = InjectedBindingComponent;
         fixture.componentInstance.inputs = inputs;

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('angular');

         inputs.content = 'changed';

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('angular');

         inputs.content = 'changed again';

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('angular');
       });

    it('should not rebuild the component, if the input object changes', () => {
      fixture.componentInstance.currentComponent = InjectedBindingComponent;
      fixture.componentInstance.inputs = {content: 'angular'};

      fixture.detectChanges();

      const component = fixture.componentInstance.cmpRef;
      fixture.componentInstance.inputs = {content: 'changed'};

      fixture.detectChanges();
      expect(fixture.componentInstance.cmpRef).toBe(component);

      fixture.componentInstance.inputs = {content: 'changed again'};

      fixture.detectChanges();
      expect(fixture.componentInstance.cmpRef).toBe(component);
    });

    it('should invoke lifecycle hooks on the component', inject([Log], (log: Log) => {
         const component = fixture.componentInstance;
         const updateBindingFn = (component.ngComponentOutlet as any)._updateBindings;
         spyOn(component.ngComponentOutlet as any, '_updateBindings')
             .and.callFake((changes: any) => {
               updateBindingFn.apply(component.ngComponentOutlet, [changes]);
               component.cmpRef!.instance.ngOnChanges();  // manually trigger since
                                                          // it's not triggered in
                                                          // test. See #9866
             });
         const updateComponentFn = (component.ngComponentOutlet as any)._updateComponent;
         spyOn(component.ngComponentOutlet as any, '_updateComponent')
             .and.callFake((changes: any) => {
               updateComponentFn.apply(component.ngComponentOutlet, [changes]);
               component.cmpRef!.instance.ngOnChanges();  // manually trigger since
                                                          // it's not triggered in
                                                          // test. See #9866
             });
         const inputs = {content: 'angular'};
         component.currentComponent = InjectedBindingComponent;
         component.inputs = inputs;

         fixture.detectChanges();

         expect(log.result())
             .toEqual(
                 'ngOnChanges; ngOnInit; ngDoCheck; ngAfterContentInit; ngAfterContentChecked; ' +
                 'ngAfterViewInit; ngAfterViewChecked');

         component.inputs = {content: 'changed'};
         log.clear();

         fixture.detectChanges();
         expect(log.result())
             .toEqual('ngOnChanges; ngDoCheck; ngAfterContentChecked; ngAfterViewChecked');

         component.inputs = {content: 'changed again'};
         log.clear();

         fixture.detectChanges();
         expect(log.result())
             .toEqual('ngOnChanges; ngDoCheck; ngAfterContentChecked; ngAfterViewChecked');

         log.clear();

         fixture.detectChanges();
         expect(log.result()).toEqual('ngDoCheck; ngAfterContentChecked; ngAfterViewChecked');
       }));

    it('should bind outputs to the component according to its metadata', () => {
      const onCalledHandler = jasmine.createSpy('onCalled');
      const onInnerChangedHandler = jasmine.createSpy('onCalled');
      const outputs = {
        onCalled: onCalledHandler,
        shouldNotBeBound: 'throw',
        aliasCall: onInnerChangedHandler
      };
      fixture.componentInstance.currentComponent = InjectedBindingComponent;
      fixture.componentInstance.outputs = outputs;

      fixture.detectChanges();

      fixture.componentInstance.cmpRef!.instance.onCalled.emit(2);
      expect(onCalledHandler).toHaveBeenCalledTimes(1);
      expect(onCalledHandler).toHaveBeenCalledWith(2);
      expect(fixture.componentInstance.cmpRef!.instance['shouldNotBeBound']).toBeUndefined();
      fixture.componentInstance.cmpRef!.instance.onInnerChanged.emit(3);
      expect(onInnerChangedHandler).toHaveBeenCalledTimes(1);
      expect(onInnerChangedHandler).toHaveBeenCalledWith(3);
    });
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

@Component({selector: 'injected-binding-component', template: '{{content}}'})
class InjectedBindingComponent implements OnChanges, OnInit, DoCheck, AfterContentInit,
                                          AfterContentChecked, AfterViewInit, AfterViewChecked {
  @Input() content!: string;
  @Input('alias') innerRepresentation!: string;
  @Output() onCalled = new EventEmitter<number>();
  @Output('aliasCall') onInnerChanged = new EventEmitter<number>();

  constructor(private _log: Log) {}

  ngOnChanges(_: any) {
    this._log.add('ngOnChanges');
  }

  ngOnInit() {
    this._log.add('ngOnInit');
  }

  ngDoCheck() {
    this._log.add('ngDoCheck');
  }

  ngAfterContentInit() {
    this._log.add('ngAfterContentInit');
  }

  ngAfterContentChecked() {
    this._log.add('ngAfterContentChecked');
  }

  ngAfterViewInit() {
    this._log.add('ngAfterViewInit');
  }

  ngAfterViewChecked() {
    this._log.add('ngAfterViewChecked');
  }
}

const TEST_CMP_TEMPLATE =
    `<ng-template *ngComponentOutlet="currentComponent; injector: injector; content: projectables; ngModuleFactory: module;"></ng-template>`;
@Component({selector: 'test-cmp', template: TEST_CMP_TEMPLATE})
class TestComponent {
  // TODO(issue/24571): remove '!'.
  currentComponent!: Type<any>|null;
  // TODO(issue/24571): remove '!'.
  injector!: Injector;
  // TODO(issue/24571): remove '!'.
  projectables!: any[][];
  // TODO(issue/24571): remove '!'.
  module!: NgModuleFactory<any>;
  inputs: {[key: string]: any}|null = null;
  outputs: {[key: string]: any}|null = null;

  get cmpRef(): ComponentRef<any>|null {
    return this.ngComponentOutlet['_componentRef'];
  }
  set cmpRef(value: ComponentRef<any>|null) {
    this.ngComponentOutlet['_componentRef'] = value;
  }

  // TODO(issue/24571): remove '!'.
  @ViewChildren(TemplateRef) tplRefs!: QueryList<TemplateRef<any>>;
  // TODO(issue/24571): remove '!'.
  @ViewChild(NgComponentOutlet, {static: true}) ngComponentOutlet!: NgComponentOutlet;

  constructor(public vcRef: ViewContainerRef) {}
}

@NgModule({
  imports: [CommonModule],
  declarations:
      [TestComponent, InjectedComponent, InjectedComponentAgain, InjectedBindingComponent],
  exports: [TestComponent, InjectedComponent, InjectedComponentAgain, InjectedBindingComponent],
  entryComponents: [InjectedComponent, InjectedComponentAgain, InjectedBindingComponent]
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
  exports: [Module2InjectedComponent, Module2InjectedComponent2],
  entryComponents: [Module2InjectedComponent, Module2InjectedComponent2]
})
export class TestModule2 {
}

@Component({selector: 'module-3-injected-component', template: 'bat'})
class Module3InjectedComponent {
}

@NgModule({
  imports: [CommonModule],
  declarations: [Module3InjectedComponent],
  exports: [Module3InjectedComponent],
  entryComponents: [Module3InjectedComponent]
})
export class TestModule3 {
}
