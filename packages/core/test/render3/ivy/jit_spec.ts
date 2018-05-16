/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core/src/di/injectable';
import {inject, setCurrentInjector} from '@angular/core/src/di/injector';
import {ivyEnabled} from '@angular/core/src/ivy_switch';
import {Component} from '@angular/core/src/metadata/directives';
import {NgModule, NgModuleDef} from '@angular/core/src/metadata/ng_module';
import {ComponentDef} from '@angular/core/src/render3/interfaces/definition';

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
    expect(moduleDef.declarations.length).toBe(1);
    expect(moduleDef.declarations[0]).toBe(Cmp);
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
    expect(cmpDef.directiveDefs instanceof Function).toBe(true);
    expect((cmpDef.directiveDefs as Function)()).toEqual([cmpDef]);
  });
});

it('ensure at least one spec exists', () => {});
