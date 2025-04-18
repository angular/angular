/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, NgComponentOutlet} from '@angular/common';
import {
  Component,
  createEnvironmentInjector,
  Directive,
  EnvironmentInjector,
  forwardRef,
  inject,
  Injectable,
  Injector,
  Input,
  isStandalone,
  NgModule,
  NO_ERRORS_SCHEMA,
  OnInit,
  Pipe,
  PipeTransform,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('standalone components, directives, and pipes', () => {
  it('should render a standalone component', () => {
    @Component({
      template: 'Look at me, no NgModule!',
    })
    class StandaloneCmp {}

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('Look at me, no NgModule!');
  });

  it('should render a recursive standalone component', () => {
    @Component({
      selector: 'tree',
      template: `({{level}})<ng-template [ngIf]="level > 0"><tree [level]="level - 1"></tree></ng-template>`,
      imports: [CommonModule],
    })
    class TreeCmp {
      @Input() level = 0;
    }

    @Component({template: '<tree [level]="3"></tree>', imports: [TreeCmp]})
    class StandaloneCmp {}

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(3)(2)(1)(0)');
  });

  it('should render a standalone component with a standalone dependency', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Look at me, no NgModule!',
    })
    class InnerCmp {}

    @Component({
      template: '<inner-cmp></inner-cmp>',
      imports: [InnerCmp],
    })
    class StandaloneCmp {}

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<inner-cmp>Look at me, no NgModule!</inner-cmp>',
    );
  });

  it('should render a standalone component (with standalone: true) with a standalone dependency', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Look at me, no NgModule!',
    })
    class InnerCmp {}

    @Component({
      template: '<inner-cmp></inner-cmp>',
      imports: [InnerCmp],
    })
    class StandaloneCmp {}

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<inner-cmp>Look at me, no NgModule!</inner-cmp>',
    );
  });

  it('should render a standalone component with an NgModule-based dependency', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Look at me, no NgModule (kinda)!',
      standalone: false,
    })
    class InnerCmp {}

    @NgModule({
      declarations: [InnerCmp],
      exports: [InnerCmp],
    })
    class Module {}

    @Component({
      template: '<inner-cmp></inner-cmp>',
      imports: [Module],
    })
    class StandaloneCmp {}

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<inner-cmp>Look at me, no NgModule (kinda)!</inner-cmp>',
    );
  });

  it('should allow exporting standalone components, directives, and pipes from NgModule', () => {
    @Component({
      selector: 'standalone-cmp',
      template: `standalone`,
    })
    class StandaloneCmp {}

    @Directive({
      selector: '[standalone-dir]',
      host: {
        '[attr.id]': '"standalone"',
      },
    })
    class StandaloneDir {}

    @Pipe({name: 'standalonePipe'})
    class StandalonePipe implements PipeTransform {
      transform(value: any) {
        return `|${value}`;
      }
    }

    @NgModule({
      imports: [StandaloneCmp, StandaloneDir, StandalonePipe],
      exports: [StandaloneCmp, StandaloneDir, StandalonePipe],
    })
    class LibModule {}

    @Component({
      selector: 'app-cmpt',
      template: `<standalone-cmp standalone-dir></standalone-cmp>{{'standalone' | standalonePipe}}`,
      standalone: false,
    })
    class AppComponent {}

    TestBed.configureTestingModule({
      imports: [LibModule],
      declarations: [AppComponent],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('standalone|standalone');
    expect(fixture.nativeElement.querySelector('standalone-cmp').getAttribute('id')).toBe(
      'standalone',
    );
  });

  it('should render a standalone component with dependencies and ambient providers', () => {
    @Component({
      template: 'Inner',
      selector: 'inner-cmp',
    })
    class InnerCmp {}

    class Service {
      value = 'Service';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAProvider {}

    @Component({
      template: 'Outer<inner-cmp></inner-cmp>{{service.value}}',
      imports: [InnerCmp, ModuleWithAProvider],
    })
    class OuterCmp {
      constructor(readonly service: Service) {}
    }

    const fixture = TestBed.createComponent(OuterCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('Outer<inner-cmp>Inner</inner-cmp>Service');
  });

  it('should discover ambient providers from a standalone component', () => {
    class Service {
      value = 'Service';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAProvider {}

    @Component({
      template: 'Inner({{service.value}})',
      selector: 'inner-cmp',
      imports: [ModuleWithAProvider],
    })
    class InnerCmp {
      constructor(readonly service: Service) {}
    }

    @Component({
      template: 'Outer<inner-cmp></inner-cmp>{{service.value}}',
      imports: [InnerCmp],
    })
    class OuterCmp {
      constructor(readonly service: Service) {}
    }

    const fixture = TestBed.createComponent(OuterCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      'Outer<inner-cmp>Inner(Service)</inner-cmp>Service',
    );
  });

  it('should correctly associate an injector with a standalone component def', () => {
    @Injectable()
    class MyServiceA {}

    @Injectable()
    class MyServiceB {}

    @NgModule({
      providers: [MyServiceA],
    })
    class MyModuleA {}

    @NgModule({
      providers: [MyServiceB],
    })
    class MyModuleB {}

    @Component({
      selector: 'duplicate-selector',
      template: `ComponentA: {{ service ? 'service found' : 'service not found' }}`,
      imports: [MyModuleA],
    })
    class ComponentA {
      service = inject(MyServiceA, {optional: true});
    }

    @Component({
      selector: 'duplicate-selector',
      template: `ComponentB: {{ service ? 'service found' : 'service not found' }}`,
      imports: [MyModuleB],
    })
    class ComponentB {
      service = inject(MyServiceB, {optional: true});
    }

    @Component({
      selector: 'app-cmp',
      template: `
        <ng-container [ngComponentOutlet]="ComponentA" />
        <ng-container [ngComponentOutlet]="ComponentB" />
      `,
      imports: [NgComponentOutlet],
    })
    class AppCmp {
      ComponentA = ComponentA;
      ComponentB = ComponentB;
    }

    const fixture = TestBed.createComponent(AppCmp);
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('ComponentA: service found');
    expect(textContent).toContain('ComponentB: service found');
  });

  it('should dynamically insert a standalone component', () => {
    class Service {
      value = 'Service';
    }

    @NgModule({providers: [Service]})
    class Module {}

    @Component({
      template: 'Inner({{service.value}})',
      selector: 'inner-cmp',
      imports: [Module],
    })
    class InnerCmp {
      constructor(readonly service: Service) {}
    }

    @Component({
      template: '<ng-template #insert></ng-template>',
      imports: [InnerCmp],
    })
    class AppCmp implements OnInit {
      @ViewChild('insert', {read: ViewContainerRef, static: true}) vcRef!: ViewContainerRef;

      ngOnInit(): void {
        this.vcRef.createComponent(InnerCmp);
      }
    }

    const fixture = TestBed.createComponent(AppCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Inner(Service)');
  });

  it('should dynamically insert a standalone component with ambient providers override in the "left / node" injector', () => {
    class Service {
      constructor(readonly value = 'Service') {}
    }

    class NodeOverrideService extends Service {
      constructor() {
        super('NodeOverrideService');
      }
    }

    class EnvOverrideService extends Service {
      constructor() {
        super('EnvOverrideService');
      }
    }

    @NgModule({providers: [Service]})
    class Module {}

    @Component({
      template: 'Inner({{service.value}})',
      selector: 'inner-cmp',
      imports: [Module],
    })
    class InnerCmp {
      constructor(readonly service: Service) {}
    }

    @Component({
      template: '<ng-template #insert></ng-template>',
      imports: [InnerCmp],
    })
    class AppCmp implements OnInit {
      @ViewChild('insert', {read: ViewContainerRef, static: true}) vcRef!: ViewContainerRef;

      constructor(
        readonly inj: Injector,
        readonly envInj: EnvironmentInjector,
      ) {}

      ngOnInit(): void {
        const lhsInj = Injector.create({
          providers: [{provide: Service, useClass: NodeOverrideService}],
          parent: this.inj,
        });

        const rhsInj = createEnvironmentInjector(
          [{provide: Service, useClass: EnvOverrideService}],
          this.envInj,
        );

        this.vcRef.createComponent(InnerCmp, {injector: lhsInj, environmentInjector: rhsInj});
      }
    }

    const fixture = TestBed.createComponent(AppCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Inner(NodeOverrideService)');
  });

  it('should consult ambient providers before environment injector when inserting a component dynamically', () => {
    class Service {
      constructor(readonly value = 'Service') {}
    }

    class EnvOverrideService extends Service {
      constructor() {
        super('EnvOverrideService');
      }
    }

    @NgModule({providers: [Service]})
    class Module {}

    @Component({
      template: 'Inner({{service.value}})',
      selector: 'inner-cmp',
      imports: [Module],
    })
    class InnerCmp {
      constructor(readonly service: Service) {}
    }

    @Component({
      template: '<ng-template #insert></ng-template>',
      imports: [InnerCmp],
    })
    class AppCmp implements OnInit {
      @ViewChild('insert', {read: ViewContainerRef, static: true}) vcRef!: ViewContainerRef;

      constructor(readonly envInj: EnvironmentInjector) {}

      ngOnInit(): void {
        const rhsInj = createEnvironmentInjector(
          [{provide: Service, useClass: EnvOverrideService}],
          this.envInj,
        );

        this.vcRef.createComponent(InnerCmp, {environmentInjector: rhsInj});
      }
    }

    const fixture = TestBed.createComponent(AppCmp);
    fixture.detectChanges();

    // The Service (an ambient provider) gets injected here as the standalone injector is a child
    // of the user-created environment injector.
    expect(fixture.nativeElement.textContent).toBe('Inner(Service)');
  });

  it('should render a recursive cycle of standalone components', () => {
    @Component({
      selector: 'cmp-a',
      template: '<ng-template [ngIf]="false"><cmp-c></cmp-c></ng-template>A',
      imports: [forwardRef(() => StandaloneCmpC)],
    })
    class StandaloneCmpA {}

    @Component({
      selector: 'cmp-b',
      template: '(<cmp-a></cmp-a>)B',
      imports: [StandaloneCmpA],
    })
    class StandaloneCmpB {}

    @Component({
      selector: 'cmp-c',
      template: '(<cmp-b></cmp-b>)C',
      imports: [StandaloneCmpB],
    })
    class StandaloneCmpC {}

    const fixture = TestBed.createComponent(StandaloneCmpC);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('((A)B)C');
  });

  it('should collect ambient providers from exported NgModule', () => {
    class Service {
      value = 'service';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAService {}

    @NgModule({exports: [ModuleWithAService]})
    class ExportingModule {}
    @Component({
      selector: 'standalone',
      imports: [ExportingModule],
      template: `({{service.value}})`,
    })
    class TestComponent {
      constructor(readonly service: Service) {}
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(service)');
  });

  it('should support nested arrays in @Component.imports', () => {
    @Directive({selector: '[red]', host: {'[attr.red]': 'true'}})
    class RedIdDirective {}

    @Pipe({name: 'blue', pure: true})
    class BluePipe implements PipeTransform {
      transform() {
        return 'blue';
      }
    }

    @Component({
      selector: 'standalone',
      template: `<div red>{{'' | blue}}</div>`,
      imports: [[RedIdDirective, [BluePipe]]],
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toBe('<div red="true">blue</div>');
  });

  it('should support readonly arrays in @Component.imports', () => {
    @Directive({selector: '[red]', host: {'[attr.red]': 'true'}})
    class RedIdDirective {}

    @Pipe({name: 'blue', pure: true})
    class BluePipe implements PipeTransform {
      transform() {
        return 'blue';
      }
    }

    const DirAndPipe = [RedIdDirective, BluePipe] as const;

    @Component({
      selector: 'standalone',
      template: `<div red>{{'' | blue}}</div>`,
      imports: [DirAndPipe],
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toBe('<div red="true">blue</div>');
  });

  it('should deduplicate declarations', () => {
    @Component({selector: 'test-red', template: 'red(<ng-content></ng-content>)'})
    class RedComponent {}

    @Component({
      selector: 'test-blue',
      standalone: false,
      template: 'blue(<ng-content></ng-content>)',
    })
    class BlueComponent {}

    @NgModule({declarations: [BlueComponent], exports: [BlueComponent]})
    class BlueModule {}

    @NgModule({exports: [BlueModule]})
    class BlueAModule {}

    @NgModule({exports: [BlueModule]})
    class BlueBModule {}

    @Component({
      selector: 'standalone',
      template: `<test-red><test-blue>orange</test-blue></test-red>`,
      imports: [RedComponent, RedComponent, BlueAModule, BlueBModule],
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toBe(
      '<test-red>red(<test-blue>blue(orange)</test-blue>)</test-red>',
    );
  });

  it('should error when forwardRef does not resolve to a truthy value', () => {
    @Component({
      selector: 'test',
      imports: [forwardRef(() => null)],
      template: '',
    })
    class TestComponent {}
    expect(() => {
      TestBed.createComponent(TestComponent);
    }).toThrowError(
      'Expected forwardRef function, imported from "TestComponent", to return a standalone entity or NgModule but got "null".',
    );
  });

  it('should error when a non-standalone component is imported', () => {
    @Component({
      selector: 'not-a-standalone',
      template: '',
      standalone: false,
    })
    class NonStandaloneCmp {}

    @Component({
      selector: 'standalone',
      template: '',
      imports: [NonStandaloneCmp],
    })
    class StandaloneCmp {}

    expect(() => {
      TestBed.createComponent(StandaloneCmp);
    }).toThrowError(
      'The "NonStandaloneCmp" component, imported from "StandaloneCmp", is not standalone. Did you forget to add the standalone: true flag?',
    );
  });

  it('should error when a non-standalone directive is imported', () => {
    @Directive({
      selector: '[not-a-standalone]',
      standalone: false,
    })
    class NonStandaloneDirective {}

    @Component({
      selector: 'standalone',
      template: '',
      imports: [NonStandaloneDirective],
    })
    class StandaloneCmp {}

    expect(() => {
      TestBed.createComponent(StandaloneCmp);
    }).toThrowError(
      'The "NonStandaloneDirective" directive, imported from "StandaloneCmp", is not standalone. Did you forget to add the standalone: true flag?',
    );
  });

  it('should error when a non-standalone pipe is imported', () => {
    @Pipe({
      name: 'not-a-standalone',
      standalone: false,
    })
    class NonStandalonePipe {}

    @Component({
      selector: 'standalone',
      template: '',
      imports: [NonStandalonePipe],
    })
    class StandaloneCmp {}

    expect(() => {
      TestBed.createComponent(StandaloneCmp);
    }).toThrowError(
      'The "NonStandalonePipe" pipe, imported from "StandaloneCmp", is not standalone. Did you forget to add the standalone: true flag?',
    );
  });

  it('should error when an unknown type is imported', () => {
    class SthElse {}

    @Component({
      selector: 'standalone',
      template: '',
      imports: [SthElse],
    })
    class StandaloneCmp {}

    expect(() => {
      TestBed.createComponent(StandaloneCmp);
    }).toThrowError(
      'The "SthElse" type, imported from "StandaloneCmp", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?',
    );
  });

  it('should error when a module with providers is imported', () => {
    @NgModule()
    class OtherModule {}

    @NgModule()
    class LibModule {
      static forComponent() {
        return {ngModule: OtherModule};
      }
    }

    @Component({
      template: '',
      // we need to import a module with a provider in a nested array since module with providers
      // are disallowed on the type level
      imports: [[LibModule.forComponent()]],
    })
    class StandaloneCmp {}

    expect(() => {
      TestBed.createComponent(StandaloneCmp);
    }).toThrowError(
      'A module with providers was imported from "StandaloneCmp". Modules with providers are not supported in standalone components imports.',
    );
  });

  it('should support forwardRef imports', () => {
    @Component({
      selector: 'test',
      imports: [forwardRef(() => StandaloneComponent)],
      template: `(<other-standalone></other-standalone>)`,
    })
    class TestComponent {}

    @Component({selector: 'other-standalone', template: `standalone component`})
    class StandaloneComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(standalone component)');
  });

  describe('schemas', () => {
    it('should allow schemas in standalone component', () => {
      @Component({
        template: '<maybe-custom-elm></maybe-custom-elm>',
        schemas: [NO_ERRORS_SCHEMA],
      })
      class AppCmp {}

      const fixture = TestBed.createComponent(AppCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toBe('<maybe-custom-elm></maybe-custom-elm>');
    });

    it('should error when schemas are specified for a non-standalone component', () => {
      @Component({
        template: '',
        schemas: [NO_ERRORS_SCHEMA],
        standalone: false,
      })
      class AppCmp {}

      expect(() => {
        TestBed.createComponent(AppCmp);
      }).toThrowError(
        `The 'schemas' was specified for the AppCmp but is only valid on a component that is standalone.`,
      );
    });
  });

  describe('unknown template elements', () => {
    const unknownElErrorRegex = (tag: string) => {
      const prefix = `'${tag}' is not a known element \\(used in the 'AppCmp' component template\\):`;
      const message1 = `1. If '${tag}' is an Angular component, then verify that it is included in the '@Component.imports' of this component.`;
      const message2 = `2. If '${tag}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.`;
      return new RegExp(`${prefix}s*\ns*${message1}s*\ns*${message2}`);
    };

    it('should warn the user when an unknown element is present', () => {
      const spy = spyOn(console, 'error');
      @Component({
        template: '<unknown-tag></unknown-tag>',
      })
      class AppCmp {}

      TestBed.createComponent(AppCmp);

      const errorRegex = unknownElErrorRegex('unknown-tag');
      expect(spy).toHaveBeenCalledOnceWith(jasmine.stringMatching(errorRegex));
    });

    it('should warn the user when multiple unknown elements are present', () => {
      const spy = spyOn(console, 'error');
      @Component({
        template: '<unknown-tag-A></unknown-tag-A><unknown-tag-B></unknown-tag-B>',
      })
      class AppCmp {}

      TestBed.createComponent(AppCmp);

      const errorRegexA = unknownElErrorRegex('unknown-tag-A');
      const errorRegexB = unknownElErrorRegex('unknown-tag-B');

      expect(spy).toHaveBeenCalledWith(jasmine.stringMatching(errorRegexA));
      expect(spy).toHaveBeenCalledWith(jasmine.stringMatching(errorRegexB));
    });

    it('should not warn the user when an unknown element is present inside an ng-template', () => {
      const spy = spyOn(console, 'error');
      @Component({
        template: '<ng-template><unknown-tag></unknown-tag><ng-template>',
      })
      class AppCmp {}

      TestBed.createComponent(AppCmp);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should warn the user when an unknown element is present in an instantiated embedded view', () => {
      const spy = spyOn(console, 'error');
      @Component({
        template: '<ng-template [ngIf]="true"><unknown-tag></unknown-tag><ng-template>',
        imports: [CommonModule],
      })
      class AppCmp {}

      const fixture = TestBed.createComponent(AppCmp);
      fixture.detectChanges();

      const errorRegex = unknownElErrorRegex('unknown-tag');
      expect(spy).toHaveBeenCalledOnceWith(jasmine.stringMatching(errorRegex));
    });
  });

  /*
    The following test verify that we don't impose limits when it comes to extending components of
    various type (standalone vs. non-standalone).

    This is based on the reasoning that the "template"
    / "templateUrl", "imports", "schemas" and "standalone" properties are all related and they
    specify how to compile a template. As of today extending a component means providing a new
    template and this implies providing compiler configuration for a new template. In this sense
    neither a template nor its compiler configuration is carried over from a class being extended
    (we can think of each component being a "fresh copy" when it comes to a template and its
    compiler configuration).
   */
  describe('inheritance', () => {
    it('should allow extending a regular component and turn it into a standalone one', () => {
      @Component({
        selector: 'regular',
        template: 'regular: {{input}}',
        standalone: false,
      })
      class RegularCmp {
        @Input() input: string | undefined;
      }

      @Component({selector: 'standalone', template: 'standalone: {{input}}'})
      class StandaloneCmp extends RegularCmp {}

      const fixture = TestBed.createComponent(StandaloneCmp);
      fixture.componentInstance.input = 'input value';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('standalone: input value');
    });

    it('should allow extending a regular component and turn it into a standalone one', () => {
      @Component({selector: 'standalone', template: 'standalone: {{in}}'})
      class StandaloneCmp {
        @Input() input: string | undefined;
      }

      @Component({
        selector: 'regular',
        template: 'regular: {{input}}',
        standalone: false,
      })
      class RegularCmp extends StandaloneCmp {}

      const fixture = TestBed.createComponent(RegularCmp);
      fixture.componentInstance.input = 'input value';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('regular: input value');
    });

    it('should ?', () => {
      @Component({
        selector: 'inner',
        template: 'inner',
      })
      class InnerCmp {}

      @Component({
        selector: 'standalone',
        template: 'standalone: {{input}}; (<inner></inner>)',
        imports: [InnerCmp],
      })
      class StandaloneCmp {
        @Input() input: string | undefined;
      }

      @Component({
        selector: 'regular',
        standalone: false,
      })
      class RegularCmp extends StandaloneCmp {}

      const fixture = TestBed.createComponent(RegularCmp);
      fixture.componentInstance.input = 'input value';
      fixture.detectChanges();
      // the assumption here is that not providing a template is equivalent to providing an empty
      // one
      expect(fixture.nativeElement.textContent).toBe('');
    });
  });

  describe('isStandalone()', () => {
    it('should return `true` if component is standalone', () => {
      @Component({selector: 'standalone-cmp'})
      class StandaloneCmp {}

      expect(isStandalone(StandaloneCmp)).toBeTrue();
    });

    it('should return `true` if component is standalone (with `standalone:true`)', () => {
      @Component({selector: 'standalone-cmp'})
      class StandaloneCmp {}

      expect(isStandalone(StandaloneCmp)).toBeTrue();
    });

    it('should return `false` if component is not standalone', () => {
      @Component({selector: 'standalone-cmp', standalone: false})
      class StandaloneCmp {}

      expect(isStandalone(StandaloneCmp)).toBeFalse();
    });

    it('should return `true` if directive is standalone', () => {
      @Directive({selector: '[standaloneDir]'})
      class StandAloneDirective {}

      expect(isStandalone(StandAloneDirective)).toBeTrue();
    });

    it('should return `false` if directive is standalone', () => {
      @Directive({selector: '[standaloneDir]', standalone: false})
      class StandAloneDirective {}

      expect(isStandalone(StandAloneDirective)).toBeFalse();
    });

    it('should return `true` if pipe is standalone', () => {
      @Pipe({name: 'standalonePipe'})
      class StandAlonePipe {}

      expect(isStandalone(StandAlonePipe)).toBeTrue();
    });

    it('should return `false` if pipe is standalone', () => {
      @Pipe({name: 'standalonePipe', standalone: false})
      class StandAlonePipe {}

      expect(isStandalone(StandAlonePipe)).toBeFalse();
    });

    it('should return `false` if the class is not annotated', () => {
      class NonAnnotatedClass {}

      expect(isStandalone(NonAnnotatedClass)).toBeFalse();
    });

    it('should return `false` if the class is an NgModule', () => {
      @NgModule({})
      class Module {}

      expect(isStandalone(Module)).toBeFalse();
    });

    it('should render a recursive cycle of standalone components', () => {
      @Component({
        selector: 'cmp-a',
        template: '<ng-template [ngIf]="false"><cmp-c></cmp-c></ng-template>A',
        imports: [forwardRef(() => StandaloneCmpC)],
      })
      class StandaloneCmpA {}

      @Component({
        selector: 'cmp-b',
        template: '(<cmp-a></cmp-a>)B',
        imports: [StandaloneCmpA],
      })
      class StandaloneCmpB {}

      @Component({
        selector: 'cmp-c',
        template: '(<cmp-b></cmp-b>)C',
        imports: [StandaloneCmpB],
      })
      class StandaloneCmpC {}

      TestBed.configureTestingModule({imports: [StandaloneCmpC]});
      const fixture = TestBed.createComponent(StandaloneCmpC);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('((A)B)C');
    });
  });
});
