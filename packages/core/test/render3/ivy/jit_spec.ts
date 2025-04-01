/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  getNgModuleById,
  HostBinding,
  HostListener,
  Input,
  NgModule,
  Pipe,
  QueryList,
  ViewChild,
  ViewChildren,
  ɵNgModuleDef as NgModuleDef,
  ɵɵngDeclareComponent as ngDeclareComponent,
} from '../../../src/core';
import {Injectable} from '../../../src/di/injectable';
import {setCurrentInjector, ɵɵinject} from '../../../src/di/injector_compatibility';
import {ɵɵdefineInjectable, ɵɵInjectorDef} from '../../../src/di/interface/defs';
import {FactoryFn} from '../../../src/render3/definition_factory';
import {ComponentDef, PipeDef} from '../../../src/render3/interfaces/definition';
import {InputFlags} from '../../../src/render3/interfaces/input_flags';

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
      standalone: false,
    })
    class SomeCmp {}
    const SomeCmpAny = SomeCmp as any;

    expect(SomeCmpAny.ɵcmp).toBeDefined();
    expect(SomeCmpAny.ɵfac() instanceof SomeCmp).toBe(true);
  });

  it('compiles a partially compiled component with split dependencies', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Inner!',
      standalone: false,
    })
    class InnerCmp {}

    class OuterCmp {
      static ɵcmp = ngDeclareComponent({
        template: '<inner-cmp></inner-cmp>',
        version: '18.0.0',
        type: OuterCmp,
        components: [
          {
            type: InnerCmp,
            selector: 'inner-cmp',
          },
        ],
      });
    }

    const rawDirectiveDefs = (OuterCmp.ɵcmp as ComponentDef<OuterCmp>).directiveDefs;
    expect(rawDirectiveDefs).not.toBeNull();
    const directiveDefs =
      rawDirectiveDefs! instanceof Function ? rawDirectiveDefs!() : rawDirectiveDefs!;
    expect(directiveDefs.length).toBe(1);
    expect(directiveDefs[0].type).toBe(InnerCmp);
  });

  it('compiles a partially compiled component with unified dependencies', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Inner!',
      standalone: false,
    })
    class InnerCmp {}

    class OuterCmp {
      static ɵcmp = ngDeclareComponent({
        template: '<inner-cmp></inner-cmp>',
        type: OuterCmp,
        version: '18.0.0',
        dependencies: [
          {
            kind: 'component',
            type: InnerCmp,
            selector: 'inner-cmp',
          },
        ],
      });
    }

    const rawDirectiveDefs = (OuterCmp.ɵcmp as ComponentDef<OuterCmp>).directiveDefs;
    expect(rawDirectiveDefs).not.toBeNull();
    const directiveDefs =
      rawDirectiveDefs! instanceof Function ? rawDirectiveDefs!() : rawDirectiveDefs!;
    expect(directiveDefs.length).toBe(1);
    expect(directiveDefs[0].type).toBe(InnerCmp);
  });

  it('compiles an injectable with a type provider', () => {
    @Injectable({providedIn: 'root'})
    class Service {}
    const ServiceAny = Service as any;

    expect(ServiceAny.ɵprov).toBeDefined();
    expect(ServiceAny.ɵprov.providedIn).toBe('root');
    expect(ɵɵinject(Service) instanceof Service).toBe(true);
  });

  it('compiles an injectable with a useValue provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Service {}

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useExisting provider', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {}

    @Injectable({providedIn: 'root', useExisting: Existing})
    class Service {}

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, without deps', () => {
    @Injectable({providedIn: 'root', useFactory: () => 'test'})
    class Service {}

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useFactory provider, with deps', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {}

    @Injectable({providedIn: 'root', useFactory: (existing: any) => existing, deps: [Existing]})
    class Service {}

    expect(ɵɵinject(Service)).toBe('test');
  });

  it('compiles an injectable with a useClass provider, with deps', () => {
    @Injectable({providedIn: 'root', useValue: 'test'})
    class Existing {}

    class Other {
      constructor(public value: any) {}
    }

    @Injectable({providedIn: 'root', useClass: Other, deps: [Existing]})
    class Service {
      get value(): any {
        return null;
      }
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
    class Dep {}

    @Injectable()
    class Base {
      constructor(readonly dep: Dep) {}
    }

    @Injectable({providedIn: 'root'})
    class Child extends Base {}

    expect(ɵɵinject(Child).dep instanceof Dep).toBe(true);
  });

  it('compiles a module to a definition', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
      standalone: false,
    })
    class Cmp {}

    @NgModule({
      declarations: [Cmp],
    })
    class Module {}

    const moduleDef: NgModuleDef<Module> = (Module as any).ɵmod;
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
    class Module {}

    @Component({
      template: 'foo',
      selector: 'foo',
      standalone: false,
    })
    class Cmp {}

    const componentDef: ComponentDef<Module> = (Cmp as any).ɵcmp;
    expect(componentDef).toBeDefined();
    expect(componentDef.schemas).toBeInstanceOf(Array);
  });

  it('compiles a module with an id and registers it correctly', () => {
    @NgModule({
      id: 'test',
    })
    class Module {}

    const moduleDef: NgModuleDef<Module> = (Module as any).ɵmod;
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

    const factory: FactoryFn<Module> = (Module as any).ɵfac;
    const instance = factory();

    // Since the instance was created outside of an injector using the module, the
    // injection will use the default provider, not the provider from the module.
    expect(instance.token).toBe('default');

    const injectorDef: ɵɵInjectorDef<Module> = (Module as any).ɵinj;
    expect(injectorDef.providers).toEqual([{provide: Token, useValue: 'test'}]);
  });

  it('patches a module onto the component', () => {
    @Component({
      template: 'foo',
      selector: 'foo',
      standalone: false,
    })
    class Cmp {}
    const cmpDef: ComponentDef<Cmp> = (Cmp as any).ɵcmp;

    expect(cmpDef.directiveDefs).toBeNull();

    @NgModule({
      declarations: [Cmp],
    })
    class Module {}

    const moduleDef: NgModuleDef<Module> = (Module as any).ɵmod;
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
      standalone: false,
    })
    class Cmp {
      @HostBinding('class.green') green: boolean = false;

      @HostListener('change', ['$event'])
      onChange(event: any): void {}
    }

    const cmpDef = (Cmp as any).ɵcmp as ComponentDef<Cmp>;

    expect(cmpDef.hostBindings).toBeDefined();
    expect(cmpDef.hostBindings!.length).toBe(2);
  });

  it('should compile @Pipes without errors', () => {
    @Pipe({
      name: 'test-pipe',
      pure: false,
      standalone: false,
    })
    class P {}

    const pipeDef = (P as any).ɵpipe as PipeDef<P>;
    const pipeFactory = (P as any).ɵfac as FactoryFn<P>;
    expect(pipeDef.name).toBe('test-pipe');
    expect(pipeDef.pure).toBe(false, 'pipe should not be pure');
    expect(pipeFactory() instanceof P).toBe(
      true,
      'factory() should create an instance of the pipe',
    );
  });

  it('should default @Pipe to pure: true', () => {
    @Pipe({
      name: 'test-pipe',
      standalone: false,
    })
    class P {}

    const pipeDef = (P as any).ɵpipe as PipeDef<P>;
    expect(pipeDef.pure).toBe(true, 'pipe should be pure');
  });

  it('should add @Input properties to a component', () => {
    @Component({
      selector: 'input-comp',
      template: 'test',
      standalone: false,
    })
    class InputComp {
      @Input('publicName') privateName = 'name1';
    }

    const InputCompAny = InputComp as any;
    expect(InputCompAny.ɵcmp.inputs).toEqual({publicName: ['privateName', InputFlags.None, null]});
    expect(InputCompAny.ɵcmp.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should add @Input properties to a directive', () => {
    @Directive({
      selector: '[dir]',
      standalone: false,
    })
    class InputDir {
      @Input('publicName') privateName = 'name1';
    }

    const InputDirAny = InputDir as any;
    expect(InputDirAny.ɵdir.inputs).toEqual({publicName: ['privateName', InputFlags.None, null]});
    expect(InputDirAny.ɵdir.declaredInputs).toEqual({publicName: 'privateName'});
  });

  it('should compile ContentChildren query with string predicate on a directive', () => {
    @Directive({
      selector: '[test]',
      standalone: false,
    })
    class TestDirective {
      @ContentChildren('foo') foos: QueryList<ElementRef> | undefined;
    }

    expect((TestDirective as any).ɵdir.contentQueries).not.toBeNull();
  });

  it('should compile ContentChild query with string predicate on a directive', () => {
    @Directive({
      selector: '[test]',
      standalone: false,
    })
    class TestDirective {
      @ContentChild('foo') foo: ElementRef | undefined;
    }

    expect((TestDirective as any).ɵdir.contentQueries).not.toBeNull();
  });

  it('should compile ContentChildren query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({
      selector: '[test]',
      standalone: false,
    })
    class TestDirective {
      @ContentChildren(SomeDir) dirs: QueryList<SomeDir> | undefined;
    }

    expect((TestDirective as any).ɵdir.contentQueries).not.toBeNull();
  });

  it('should compile ContentChild query with type predicate on a directive', () => {
    class SomeDir {}

    @Directive({
      selector: '[test]',
      standalone: false,
    })
    class TestDirective {
      @ContentChild(SomeDir) dir: SomeDir | undefined;
    }

    expect((TestDirective as any).ɵdir.contentQueries).not.toBeNull();
  });

  it('should compile ViewChild query on a component', () => {
    @Component({
      selector: 'test',
      template: '',
      standalone: false,
    })
    class TestComponent {
      @ViewChild('foo') foo: ElementRef | undefined;
    }

    expect((TestComponent as any).ɵcmp.foo).not.toBeNull();
  });

  it('should compile ViewChildren query on a component', () => {
    @Component({
      selector: 'test',
      template: '',
      standalone: false,
    })
    class TestComponent {
      @ViewChildren('foo') foos: QueryList<ElementRef> | undefined;
    }

    expect((TestComponent as any).ɵcmp.viewQuery).not.toBeNull();
  });

  describe('invalid parameters', () => {
    it('should error when creating an @Injectable that extends a class with a faulty parameter', () => {
      @Injectable({providedIn: 'root'})
      class Legit {}

      @Injectable()
      class Base {
        constructor(first: Legit, second: any) {}
      }

      @Injectable({providedIn: 'root'})
      class Service extends Base {}

      const ServiceAny = Service as any;

      expect(ServiceAny.ɵprov).toBeDefined();
      expect(ServiceAny.ɵprov.providedIn).toBe('root');
      expect(() => ɵɵinject(Service)).toThrowError(
        /constructor is not compatible with Angular Dependency Injection because its dependency at index 1 of the parameter list is invalid/,
      );
    });

    it('should error when creating an @Directive that extends an undecorated class with parameters', () => {
      @Injectable({providedIn: 'root'})
      class Legit {}

      class BaseDir {
        constructor(first: Legit) {}
      }

      @Directive({
        selector: 'test',
        standalone: false,
      })
      class TestDir extends BaseDir {}

      const TestDirAny = TestDir as any;

      expect(TestDirAny.ɵfac).toBeDefined();
      expect(() => TestDirAny.ɵfac()).toThrowError(
        /constructor is not compatible with Angular Dependency Injection because its dependency at index 0 of the parameter list is invalid/,
      );
    });
  });
});

it('ensure at least one spec exists', () => {});
