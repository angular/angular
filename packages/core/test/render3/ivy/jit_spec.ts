/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import 'reflect-metadata';

import {ElementRef, QueryList, ɵɵsetComponentScope as setComponentScope} from '@angular/core';
import {Injectable} from '@angular/core/src/di/injectable';
import {setCurrentInjector, ɵɵinject} from '@angular/core/src/di/injector_compatibility';
import {ɵɵInjectorDef, ɵɵdefineInjectable} from '@angular/core/src/di/interface/defs';
import {ivyEnabled} from '@angular/core/src/ivy_switch';
import {ContentChild, ContentChildren, ViewChild, ViewChildren} from '@angular/core/src/metadata/di';
import {Component, Directive, HostBinding, HostListener, Input, Output, Pipe} from '@angular/core/src/metadata/directives';
import {NgModule, NgModuleDef} from '@angular/core/src/metadata/ng_module';
import {ComponentDef, PipeDef} from '@angular/core/src/render3/interfaces/definition';


ivyEnabled && describe('render3 jit', () => {
  let injector: any;
  beforeAll(() => { injector = setCurrentInjector(null); });

  afterAll(() => { setCurrentInjector(injector); });

  it('compiles a component', () => {
    @Component({
      template: 'test',
      selector: 'test-cmp',
    })
    class SomeCmp {
    }
    const SomeCmpAny = SomeCmp as any;

    expect(SomeCmpAny.ngComponentDef).toBeDefined();
    expect(SomeCmpAny.ngComponentDef.factory() instanceof SomeCmp).toBe(true);
  });

  it('compiles an injectable with a type provider', () => {
    @Injectable({providedIn: 'root'})
    class Service {
    }
    const ServiceAny = Service as any;

    expect(ServiceAny.ngInjectableDef).toBeDefined();
    expect(ServiceAny.ngInjectableDef.providedIn).toBe('root');
    expect(ɵɵinject(Service) instanceof Service).toBe(true);
  });

  it('compiles an injectable with a useValue provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Service {
    }

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useExisting provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {
    }

    @Injectable({providedIn: 'root', useExisting: Existing})
    class Service {
    }

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, without deps', () => {

    @Injectable({providedIn: 'root', useFactory: () => 'test'})
    class Service {
    }

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, with deps', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {
    }

    @Injectable({providedIn: 'root', useFactory: (existing: any) => existing, deps: [Existing]})
    class Service {
    }

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useClass provider, with deps', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {
    }

    class Other {
      constructor(public value: any) {}
    }

    @Injectable({providedIn: 'root', useClass: Other, deps: [Existing]})
    class Service {
      get value(): any { return null; }
    }
    const ServiceAny = Service as any;

    expect(ɵɵinject(Service).value).toBe('test');
  });

  it('compiles an injectable with a useClass provider, without deps', () => {
    let _value = 1;
    @Injectable({providedIn: 'root'})
    class Existing {
      readonly value = _value++;
    }

    @Injectable({providedIn: 'root', useClass: Existing})
    class Service {
      get value(): number { return 0; }
    }

    expect(ɵɵinject(Existing).value).toBe(1);
    const injected = ɵɵinject(Service);
    expect(injected instanceof Existing).toBe(true);
    expect(injected.value).toBe(2);
  });

  it('compiles an injectable with an inherited constructor', () => {
    @Injectable({providedIn: 'root'})
    class Dep {
    }

    @Injectable()
    class Base {
      constructor(readonly dep: Dep) {}
    }

    @Injectable({providedIn: 'root'})
    class Child extends Base {
    }

    expect(ɵɵinject(Child).dep instanceof Dep).toBe(true);
  });

  it('compiles a module to a definition', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
    })
    class Cmp {
    }

    @NgModule({
      declarations: [Cmp],
    })
    class Module {
    }

    const moduleDef: NgModuleDef<Module> = (Module as any).ngModuleDef;
    expect(moduleDef).toBeDefined();
    if (!Array.isArray(moduleDef.declarations)) {
      return fail('Expected an array');
    }
    expect(moduleDef.declarations.length).toBe(1);
    expect(moduleDef.declarations[0]).toBe(Cmp);
  });

  it('compiles a module to an ngInjectorDef with the providers', () => {
    class Token {
      static ngInjectableDef = ɵɵdefineInjectable({
        token: Token,
        providedIn: 'root',
        factory: () => 'default',
      });
    }

    @NgModule({
      providers: [{provide: Token, useValue: 'test'}],
    })
    class Module {
      constructor(public token: Token) {}
    }

    const injectorDef: ɵɵInjectorDef<Module> = (Module as any).ngInjectorDef;
    const instance = injectorDef.factory();

    // Since the instance was created outside of an injector using the module, the
    // injection will use the default provider, not the provider from the module.
    expect(instance.token).toBe('default');

    expect(injectorDef.providers).toEqual([{provide: Token, useValue: 'test'}]);
  });

  it('patches a module onto the component', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
    })
    class Cmp {
    }
    const cmpDef: ComponentDef<Cmp> = (Cmp as any).ngComponentDef;

    expect(cmpDef.directiveDefs).toBeNull();

    @NgModule({
      declarations: [Cmp],
    })
    class Module {
    }

    const moduleDef: NgModuleDef<Module> = (Module as any).ngModuleDef;
    // directive defs are still null, since no directives were in that component
    expect(cmpDef.directiveDefs).toBeNull();
  });

  it('should add hostbindings and hostlisteners', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
      host: {
        '[class.red]': 'isRed',
        '(click)': 'onClick()',
      },
    })
    class Cmp {
      @HostBinding('class.green')
      green: boolean = false;

      @HostListener('change', ['$event'])
      onChange(event: any): void {}
    }

    const cmpDef = (Cmp as any).ngComponentDef as ComponentDef<Cmp>;

    expect(cmpDef.hostBindings).toBeDefined();
    expect(cmpDef.hostBindings !.length).toBe(3);
  });

  it('should compile @Pipes without errors', () => {
    @Pipe({name: 'test-pipe', pure: false})
    class P {
    }

    const pipeDef = (P as any).ngPipeDef as PipeDef<P>;
    expect(pipeDef.name).toBe('test-pipe');
    expect(pipeDef.pure).toBe(false, 'pipe should not be pure');
    expect(pipeDef.factory() instanceof P)
        .toBe(true, 'factory() should create an instance of the pipe');
  });

  it('should default @Pipe to pure: true', () => {
    @Pipe({name: 'test-pipe'})
    class P {
    }

    const pipeDef = (P as any).ngPipeDef as PipeDef<P>;
    expect(pipeDef.pure).toBe(true, 'pipe should be pure');
  });

  it('should add @Input properties to a component', () => {
    @Component({
      selector: 'input-comp',
      template: 'test',
    })
    class InputComp {
      @Input('publicName') privateName = 'name1';
    }

    const InputCompAny = InputComp as any;
    expect(InputCompAny.ngComponentDef.inputs).toEqual({publicName: 'privateName'});
    expect(InputCompAny.ngComponentDef.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should add @Input properties to a directive', () => {
    @Directive({
      selector: '[dir]',
    })
    class InputDir {
      @Input('publicName') privateName = 'name1';
    }

    const InputDirAny = InputDir as any;
    expect(InputDirAny.ngDirectiveDef.inputs).toEqual({publicName: 'privateName'});
    expect(InputDirAny.ngDirectiveDef.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should compile ContentChildren query with string predicate on a directive', () => {
    @Directive({selector: '[test]'})
    class TestDirective {
      @ContentChildren('foo') foos: QueryList<ElementRef>|undefined;
    }

    expect((TestDirective as any).ngDirectiveDef.contentQueries).not.toBeNull();
  });

  it('should compile ContentChild query with string predicate on a directive', () => {
    @Directive({selector: '[test]'})
    class TestDirective {
      @ContentChild('foo', {static: false}) foo: ElementRef|undefined;
    }

    expect((TestDirective as any).ngDirectiveDef.contentQueries).not.toBeNull();
  });

  it('should compile ContentChildren query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({selector: '[test]'})
    class TestDirective {
      @ContentChildren(SomeDir) dirs: QueryList<SomeDir>|undefined;
    }

    expect((TestDirective as any).ngDirectiveDef.contentQueries).not.toBeNull();
  });

  it('should compile ContentChild query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({selector: '[test]'})
    class TestDirective {
      @ContentChild(SomeDir, {static: false}) dir: SomeDir|undefined;
    }

    expect((TestDirective as any).ngDirectiveDef.contentQueries).not.toBeNull();
  });

  it('should compile ViewChild query on a component', () => {
    @Component({selector: 'test', template: ''})
    class TestComponent {
      @ViewChild('foo', {static: false}) foo: ElementRef|undefined;
    }

    expect((TestComponent as any).ngComponentDef.foo).not.toBeNull();
  });

  it('should compile ViewChildren query on a component', () => {
    @Component({selector: 'test', template: ''})
    class TestComponent {
      @ViewChildren('foo') foos: QueryList<ElementRef>|undefined;
    }

    expect((TestComponent as any).ngComponentDef.viewQuery).not.toBeNull();
  });
});

it('ensure at least one spec exists', () => {});
