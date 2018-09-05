/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';

import {InjectorDef, defineInjectable} from '@angular/core/src/di/defs';
import {Injectable} from '@angular/core/src/di/injectable';
import {inject, setCurrentInjector} from '@angular/core/src/di/injector';
import {ivyEnabled} from '@angular/core/src/ivy_switch';
import {Component, HostBinding, HostListener, Input, Output, Pipe} from '@angular/core/src/metadata/directives';
import {NgModule, NgModuleDefInternal} from '@angular/core/src/metadata/ng_module';
import {ComponentDefInternal, PipeDefInternal} from '@angular/core/src/render3/interfaces/definition';


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
    expect(inject(Service) instanceof Service).toBe(true);
  });

  it('compiles an injectable with a useValue provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Service {
    }

    expect(inject(Service)).toBe('test');
  });

  it('compiles an injectable with a useExisting provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {
    }

    @Injectable({providedIn: 'root', useExisting: Existing})
    class Service {
    }

    expect(inject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, without deps', () => {

    @Injectable({providedIn: 'root', useFactory: () => 'test'})
    class Service {
    }

    expect(inject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, with deps', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {
    }

    @Injectable({providedIn: 'root', useFactory: (existing: any) => existing, deps: [Existing]})
    class Service {
    }

    expect(inject(Service)).toBe('test');
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

    expect(inject(Service).value).toBe('test');
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

    expect(inject(Existing).value).toBe(1);
    const injected = inject(Service);
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

    expect(inject(Child).dep instanceof Dep).toBe(true);
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

    const moduleDef: NgModuleDefInternal<Module> = (Module as any).ngModuleDef;
    expect(moduleDef).toBeDefined();
    expect(moduleDef.declarations.length).toBe(1);
    expect(moduleDef.declarations[0]).toBe(Cmp);
  });

  it('compiles a module to an ngInjectorDef with the providers', () => {
    class Token {
      static ngInjectableDef = defineInjectable({
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

    const injectorDef: InjectorDef<Module> = (Module as any).ngInjectorDef;
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
    const cmpDef: ComponentDefInternal<Cmp> = (Cmp as any).ngComponentDef;

    expect(cmpDef.directiveDefs).toBeNull();

    @NgModule({
      declarations: [Cmp],
    })
    class Module {
    }

    const moduleDef: NgModuleDefInternal<Module> = (Module as any).ngModuleDef;
    expect(cmpDef.directiveDefs instanceof Function).toBe(true);
    expect((cmpDef.directiveDefs as Function)()).toEqual([cmpDef]);
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

    const cmpDef = (Cmp as any).ngComponentDef as ComponentDefInternal<Cmp>;

    expect(cmpDef.hostBindings).toBeDefined();
    expect(cmpDef.hostBindings !.length).toBe(2);
  });

  it('should compile @Pipes without errors', () => {
    @Pipe({name: 'test-pipe', pure: false})
    class P {
    }

    const pipeDef = (P as any).ngPipeDef as PipeDefInternal<P>;
    expect(pipeDef.name).toBe('test-pipe');
    expect(pipeDef.pure).toBe(false, 'pipe should not be pure');
    expect(pipeDef.factory() instanceof P)
        .toBe(true, 'factory() should create an instance of the pipe');
  });

  it('should default @Pipe to pure: true', () => {
    @Pipe({name: 'test-pipe'})
    class P {
    }

    const pipeDef = (P as any).ngPipeDef as PipeDefInternal<P>;
    expect(pipeDef.pure).toBe(true, 'pipe should be pure');
  });

  it('should add ngBaseDef to types with @Input properties', () => {
    class C {
      @Input('alias1')
      prop1 = 'test';

      @Input('alias2')
      prop2 = 'test';
    }

    expect((C as any).ngBaseDef).toBeDefined();
    expect((C as any).ngBaseDef.inputs).toEqual({prop1: 'alias1', prop2: 'alias2'});
  });

  it('should add ngBaseDef to types with @Output properties', () => {
    class C {
      @Output('alias1')
      prop1 = 'test';

      @Output('alias2')
      prop2 = 'test';
    }

    expect((C as any).ngBaseDef).toBeDefined();
    expect((C as any).ngBaseDef.outputs).toEqual({prop1: 'alias1', prop2: 'alias2'});
  });
});

it('ensure at least one spec exists', () => {});
