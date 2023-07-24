/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, ContentChildren, Directive, ElementRef, forwardRef, getNgModuleById, HostBinding, HostListener, Input, NgModule, Pipe, QueryList, ViewChild, ViewChildren, ɵNgModuleDef as NgModuleDef, ɵɵngDeclareComponent as ngDeclareComponent} from '@angular/core';
import {Injectable} from '@angular/core/src/di/injectable';
import {setCurrentInjector, ɵɵinject} from '@angular/core/src/di/injector_compatibility';
import {InjectorType, ɵɵdefineInjectable, ɵɵInjectorDef} from '@angular/core/src/di/interface/defs';
import {NgModuleType} from '@angular/core/src/render3';
import {FactoryFn} from '@angular/core/src/render3/definition_factory';
import {ComponentDef, ComponentType, DirectiveDef, DirectiveType, PipeDef, PipeType,} from '@angular/core/src/render3/interfaces/definition';



describe('render3 jit', () => {
  let injector: any;
  beforeAll(() => {
    injector = setCurrentInjector(null);
  });

  afterAll(() => {
    setCurrentInjector(injector);
  });

  it('compiles a component', () => {
    @Component({
      template: 'test',
      selector: 'test-cmp',
    })
    class SomeCmp {
    }
    const SomeCmpType = SomeCmp as ComponentType<SomeCmp>;
    const SomeCmpFac = (SomeCmp as DirectiveType<SomeCmp>).ɵfac as FactoryFn<SomeCmp>;

    expect(SomeCmpType.ɵcmp).toBeDefined();
    expect(SomeCmpFac() instanceof SomeCmp).toBe(true);
  });

  it('compiles a partially compiled component with split dependencies', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Inner!',
    })
    class InnerCmp {
    }

    class OuterCmp {
      static ɵcmp = ngDeclareComponent({
        template: '<inner-cmp></inner-cmp>',
        type: OuterCmp,
        components: [{
          type: InnerCmp,
          selector: 'inner-cmp',
        }],
      });
    }

    const rawDirectiveDefs = (OuterCmp.ɵcmp as ComponentDef<OuterCmp>).directiveDefs;
    expect(rawDirectiveDefs).toBeDefined();
    expect(typeof rawDirectiveDefs).toBe('function');
    const directiveDefs = (rawDirectiveDefs as Function)();
    expect(directiveDefs.length).toBe(1);
    expect(directiveDefs[0].type).toBe(InnerCmp);
  });


  it('compiles a partially compiled component with unified dependencies', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Inner!',
    })
    class InnerCmp {
    }

    class OuterCmp {
      static ɵcmp = ngDeclareComponent({
        template: '<inner-cmp></inner-cmp>',
        type: OuterCmp,
        dependencies: [{
          kind: 'component',
          type: InnerCmp,
          selector: 'inner-cmp',
        }],
      });
    }

    const rawDirectiveDefs = (OuterCmp.ɵcmp as ComponentDef<OuterCmp>).directiveDefs;
    expect(rawDirectiveDefs).toBeDefined();
    expect(typeof rawDirectiveDefs).toBe('function');
    const directiveDefs = (rawDirectiveDefs as Function)();
    expect(directiveDefs.length).toBe(1);
    expect(directiveDefs[0].type).toBe(InnerCmp);
  });

  it('compiles an injectable with a type provider', () => {
    @Injectable({providedIn: 'root'})
    class Service {
    }
    const ServiceAny = Service as any;

    expect(ServiceAny.ɵprov).toBeDefined();
    expect(ServiceAny.ɵprov.providedIn).toBe('root');
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
      get value(): any {
        return null;
      }
    }

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
      get value(): number {
        return 0;
      }
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

    const moduleDef: NgModuleDef<Module> = (Module as NgModuleType).ɵmod;
    expect(moduleDef).toBeDefined();
    if (!Array.isArray(moduleDef.declarations)) {
      return fail('Expected an array');
    }
    expect(moduleDef.declarations.length).toBe(1);
    expect(moduleDef.declarations[0]).toBe(Cmp);
  });

  it('compiles a module with forwardRef', () => {
    @NgModule({
      declarations: [forwardRef(() => Cmp)],
    })
    class Module {
    }

    @Component({
      template: 'foo',
      selector: 'foo',
    })
    class Cmp {
    }

    const componentDef = (Cmp as ComponentType<Cmp>).ɵcmp as ComponentDef<Module>;
    expect(componentDef).toBeDefined();
    expect(componentDef.schemas).toBeInstanceOf(Array);
  });

  it('compiles a module with an id and registers it correctly', () => {
    @NgModule({
      id: 'test',
    })
    class Module {
    }

    const moduleDef: NgModuleDef<Module> = (Module as NgModuleType).ɵmod;
    expect(moduleDef).toBeDefined();
    if (!Array.isArray(moduleDef.declarations)) {
      return fail('Expected an array');
    }
    expect(moduleDef.id).toBe('test');
    expect(getNgModuleById('test')).toBe(Module);
  });

  it('compiles a module to an ɵinj with the providers', () => {
    class Token {
      static ɵprov = ɵɵdefineInjectable({
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

    const factory = (Module as InjectorType<Module>).ɵfac as FactoryFn<Module>;
    const instance = factory();

    // Since the instance was created outside of an injector using the module, the
    // injection will use the default provider, not the provider from the module.
    expect(instance.token).toBe('default');

    const injectorDef = (Module as InjectorType<Module>).ɵinj as ɵɵInjectorDef<Module>;
    expect(injectorDef.providers).toEqual([{provide: Token, useValue: 'test'}]);
  });

  it('patches a module onto the component', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
    })
    class Cmp {
    }

    const cmpDef = (Cmp as ComponentType<Cmp>).ɵcmp as ComponentDef<Cmp>;

    expect(cmpDef.directiveDefs).toBeNull();

    @NgModule({
      declarations: [Cmp],
    })
    class Module {
    }

    const moduleDef: NgModuleDef<Module> = (Module as NgModuleType).ɵmod;
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
      @HostBinding('class.green') green: boolean = false;

      @HostListener('change', ['$event'])
      onChange(event: any): void {
      }
    }

    const cmpDef = (Cmp as ComponentType<Cmp>).ɵcmp as ComponentDef<Cmp>;

    expect(cmpDef.hostBindings).toBeDefined();
    expect(cmpDef.hostBindings!.length).toBe(2);
  });

  it('should compile @Pipes without errors', () => {
    @Pipe({name: 'test-pipe', pure: false})
    class P {
    }

    const pipeDef = (P as PipeType<P>).ɵpipe as PipeDef<P>;
    const pipeFactory = (P as PipeType<P>).ɵfac as FactoryFn<P>;
    expect(pipeDef.name).toBe('test-pipe');
    expect(pipeDef.pure).withContext('pipe should not be pure').toBe(false);
    expect(pipeFactory() instanceof P)
        .withContext('factory() should create an instance of the pipe')
        .toBe(
            true,
        );
  });

  it('should default @Pipe to pure: true', () => {
    @Pipe({name: 'test-pipe'})
    class P {
    }

    const pipeDef = (P as PipeType<P>).ɵpipe as PipeDef<P>;
    expect(pipeDef.pure).withContext('pipe should be pure').toBe(true);
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
    // No need to bother to type correctly, as it uses an alias
    expect(InputCompAny.ɵcmp.inputs).toEqual({publicName: 'privateName'});
    expect(InputCompAny.ɵcmp.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should add @Input properties to a directive', () => {
    @Directive({
      selector: '[dir]',
    })
    class InputDir {
      @Input('publicName') privateName = 'name1';
    }

    const InputDirAny = InputDir as any;
    // No need to bother to type correctly, as it uses an alias
    expect(InputDirAny.ɵdir.inputs).toEqual({publicName: 'privateName'});
    expect(InputDirAny.ɵdir.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should compile ContentChildren query with string predicate on a directive', () => {
    @Directive({selector: '[test]'})
    class TestDir {
      @ContentChildren('foo') foos: QueryList<ElementRef>|undefined;
    }

    const dirDef = (TestDir as DirectiveType<TestDir>).ɵdir as DirectiveDef<TestDir>;
    expect(dirDef.contentQueries).toBeDefined();
    expect(typeof dirDef.contentQueries).toBe('function');
  });

  it('should compile ContentChild query with string predicate on a directive', () => {
    @Directive({selector: '[test]'})
    class TestDir {
      @ContentChild('foo') foo: ElementRef|undefined;
    }

    const dirDef = (TestDir as DirectiveType<TestDir>).ɵdir as DirectiveDef<TestDir>;
    expect(dirDef.contentQueries).toBeDefined();
    expect(typeof dirDef.contentQueries).toBe('function');
  });

  it('should compile ContentChildren query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({selector: '[test]'})
    class TestDir {
      @ContentChildren(SomeDir) dirs: QueryList<SomeDir>|undefined;
    }

    const dirDef = (TestDir as DirectiveType<TestDir>).ɵdir as DirectiveDef<TestDir>;
    expect(dirDef.contentQueries).toBeDefined();
    expect(typeof dirDef.contentQueries).toBe('function');
  });

  it('should compile ContentChild query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({selector: '[test]'})
    class TestDir {
      @ContentChild(SomeDir) dir: SomeDir|undefined;
    }

    const dirDef = (TestDir as DirectiveType<TestDir>).ɵdir as DirectiveDef<TestDir>;
    expect(typeof dirDef.contentQueries).toBe('function');
  });

  it('should compile ViewChild query on a component', () => {
    @Component({selector: 'test', template: ''})
    class TestCmp {
      @ViewChild('foo') public foo: ElementRef|undefined;
    }

    const cmpDef = (TestCmp as ComponentType<TestCmp>).ɵcmp as ComponentDef<TestCmp>;
    expect(cmpDef.viewQuery).toBeDefined();
    expect(typeof cmpDef.viewQuery).toBe('function');
    expect((cmpDef as any).foo).toBeUndefined();
  });

  it('should compile ViewChildren query on a component', () => {
    @Component({selector: 'test', template: ''})
    class TestCmp {
      @ViewChildren('foo') foos: QueryList<ElementRef>|undefined;
    }

    const cmpDef = (TestCmp as ComponentType<TestCmp>).ɵcmp as ComponentDef<TestCmp>;
    expect(cmpDef.viewQuery).toBeDefined();
    expect(typeof cmpDef.viewQuery).toBe('function');
  });

  describe('invalid parameters', () => {
    it('should error when creating an @Injectable that extends a class with a faulty parameter', () => {
      @Injectable({providedIn: 'root'})
      class Legit {
      }


      @Injectable()
      class Base {
        constructor(first: Legit, second: any) {}
      }

      @Injectable({providedIn: 'root'})
      class Service extends Base {
      }

      const ServiceAny = Service as any;

      expect(ServiceAny.ɵprov).toBeDefined();
      expect(ServiceAny.ɵprov.providedIn).toBe('root');
      expect(() => ɵɵinject(Service))
          .toThrowError(
              /constructor is not compatible with Angular Dependency Injection because its dependency at index 1 of the parameter list is invalid/);
    });

    it('should error when creating an @Directive that extends an undecorated class with parameters',
       () => {
         @Injectable({providedIn: 'root'})
         class Legit {
         }

         class BaseDir {
           constructor(first: Legit) {}
         }

         @Directive({selector: 'test'})
         class TestDir extends BaseDir {
         }

         const TestDirFac = (TestDir as DirectiveType<TestDir>).ɵfac as FactoryFn<TestDir>;

         expect(TestDirFac).toBeDefined();
         expect(() => TestDirFac())
             .toThrowError(
                 /constructor is not compatible with Angular Dependency Injection because its dependency at index 0 of the parameter list is invalid/);
       });
  });
});

it('ensure at least one spec exists', () => {});
