/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  assertInInjectionContext,
  Attribute,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createEnvironmentInjector,
  createNgModule,
  Directive,
  ElementRef,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  EventEmitter,
  forwardRef,
  Host,
  HOST_TAG_NAME,
  HostAttributeToken,
  HostBinding,
  importProvidersFrom,
  ImportProvidersSource,
  inject,
  Inject,
  Injectable,
  InjectionToken,
  InjectOptions,
  INJECTOR,
  Injector,
  Input,
  LOCALE_ID,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
  NgModuleRef,
  NgZone,
  Optional,
  Output,
  Pipe,
  PipeTransform,
  Provider,
  runInInjectionContext,
  Self,
  SkipSelf,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ViewRef,
  ɵcreateInjector as createInjector,
  ɵDEFAULT_LOCALE_ID as DEFAULT_LOCALE_ID,
  ɵINJECTOR_SCOPE,
  ɵInternalEnvironmentProviders as InternalEnvironmentProviders,
  DestroyRef,
} from '../../src/core';
import {RuntimeError, RuntimeErrorCode} from '../../src/errors';
import {ViewRef as ViewRefInternal} from '../../src/render3/view_ref';
import {TestBed} from '../../testing';
import {By} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs';

const getProvidersByToken = (
  providers: Provider[],
  token: Type<unknown> | InjectionToken<unknown>,
): Provider[] => providers.filter((provider) => (provider as any).provide === token);

const hasProviderWithToken = (providers: Provider[], token: InjectionToken<unknown>): boolean =>
  getProvidersByToken(providers, token).length > 0;

const collectEnvironmentInitializerProviders = (providers: Provider[]) =>
  getProvidersByToken(providers, ENVIRONMENT_INITIALIZER);

function unwrappedImportProvidersFrom(...sources: ImportProvidersSource[]): Provider[] {
  const providers = (importProvidersFrom(...sources) as unknown as InternalEnvironmentProviders)
    .ɵproviders;
  if (providers.some((provider) => 'ɵproviders' in provider)) {
    throw new Error(`Unexpected nested EnvironmentProviders in test`);
  }
  return providers as Provider[];
}

describe('importProvidersFrom', () => {
  // Set of tokens used in various tests.
  const A = new InjectionToken('A');
  const B = new InjectionToken('B');
  const C = new InjectionToken('C');
  const D = new InjectionToken('D');

  it('should collect providers from NgModules', () => {
    @NgModule({
      providers: [
        {provide: C, useValue: 'C'},
        {provide: D, useValue: 'D'},
      ],
    })
    class MyModule2 {}
    @NgModule({
      imports: [MyModule2],
      providers: [
        {provide: A, useValue: 'A'},
        {provide: B, useValue: 'B'},
      ],
    })
    class MyModule {}
    const providers = unwrappedImportProvidersFrom(MyModule);

    // 4 tokens (A, B, C, D) + 2 providers for each NgModule:
    // - the definition type itself
    // - `INJECTOR_DEF_TYPES`
    // - `ENVIRONMENT_INITIALIZER`
    expect(providers.length).toBe(10);

    expect(hasProviderWithToken(providers, A)).toBe(true);
    expect(hasProviderWithToken(providers, B)).toBe(true);
    expect(hasProviderWithToken(providers, C)).toBe(true);
    expect(hasProviderWithToken(providers, D)).toBe(true);

    // Expect 2 `ENVIRONMENT_INITIALIZER` providers: one for `MyModule`, another was `MyModule2`
    expect(collectEnvironmentInitializerProviders(providers).length).toBe(2);
  });

  it('should collect providers from directly imported ModuleWithProviders', () => {
    @NgModule({})
    class Module {}

    const providers = unwrappedImportProvidersFrom({
      ngModule: Module,
      providers: [{provide: A, useValue: 'A'}],
    });
    expect(hasProviderWithToken(providers, A)).toBe(true);
  });

  it('should collect all providers when a module is used twice with different providers (via ModuleWithProviders)', () => {
    @NgModule({
      providers: [
        {provide: A, useValue: 'A'}, //
      ],
    })
    class ModuleA {}

    @NgModule({imports: [ModuleA]})
    class ModuleB {
      static forRoot(): ModuleWithProviders<ModuleB> {
        return {ngModule: ModuleB, providers: [{provide: B, useValue: 'B'}]};
      }
      static forChild(): ModuleWithProviders<ModuleB> {
        return {ngModule: ModuleB, providers: [{provide: C, useValue: 'C'}]};
      }
    }

    const providers = unwrappedImportProvidersFrom(ModuleB.forRoot(), ModuleB.forChild());

    // Expect 2 `ENVIRONMENT_INITIALIZER` providers: one for `ModuleA`, another one for `ModuleB`
    expect(collectEnvironmentInitializerProviders(providers).length).toBe(2);

    // Expect exactly 1 provider for each module: `ModuleA` and `ModuleB`
    expect(getProvidersByToken(providers, ModuleA).length).toBe(1);
    expect(getProvidersByToken(providers, ModuleB).length).toBe(1);

    // Expect all tokens to be collected.
    expect(hasProviderWithToken(providers, A)).toBe(true);
    expect(hasProviderWithToken(providers, B)).toBe(true);
    expect(hasProviderWithToken(providers, C)).toBe(true);
  });

  it('should process nested arrays within a provider set of ModuleWithProviders type', () => {
    @NgModule()
    class ModuleA {
      static forRoot(): ModuleWithProviders<ModuleA> {
        return {
          ngModule: ModuleA,
          providers: [
            {provide: A, useValue: 'A'},
            // Nested arrays inside the list of providers:
            [{provide: B, useValue: 'B'}, [{provide: C, useValue: 'C'}]],
          ],
        };
      }
    }

    const providers = unwrappedImportProvidersFrom(ModuleA.forRoot());

    // Expect 1 `ENVIRONMENT_INITIALIZER` provider (for `ModuleA`)
    expect(collectEnvironmentInitializerProviders(providers).length).toBe(1);

    // Expect exactly 1 provider for `ModuleA`
    expect(getProvidersByToken(providers, ModuleA).length).toBe(1);

    // Expect all tokens to be collected.
    expect(hasProviderWithToken(providers, A)).toBe(true);
    expect(hasProviderWithToken(providers, B)).toBe(true);
    expect(hasProviderWithToken(providers, C)).toBe(true);
  });

  it('should process nested arrays within provider set of an imported ModuleWithProviders type', () => {
    @NgModule()
    class ModuleA {
      static forRoot(): ModuleWithProviders<ModuleA> {
        return {
          ngModule: ModuleA,
          providers: [
            {provide: A, useValue: 'A'},
            // Nested arrays inside the list of providers:
            [{provide: B, useValue: 'B'}, [{provide: C, useValue: 'C'}]],
          ],
        };
      }
    }

    @NgModule({imports: [ModuleA.forRoot()]})
    class ModuleB {}

    const providers = unwrappedImportProvidersFrom(ModuleB);

    // Expect 2 `ENVIRONMENT_INITIALIZER` providers: one for `ModuleA`, another one for `ModuleB`
    expect(collectEnvironmentInitializerProviders(providers).length).toBe(2);

    // Expect exactly 1 provider for each module: `ModuleA` and `ModuleB`
    expect(getProvidersByToken(providers, ModuleA).length).toBe(1);
    expect(getProvidersByToken(providers, ModuleB).length).toBe(1);

    // Expect all tokens to be collected.
    expect(hasProviderWithToken(providers, A)).toBe(true);
    expect(hasProviderWithToken(providers, B)).toBe(true);
    expect(hasProviderWithToken(providers, C)).toBe(true);
  });

  it('should collect providers defined via `@NgModule.providers` when ModuleWithProviders type is used', () => {
    @NgModule({
      providers: [
        {provide: A, useValue: 'Original A'}, //
        {provide: B, useValue: 'B'}, //
        {provide: D, useValue: 'Original D', multi: true},
      ],
    })
    class ModuleA {
      static forRoot(): ModuleWithProviders<ModuleA> {
        return {
          ngModule: ModuleA,
          providers: [
            {provide: A, useValue: 'Overridden A'}, //
            {provide: C, useValue: 'C'}, //
            {provide: D, useValue: 'Extra D', multi: true},
          ],
        };
      }
    }

    const providers = unwrappedImportProvidersFrom(ModuleA.forRoot());

    // Expect all tokens to be collected.
    expect(hasProviderWithToken(providers, A)).toBe(true);
    expect(hasProviderWithToken(providers, B)).toBe(true);
    expect(hasProviderWithToken(providers, C)).toBe(true);
    expect(hasProviderWithToken(providers, D)).toBe(true);

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const injector = createEnvironmentInjector(providers, parentEnvInjector);

    // Verify that overridden token A has the right value.
    expect(injector.get(A)).toBe('Overridden A');

    // Verify that a multi-provider has both values.
    expect(injector.get(D)).toEqual(['Original D', 'Extra D']);
  });

  it('should not be allowed in component providers', () => {
    @NgModule({})
    class Module {}

    expect(() => {
      @Component({
        selector: 'test-cmp',
        template: '',
        // The double array here is necessary to escape the compile-time error, via Provider's
        // `any[]` option.
        providers: [[importProvidersFrom(Module)]],
        standalone: false,
      })
      class Cmp {}

      TestBed.createComponent(Cmp);
    }).toThrowError(/NG0207/);
  });

  it('should import providers from an array of NgModules (may be nested)', () => {
    @NgModule({providers: [{provide: A, useValue: 'A'}]})
    class ModuleA {}

    @NgModule({providers: [{provide: B, useValue: 'B'}]})
    class ModuleB {}

    const providers = unwrappedImportProvidersFrom([ModuleA, [ModuleB]]);

    expect(hasProviderWithToken(providers, A)).toBeTrue();
    expect(hasProviderWithToken(providers, B)).toBeTrue();
  });

  it('should throw when trying to import providers from standalone components', () => {
    @NgModule({providers: [{provide: A, useValue: 'A'}]})
    class ModuleA {}

    @Component({
      template: '',
      imports: [ModuleA],
    })
    class StandaloneCmp {}

    expect(() => {
      importProvidersFrom(StandaloneCmp);
    }).toThrowError(
      'NG0800: Importing providers supports NgModule or ModuleWithProviders but got a standalone component "StandaloneCmp"',
    );
  });
});

describe('EnvironmentProviders', () => {
  const TOKEN = new InjectionToken<string>('TOKEN');
  const environmentProviders = makeEnvironmentProviders([
    {
      provide: TOKEN,
      useValue: 'token!',
    },
  ]);

  it('should be accepted by TestBed providers', () => {
    TestBed.configureTestingModule({
      providers: [environmentProviders],
    });

    expect(TestBed.inject(TOKEN)).toEqual('token!');
  });

  it('should be accepted by @NgModule & createNgModule', () => {
    @NgModule({
      providers: [environmentProviders],
    })
    class TestModule {}

    const inj = createNgModule(TestModule).injector;
    expect(inj.get(TOKEN)).toEqual('token!');
  });

  it('should be accepted by @NgModule & TestBed imports', () => {
    @NgModule({
      providers: [environmentProviders],
    })
    class TestModule {}

    TestBed.configureTestingModule({
      imports: [TestModule],
    });

    expect(TestBed.inject(TOKEN)).toEqual('token!');
  });

  it('should be accepted in ModuleWithProviders & createNgModule', () => {
    @NgModule({})
    class EmptyModule {}

    const mwp: ModuleWithProviders<EmptyModule> = {
      ngModule: EmptyModule,
      providers: [environmentProviders],
    };

    @NgModule({
      imports: [mwp],
    })
    class TestModule {}

    const inj = createNgModule(TestModule).injector;
    expect(inj.get(TOKEN)).toEqual('token!');
  });

  it('should be accepted by createEnvironmentInjector', () => {
    TestBed.configureTestingModule({});
    const inj = createEnvironmentInjector(
      [environmentProviders],
      TestBed.inject(EnvironmentInjector),
    );
    expect(inj.get(TOKEN)).toEqual('token!');
  });

  it('should be accepted as additional input to makeEnvironmentProviders', () => {
    const wrappedProviders = makeEnvironmentProviders([environmentProviders]);
    TestBed.configureTestingModule({});

    const inj = createEnvironmentInjector([wrappedProviders], TestBed.inject(EnvironmentInjector));
    expect(inj.get(TOKEN)).toEqual('token!');
  });

  it('should be overridable by TestBed overrides', () => {
    TestBed.configureTestingModule({
      providers: [environmentProviders],
    });
    TestBed.overrideProvider(TOKEN, {
      useValue: 'overridden!',
    });

    expect(TestBed.inject(TOKEN)).toEqual('overridden!');
  });

  it('should be rejected by @Component.providers', () => {
    @Component({
      providers: [environmentProviders as any],
      standalone: false,
    })
    class TestCmp {
      readonly token = inject(TOKEN);
    }

    expect(() => TestBed.createComponent(TestCmp)).toThrowError(/NG0207/);
  });
});

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      @Directive({
        selector: '[dir]',
        exportAs: 'dir',
        standalone: false,
      })
      class MyDirective {
        value = 'Created';
      }
      @Component({
        template: '<div dir #dir="dir">{{ dir.value }}</div>',
        standalone: false,
      })
      class MyComp {}
      TestBed.configureTestingModule({declarations: [MyDirective, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toContain('Created');
    });
  });

  describe('multi providers', () => {
    it('should process ModuleWithProvider providers after module imports', () => {
      const testToken = new InjectionToken<string[]>('test-multi');

      @NgModule({providers: [{provide: testToken, useValue: 'A', multi: true}]})
      class TestModuleA {}

      @NgModule({providers: [{provide: testToken, useValue: 'B', multi: true}]})
      class TestModuleB {}

      TestBed.configureTestingModule({
        imports: [
          {
            ngModule: TestModuleA,
            providers: [{provide: testToken, useValue: 'C', multi: true}],
          },
          TestModuleB,
        ],
      });

      expect(TestBed.inject(testToken)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('directive injection', () => {
    let log: string[] = [];

    @Directive({
      selector: '[dirB]',
      exportAs: 'dirB',
      standalone: false,
    })
    class DirectiveB {
      @Input() value = 'DirB';

      constructor() {
        log.push(this.value);
      }
    }

    beforeEach(() => (log = []));

    it('should create directive with intra view dependencies', () => {
      @Directive({
        selector: '[dirA]',
        exportAs: 'dirA',
        standalone: false,
      })
      class DirectiveA {
        value = 'DirA';
      }

      @Directive({
        selector: '[dirC]',
        exportAs: 'dirC',
        standalone: false,
      })
      class DirectiveC {
        value: string;

        constructor(dirA: DirectiveA, dirB: DirectiveB) {
          this.value = dirA.value + dirB.value;
        }
      }

      @Component({
        template: `
        <div dirA>
          <span dirB dirC #dir="dirC">{{ dir.value }}</span>
        </div>
      `,
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, DirectiveC, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('span');
      expect(divElement.textContent).toContain('DirADirB');
    });

    it('should instantiate injected directives in dependency order', () => {
      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        value = 'dirA';

        constructor(dirB: DirectiveB) {
          log.push(`DirA (dep: ${dirB.value})`);
        }
      }

      @Component({
        template: '<div dirA dirB></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (dep: DirB)']);
    });

    it('should fallback to the module injector', () => {
      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        value = 'dirA';

        constructor(dirB: DirectiveB) {
          log.push(`DirA (dep: ${dirB.value})`);
        }
      }

      // - dirB is know to the node injectors
      // - then when dirA tries to inject dirB, it will check the node injector first tree
      // - if not found, it will check the module injector tree
      @Component({
        template: '<div dirB></div><div dirA></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({
        declarations: [DirectiveA, DirectiveB, MyComp],
        providers: [{provide: DirectiveB, useValue: {value: 'module'}}],
      });
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (dep: module)']);
    });

    it('should instantiate injected directives before components', () => {
      @Component({
        selector: 'my-comp',
        template: '',
        standalone: false,
      })
      class MyComp {
        constructor(dirB: DirectiveB) {
          log.push(`Comp (dep: ${dirB.value})`);
        }
      }

      @Component({
        template: '<my-comp dirB></my-comp>',
        standalone: false,
      })
      class MyApp {}

      TestBed.configureTestingModule({declarations: [DirectiveB, MyComp, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'Comp (dep: DirB)']);
    });

    it('should inject directives in the correct order in a for loop', () => {
      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(dir: DirectiveB) {
          log.push(`DirA (dep: ${dir.value})`);
        }
      }

      @Component({
        template: '<div dirA dirB *ngFor="let i of array"></div>',
        standalone: false,
      })
      class MyComp {
        array = [1, 2, 3];
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual([
        'DirB',
        'DirA (dep: DirB)',
        'DirB',
        'DirA (dep: DirB)',
        'DirB',
        'DirA (dep: DirB)',
      ]);
    });

    it('should instantiate directives with multiple out-of-order dependencies', () => {
      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        value = 'DirA';

        constructor() {
          log.push(this.value);
        }
      }

      @Directive({
        selector: '[dirC]',
        standalone: false,
      })
      class DirectiveC {
        value = 'DirC';

        constructor() {
          log.push(this.value);
        }
      }

      @Directive({
        selector: '[dirB]',
        standalone: false,
      })
      class DirectiveB {
        constructor(dirA: DirectiveA, dirC: DirectiveC) {
          log.push(`DirB (deps: ${dirA.value} and ${dirC.value})`);
        }
      }

      @Component({
        template: '<div dirA dirB dirC></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, DirectiveC, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirA', 'DirC', 'DirB (deps: DirA and DirC)']);
    });

    it('should instantiate in the correct order for complex case', () => {
      @Directive({
        selector: '[dirC]',
        standalone: false,
      })
      class DirectiveC {
        value = 'DirC';

        constructor(dirB: DirectiveB) {
          log.push(`DirC (dep: ${dirB.value})`);
        }
      }

      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        value = 'DirA';

        constructor(dirC: DirectiveC) {
          log.push(`DirA (dep: ${dirC.value})`);
        }
      }

      @Directive({
        selector: '[dirD]',
        standalone: false,
      })
      class DirectiveD {
        value = 'DirD';

        constructor(dirA: DirectiveA) {
          log.push(`DirD (dep: ${dirA.value})`);
        }
      }

      @Component({
        selector: 'my-comp',
        template: '',
        standalone: false,
      })
      class MyComp {
        constructor(dirD: DirectiveD) {
          log.push(`Comp (dep: ${dirD.value})`);
        }
      }

      @Component({
        template: '<my-comp dirA dirB dirC dirD></my-comp>',
        standalone: false,
      })
      class MyApp {}

      TestBed.configureTestingModule({
        declarations: [DirectiveA, DirectiveB, DirectiveC, DirectiveD, MyComp, MyApp],
      });
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual([
        'DirB',
        'DirC (dep: DirB)',
        'DirA (dep: DirC)',
        'DirD (dep: DirA)',
        'Comp (dep: DirD)',
      ]);
    });

    it('should instantiate in correct order with mixed parent and peer dependencies', () => {
      @Component({
        template: '<div dirA dirB dirC></div>',
        standalone: false,
      })
      class MyApp {
        value = 'App';
      }

      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(dirB: DirectiveB, app: MyApp) {
          log.push(`DirA (deps: ${dirB.value} and ${app.value})`);
        }
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (deps: DirB and App)']);
    });

    it('should not use a parent when peer dep is available', () => {
      let count = 1;

      @Directive({
        selector: '[dirB]',
        standalone: false,
      })
      class DirectiveB {
        count: number;

        constructor() {
          log.push(`DirB`);
          this.count = count++;
        }
      }

      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(dirB: DirectiveB) {
          log.push(`DirA (dep: DirB - ${dirB.count})`);
        }
      }

      @Component({
        selector: 'my-comp',
        template: '<div dirA dirB></div>',
        standalone: false,
      })
      class MyComp {}

      @Component({
        template: '<my-comp dirB></my-comp>',
        standalone: false,
      })
      class MyApp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirB', 'DirA (dep: DirB - 2)']);
    });

    describe('dependencies in parent views', () => {
      @Directive({
        selector: '[dirA]',
        exportAs: 'dirA',
        standalone: false,
      })
      class DirectiveA {
        injector: Injector;

        constructor(
          public dirB: DirectiveB,
          public vcr: ViewContainerRef,
        ) {
          this.injector = vcr.injector;
        }
      }

      @Component({
        selector: 'my-comp',
        template: '<div dirA #dir="dirA">{{ dir.dirB.value }}</div>',
        standalone: false,
      })
      class MyComp {}

      it('should find dependencies on component hosts', () => {
        @Component({
          template: '<my-comp dirB></my-comp>',
          standalone: false,
        })
        class MyApp {}

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies for directives in embedded views', () => {
        @Component({
          template: `<div dirB>
            <div *ngIf="showing">
              <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
            </div>
          </div>`,
          standalone: false,
        })
        class MyApp {
          showing = false;
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.componentInstance.showing = true;
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies of directives nested deeply in inline views', () => {
        @Component({
          template: `<div dirB>
            <ng-container *ngIf="!skipContent">
              <ng-container *ngIf="!skipContent2">
                <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
              </ng-container>
            </ng-container>
          </div>`,
          standalone: false,
        })
        class MyApp {
          skipContent = false;
          skipContent2 = false;
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies in declaration tree of ng-template (not insertion tree)', () => {
        @Directive({
          selector: '[structuralDir]',
          standalone: false,
        })
        class StructuralDirective {
          @Input() tmp!: TemplateRef<any>;

          constructor(public vcr: ViewContainerRef) {}

          create() {
            this.vcr.createEmbeddedView(this.tmp);
          }
        }

        @Component({
          template: `<div dirB value="declaration">
           <ng-template #foo>
               <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
           </ng-template>
         </div>

         <div dirB value="insertion">
           <div structuralDir [tmp]="foo"></div>
           <!-- insertion point -->
         </div>`,
          standalone: false,
        })
        class MyComp {
          @ViewChild(StructuralDirective) structuralDir!: StructuralDirective;
        }

        TestBed.configureTestingModule({
          declarations: [StructuralDirective, DirectiveA, DirectiveB, MyComp],
        });
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        fixture.componentInstance.structuralDir.create();
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div[value=insertion]');
        expect(divElement.textContent).toEqual('declaration');
      });

      it('should create injectors on second template pass', () => {
        @Component({
          template: `<div>
            <my-comp dirB></my-comp>
            <my-comp dirB></my-comp>
          </div>`,
          standalone: false,
        })
        class MyApp {}

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirBDirB');
      });

      it('should create injectors and host bindings in same view', () => {
        @Directive({
          selector: '[hostBindingDir]',
          standalone: false,
        })
        class HostBindingDirective {
          @HostBinding('id') id = 'foo';
        }

        @Component({
          template: `<div dirB hostBindingDir>
            <p dirA #dir="dirA">{{ dir.dirB.value }}</p>
          </div>`,
          standalone: false,
        })
        class MyApp {
          @ViewChild(HostBindingDirective) hostBindingDir!: HostBindingDirective;
          @ViewChild(DirectiveA) dirA!: DirectiveA;
        }

        TestBed.configureTestingModule({
          declarations: [DirectiveA, DirectiveB, HostBindingDirective, MyApp],
        });
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
        expect(divElement.id).toEqual('foo');

        const dirA = fixture.componentInstance.dirA;
        expect(dirA.vcr.injector).toEqual(dirA.injector);

        const hostBindingDir = fixture.componentInstance.hostBindingDir;
        hostBindingDir.id = 'bar';
        fixture.detectChanges();
        expect(divElement.id).toBe('bar');
      });

      it('dynamic components should find dependencies when parent is projected', () => {
        @Directive({
          selector: '[dirA]',
          standalone: false,
        })
        class DirA {}
        @Directive({
          selector: '[dirB]',
          standalone: false,
        })
        class DirB {}
        @Component({
          selector: 'child',
          template: '',
          standalone: false,
        })
        class Child {
          constructor(
            @Optional() readonly dirA: DirA,
            @Optional() readonly dirB: DirB,
          ) {}
        }
        @Component({
          selector: 'projector',
          template: '<ng-content></ng-content>',
          standalone: false,
        })
        class Projector {}

        @Component({
          template: `
          <projector>
            <div dirA>
              <ng-container #childOrigin></ng-container>
              <ng-container #childOriginWithDirB dirB></ng-container>
            </div>
          </projector>`,
          standalone: false,
        })
        class MyApp {
          @ViewChild('childOrigin', {read: ViewContainerRef, static: true})
          childOrigin!: ViewContainerRef;
          @ViewChild('childOriginWithDirB', {read: ViewContainerRef, static: true})
          childOriginWithDirB!: ViewContainerRef;

          addChild() {
            return this.childOrigin.createComponent(Child);
          }
          addChildWithDirB() {
            return this.childOriginWithDirB.createComponent(Child);
          }
        }

        const fixture = TestBed.configureTestingModule({
          declarations: [Child, DirA, DirB, Projector, MyApp],
        }).createComponent(MyApp);
        const child = fixture.componentInstance.addChild();
        expect(child).toBeDefined();
        expect(child.instance.dirA)
          .withContext('dirA should be found. It is on the parent of the viewContainerRef.')
          .not.toBeNull();
        const child2 = fixture.componentInstance.addChildWithDirB();
        expect(child2).toBeDefined();
        expect(child2.instance.dirA)
          .withContext('dirA should be found. It is on the parent of the viewContainerRef.')
          .not.toBeNull();
        expect(child2.instance.dirB)
          .withContext(
            'dirB appears on the ng-container and should not be found because the ' +
              'viewContainerRef.createComponent node is inserted next to the container.',
          )
          .toBeNull();
      });
    });

    it('should throw if directive is not found anywhere', () => {
      @Directive({
        selector: '[dirB]',
        standalone: false,
      })
      class DirectiveB {
        constructor() {}
      }

      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(siblingDir: DirectiveB) {}
      }

      @Component({
        template: '<div dirA></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp)).toThrowError(
        /NG0201: No provider found for `DirectiveB`/,
      );
    });

    it('should throw if directive is not found in ancestor tree', () => {
      @Directive({
        selector: '[dirB]',
        standalone: false,
      })
      class DirectiveB {
        constructor() {}
      }

      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(siblingDir: DirectiveB) {}
      }

      @Component({
        template: '<div dirA></div><div dirB></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp)).toThrowError(
        /NG0201\: No provider found for `DirectiveB`/,
      );
    });

    it('should not have access to the directive injector in a standalone injector from within a directive-level provider factory', () => {
      // https://github.com/angular/angular/issues/42651
      class TestA {
        constructor(public injector: string) {}
      }
      class TestB {
        constructor(public a: TestA) {}
      }

      function createTestB() {
        // Setup a standalone injector that provides `TestA`, which is resolved from a
        // standalone child injector that requests `TestA` as a dependency for `TestB`.
        // Although we're inside a directive factory and therefore have access to the
        // directive-level injector, `TestA` has to be resolved from the standalone injector.
        const parent = Injector.create({
          providers: [{provide: TestA, useFactory: () => new TestA('standalone'), deps: []}],
          name: 'TestA',
        });
        const child = Injector.create({
          providers: [{provide: TestB, useClass: TestB, deps: [TestA]}],
          parent,
          name: 'TestB',
        });
        return child.get(TestB);
      }

      @Component({
        template: '',
        providers: [
          {provide: TestA, useFactory: () => new TestA('component'), deps: []},
          {provide: TestB, useFactory: createTestB},
        ],
        standalone: false,
      })
      class MyComp {
        constructor(public readonly testB: TestB) {}
      }

      TestBed.configureTestingModule({declarations: [MyComp]});

      const cmp = TestBed.createComponent(MyComp);
      expect(cmp.componentInstance.testB).toBeInstanceOf(TestB);
      expect(cmp.componentInstance.testB.a.injector).toBe('standalone');
    });

    it('should not have access to the directive injector in a standalone injector from within a directive-level provider factory', () => {
      class TestA {
        constructor(public injector: string) {}
      }
      class TestB {
        constructor(public a: TestA | null) {}
      }

      function createTestB() {
        // Setup a standalone injector that provides `TestB` with an optional dependency of
        // `TestA`. Since `TestA` is not provided by the standalone injector it should resolve
        // to null; both the NgModule providers and the component-level providers should not
        // be considered.
        const injector = Injector.create({
          providers: [{provide: TestB, useClass: TestB, deps: [[TestA, new Optional()]]}],
          name: 'TestB',
        });
        return injector.get(TestB);
      }

      @Component({
        template: '',
        providers: [
          {provide: TestA, useFactory: () => new TestA('component'), deps: []},
          {provide: TestB, useFactory: createTestB},
        ],
        standalone: false,
      })
      class MyComp {
        constructor(public readonly testB: TestB) {}
      }

      TestBed.configureTestingModule({
        declarations: [MyComp],
        providers: [{provide: TestA, useFactory: () => new TestA('module'), deps: []}],
      });

      const cmp = TestBed.createComponent(MyComp);
      expect(cmp.componentInstance.testB).toBeInstanceOf(TestB);
      expect(cmp.componentInstance.testB.a).toBeNull();
    });

    it('should throw if directive tries to inject itself', () => {
      @Directive({
        selector: '[dirA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(siblingDir: DirectiveA) {}
      }

      @Component({
        template: '<div dirA></div>',
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp)).toThrowError(
        'NG0200: Circular dependency detected for `DirectiveA`. ' +
          'Path: DirectiveA -> DirectiveA. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    describe('flags', () => {
      @Directive({
        selector: '[dirB]',
        standalone: false,
      })
      class DirectiveB {
        @Input('dirB') value = '';
      }

      describe('Optional', () => {
        @Directive({
          selector: '[dirA]',
          standalone: false,
        })
        class DirectiveA {
          constructor(@Optional() public dirB: DirectiveB) {}
        }

        it('should not throw if dependency is @Optional (module injector)', () => {
          @Component({
            template: '<div dirA></div>',
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveA) dirA!: DirectiveA;
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirA = fixture.componentInstance.dirA;
          expect(dirA.dirB).toBeNull();
        });

        it('should return null if @Optional dependency has @Self flag', () => {
          @Directive({
            selector: '[dirC]',
            standalone: false,
          })
          class DirectiveC {
            constructor(@Optional() @Self() public dirB: DirectiveB) {}
          }

          @Component({
            template: '<div dirC></div>',
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveC) dirC!: DirectiveC;
          }

          TestBed.configureTestingModule({declarations: [DirectiveC, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirC = fixture.componentInstance.dirC;
          expect(dirC.dirB).toBeNull();
        });

        it('should not throw if dependency is @Optional but defined elsewhere', () => {
          @Directive({
            selector: '[dirC]',
            standalone: false,
          })
          class DirectiveC {
            constructor(@Optional() public dirB: DirectiveB) {}
          }

          @Component({
            template: '<div dirB></div><div dirC></div>',
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveC) dirC!: DirectiveC;
          }

          TestBed.configureTestingModule({declarations: [DirectiveB, DirectiveC, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirC = fixture.componentInstance.dirC;
          expect(dirC.dirB).toBeNull();
        });

        it('should imply @Optional in presence of a default value', () => {
          const NON_EXISTING_PROVIDER = new InjectionToken<string>('non-existing');

          @Component({
            template: '',
            standalone: false,
          })
          class MyComp {
            value: string | undefined;
            constructor(injector: Injector) {
              this.value = injector.get(NON_EXISTING_PROVIDER, 'default', {host: true});
            }
          }

          const injector = Injector.create({providers: []});
          expect(injector.get(NON_EXISTING_PROVIDER, 'default', {host: true})).toBe('default');

          const fixture = TestBed.createComponent(MyComp);
          expect(fixture.componentInstance.value).toBe('default');
        });
      });

      it('should check only the current node with @Self', () => {
        @Directive({
          selector: '[dirA]',
          standalone: false,
        })
        class DirectiveA {
          constructor(@Self() public dirB: DirectiveB) {}
        }

        @Component({
          template: '<div dirB><div dirA></div></div>',
          standalone: false,
        })
        class MyComp {}
        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
        expect(() => TestBed.createComponent(MyComp)).toThrowError(
          /NG0201: No provider for DirectiveB found in NodeInjector/,
        );
      });

      describe('SkipSelf', () => {
        describe('Injectors', () => {
          it('should support @SkipSelf when injecting Injectors', () => {
            @Component({
              selector: 'parent',
              template: '<child></child>',
              providers: [
                {
                  provide: 'token',
                  useValue: 'PARENT',
                },
              ],
              standalone: false,
            })
            class ParentComponent {}

            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class ChildComponent {
              constructor(
                public injector: Injector,
                @SkipSelf() public parentInjector: Injector,
              ) {}
            }

            TestBed.configureTestingModule({
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            const childComponent = fixture.debugElement.query(
              By.directive(ChildComponent),
            ).componentInstance;
            expect(childComponent.injector.get('token')).toBe('CHILD');
            expect(childComponent.parentInjector.get('token')).toBe('PARENT');
          });

          it('should lookup module injector in case @SkipSelf is used and no suitable Injector found in element injector tree', () => {
            let componentInjector: Injector;
            let moduleInjector: Injector;
            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class MyComponent {
              constructor(@SkipSelf() public injector: Injector) {
                componentInjector = injector;
              }
            }

            @NgModule({
              declarations: [MyComponent],
              providers: [
                {
                  provide: 'token',
                  useValue: 'NG_MODULE',
                },
              ],
            })
            class MyModule {
              constructor(public injector: Injector) {
                moduleInjector = injector;
              }
            }

            TestBed.configureTestingModule({
              imports: [MyModule],
            });
            const fixture = TestBed.createComponent(MyComponent);
            fixture.detectChanges();

            expect(componentInjector!.get('token')).toBe('NG_MODULE');
            expect(moduleInjector!.get('token')).toBe('NG_MODULE');
          });

          it('should respect @Host in case @SkipSelf is used and no suitable Injector found in element injector tree', () => {
            let componentInjector: Injector;
            let moduleInjector: Injector;
            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class MyComponent {
              constructor(@Host() @SkipSelf() public injector: Injector) {
                componentInjector = injector;
              }
            }

            @NgModule({
              declarations: [MyComponent],
              providers: [
                {
                  provide: 'token',
                  useValue: 'NG_MODULE',
                },
              ],
            })
            class MyModule {
              constructor(public injector: Injector) {
                moduleInjector = injector;
              }
            }

            TestBed.configureTestingModule({
              imports: [MyModule],
            });

            expect(() => TestBed.createComponent(MyComponent)).toThrowError(
              /NG0201: No provider for Injector found in NodeInjector/,
            );
          });

          it('should throw when injecting Injectors using @SkipSelf and @Host and no Injectors are available in a current view', () => {
            @Component({
              selector: 'parent',
              template: '<child></child>',
              providers: [
                {
                  provide: 'token',
                  useValue: 'PARENT',
                },
              ],
              standalone: false,
            })
            class ParentComponent {}

            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class ChildComponent {
              constructor(@Host() @SkipSelf() public injector: Injector) {}
            }

            TestBed.configureTestingModule({
              declarations: [ParentComponent, ChildComponent],
            });

            const expectedErrorMessage = /NG0201: No provider for Injector found in NodeInjector/;
            expect(() => TestBed.createComponent(ParentComponent)).toThrowError(
              expectedErrorMessage,
            );
          });

          it('should not throw when injecting Injectors using @SkipSelf, @Host, and @Optional and no Injectors are available in a current view', () => {
            @Component({
              selector: 'parent',
              template: '<child></child>',
              providers: [
                {
                  provide: 'token',
                  useValue: 'PARENT',
                },
              ],
              standalone: false,
            })
            class ParentComponent {}

            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class ChildComponent {
              constructor(@Host() @SkipSelf() @Optional() public injector: Injector) {}
            }

            TestBed.configureTestingModule({
              declarations: [ParentComponent, ChildComponent],
            });

            const expectedErrorMessage = /NG0201: No provider for Injector found in NodeInjector/;
            expect(() => TestBed.createComponent(ParentComponent)).not.toThrowError(
              expectedErrorMessage,
            );
          });
        });

        describe('ElementRef', () => {
          // While tokens like `ElementRef` make sense only in a context of a NodeInjector,
          // ViewEngine also used `ModuleInjector` tree to lookup such tokens. In Ivy we replicate
          // this behavior for now to avoid breaking changes.
          it('should lookup module injector in case @SkipSelf is used for `ElementRef` token and Component has no parent', () => {
            let componentElement: ElementRef;
            let moduleElement: ElementRef;
            @Component({
              template: '<div>component</div>',
              standalone: false,
            })
            class MyComponent {
              constructor(@SkipSelf() public el: ElementRef) {
                componentElement = el;
              }
            }

            @NgModule({
              declarations: [MyComponent],
              providers: [
                {
                  provide: ElementRef,
                  useValue: {from: 'NG_MODULE'},
                },
              ],
            })
            class MyModule {
              constructor(public el: ElementRef) {
                moduleElement = el;
              }
            }

            TestBed.configureTestingModule({
              imports: [MyModule],
            });
            const fixture = TestBed.createComponent(MyComponent);
            fixture.detectChanges();

            expect((moduleElement! as any).from).toBe('NG_MODULE');
            expect((componentElement! as any).from).toBe('NG_MODULE');
          });

          it('should return host node when @SkipSelf is used for `ElementRef` token and Component has no parent node', () => {
            let parentElement: ElementRef;
            let componentElement: ElementRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class MyComponent {
              constructor(@SkipSelf() public el: ElementRef) {
                componentElement = el;
              }
            }

            @Component({
              template: '<child></child>',
              standalone: false,
            })
            class ParentComponent {
              constructor(public el: ElementRef) {
                parentElement = el;
              }
            }

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [ParentComponent, MyComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(componentElement!).toEqual(parentElement!);
          });

          it('should @SkipSelf on child directive node when injecting ElementRef on nested parent directive', () => {
            let parentRef: ElementRef;
            let childRef: ElementRef;

            @Directive({
              selector: '[parent]',
              standalone: false,
            })
            class ParentDirective {
              constructor(elementRef: ElementRef) {
                parentRef = elementRef;
              }
            }

            @Directive({
              selector: '[child]',
              standalone: false,
            })
            class ChildDirective {
              constructor(@SkipSelf() elementRef: ElementRef) {
                childRef = elementRef;
              }
            }

            @Component({
              template: '<div parent>parent <span child>child</span></div>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              declarations: [ParentDirective, ChildDirective, MyComp],
            });
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            // Assert against the `nativeElement` since Ivy always returns a new ElementRef.
            expect(childRef!.nativeElement).toBe(parentRef!.nativeElement);
            expect(childRef!.nativeElement.tagName).toBe('DIV');
          });
        });

        describe('@SkipSelf when parent contains embedded views', () => {
          it('should work for `ElementRef` token', () => {
            let requestedElementRef: ElementRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public elementRef: ElementRef) {
                requestedElementRef = elementRef;
              }
            }
            @Component({
              selector: 'root',
              template: '<div><child *ngIf="true"></child></div>',
              standalone: false,
            })
            class ParentComponent {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(requestedElementRef!.nativeElement).toEqual(fixture.nativeElement.firstChild);
            expect(requestedElementRef!.nativeElement.tagName).toEqual('DIV');
          });

          it('should work for `ElementRef` token with expanded *ngIf', () => {
            let requestedElementRef: ElementRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public elementRef: ElementRef) {
                requestedElementRef = elementRef;
              }
            }
            @Component({
              selector: 'root',
              template: '<div><ng-template [ngIf]="true"><child></child></ng-template></div>',
              standalone: false,
            })
            class ParentComponent {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(requestedElementRef!.nativeElement).toEqual(fixture.nativeElement.firstChild);
            expect(requestedElementRef!.nativeElement.tagName).toEqual('DIV');
          });

          it('should work for `ViewContainerRef` token', () => {
            let requestedRef: ViewContainerRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public ref: ViewContainerRef) {
                requestedRef = ref;
              }
            }

            @Component({
              selector: 'root',
              template: '<div><child *ngIf="true"></child></div>',
              standalone: false,
            })
            class ParentComponent {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(requestedRef!.element.nativeElement).toBe(fixture.nativeElement.firstChild);
            expect(requestedRef!.element.nativeElement.tagName).toBe('DIV');
          });

          it('should work for `ChangeDetectorRef` token', () => {
            let requestedChangeDetectorRef: ChangeDetectorRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public changeDetectorRef: ChangeDetectorRef) {
                requestedChangeDetectorRef = changeDetectorRef;
              }
            }

            @Component({
              selector: 'root',
              template: '<child *ngIf="true"></child>',
              standalone: false,
            })
            class ParentComponent {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            const {context} = requestedChangeDetectorRef! as ViewRefInternal<ParentComponent>;
            expect(context).toBe(fixture.componentInstance);
          });

          // this works consistently between VE and Ivy
          it('should work for Injectors', () => {
            let childComponentInjector: Injector;
            let parentComponentInjector: Injector;
            @Component({
              selector: 'parent',
              template: '<child *ngIf="true"></child>',
              providers: [
                {
                  provide: 'token',
                  useValue: 'PARENT',
                },
              ],
              standalone: false,
            })
            class ParentComponent {
              constructor(public injector: Injector) {
                parentComponentInjector = injector;
              }
            }

            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public injector: Injector) {
                childComponentInjector = injector;
              }
            }

            TestBed.configureTestingModule({
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(childComponentInjector!.get('token')).toBe(
              parentComponentInjector!.get('token'),
            );
          });

          it('should work for Injectors with expanded *ngIf', () => {
            let childComponentInjector: Injector;
            let parentComponentInjector: Injector;
            @Component({
              selector: 'parent',
              template: '<ng-template [ngIf]="true"><child></child></ng-template>',
              providers: [
                {
                  provide: 'token',
                  useValue: 'PARENT',
                },
              ],
              standalone: false,
            })
            class ParentComponent {
              constructor(public injector: Injector) {
                parentComponentInjector = injector;
              }
            }

            @Component({
              selector: 'child',
              template: '...',
              providers: [
                {
                  provide: 'token',
                  useValue: 'CHILD',
                },
              ],
              standalone: false,
            })
            class ChildComponent {
              constructor(@SkipSelf() public injector: Injector) {
                childComponentInjector = injector;
              }
            }

            TestBed.configureTestingModule({
              declarations: [ParentComponent, ChildComponent],
            });
            const fixture = TestBed.createComponent(ParentComponent);
            fixture.detectChanges();

            expect(childComponentInjector!.get('token')).toBe(
              parentComponentInjector!.get('token'),
            );
          });
        });

        describe('TemplateRef', () => {
          // SkipSelf doesn't make sense to use with TemplateRef since you
          // can't inject TemplateRef on a regular element and you can initialize
          // a child component on a nested `<ng-template>` only when a component/directive
          // on a parent `<ng-template>` is initialized.
          it('should throw when using @SkipSelf for TemplateRef', () => {
            @Directive({
              selector: '[dir]',
              exportAs: 'dir',
              standalone: false,
            })
            class MyDir {
              constructor(@SkipSelf() public templateRef: TemplateRef<any>) {}
            }

            @Component({
              selector: '[child]',
              template: '<ng-template dir></ng-template>',
              standalone: false,
            })
            class ChildComp {
              constructor(public templateRef: TemplateRef<any>) {}
              @ViewChild(MyDir) directive!: MyDir;
            }

            @Component({
              selector: 'root',
              template: '<div child></div>',
              standalone: false,
            })
            class MyComp {
              @ViewChild(ChildComp) child!: ChildComp;
            }

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [MyDir, ChildComp, MyComp],
            });
            const expectedErrorMessage = /NG0201: No provider for TemplateRef found/;
            expect(() => {
              const fixture = TestBed.createComponent(MyComp);
              fixture.detectChanges();
            }).toThrowError(expectedErrorMessage);
          });

          it('should throw when SkipSelf and no parent TemplateRef', () => {
            @Directive({
              selector: '[dirA]',
              exportAs: 'dirA',
              standalone: false,
            })
            class DirA {
              constructor(@SkipSelf() public templateRef: TemplateRef<any>) {}
            }

            @Component({
              selector: 'root',
              template: '<ng-template dirA></ng-template>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [DirA, MyComp],
            });
            const expectedErrorMessage = /NG0201: No provider for TemplateRef found/;
            expect(() => {
              const fixture = TestBed.createComponent(MyComp);
              fixture.detectChanges();
            }).toThrowError(expectedErrorMessage);
          });

          it('should not throw when SkipSelf and Optional', () => {
            let directiveTemplateRef;
            @Directive({
              selector: '[dirA]',
              exportAs: 'dirA',
              standalone: false,
            })
            class DirA {
              constructor(@SkipSelf() @Optional() templateRef: TemplateRef<any>) {
                directiveTemplateRef = templateRef;
              }
            }

            @Component({
              selector: 'root',
              template: '<ng-template dirA></ng-template>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [DirA, MyComp],
            });

            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            expect(directiveTemplateRef).toBeNull();
          });

          it('should not throw when SkipSelf, Optional, and Host', () => {
            @Directive({
              selector: '[dirA]',
              exportAs: 'dirA',
              standalone: false,
            })
            class DirA {
              constructor(@SkipSelf() @Optional() @Host() public templateRef: TemplateRef<any>) {}
            }

            @Component({
              selector: 'root',
              template: '<ng-template dirA></ng-template>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              imports: [CommonModule],
              declarations: [DirA, MyComp],
            });

            expect(() => TestBed.createComponent(MyComp)).not.toThrowError();
          });
        });

        describe('ViewContainerRef', () => {
          it('should support @SkipSelf when injecting ViewContainerRef', () => {
            let parentViewContainer: ViewContainerRef;
            let childViewContainer: ViewContainerRef;

            @Directive({
              selector: '[parent]',
              standalone: false,
            })
            class ParentDirective {
              constructor(vc: ViewContainerRef) {
                parentViewContainer = vc;
              }
            }

            @Directive({
              selector: '[child]',
              standalone: false,
            })
            class ChildDirective {
              constructor(@SkipSelf() vc: ViewContainerRef) {
                childViewContainer = vc;
              }
            }

            @Component({
              template: '<div parent>parent <span child>child</span></div>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              declarations: [ParentDirective, ChildDirective, MyComp],
            });
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            // Assert against the `element` since Ivy always returns a new ViewContainerRef.
            expect(childViewContainer!.element.nativeElement).toBe(
              parentViewContainer!.element.nativeElement,
            );
            expect(parentViewContainer!.element.nativeElement.tagName).toBe('DIV');
          });

          it('should get ViewContainerRef using @SkipSelf and @Host', () => {
            let parentViewContainer: ViewContainerRef;
            let childViewContainer: ViewContainerRef;

            @Directive({
              selector: '[parent]',
              standalone: false,
            })
            class ParentDirective {
              constructor(vc: ViewContainerRef) {
                parentViewContainer = vc;
              }
            }

            @Directive({
              selector: '[child]',
              standalone: false,
            })
            class ChildDirective {
              constructor(@SkipSelf() @Host() vc: ViewContainerRef) {
                childViewContainer = vc;
              }
            }

            @Component({
              template: '<div parent>parent <span child>child</span></div>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              declarations: [ParentDirective, ChildDirective, MyComp],
            });

            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            expect(childViewContainer!.element.nativeElement).toBe(
              parentViewContainer!.element.nativeElement,
            );
            expect(parentViewContainer!.element.nativeElement.tagName).toBe('DIV');
          });

          it('should get ViewContainerRef using @SkipSelf and @Host on parent', () => {
            let parentViewContainer: ViewContainerRef;

            @Directive({
              selector: '[parent]',
              standalone: false,
            })
            class ParentDirective {
              constructor(@SkipSelf() vc: ViewContainerRef) {
                parentViewContainer = vc;
              }
            }

            @Component({
              template: '<div parent>parent</div>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({declarations: [ParentDirective, MyComp]});

            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            expect(parentViewContainer!.element.nativeElement.tagName).toBe('DIV');
          });

          it('should throw when injecting ViewContainerRef using @SkipSelf and no ViewContainerRef are available in a current view', () => {
            @Component({
              template: '<span>component</span>',
              standalone: false,
            })
            class MyComp {
              constructor(@SkipSelf() vc: ViewContainerRef) {}
            }

            TestBed.configureTestingModule({declarations: [MyComp]});

            expect(() => TestBed.createComponent(MyComp)).toThrowError(
              /NG0201\: No provider found for `ViewContainerRef`/,
            );
          });
        });

        describe('ChangeDetectorRef', () => {
          it('should support @SkipSelf when injecting ChangeDetectorRef', () => {
            let parentRef: ChangeDetectorRef | undefined;
            let childRef: ChangeDetectorRef | undefined;

            @Directive({
              selector: '[parent]',
              standalone: false,
            })
            class ParentDirective {
              constructor(cdr: ChangeDetectorRef) {
                parentRef = cdr;
              }
            }

            @Directive({
              selector: '[child]',
              standalone: false,
            })
            class ChildDirective {
              constructor(@SkipSelf() cdr: ChangeDetectorRef) {
                childRef = cdr;
              }
            }

            @Component({
              template: '<div parent>parent <span child>child</span></div>',
              standalone: false,
            })
            class MyComp {}

            TestBed.configureTestingModule({
              declarations: [ParentDirective, ChildDirective, MyComp],
            });
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            // Assert against the `rootNodes` since Ivy always returns a new ChangeDetectorRef.
            expect((parentRef as ViewRefInternal<any>).rootNodes).toEqual(
              (childRef as ViewRefInternal<any>).rootNodes,
            );
          });

          it('should inject host component ChangeDetectorRef when @SkipSelf', () => {
            let childRef: ChangeDetectorRef | undefined;

            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class ChildComp {
              constructor(@SkipSelf() cdr: ChangeDetectorRef) {
                childRef = cdr;
              }
            }

            @Component({
              template: '<div><child></child></div>',
              standalone: false,
            })
            class MyComp {
              constructor(public cdr: ChangeDetectorRef) {}
            }

            TestBed.configureTestingModule({declarations: [ChildComp, MyComp]});
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            // Assert against the `rootNodes` since Ivy always returns a new ChangeDetectorRef.
            expect((childRef as ViewRefInternal<any>).rootNodes).toEqual(
              (fixture.componentInstance.cdr as ViewRefInternal<any>).rootNodes,
            );
          });

          it('should throw when ChangeDetectorRef and @SkipSelf and not found', () => {
            @Component({
              template: '<div></div>',
              standalone: false,
            })
            class MyComponent {
              constructor(@SkipSelf() public injector: ChangeDetectorRef) {}
            }

            @NgModule({
              declarations: [MyComponent],
            })
            class MyModule {}

            TestBed.configureTestingModule({
              imports: [MyModule],
            });

            expect(() => TestBed.createComponent(MyComponent)).toThrowError(
              /NG0201\: No provider found for `ChangeDetectorRef`/,
            );
          });

          it('should lookup module injector in case @SkipSelf is used for `ChangeDetectorRef` token and Component has no parent', () => {
            let componentCDR: ChangeDetectorRef;
            let moduleCDR: ChangeDetectorRef;
            @Component({
              selector: 'child',
              template: '...',
              standalone: false,
            })
            class MyComponent {
              constructor(@SkipSelf() public injector: ChangeDetectorRef) {
                componentCDR = injector;
              }
            }

            @NgModule({
              declarations: [MyComponent],
              providers: [
                {
                  provide: ChangeDetectorRef,
                  useValue: {from: 'NG_MODULE'},
                },
              ],
            })
            class MyModule {
              constructor(public injector: ChangeDetectorRef) {
                moduleCDR = injector;
              }
            }

            TestBed.configureTestingModule({
              imports: [MyModule],
            });
            const fixture = TestBed.createComponent(MyComponent);
            fixture.detectChanges();

            expect((moduleCDR! as any).from).toBe('NG_MODULE');
            expect((componentCDR! as any).from).toBe('NG_MODULE');
          });
        });

        describe('viewProviders', () => {
          it('should support @SkipSelf when using viewProviders', () => {
            @Component({
              selector: 'child',
              template: '{{ blah | json }}<br />{{ foo | json }}<br />{{ bar | json }}',
              providers: [{provide: 'Blah', useValue: 'Blah as Provider'}],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Child {
              constructor(
                @Inject('Blah') public blah: String,
                @Inject('Foo') public foo: String,
                @SkipSelf() @Inject('Bar') public bar: String,
              ) {}
            }

            @Component({
              selector: 'parent',
              template: '<ng-content></ng-content>',
              providers: [
                {provide: 'Blah', useValue: 'Blah as provider'},
                {provide: 'Bar', useValue: 'Bar as Provider'},
              ],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Parent {}

            @Component({
              selector: 'my-app',
              template: '<parent><child></child></parent>',
              standalone: false,
            })
            class MyApp {
              @ViewChild(Parent) parent!: Parent;
              @ViewChild(Child) child!: Child;
            }

            TestBed.configureTestingModule({declarations: [Child, Parent, MyApp]});
            const fixture = TestBed.createComponent(MyApp);
            fixture.detectChanges();

            const child = fixture.componentInstance.child;
            expect(child.bar).toBe('Bar as Provider');
          });

          it('should throw when @SkipSelf and no accessible viewProvider', () => {
            @Component({
              selector: 'child',
              template: '{{ blah | json }}<br />{{ foo | json }}<br />{{ bar | json }}',
              providers: [{provide: 'Blah', useValue: 'Blah as Provider'}],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Child {
              constructor(
                @Inject('Blah') public blah: String,
                @Inject('Foo') public foo: String,
                @SkipSelf() @Inject('Bar') public bar: String,
              ) {}
            }

            @Component({
              selector: 'parent',
              template: '<ng-content></ng-content>',
              providers: [{provide: 'Blah', useValue: 'Blah as provider'}],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Parent {}

            @Component({
              selector: 'my-app',
              template: '<parent><child></child></parent>',
              standalone: false,
            })
            class MyApp {}

            TestBed.configureTestingModule({declarations: [Child, Parent, MyApp]});

            expect(() => TestBed.createComponent(MyApp)).toThrowError(
              /NG0201\: No provider found for `Bar`/,
            );
          });

          it('should not throw when @SkipSelf and @Optional with no accessible viewProvider', () => {
            @Component({
              selector: 'child',
              template: '{{ blah | json }}<br />{{ foo | json }}<br />{{ bar | json }}',
              providers: [{provide: 'Blah', useValue: 'Blah as Provider'}],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Child {
              constructor(
                @Inject('Blah') public blah: String,
                @Inject('Foo') public foo: String,
                @SkipSelf() @Optional() @Inject('Bar') public bar: String,
              ) {}
            }

            @Component({
              selector: 'parent',
              template: '<ng-content></ng-content>',
              providers: [{provide: 'Blah', useValue: 'Blah as provider'}],
              viewProviders: [
                {provide: 'Foo', useValue: 'Foo as ViewProvider'},
                {provide: 'Bar', useValue: 'Bar as ViewProvider'},
              ],
              standalone: false,
            })
            class Parent {}

            @Component({
              selector: 'my-app',
              template: '<parent><child></child></parent>',
              standalone: false,
            })
            class MyApp {}

            TestBed.configureTestingModule({declarations: [Child, Parent, MyApp]});

            expect(() => TestBed.createComponent(MyApp)).not.toThrowError(
              /NG0201\: No provider found for `Bar`/,
            );
          });
        });
      });

      describe('@Host', () => {
        @Directive({
          selector: '[dirA]',
          standalone: false,
        })
        class DirectiveA {
          constructor(@Host() public dirB: DirectiveB) {}
        }

        @Directive({
          selector: '[dirString]',
          standalone: false,
        })
        class DirectiveString {
          constructor(@Host() public s: String) {}
        }

        it('should find viewProviders on the host itself', () => {
          @Component({
            selector: 'my-comp',
            template: '<div dirString></div>',
            viewProviders: [{provide: String, useValue: 'Foo'}],
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveString) dirString!: DirectiveString;
          }

          @Component({
            template: '<my-comp></my-comp>',
            standalone: false,
          })
          class MyApp {
            @ViewChild(MyComp) myComp!: MyComp;
          }

          TestBed.configureTestingModule({declarations: [DirectiveString, MyComp, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          const dirString = fixture.componentInstance.myComp.dirString;
          expect(dirString.s).toBe('Foo');
        });

        it('should not find providers on the host itself', () => {
          @Component({
            selector: 'my-comp',
            template: '<div dirString></div>',
            providers: [{provide: String, useValue: 'Foo'}],
            standalone: false,
          })
          class MyComp {}

          @Component({
            template: '<my-comp></my-comp>',
            standalone: false,
          })
          class MyApp {}

          TestBed.configureTestingModule({declarations: [DirectiveString, MyComp, MyApp]});
          expect(() => TestBed.createComponent(MyApp)).toThrowError(
            'NG0201: No provider for String found in NodeInjector. Find more at https://angular.dev/errors/NG0201',
          );
        });

        it('should not find other directives on the host itself', () => {
          @Component({
            selector: 'my-comp',
            template: '<div dirA></div>',
            standalone: false,
          })
          class MyComp {}

          @Component({
            template: '<my-comp dirB></my-comp>',
            standalone: false,
          })
          class MyApp {}

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
          expect(() => TestBed.createComponent(MyApp)).toThrowError(
            /NG0201: No provider for DirectiveB found in NodeInjector/,
          );
        });

        it('should not find providers on the host itself if in inline view', () => {
          @Component({
            selector: 'my-comp',
            template: '<ng-container *ngIf="showing"><div dirA></div></ng-container>',
            standalone: false,
          })
          class MyComp {
            showing = false;
          }

          @Component({
            template: '<my-comp dirB></my-comp>',
            standalone: false,
          })
          class MyApp {
            @ViewChild(MyComp) myComp!: MyComp;
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();
          expect(() => {
            fixture.componentInstance.myComp.showing = true;
            fixture.detectChanges();
          }).toThrowError(/NG0201: No provider for DirectiveB found in NodeInjector/);
        });

        it('should find providers across embedded views if not passing component boundary', () => {
          @Component({
            template: '<div dirB><div *ngIf="showing" dirA></div></div>',
            standalone: false,
          })
          class MyApp {
            showing = false;
            @ViewChild(DirectiveA) dirA!: DirectiveA;
            @ViewChild(DirectiveB) dirB!: DirectiveB;
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();
          fixture.componentInstance.showing = true;
          fixture.detectChanges();

          const dirA = fixture.componentInstance.dirA;
          const dirB = fixture.componentInstance.dirB;
          expect(dirA.dirB).toBe(dirB);
        });

        it('should not find component above the host', () => {
          @Component({
            template: '<my-comp></my-comp>',
            standalone: false,
          })
          class MyApp {}

          @Directive({
            selector: '[dirComp]',
            standalone: false,
          })
          class DirectiveComp {
            constructor(@Host() public comp: MyApp) {}
          }

          @Component({
            selector: 'my-comp',
            template: '<div dirComp></div>',
            standalone: false,
          })
          class MyComp {}

          TestBed.configureTestingModule({declarations: [DirectiveComp, MyComp, MyApp]});
          expect(() => TestBed.createComponent(MyApp)).toThrowError(
            'NG0201: No provider for MyApp found in NodeInjector. Find more at https://angular.dev/errors/NG0201',
          );
        });

        describe('regression', () => {
          // based on https://stackblitz.com/edit/angular-riss8k?file=src/app/app.component.ts
          it('should allow directives with Host flag to inject view providers from containing component', () => {
            class ControlContainer {}
            let controlContainers: ControlContainer[] = [];
            let injectedControlContainer: ControlContainer | null = null;

            @Directive({
              selector: '[group]',
              providers: [{provide: ControlContainer, useExisting: GroupDirective}],
              standalone: false,
            })
            class GroupDirective {
              constructor() {
                controlContainers.push(this);
              }
            }

            @Directive({
              selector: '[control]',
              standalone: false,
            })
            class ControlDirective {
              constructor(@Host() @SkipSelf() @Inject(ControlContainer) parent: ControlContainer) {
                injectedControlContainer = parent;
              }
            }

            @Component({
              selector: 'my-comp',
              template: '<input control>',
              viewProviders: [{provide: ControlContainer, useExisting: GroupDirective}],
              standalone: false,
            })
            class MyComp {}

            @Component({
              template: `
                   <div group>
                     <my-comp></my-comp>
                   </div>
                 `,
              standalone: false,
            })
            class MyApp {}

            TestBed.configureTestingModule({
              declarations: [GroupDirective, ControlDirective, MyComp, MyApp],
            });
            const fixture = TestBed.createComponent(MyApp);
            expect(fixture.nativeElement.innerHTML).toBe(
              '<div group=""><my-comp><input control=""></my-comp></div>',
            );
            expect(controlContainers).toEqual([injectedControlContainer!]);
          });
        });
      });

      describe('`InjectFlags` support in NodeInjector', () => {
        it('should support Optional flag in NodeInjector', () => {
          const NON_EXISTING_PROVIDER = new InjectionToken<string>('non-existing');
          @Component({
            template: '...',
            standalone: false,
          })
          class MyComp {
            tokenViaInjector;
            constructor(
              public injector: Injector,
              @Inject(NON_EXISTING_PROVIDER) @Optional() public tokenViaConstructor: string,
            ) {
              this.tokenViaInjector = this.injector.get(NON_EXISTING_PROVIDER, null, {
                optional: true,
              });
            }
          }
          TestBed.configureTestingModule({declarations: [MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(fixture.componentInstance.tokenViaInjector).toBe(null);
          expect(fixture.componentInstance.tokenViaInjector).toBe(
            fixture.componentInstance.tokenViaConstructor,
          );
        });
        it('should support SkipSelf flag in NodeInjector', () => {
          const TOKEN = new InjectionToken<string>('token');
          @Component({
            selector: 'parent',
            template: '<child></child>',
            providers: [
              {
                provide: TOKEN,
                useValue: 'PARENT',
              },
            ],
            standalone: false,
          })
          class ParentComponent {}

          @Component({
            selector: 'child',
            template: '...',
            providers: [
              {
                provide: TOKEN,
                useValue: 'CHILD',
              },
            ],
            standalone: false,
          })
          class ChildComponent {
            tokenViaInjector;
            constructor(
              public injector: Injector,
              @Inject(TOKEN) @SkipSelf() public tokenViaConstructor: string,
            ) {
              this.tokenViaInjector = this.injector.get(TOKEN, null, {skipSelf: true});
            }
          }

          TestBed.configureTestingModule({
            declarations: [ParentComponent, ChildComponent],
          });
          const fixture = TestBed.createComponent(ParentComponent);
          fixture.detectChanges();

          const childComponent = fixture.debugElement.query(
            By.directive(ChildComponent),
          ).componentInstance;
          expect(childComponent.tokenViaInjector).toBe('PARENT');
          expect(childComponent.tokenViaConstructor).toBe(childComponent.tokenViaInjector);
        });
        it('should support Host flag in NodeInjector', () => {
          const TOKEN = new InjectionToken<string>('token');
          @Directive({
            selector: '[dirString]',
            standalone: false,
          })
          class DirectiveString {
            tokenViaInjector;
            constructor(
              public injector: Injector,
              @Inject(TOKEN) @Host() public tokenViaConstructor: string,
            ) {
              this.tokenViaInjector = this.injector.get(TOKEN, null, {host: true});
            }
          }

          @Component({
            template: '<div dirString></div>',
            viewProviders: [{provide: TOKEN, useValue: 'Foo'}],
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveString) dirString!: DirectiveString;
          }

          TestBed.configureTestingModule({declarations: [DirectiveString, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirString = fixture.componentInstance.dirString;
          expect(dirString.tokenViaConstructor).toBe('Foo');
          expect(dirString.tokenViaConstructor).toBe(dirString.tokenViaInjector!);
        });
        it('should support multiple flags in NodeInjector', () => {
          @Directive({
            selector: '[dirA]',
            standalone: false,
          })
          class DirectiveA {}
          @Directive({
            selector: '[dirB]',
            standalone: false,
          })
          class DirectiveB {
            tokenSelfViaInjector;
            tokenHostViaInjector;
            constructor(
              public injector: Injector,
              @Inject(DirectiveA) @Self() @Optional() public tokenSelfViaConstructor: DirectiveA,
              @Inject(DirectiveA) @Host() @Optional() public tokenHostViaConstructor: DirectiveA,
            ) {
              this.tokenSelfViaInjector = this.injector.get(DirectiveA, null, {
                self: true,
                optional: true,
              });
              this.tokenHostViaInjector = this.injector.get(DirectiveA, null, {
                host: true,
                optional: true,
              });
            }
          }

          @Component({
            template: '<div dirB></div>',
            standalone: false,
          })
          class MyComp {
            @ViewChild(DirectiveB) dirB!: DirectiveB;
          }

          TestBed.configureTestingModule({declarations: [DirectiveB, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirB = fixture.componentInstance.dirB;
          expect(dirB.tokenSelfViaInjector).toBeNull();
          expect(dirB.tokenSelfViaInjector).toBe(dirB.tokenSelfViaConstructor);
          expect(dirB.tokenHostViaInjector).toBeNull();
          expect(dirB.tokenHostViaInjector).toBe(dirB.tokenHostViaConstructor);
        });
      });
    });
  });

  describe('Tree shakable injectors', () => {
    it('should support tree shakable injectors scopes', () => {
      @Injectable({providedIn: 'any'})
      class AnyService {
        constructor(public injector: Injector) {}
      }

      @Injectable({providedIn: 'root'})
      class RootService {
        constructor(public injector: Injector) {}
      }

      @Injectable({providedIn: 'platform'})
      class PlatformService {
        constructor(public injector: Injector) {}
      }

      const testBedInjector = TestBed.inject(Injector);
      const childInjector = Injector.create({providers: [], parent: testBedInjector});

      const anyService = childInjector.get(AnyService);
      expect(anyService.injector).toBe(childInjector);

      const rootService = childInjector.get(RootService);
      expect(rootService.injector.get(ɵINJECTOR_SCOPE)).toBe('root');

      const platformService = childInjector.get(PlatformService);
      expect(platformService.injector.get(ɵINJECTOR_SCOPE)).toBe('platform');
    });

    it('should create a provider that uses `forwardRef` inside `providedIn`', () => {
      @Injectable()
      class ProviderDep {
        getNumber() {
          return 3;
        }
      }

      @Injectable({providedIn: forwardRef(() => Module)})
      class Provider {
        constructor(private _dep: ProviderDep) {
          this.value = this._dep.getNumber() + 2;
        }
        value;
      }

      @Component({
        template: '',
        standalone: false,
      })
      class Comp {
        constructor(public provider: Provider) {}
      }

      @NgModule({declarations: [Comp], exports: [Comp], providers: [ProviderDep]})
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const fixture = TestBed.createComponent(Comp);
      expect(fixture.componentInstance.provider.value).toBe(5);
    });
  });

  describe('service injection', () => {
    it('should create instance even when no injector present', () => {
      @Injectable({providedIn: 'root'})
      class MyService {
        value = 'MyService';
      }
      @Component({
        template: '<div>{{myService.value}}</div>',
        standalone: false,
      })
      class MyComp {
        constructor(public myService: MyService) {}
      }
      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toEqual('MyService');
    });

    it('should support sub-classes with no @Injectable decorator', () => {
      @Injectable()
      class Dependency {}

      @Injectable()
      class SuperClass {
        constructor(public dep: Dependency) {}
      }

      // Note, no @Injectable decorators for these two classes
      class SubClass extends SuperClass {}
      class SubSubClass extends SubClass {}

      @Component({
        template: '',
        standalone: false,
      })
      class MyComp {
        constructor(public myService: SuperClass) {}
      }
      TestBed.configureTestingModule({
        declarations: [MyComp],
        providers: [{provide: SuperClass, useClass: SubSubClass}, Dependency],
      });

      const warnSpy = spyOn(console, 'warn');
      const fixture = TestBed.createComponent(MyComp);
      expect(fixture.componentInstance.myService.dep instanceof Dependency).toBe(true);

      expect(warnSpy).toHaveBeenCalledWith(
        `DEPRECATED: DI is instantiating a token "SubSubClass" that inherits its @Injectable decorator but does not provide one itself.\n` +
          `This will become an error in a future version of Angular. Please add @Injectable() to the "SubSubClass" class.`,
      );
    });

    it('should instantiate correct class when undecorated class extends an injectable', () => {
      @Injectable()
      class MyService {
        id = 1;
      }

      class MyRootService extends MyService {
        override id = 2;
      }

      @Component({
        template: '',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App], providers: [MyRootService]});
      const warnSpy = spyOn(console, 'warn');
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const provider = TestBed.inject(MyRootService);

      expect(provider instanceof MyRootService).toBe(true);
      expect(provider.id).toBe(2);

      expect(warnSpy).toHaveBeenCalledWith(
        `DEPRECATED: DI is instantiating a token "MyRootService" that inherits its @Injectable decorator but does not provide one itself.\n` +
          `This will become an error in a future version of Angular. Please add @Injectable() to the "MyRootService" class.`,
      );
    });

    it('should inject services in constructor with overloads', () => {
      @Injectable({providedIn: 'root'})
      class MyService {}

      @Injectable({providedIn: 'root'})
      class MyOtherService {}

      @Component({
        template: '',
        standalone: false,
      })
      class MyComp {
        constructor(myService: MyService);
        constructor(
          public myService: MyService,
          @Optional() public myOtherService?: MyOtherService,
        ) {}
      }
      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.myService instanceof MyService).toBe(true);
      expect(fixture.componentInstance.myOtherService instanceof MyOtherService).toBe(true);
    });
  });

  describe('service injection with useClass', () => {
    @Injectable({providedIn: 'root'})
    class BarServiceDep {
      name = 'BarServiceDep';
    }

    @Injectable({providedIn: 'root'})
    class BarService {
      constructor(public dep: BarServiceDep) {}
      getMessage() {
        return 'bar';
      }
    }

    @Injectable({providedIn: 'root'})
    class FooServiceDep {
      name = 'FooServiceDep';
    }

    @Injectable({providedIn: 'root', useClass: BarService})
    class FooService {
      constructor(public dep: FooServiceDep) {}
      getMessage() {
        return 'foo';
      }
    }

    it('should use @Injectable useClass config when token is not provided', () => {
      let provider: FooService | BarService;

      @Component({
        template: '',
        standalone: false,
      })
      class App {
        constructor(service: FooService) {
          provider = service;
        }
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(provider!.getMessage()).toBe('bar');
      expect(provider!.dep.name).toBe('BarServiceDep');
    });

    it('should use constructor config directly when token is explicitly provided via useClass', () => {
      let provider: FooService | BarService;

      @Component({
        template: '',
        standalone: false,
      })
      class App {
        constructor(service: FooService) {
          provider = service;
        }
      }

      TestBed.configureTestingModule({
        declarations: [App],
        providers: [{provide: FooService, useClass: FooService}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(provider!.getMessage()).toBe('foo');
    });

    it('should inject correct provider when re-providing an injectable that has useClass', () => {
      let directProvider: FooService | BarService;
      let overriddenProvider: FooService | BarService;

      @Component({
        template: '',
        standalone: false,
      })
      class App {
        constructor(@Inject('stringToken') overriddenService: FooService, service: FooService) {
          overriddenProvider = overriddenService;
          directProvider = service;
        }
      }

      TestBed.configureTestingModule({
        declarations: [App],
        providers: [{provide: 'stringToken', useClass: FooService}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directProvider!.getMessage()).toBe('bar');
      expect(overriddenProvider!.getMessage()).toBe('foo');
      expect(directProvider!.dep.name).toBe('BarServiceDep');
      expect(overriddenProvider!.dep.name).toBe('FooServiceDep');
    });

    it('should use constructor config directly when token is explicitly provided as a type provider', () => {
      let provider: FooService | BarService;

      @Component({
        template: '',
        standalone: false,
      })
      class App {
        constructor(service: FooService) {
          provider = service;
        }
      }

      TestBed.configureTestingModule({declarations: [App], providers: [FooService]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(provider!.getMessage()).toBe('foo');
      expect(provider!.dep.name).toBe('FooServiceDep');
    });
  });

  describe('inject', () => {
    it('should inject from parent view', () => {
      @Directive({
        selector: '[parentDir]',
        standalone: false,
      })
      class ParentDirective {}

      @Directive({
        selector: '[childDir]',
        exportAs: 'childDir',
        standalone: false,
      })
      class ChildDirective {
        value: string;
        constructor(public parent: ParentDirective) {
          this.value = parent.constructor.name;
        }
      }

      @Directive({
        selector: '[child2Dir]',
        exportAs: 'child2Dir',
        standalone: false,
      })
      class Child2Directive {
        value: boolean;
        constructor(parent: ParentDirective, child: ChildDirective) {
          this.value = parent === child.parent;
        }
      }

      @Component({
        template: `<div parentDir>
          <ng-container *ngIf="showing">
            <span childDir child2Dir #child1="childDir" #child2="child2Dir">{{ child1.value }}-{{ child2.value }}</span>
          </ng-container>
        </div>`,
        standalone: false,
      })
      class MyComp {
        showing = true;
      }
      TestBed.configureTestingModule({
        declarations: [ParentDirective, ChildDirective, Child2Directive, MyComp],
      });
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toBe('ParentDirective-true');
    });
  });

  describe('Special tokens', () => {
    describe('Injector', () => {
      it('should inject the injector', () => {
        @Directive({
          selector: '[injectorDir]',
          standalone: false,
        })
        class InjectorDir {
          constructor(public injector: Injector) {}
        }

        @Directive({
          selector: '[otherInjectorDir]',
          standalone: false,
        })
        class OtherInjectorDir {
          constructor(
            public otherDir: InjectorDir,
            public injector: Injector,
          ) {}
        }

        @Component({
          template: '<div injectorDir otherInjectorDir></div>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(InjectorDir) injectorDir!: InjectorDir;
          @ViewChild(OtherInjectorDir) otherInjectorDir!: OtherInjectorDir;
        }

        TestBed.configureTestingModule({declarations: [InjectorDir, OtherInjectorDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const injectorDir = fixture.componentInstance.injectorDir;
        const otherInjectorDir = fixture.componentInstance.otherInjectorDir;

        expect(injectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(otherInjectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(otherInjectorDir.injector.get(InjectorDir)).toBe(injectorDir);
        expect(injectorDir.injector).not.toBe(otherInjectorDir.injector);
      });

      it('should inject INJECTOR', () => {
        @Directive({
          selector: '[injectorDir]',
          standalone: false,
        })
        class InjectorDir {
          constructor(@Inject(INJECTOR) public injector: Injector) {}
        }

        @Component({
          template: '<div injectorDir></div>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(InjectorDir) injectorDir!: InjectorDir;
        }

        TestBed.configureTestingModule({declarations: [InjectorDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const injectorDir = fixture.componentInstance.injectorDir;

        expect(injectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(injectorDir.injector.get(Injector).get(ElementRef).nativeElement).toBe(divElement);
        expect(injectorDir.injector.get(INJECTOR).get(ElementRef).nativeElement).toBe(divElement);
      });
    });

    describe('ElementRef', () => {
      it('should create directive with ElementRef dependencies', () => {
        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class MyDir {
          value: string;
          constructor(public elementRef: ElementRef) {
            this.value = (elementRef.constructor as any).name;
          }
        }

        @Directive({
          selector: '[otherDir]',
          standalone: false,
        })
        class MyOtherDir {
          isSameInstance: boolean;
          constructor(
            public elementRef: ElementRef,
            public directive: MyDir,
          ) {
            this.isSameInstance = elementRef === directive.elementRef;
          }
        }

        @Component({
          template: '<div dir otherDir></div>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const directive = fixture.componentInstance.directive;
        const otherDirective = fixture.componentInstance.otherDirective;

        expect(directive.value).toContain('ElementRef');
        expect(directive.elementRef.nativeElement).toEqual(divElement);
        expect(otherDirective.elementRef.nativeElement).toEqual(divElement);

        // Each ElementRef instance should be unique
        expect(otherDirective.isSameInstance).toBe(false);
      });

      it('should create ElementRef with comment if requesting directive is on <ng-template> node', () => {
        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class MyDir {
          value: string;
          constructor(public elementRef: ElementRef<Node>) {
            this.value = (elementRef.constructor as any).name;
          }
        }

        @Component({
          template: '<ng-template dir></ng-template>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(MyDir) directive!: MyDir;
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const directive = fixture.componentInstance.directive;

        expect(directive.value).toContain('ElementRef');
        // the nativeElement should be a comment
        expect(directive.elementRef.nativeElement.nodeType).toEqual(Node.COMMENT_NODE);
      });

      it('should be available if used in conjunction with other tokens', () => {
        @Injectable()
        class ServiceA {
          subject: any;
          constructor(protected zone: NgZone) {
            this.subject = new BehaviorSubject<any>(1);
            // trigger change detection
            zone.run(() => {
              this.subject.next(2);
            });
          }
        }

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class DirectiveA {
          constructor(
            public service: ServiceA,
            public elementRef: ElementRef,
          ) {}
        }

        @Component({
          selector: 'child',
          template: `<div id="test-id" dir></div>`,
          standalone: false,
        })
        class ChildComp {
          @ViewChild(DirectiveA) directive!: DirectiveA;
        }

        @Component({
          selector: 'root',
          template: '...',
          standalone: false,
        })
        class RootComp {
          public childCompRef!: ComponentRef<ChildComp>;

          constructor(public vcr: ViewContainerRef) {}

          create() {
            this.childCompRef = this.vcr.createComponent(ChildComp);
            this.childCompRef.changeDetectorRef.detectChanges();
          }
        }

        TestBed.configureTestingModule({
          declarations: [DirectiveA, RootComp, ChildComp],
          providers: [ServiceA],
        });

        const fixture = TestBed.createComponent(RootComp);
        fixture.autoDetectChanges();

        fixture.componentInstance.create();

        const {elementRef} = fixture.componentInstance.childCompRef.instance.directive;
        expect(elementRef.nativeElement.id).toBe('test-id');
      });
    });

    describe('TemplateRef', () => {
      @Directive({
        selector: '[dir]',
        exportAs: 'dir',
        standalone: false,
      })
      class MyDir {
        value: string;
        constructor(public templateRef: TemplateRef<any>) {
          this.value = (templateRef.constructor as any).name;
        }
      }

      it('should create directive with TemplateRef dependencies', () => {
        @Directive({
          selector: '[otherDir]',
          exportAs: 'otherDir',
          standalone: false,
        })
        class MyOtherDir {
          isSameInstance: boolean;
          constructor(
            public templateRef: TemplateRef<any>,
            public directive: MyDir,
          ) {
            this.isSameInstance = templateRef === directive.templateRef;
          }
        }

        @Component({
          template: '<ng-template dir otherDir #dir="dir" #otherDir="otherDir"></ng-template>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const directive = fixture.componentInstance.directive;
        const otherDirective = fixture.componentInstance.otherDirective;

        expect(directive.value).toContain('TemplateRef');
        expect(directive.templateRef).not.toBeNull();
        expect(otherDirective.templateRef).not.toBeNull();

        // Each TemplateRef instance should be unique
        expect(otherDirective.isSameInstance).toBe(false);
      });

      it('should throw if injected on an element', () => {
        @Component({
          template: '<div dir></div>',
          standalone: false,
        })
        class MyComp {}

        TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
        expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for TemplateRef/);
      });

      it('should throw if injected on an ng-container', () => {
        @Component({
          template: '<ng-container dir></ng-container>',
          standalone: false,
        })
        class MyComp {}

        TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
        expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for TemplateRef/);
      });

      it('should NOT throw if optional and injected on an element', () => {
        @Directive({
          selector: '[optionalDir]',
          exportAs: 'optionalDir',
          standalone: false,
        })
        class OptionalDir {
          constructor(@Optional() public templateRef: TemplateRef<any>) {}
        }
        @Component({
          template: '<div optionalDir></div>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(OptionalDir) directive!: OptionalDir;
        }

        TestBed.configureTestingModule({declarations: [OptionalDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        expect(fixture.componentInstance.directive.templateRef).toBeNull();
      });
    });

    describe('ViewContainerRef', () => {
      it('should create directive with ViewContainerRef dependencies', () => {
        @Directive({
          selector: '[dir]',
          exportAs: 'dir',
          standalone: false,
        })
        class MyDir {
          value: string;
          constructor(public viewContainerRef: ViewContainerRef) {
            this.value = (viewContainerRef.constructor as any).name;
          }
        }
        @Directive({
          selector: '[otherDir]',
          exportAs: 'otherDir',
          standalone: false,
        })
        class MyOtherDir {
          isSameInstance: boolean;
          constructor(
            public viewContainerRef: ViewContainerRef,
            public directive: MyDir,
          ) {
            this.isSameInstance = viewContainerRef === directive.viewContainerRef;
          }
        }
        @Component({
          template: '<div dir otherDir #dir="dir" #otherDir="otherDir"></div>',
          standalone: false,
        })
        class MyComp {
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const directive = fixture.componentInstance.directive;
        const otherDirective = fixture.componentInstance.otherDirective;

        expect(directive.value).toContain('ViewContainerRef');
        expect(directive.viewContainerRef).not.toBeNull();
        expect(otherDirective.viewContainerRef).not.toBeNull();

        // Each ViewContainerRef instance should be unique
        expect(otherDirective.isSameInstance).toBe(false);
      });

      it('should sync ViewContainerRef state between all injected instances', () => {
        @Component({
          selector: 'root',
          template: `<ng-template #tmpl>Test</ng-template>`,
          standalone: false,
        })
        class Root {
          @ViewChild(TemplateRef, {static: true}) tmpl!: TemplateRef<any>;

          constructor(
            public vcr: ViewContainerRef,
            public vcr2: ViewContainerRef,
          ) {}

          ngOnInit(): void {
            this.vcr.createEmbeddedView(this.tmpl);
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root],
        });

        const fixture = TestBed.createComponent(Root);
        fixture.detectChanges();
        const cmp = fixture.componentInstance;

        expect(cmp.vcr.length).toBe(1);
        expect(cmp.vcr2.length).toBe(1);
        expect(cmp.vcr2.get(0)).toEqual(cmp.vcr.get(0));

        cmp.vcr2.remove(0);
        expect(cmp.vcr.length).toBe(0);
        expect(cmp.vcr.get(0)).toBeNull();
      });
    });

    describe('ChangeDetectorRef', () => {
      @Directive({
        selector: '[dir]',
        exportAs: 'dir',
        standalone: false,
      })
      class MyDir {
        value: string;
        constructor(public cdr: ChangeDetectorRef) {
          this.value = (cdr.constructor as any).name;
        }
      }
      @Directive({
        selector: '[otherDir]',
        exportAs: 'otherDir',
        standalone: false,
      })
      class MyOtherDir {
        constructor(public cdr: ChangeDetectorRef) {}
      }
      @Component({
        selector: 'my-comp',
        template: '<ng-content></ng-content>',
        standalone: false,
      })
      class MyComp {
        constructor(public cdr: ChangeDetectorRef) {}
      }

      it('should inject host component ChangeDetectorRef into directives on templates', () => {
        let pipeInstance: MyPipe;

        @Pipe({
          name: 'pipe',
          standalone: false,
        })
        class MyPipe implements PipeTransform {
          constructor(public cdr: ChangeDetectorRef) {
            pipeInstance = this;
          }

          transform(value: any): any {
            return value;
          }
        }

        @Component({
          selector: 'my-app',
          template: `<div *ngIf="showing | pipe">Visible</div>`,
          standalone: false,
        })
        class MyApp {
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}
        }

        TestBed.configureTestingModule({declarations: [MyApp, MyPipe], imports: [CommonModule]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        expect((pipeInstance!.cdr as ViewRefInternal<MyApp>).context).toBe(
          fixture.componentInstance,
        );
      });

      it('should inject current component ChangeDetectorRef into directives on the same node as components', () => {
        @Component({
          selector: 'my-app',
          template: '<my-comp dir otherDir #dir="dir"></my-comp>',
          standalone: false,
        })
        class MyApp {
          @ViewChild(MyComp) component!: MyComp;
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }
        TestBed.configureTestingModule({declarations: [MyApp, MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        const app = fixture.componentInstance;
        const comp = fixture.componentInstance.component;
        expect((comp!.cdr as ViewRefInternal<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(app.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(app.directive!.cdr).not.toBe(comp!.cdr);
        expect(app.directive!.cdr).not.toBe(app.otherDirective!.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on normal elements', () => {
        @Component({
          selector: 'my-comp',
          template: '<div dir otherDir #dir="dir"></div>',
          standalone: false,
        })
        class MyComp {
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }
        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        expect((comp!.cdr as ViewRefInternal<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(comp.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(comp.directive!.cdr).not.toBe(comp.cdr);
        expect(comp.directive!.cdr).not.toBe(comp.otherDirective!.cdr);
      });

      it("should inject host component ChangeDetectorRef into directives in a component's ContentChildren", () => {
        @Component({
          selector: 'my-app',
          template: `<my-comp>
               <div dir otherDir #dir="dir"></div>
             </my-comp>
              `,
          standalone: false,
        })
        class MyApp {
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyComp) component!: MyComp;
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }
        TestBed.configureTestingModule({declarations: [MyApp, MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        const app = fixture.componentInstance;
        expect((app!.cdr as ViewRefInternal<MyApp>).context).toBe(app);
        const comp = fixture.componentInstance.component;
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(app.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(app.directive!.cdr).not.toBe(comp.cdr);
        expect(app.directive!.cdr).not.toBe(app.otherDirective!.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives in embedded views', () => {
        @Component({
          selector: 'my-comp',
          template: `<ng-container *ngIf="showing">
            <div dir otherDir #dir="dir" *ngIf="showing"></div>
          </ng-container>`,
          standalone: false,
        })
        class MyComp {
          showing = true;
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        expect((comp!.cdr as ViewRefInternal<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(comp.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(comp.directive!.cdr).not.toBe(comp.cdr);
        expect(comp.directive!.cdr).not.toBe(comp.otherDirective!.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on containers', () => {
        @Component({
          selector: 'my-comp',
          template: '<div dir otherDir #dir="dir" *ngIf="showing"></div>',
          standalone: false,
        })
        class MyComp {
          showing = true;
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyDir) directive!: MyDir;
          @ViewChild(MyOtherDir) otherDirective!: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        expect((comp!.cdr as ViewRefInternal<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(comp.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(comp.directive!.cdr).not.toBe(comp.cdr);
        expect(comp.directive!.cdr).not.toBe(comp.otherDirective!.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on ng-container', () => {
        let dirInstance: MyDirective;

        @Directive({
          selector: '[getCDR]',
          standalone: false,
        })
        class MyDirective {
          constructor(public cdr: ChangeDetectorRef) {
            dirInstance = this;
          }
        }

        @Component({
          selector: 'my-app',
          template: `<ng-container getCDR>Visible</ng-container>`,
          standalone: false,
        })
        class MyApp {
          constructor(public cdr: ChangeDetectorRef) {}
        }

        TestBed.configureTestingModule({declarations: [MyApp, MyDirective]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        expect((dirInstance!.cdr as ViewRefInternal<MyApp>).context).toBe(
          fixture.componentInstance,
        );
      });
    });
  });

  describe('string tokens', () => {
    it('should be able to provide a string token', () => {
      @Directive({
        selector: '[injectorDir]',
        providers: [{provide: 'test', useValue: 'provided'}],
        standalone: false,
      })
      class InjectorDir {
        constructor(@Inject('test') public value: string) {}
      }

      @Component({
        template: '<div injectorDir></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(InjectorDir) injectorDirInstance!: InjectorDir;
      }

      TestBed.configureTestingModule({declarations: [InjectorDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const injectorDir = fixture.componentInstance.injectorDirInstance;

      expect(injectorDir.value).toBe('provided');
    });
  });

  describe('attribute tokens', () => {
    it('should be able to provide an attribute token', () => {
      const TOKEN = new InjectionToken<string>('Some token');
      function factory(token: string): string {
        return token + ' with factory';
      }
      @Component({
        selector: 'my-comp',
        template: '...',
        providers: [
          {
            provide: TOKEN,
            deps: [[new Attribute('token')]],
            useFactory: factory,
          },
        ],
        standalone: false,
      })
      class MyComp {
        constructor(@Inject(TOKEN) readonly token: string) {}
      }

      @Component({
        template: `<my-comp token='token'></my-comp>`,
        standalone: false,
      })
      class WrapperComp {
        @ViewChild(MyComp) myComp!: MyComp;
      }

      TestBed.configureTestingModule({declarations: [MyComp, WrapperComp]});

      const fixture = TestBed.createComponent(WrapperComp);
      fixture.detectChanges();
      expect(fixture.componentInstance.myComp.token).toBe('token with factory');
    });
  });

  describe('inject()', () => {
    it('should work in a directive constructor', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');

      @Component({
        selector: 'test-cmp',
        template: '{{value}}',
        providers: [{provide: TOKEN, useValue: 'injected value'}],
      })
      class TestCmp {
        value: string;
        constructor() {
          this.value = inject(TOKEN);
        }
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('injected value');
    });

    it('should work in a service constructor when the service is provided on a directive', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');

      @Injectable()
      class Service {
        value: string;
        constructor() {
          this.value = inject(TOKEN);
        }
      }

      @Component({
        selector: 'test-cmp',
        template: '{{service.value}}',
        providers: [Service, {provide: TOKEN, useValue: 'injected value'}],
      })
      class TestCmp {
        constructor(readonly service: Service) {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('injected value');
    });

    it('should be able to inject special tokens like ChangeDetectorRef', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');

      @Component({
        selector: 'test-cmp',
        template: '{{value}}',
      })
      class TestCmp {
        cdr = inject(ChangeDetectorRef);
        value = 'before';
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.componentInstance.value = 'after';
      fixture.componentInstance.cdr.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('after');
    });

    it('should work in a service constructor', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'injected value',
      });

      @Injectable({providedIn: 'root'})
      class Service {
        value: string;
        constructor() {
          this.value = inject(TOKEN);
        }
      }

      const service = TestBed.inject(Service);
      expect(service.value).toEqual('injected value');
    });

    it('should work in a useFactory definition for a service', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'injected value',
      });

      @Injectable({
        providedIn: 'root',
        useFactory: () => new Service(inject(TOKEN)),
      })
      class Service {
        constructor(readonly value: string) {}
      }

      expect(TestBed.inject(Service).value).toEqual('injected value');
    });

    it('should work for field injection', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'injected value',
      });

      @Injectable({providedIn: 'root'})
      class Service {
        value = inject(TOKEN);
      }

      const service = TestBed.inject(Service);
      expect(service.value).toEqual('injected value');
    });

    it('should not give non-node services access to the node context', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');

      @Injectable({providedIn: 'root'})
      class Service {
        value: string;
        constructor() {
          this.value = inject(TOKEN, {optional: true}) ?? 'default value';
        }
      }

      @Component({
        selector: 'test-cmp',
        template: '{{service.value}}',
        providers: [{provide: TOKEN, useValue: 'injected value'}],
      })
      class TestCmp {
        service: Service;
        constructor() {
          // `Service` is injected starting from the component context, where `inject` is
          // `ɵɵdirectiveInject` under the hood. However, this should reach the root injector which
          // should _not_ use `ɵɵdirectiveInject` to inject dependencies of `Service`, so `TOKEN`
          // should not be visible to `Service`.
          this.service = inject(Service);
        }
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('default value');
    });

    describe('with an options object argument', () => {
      it('should be able to optionally inject a service', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        @Component({
          template: '',
        })
        class TestCmp {
          value = inject(TOKEN, {optional: true});
        }

        expect(TestBed.createComponent(TestCmp).componentInstance.value).toBeNull();
      });

      it('should be able to use skipSelf injection', () => {
        const TOKEN = new InjectionToken<string>('TOKEN', {
          providedIn: 'root',
          factory: () => 'from root',
        });
        @Component({
          template: '',
          providers: [{provide: TOKEN, useValue: 'from component'}],
        })
        class TestCmp {
          value = inject(TOKEN, {skipSelf: true});
        }

        expect(TestBed.createComponent(TestCmp).componentInstance.value).toEqual('from root');
      });

      it('should be able to use self injection', () => {
        const TOKEN = new InjectionToken<string>('TOKEN', {
          providedIn: 'root',
          factory: () => 'from root',
        });

        @Component({
          template: '',
        })
        class TestCmp {
          value = inject(TOKEN, {self: true, optional: true});
        }

        expect(TestBed.createComponent(TestCmp).componentInstance.value).toBeNull();
      });

      it('should be able to use host injection', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        @Component({
          selector: 'child',
          template: '{{value}}',
        })
        class ChildCmp {
          value = inject(TOKEN, {host: true, optional: true}) ?? 'not found';
        }

        @Component({
          imports: [ChildCmp],
          template: '<child></child>',
          providers: [{provide: TOKEN, useValue: 'from parent'}],
          encapsulation: ViewEncapsulation.None,
        })
        class ParentCmp {}

        const fixture = TestBed.createComponent(ParentCmp);
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<child>not found</child>');
      });

      it('should not indicate it returns null when optional is explicitly false', () => {
        const TOKEN = new InjectionToken<string>('TOKEN', {
          providedIn: 'root',
          factory: () => 'from root',
        });

        @Component({
          template: '',
        })
        class TestCmp {
          // TypeScript will check if this assignment is legal, which won't be the case if
          // inject() erroneously returns a `string|null` type here.
          value: string = inject(TOKEN, {optional: false});
        }

        expect(TestBed.createComponent(TestCmp).componentInstance.value).toEqual('from root');
      });
    });
  });

  describe('injection flags', () => {
    describe('represented as an options object argument', () => {
      it('should be able to optionally inject a service', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        @Component({
          template: '',
        })
        class TestCmp {
          nodeInjector = inject(Injector);
          envInjector = inject(EnvironmentInjector);
        }

        const {nodeInjector, envInjector} = TestBed.createComponent(TestCmp).componentInstance;
        expect(nodeInjector.get(TOKEN, undefined, {optional: true})).toBeNull();
        expect(envInjector.get(TOKEN, undefined, {optional: true})).toBeNull();
      });

      it('should include `null` into the result type when the optional flag is used', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        @Component({
          template: '',
        })
        class TestCmp {
          nodeInjector = inject(Injector);
          envInjector = inject(EnvironmentInjector);
        }

        const {nodeInjector, envInjector} = TestBed.createComponent(TestCmp).componentInstance;

        const flags: InjectOptions = {optional: true};

        let nodeInjectorResult = nodeInjector.get(TOKEN, undefined, flags);
        expect(nodeInjectorResult).toBe(null);

        // Verify that `null` can be a valid value (from typing standpoint),
        // the line below would fail a type check in case the result doesn't
        // have `null` in the type.
        nodeInjectorResult = null;

        let envInjectorResult = envInjector.get(TOKEN, undefined, flags);
        expect(envInjectorResult).toBe(null);

        // Verify that `null` can be a valid value (from typing standpoint),
        // the line below would fail a type check in case the result doesn't
        // have `null` in the type.
        envInjectorResult = null;
      });

      it('should be able to use skipSelf injection in NodeInjector', () => {
        const TOKEN = new InjectionToken<string>('TOKEN', {
          providedIn: 'root',
          factory: () => 'from root',
        });
        @Component({
          template: '',
          providers: [{provide: TOKEN, useValue: 'from component'}],
        })
        class TestCmp {
          nodeInjector = inject(Injector);
        }

        const {nodeInjector} = TestBed.createComponent(TestCmp).componentInstance;
        expect(nodeInjector.get(TOKEN, undefined, {skipSelf: true})).toEqual('from root');
      });

      it('should be able to use skipSelf injection in EnvironmentInjector', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');
        const parent = TestBed.inject(EnvironmentInjector);
        const root = createEnvironmentInjector([{provide: TOKEN, useValue: 'from root'}], parent);
        const child = createEnvironmentInjector([{provide: TOKEN, useValue: 'from child'}], root);

        expect(child.get(TOKEN)).toEqual('from child');
        expect(child.get(TOKEN, undefined, {skipSelf: true})).toEqual('from root');
      });

      it('should be able to use self injection in NodeInjector', () => {
        const TOKEN = new InjectionToken<string>('TOKEN', {
          providedIn: 'root',
          factory: () => 'from root',
        });

        @Component({
          template: '',
        })
        class TestCmp {
          nodeInjector = inject(Injector);
        }

        const {nodeInjector} = TestBed.createComponent(TestCmp).componentInstance;
        expect(nodeInjector.get(TOKEN, undefined, {self: true, optional: true})).toBeNull();
      });

      it('should be able to use self injection in EnvironmentInjector', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');
        const parent = TestBed.inject(EnvironmentInjector);
        const root = createEnvironmentInjector([{provide: TOKEN, useValue: 'from root'}], parent);
        const child = createEnvironmentInjector([], root);

        expect(child.get(TOKEN, undefined, {self: true, optional: true})).toBeNull();
      });

      it('should be able to use host injection', () => {
        const TOKEN = new InjectionToken<string>('TOKEN');

        @Component({
          selector: 'child',
          template: '{{ value }}',
        })
        class ChildCmp {
          nodeInjector = inject(Injector);
          value = this.nodeInjector.get(TOKEN, 'not found', {host: true, optional: true});
        }

        @Component({
          imports: [ChildCmp],
          template: '<child></child>',
          providers: [{provide: TOKEN, useValue: 'from parent'}],
          encapsulation: ViewEncapsulation.None,
        })
        class ParentCmp {}

        const fixture = TestBed.createComponent(ParentCmp);
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<child>not found</child>');
      });
    });
  });

  describe('runInInjectionContext', () => {
    it("should return the function's return value", () => {
      const injector = TestBed.inject(EnvironmentInjector);
      const returnValue = runInInjectionContext(injector, () => 3);
      expect(returnValue).toBe(3);
    });

    it('should work with an NgModuleRef injector', () => {
      const ref = TestBed.inject(NgModuleRef);
      const returnValue = runInInjectionContext(ref.injector, () => 3);
      expect(returnValue).toBe(3);
    });

    it('should return correct injector reference', () => {
      const ngModuleRef = TestBed.inject(NgModuleRef);
      const ref1 = runInInjectionContext(ngModuleRef.injector, () => inject(Injector));
      const ref2 = ngModuleRef.injector.get(Injector);
      expect(ref1).toBe(ref2);
    });

    it('should make inject() available', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = createEnvironmentInjector(
        [{provide: TOKEN, useValue: 'from injector'}],
        TestBed.inject(EnvironmentInjector),
      );

      const result = runInInjectionContext(injector, () => inject(TOKEN));
      expect(result).toEqual('from injector');
    });

    it('should properly clean up after the function returns', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = TestBed.inject(EnvironmentInjector);
      runInInjectionContext(injector, () => {});
      expect(() => inject(TOKEN, {optional: true})).toThrow();
    });

    it('should properly clean up after the function throws', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = TestBed.inject(EnvironmentInjector);
      expect(() =>
        runInInjectionContext(injector, () => {
          throw new Error('crashes!');
        }),
      ).toThrow();
      expect(() => inject(TOKEN, {optional: true})).toThrow();
    });

    it('should set the correct inject implementation', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'from root',
      });

      @Component({
        template: '',
        providers: [{provide: TOKEN, useValue: 'from component'}],
      })
      class TestCmp {
        envInjector = inject(EnvironmentInjector);

        tokenFromComponent = inject(TOKEN);
        tokenFromEnvContext = runInInjectionContext(this.envInjector, () => inject(TOKEN));

        // Attempt to inject ViewContainerRef within the environment injector's context. This should
        // not be available, so the result should be `null`.
        vcrFromEnvContext = runInInjectionContext(this.envInjector, () =>
          inject(ViewContainerRef, {optional: true}),
        );
      }

      const instance = TestBed.createComponent(TestCmp).componentInstance;
      expect(instance.tokenFromComponent).toEqual('from component');
      expect(instance.tokenFromEnvContext).toEqual('from root');
      expect(instance.vcrFromEnvContext).toBeNull();
    });

    it('should support node injectors', () => {
      @Component({
        template: '',
      })
      class TestCmp {
        injector = inject(Injector);

        vcrFromEnvContext = runInInjectionContext(this.injector, () =>
          inject(ViewContainerRef, {optional: true}),
        );
      }

      const instance = TestBed.createComponent(TestCmp).componentInstance;
      expect(instance.vcrFromEnvContext).not.toBeNull();
    });

    it('should be reentrant', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'from root',
      });

      const parentInjector = TestBed.inject(EnvironmentInjector);
      const childInjector = createEnvironmentInjector(
        [{provide: TOKEN, useValue: 'from child'}],
        parentInjector,
      );

      const results = runInInjectionContext(parentInjector, () => {
        const fromParentBefore = inject(TOKEN);
        const fromChild = runInInjectionContext(childInjector, () => inject(TOKEN));
        const fromParentAfter = inject(TOKEN);
        return {fromParentBefore, fromChild, fromParentAfter};
      });

      expect(results.fromParentBefore).toEqual('from root');
      expect(results.fromChild).toEqual('from child');
      expect(results.fromParentAfter).toEqual('from root');
    });

    it('should not function on a destroyed injector', () => {
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      injector.destroy();
      expect(() => runInInjectionContext(injector, () => {})).toThrow();
    });
  });

  describe('assertInInjectionContext', () => {
    function placeholder() {}

    it('should throw if not in an injection context', () => {
      expect(() => assertInInjectionContext(placeholder)).toThrowMatching(
        (e: Error) =>
          e instanceof RuntimeError && e.code === RuntimeErrorCode.MISSING_INJECTION_CONTEXT,
      );
    });

    it('should not throw if in an EnvironmentInjector context', () => {
      expect(() => {
        TestBed.runInInjectionContext(() => {
          assertInInjectionContext(placeholder);
        });
      }).not.toThrow();
    });

    it('should not throw if in an element injector context', () => {
      expect(() => {
        @Component({
          template: '',
          standalone: false,
        })
        class EmptyCmp {}

        const fixture = TestBed.createComponent(EmptyCmp);
        runInInjectionContext(fixture.componentRef.injector, () => {
          assertInInjectionContext(placeholder);
        });
      }).not.toThrow();
    });
  });

  describe('useExisting and optional', () => {
    const token = new InjectionToken('token');
    const existing = new InjectionToken('existing');

    it('should return null when injecting a missing useExisting provider with optional: true in a node injector', () => {
      let value: unknown;

      @Directive({selector: '[dir]'})
      class Dir {
        constructor() {
          value = inject(token, {optional: true});
        }
      }

      @Component({
        template: '<div dir></div>',
        imports: [Dir],
        providers: [{provide: token, useExisting: existing}],
      })
      class App {}

      TestBed.createComponent(App);
      expect(value).toBe(null);
    });

    it('should throw when injecting a missing useExisting provider in a node injector', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        constructor() {
          inject(token, {optional: false});
        }
      }

      @Component({
        template: '<div dir></div>',
        imports: [Dir],
        providers: [{provide: token, useExisting: existing}],
      })
      class App {}

      expect(() => TestBed.createComponent(App)).toThrowError(
        /NG0201: No provider found for `InjectionToken existing/,
      );
    });

    it('should return null when injecting a missing useExisting provider with optional: true in a module injector', () => {
      let value: unknown;

      @Directive({selector: '[dir]', standalone: false})
      class Dir {
        constructor() {
          value = inject(token, {optional: true});
        }
      }

      @Component({template: '<div dir></div>', standalone: false})
      class App {}

      TestBed.configureTestingModule({
        declarations: [App, Dir],
        providers: [{provide: token, useExisting: existing}],
      });
      TestBed.createComponent(App);
      expect(value).toBe(null);
    });

    it('should throw when injecting a missing useExisting provider in a module injector', () => {
      @Directive({selector: '[dir]', standalone: false})
      class Dir {
        constructor() {
          inject(token);
        }
      }

      @Component({template: '<div dir></div>', standalone: false})
      class App {}

      TestBed.configureTestingModule({
        declarations: [App, Dir],
        providers: [{provide: token, useExisting: existing}],
      });

      expect(() => TestBed.createComponent(App)).toThrowError(
        /NG0201: No provider found for `InjectionToken existing`/,
      );
    });
  });

  it('should be able to use Host in `useFactory` dependency config', () => {
    // Scenario:
    // ---------
    // <root (provides token A)>
    //   <comp (provides token B via useFactory(@Host() @Inject(A))></comp>
    // </root>
    @Component({
      selector: 'root',
      template: '<comp></comp>',
      viewProviders: [
        {
          provide: 'A',
          useValue: 'A from Root',
        },
      ],
      standalone: false,
    })
    class Root {}

    @Component({
      selector: 'comp',
      template: '{{ token }}',
      viewProviders: [
        {
          provide: 'B',
          deps: [[new Inject('A'), new Host()]],
          useFactory: (token: string) => `${token} (processed by useFactory)`,
        },
      ],
      standalone: false,
    })
    class Comp {
      constructor(@Inject('B') readonly token: string) {}
    }

    @Component({
      template: `<root></root>`,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [Root, Comp, App]});

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('A from Root (processed by useFactory)');
  });

  it('should not lookup outside of the host element when Host is used in `useFactory`', () => {
    // Scenario:
    // ---------
    // <root (provides token A)>
    //   <intermediate>
    //     <comp (provides token B via useFactory(@Host() @Inject(A))></comp>
    //   </intermediate>
    // </root>
    @Component({
      selector: 'root',
      template: '<intermediate></intermediate>',
      viewProviders: [
        {
          provide: 'A',
          useValue: 'A from Root',
        },
      ],
      standalone: false,
    })
    class Root {}

    @Component({
      selector: 'intermediate',
      template: '<comp></comp>',
      standalone: false,
    })
    class Intermediate {}

    @Component({
      selector: 'comp',
      template: '{{ token }}',
      viewProviders: [
        {
          provide: 'B',
          deps: [[new Inject('A'), new Host(), new Optional()]],
          useFactory: (token: string) =>
            token ? `${token} (processed by useFactory)` : 'No token A found',
        },
      ],
      standalone: false,
    })
    class Comp {
      constructor(@Inject('B') readonly token: string) {}
    }

    @Component({
      template: `<root></root>`,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [Root, Comp, App, Intermediate]});

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // Making sure that the `@Host` takes effect and token `A` becomes unavailable in DI since it's
    // defined one level up from the Comp's host view.
    expect(fixture.nativeElement.textContent).toBe('No token A found');
  });

  it('should not cause cyclic dependency if same token is requested in deps with @SkipSelf', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [
        {
          provide: LOCALE_ID,
          useFactory: () => 'ja-JP',
          // Note: `LOCALE_ID` is also provided within APPLICATION_MODULE_PROVIDERS, so we use it
          // here as a dep and making sure it doesn't cause cyclic dependency (since @SkipSelf is
          // present)
          deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]],
        },
      ],
      standalone: false,
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('ja-JP');
  });

  it('module-level deps should not access Component/Directive providers', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [
        {
          provide: 'LOCALE_ID_DEP', //
          useValue: 'LOCALE_ID_DEP_VALUE',
        },
      ],
      standalone: false,
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({
      declarations: [MyComp],
      providers: [
        {
          provide: LOCALE_ID,
          // we expect `localeDepValue` to be undefined, since it's not provided at a module level
          useFactory: (localeDepValue: any) => localeDepValue || 'en-GB',
          deps: [[new Inject('LOCALE_ID_DEP'), new Optional()]],
        },
      ],
    });
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('en-GB');
  });

  it('should skip current level while retrieving tokens if @SkipSelf is defined', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{provide: LOCALE_ID, useFactory: () => 'en-GB'}],
      standalone: false,
    })
    class MyComp {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    // takes `LOCALE_ID` from module injector, since we skip Component level with @SkipSelf
    expect(fixture.componentInstance.localeId).toBe(DEFAULT_LOCALE_ID);
  });

  it('should work when injecting dependency in Directives', () => {
    @Directive({
      selector: '[dir]', //
      providers: [{provide: LOCALE_ID, useValue: 'ja-JP'}],
      standalone: false,
    })
    class MyDir {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }
    @Component({
      selector: 'my-comp',
      template: '<div dir></div>',
      providers: [{provide: LOCALE_ID, useValue: 'en-GB'}],
      standalone: false,
    })
    class MyComp {
      @ViewChild(MyDir) myDir!: MyDir;
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyDir, MyComp, MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.myDir.localeId).toBe('en-GB');
  });

  describe('@Attribute', () => {
    it('should inject attributes', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(
          @Attribute('exist') public exist: string,
          @Attribute('nonExist') public nonExist: string,
        ) {}
      }

      @Component({
        template: '<div dir exist="existValue" other="ignore"></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.nonExist).toBeNull();
    });

    it('should inject attributes on <ng-template>', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(
          @Attribute('exist') public exist: string,
          @Attribute('dir') public myDirectiveAttrValue: string,
        ) {}
      }

      @Component({
        template: '<ng-template dir="initial" exist="existValue" other="ignore"></ng-template>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.myDirectiveAttrValue).toBe('initial');
    });

    it('should inject attributes on <ng-container>', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(
          @Attribute('exist') public exist: string,
          @Attribute('dir') public myDirectiveAttrValue: string,
        ) {}
      }

      @Component({
        template: '<ng-container dir="initial" exist="existValue" other="ignore"></ng-container>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.myDirectiveAttrValue).toBe('initial');
    });

    it('should be able to inject different kinds of attributes', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(
          @Attribute('class') public className: string,
          @Attribute('style') public inlineStyles: string,
          @Attribute('other-attr') public otherAttr: string,
        ) {}
      }

      @Component({
        template:
          '<div dir style="margin: 1px; color: red;" class="hello there" other-attr="value"></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.otherAttr).toBe('value');
      expect(directive.className).toBe('hello there');
      expect(directive.inlineStyles).toMatch(/color:\s*red/);
      expect(directive.inlineStyles).toMatch(/margin:\s*1px/);
    });

    it('should not inject attributes with namespace', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(
          @Attribute('exist') public exist: string,
          @Attribute('svg:exist') public namespacedExist: string,
          @Attribute('other') public other: string,
        ) {}
      }

      @Component({
        template:
          '<div dir exist="existValue" svg:exist="testExistValue" other="otherValue"></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.namespacedExist).toBeNull();
      expect(directive.other).toBe('otherValue');
    });

    it('should not inject attributes representing bindings and outputs', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        @Input() binding!: string;
        @Output() output = new EventEmitter();
        constructor(
          @Attribute('exist') public exist: string,
          @Attribute('binding') public bindingAttr: string,
          @Attribute('output') public outputAttr: string,
          @Attribute('other') public other: string,
        ) {}
      }

      @Component({
        template:
          '<div dir exist="existValue" [binding]="bindingValue" (output)="outputValue" other="otherValue" ignore="ignoreValue"></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.bindingAttr).toBeNull();
      expect(directive.outputAttr).toBeNull();
      expect(directive.other).toBe('otherValue');
    });

    it('should inject `null` for attributes with data bindings', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(@Attribute('title') public attrValue: string) {}
      }

      @Component({
        template: '<div dir title="title {{ value }}"></div>',
        standalone: false,
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance!: MyDir;
        value = 'value';
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.directiveInstance.attrValue).toBeNull();
      expect(fixture.nativeElement.querySelector('div').getAttribute('title')).toBe('title value');
    });
  });

  describe('HostAttributeToken', () => {
    it('should inject an attribute on an element node', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'));
      }

      @Component({
        template: '<div dir some-attr="foo" other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('foo');
    });

    it('should inject an attribute on <ng-template>', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'));
      }

      @Component({
        template: '<ng-template dir some-attr="foo" other="ignore"></ng-template>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('foo');
    });

    it('should inject an attribute on <ng-container>', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'));
      }

      @Component({
        template: '<ng-container dir some-attr="foo" other="ignore"></ng-container>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('foo');
    });

    it('should be able to inject different kinds of attributes', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        className = inject(new HostAttributeToken('class'));
        inlineStyles = inject(new HostAttributeToken('style'));
        value = inject(new HostAttributeToken('some-attr'));
      }

      @Component({
        template: `
          <div
            dir
            style="margin: 1px; color: red;"
            class="hello there"
            some-attr="foo"
            other="ignore"></div>
        `,
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.dir;
      expect(directive.className).toBe('hello there');
      expect(directive.inlineStyles).toMatch(/color:\s*red/);
      expect(directive.inlineStyles).toMatch(/margin:\s*1px/);
      expect(directive.value).toBe('foo');
    });

    it('should throw a DI error when injecting a non-existent attribute', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'));
      }

      @Component({
        template: '<div dir other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      expect(() => TestBed.createComponent(TestCmp)).toThrowError(
        /No provider for HostAttributeToken some-attr found/,
      );
    });

    it('should not throw a DI error when injecting a non-existent attribute with optional: true', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'), {optional: true});
      }

      @Component({
        template: '<div dir other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe(null);
    });

    it('should not inject attributes with namespace', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('some-attr'), {optional: true});
        namespaceExists = inject(new HostAttributeToken('svg:exist'), {optional: true});
        other = inject(new HostAttributeToken('other'), {optional: true});
      }

      @Component({
        template: `
          <div dir some-attr="foo" svg:exists="testExistValue" other="otherValue"></div>
        `,
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.dir;
      expect(directive.value).toBe('foo');
      expect(directive.namespaceExists).toBe(null);
      expect(directive.other).toBe('otherValue');
    });

    it('should not inject attributes representing bindings and outputs', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        @Input() binding!: string;
        @Output() output = new EventEmitter();

        exists = inject(new HostAttributeToken('exists'));
        bindingAttr = inject(new HostAttributeToken('binding'), {optional: true});
        outputAttr = inject(new HostAttributeToken('output'), {optional: true});
        other = inject(new HostAttributeToken('other'));
      }

      @Component({
        imports: [Dir],
        template: `
          <div
            dir
            exists="existsValue"
            [binding]="bindingValue"
            (output)="noop()"
            other="otherValue"
            ignore="ignoreValue"></div>`,
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
        bindingValue = 'hello';
        noop() {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.dir;
      expect(directive.exists).toBe('existsValue');
      expect(directive.bindingAttr).toBe(null);
      expect(directive.outputAttr).toBe(null);
      expect(directive.other).toBe('otherValue');
    });

    it('should not inject data-bound attributes', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(new HostAttributeToken('title'), {optional: true});
      }

      @Component({
        template: '<div dir title="foo {{value}}" other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
        value = 123;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(null);
      expect(fixture.nativeElement.querySelector('[dir]').getAttribute('title')).toBe('foo 123');
    });

    it('should inject an attribute using @Inject', () => {
      const TOKEN = new HostAttributeToken('some-attr');

      @Directive({selector: '[dir]'})
      class Dir {
        constructor(@Inject(TOKEN) readonly value: string) {}
      }

      @Component({
        template: '<div dir some-attr="foo" other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('foo');
    });

    it('should throw when injecting a non-existent attribute using @Inject', () => {
      const TOKEN = new HostAttributeToken('some-attr');

      @Directive({selector: '[dir]'})
      class Dir {
        constructor(@Inject(TOKEN) readonly value: string) {}
      }

      @Component({
        template: '<div dir other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      expect(() => TestBed.createComponent(TestCmp)).toThrowError(
        /No provider for HostAttributeToken some-attr found/,
      );
    });

    it('should not throw when injecting a non-existent attribute using @Inject @Optional', () => {
      const TOKEN = new HostAttributeToken('some-attr');

      @Directive({selector: '[dir]'})
      class Dir {
        constructor(@Inject(TOKEN) @Optional() readonly value: string | null) {}
      }

      @Component({
        template: '<div dir other="ignore"></div>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe(null);
    });
  });

  describe('HOST_TAG_NAME', () => {
    it('should inject the tag name on an element node', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(HOST_TAG_NAME);
      }

      @Component({
        template: `
          <div dir #v1></div>
          <span dir #v2></span>
          <svg dir #v3></svg>
          <custom-component dir #v4></custom-component>
          <video dir #v5></video>
        `,
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild('v1', {read: Dir}) value1!: Dir;
        @ViewChild('v2', {read: Dir}) value2!: Dir;
        @ViewChild('v3', {read: Dir}) value3!: Dir;
        @ViewChild('v4', {read: Dir}) value4!: Dir;
        @ViewChild('v5', {read: Dir}) value5!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.value1.value).toBe('div');
      expect(fixture.componentInstance.value2.value).toBe('span');
      expect(fixture.componentInstance.value3.value).toBe('svg');
      expect(fixture.componentInstance.value4.value).toBe('custom-component');
      expect(fixture.componentInstance.value5.value).toBe('video');
    });

    it('should throw a DI error when injecting into non-DOM nodes', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(HOST_TAG_NAME);
      }

      @Component({
        template: '<ng-container dir></ng-container>',
        imports: [Dir],
      })
      class TestNgContainer {
        @ViewChild(Dir) dir!: Dir;
      }

      @Component({
        template: '<ng-template dir></ng-template>',
        imports: [Dir],
      })
      class TestNgTemplate {
        @ViewChild(Dir) dir!: Dir;
      }

      expect(() => TestBed.createComponent(TestNgContainer)).toThrowError(
        /HOST_TAG_NAME was used on an <ng-container> which doesn't have an underlying element in the DOM/,
      );

      expect(() => TestBed.createComponent(TestNgTemplate)).toThrowError(
        /HOST_TAG_NAME was used on an <ng-template> which doesn't have an underlying element in the DOM/,
      );
    });

    it('should not throw a DI error when injecting into non-DOM nodes with optional: true', () => {
      @Directive({selector: '[dir]'})
      class Dir {
        value = inject(HOST_TAG_NAME, {optional: true});
      }

      @Component({
        template: '<ng-container dir></ng-container>',
        imports: [Dir],
      })
      class TestCmp {
        @ViewChild(Dir) dir!: Dir;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe(null);
    });
  });

  it('should support dependencies in Pipes used inside ICUs', () => {
    @Injectable()
    class MyService {
      transform(value: string): string {
        return `${value} (transformed)`;
      }
    }

    @Pipe({
      name: 'somePipe',
      standalone: false,
    })
    class MyPipe {
      constructor(private service: MyService) {}
      transform(value: any): any {
        return this.service.transform(value);
      }
    }

    @Component({
      template: `
        <div i18n>{
          count, select,
          =1 {One}
          other {Other value is: {{count | somePipe}}}
        }</div>
      `,
      standalone: false,
    })
    class MyComp {
      count = '2';
    }

    TestBed.configureTestingModule({
      declarations: [MyPipe, MyComp],
      providers: [MyService],
    });
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('Other value is: 2 (transformed)');
  });

  it('should support dependencies in Pipes used inside i18n blocks', () => {
    @Injectable()
    class MyService {
      transform(value: string): string {
        return `${value} (transformed)`;
      }
    }

    @Pipe({
      name: 'somePipe',
      standalone: false,
    })
    class MyPipe {
      constructor(private service: MyService) {}
      transform(value: any): any {
        return this.service.transform(value);
      }
    }

    @Component({
      template: `
        <ng-template #source i18n>
          {{count | somePipe}} <span>items</span>
        </ng-template>
        <ng-container #target></ng-container>
      `,
      standalone: false,
    })
    class MyComp {
      count = '2';

      @ViewChild('target', {read: ViewContainerRef}) target!: ViewContainerRef;
      @ViewChild('source', {read: TemplateRef}) source!: TemplateRef<any>;

      create() {
        this.target.createEmbeddedView(this.source);
      }
    }

    TestBed.configureTestingModule({
      declarations: [MyPipe, MyComp],
      providers: [MyService],
    });
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    fixture.componentInstance.create();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('2 (transformed) items');
  });

  // TODO: https://angular-team.atlassian.net/browse/FW-1779
  it('should prioritize useFactory over useExisting', () => {
    abstract class Base {}
    @Directive({
      selector: '[dirA]',
      standalone: false,
    })
    class DirA implements Base {}
    @Directive({
      selector: '[dirB]',
      standalone: false,
    })
    class DirB implements Base {}

    const PROVIDER = {provide: Base, useExisting: DirA, useFactory: () => new DirB()};

    @Component({
      selector: 'child',
      template: '',
      providers: [PROVIDER],
      standalone: false,
    })
    class Child {
      constructor(readonly base: Base) {}
    }

    @Component({
      template: `<div dirA> <child></child> </div>`,
      standalone: false,
    })
    class App {
      @ViewChild(DirA) dirA!: DirA;
      @ViewChild(Child) child!: Child;
    }

    const fixture = TestBed.configureTestingModule({
      declarations: [DirA, DirB, App, Child],
    }).createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance.dirA).not.toEqual(
      fixture.componentInstance.child.base,
      'should not get dirA from parent, but create new dirB from the useFactory provider',
    );
  });

  describe('provider access on the same node', () => {
    const token = new InjectionToken<number>('token');

    it('pipes should access providers from the component they are on', () => {
      @Pipe({
        name: 'token',
        standalone: false,
      })
      class TokenPipe {
        constructor(@Inject(token) private _token: string) {}

        transform(value: string): string {
          return value + this._token;
        }
      }

      @Component({
        selector: 'child-comp',
        template: '{{value}}',
        providers: [{provide: token, useValue: 'child'}],
        standalone: false,
      })
      class ChildComp {
        @Input() value: any;
      }

      @Component({
        template: `<child-comp [value]="'' | token"></child-comp>`,
        providers: [{provide: token, useValue: 'parent'}],
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, ChildComp, TokenPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('child');
    });

    it('pipes should not access viewProviders from the component they are on', () => {
      @Pipe({
        name: 'token',
        standalone: false,
      })
      class TokenPipe {
        constructor(@Inject(token) private _token: string) {}

        transform(value: string): string {
          return value + this._token;
        }
      }

      @Component({
        selector: 'child-comp',
        template: '{{value}}',
        viewProviders: [{provide: token, useValue: 'child'}],
        standalone: false,
      })
      class ChildComp {
        @Input() value: any;
      }

      @Component({
        template: `<child-comp [value]="'' | token"></child-comp>`,
        viewProviders: [{provide: token, useValue: 'parent'}],
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, ChildComp, TokenPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('parent');
    });

    it('directives should access providers from the component they are on', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        constructor(@Inject(token) public token: string) {}
      }

      @Component({
        selector: 'child-comp',
        template: '',
        providers: [{provide: token, useValue: 'child'}],
        standalone: false,
      })
      class ChildComp {}

      @Component({
        template: '<child-comp dir></child-comp>',
        providers: [{provide: token, useValue: 'parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dir!: Dir;
      }

      TestBed.configureTestingModule({declarations: [App, ChildComp, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.token).toBe('child');
    });

    it('directives should not access viewProviders from the component they are on', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        constructor(@Inject(token) public token: string) {}
      }

      @Component({
        selector: 'child-comp',
        template: '',
        viewProviders: [{provide: token, useValue: 'child'}],
        standalone: false,
      })
      class ChildComp {}

      @Component({
        template: '<child-comp dir></child-comp>',
        viewProviders: [{provide: token, useValue: 'parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dir!: Dir;
      }

      TestBed.configureTestingModule({declarations: [App, ChildComp, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.token).toBe('parent');
    });
  });

  it('should not be able to inject ViewRef', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class App {
      constructor(_viewRef: ViewRef) {}
    }

    TestBed.configureTestingModule({declarations: [App]});
    expect(() => TestBed.createComponent(App)).toThrowError(
      /NG0201\: No provider found for `ViewRef`/,
    );
  });

  describe('injector when creating embedded view', () => {
    const token = new InjectionToken<string>('greeting');

    @Directive({
      selector: 'menu-trigger',
      standalone: false,
    })
    class MenuTrigger {
      @Input('triggerFor') menu!: TemplateRef<unknown>;

      constructor(private viewContainerRef: ViewContainerRef) {}

      open(injector: Injector | undefined) {
        this.viewContainerRef.createEmbeddedView(this.menu, undefined, {injector});
      }
    }

    it('should be able to provide an injection token through a custom injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu]});
      const injector = Injector.create({providers: [{provide: token, useValue: 'hello'}]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello');
    });

    it('should check only the current node with @Self when providing an injection token through an embedded view injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) @Self() @Optional() public tokenValue: string) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
        `,
        providers: [{provide: token, useValue: 'root'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu]});
      const injector = Injector.create({providers: [{provide: token, useValue: 'hello'}]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBeNull();
    });

    it('should be able to provide an injection token to a nested template through a custom injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
            <menu-trigger #outerTrigger [triggerFor]="outerTemplate"></menu-trigger>
            <ng-template #outerTemplate>
              <menu></menu>

              <menu-trigger #innerTrigger [triggerFor]="innerTemplate"></menu-trigger>
              <ng-template #innerTemplate>
                <menu #innerMenu></menu>
              </ng-template>
            </ng-template>
          `,
        standalone: false,
      })
      class App {
        @ViewChild('outerTrigger', {read: MenuTrigger}) outerTrigger!: MenuTrigger;
        @ViewChild('innerTrigger', {read: MenuTrigger}) innerTrigger!: MenuTrigger;
        @ViewChild('innerMenu', {read: Menu}) innerMenu!: Menu;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.outerTrigger.open(
        Injector.create({providers: [{provide: token, useValue: 'hello'}]}),
      );
      fixture.detectChanges();

      fixture.componentInstance.innerTrigger.open(undefined);
      fixture.detectChanges();

      expect(fixture.componentInstance.innerMenu.tokenValue).toBe('hello');
    });

    it('should be able to resolve a token from a custom grandparent injector if the token is not provided in the parent', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
            <menu-trigger #grandparentTrigger [triggerFor]="grandparentTemplate"></menu-trigger>
            <ng-template #grandparentTemplate>
              <menu></menu>

              <menu-trigger #parentTrigger [triggerFor]="parentTemplate"></menu-trigger>
              <ng-template #parentTemplate>
                <menu></menu>

                <menu-trigger #childTrigger [triggerFor]="childTemplate"></menu-trigger>
                <ng-template #childTemplate>
                  <menu #childMenu></menu>
                </ng-template>
              </ng-template>
            </ng-template>
          `,
        standalone: false,
      })
      class App {
        @ViewChild('grandparentTrigger', {read: MenuTrigger}) grandparentTrigger!: MenuTrigger;
        @ViewChild('parentTrigger', {read: MenuTrigger}) parentTrigger!: MenuTrigger;
        @ViewChild('childTrigger', {read: MenuTrigger}) childTrigger!: MenuTrigger;
        @ViewChild('childMenu', {read: Menu}) childMenu!: Menu;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.grandparentTrigger.open(
        Injector.create({providers: [{provide: token, useValue: 'hello'}]}),
      );
      fixture.detectChanges();

      fixture.componentInstance.parentTrigger.open(Injector.create({providers: []}));
      fixture.detectChanges();

      fixture.componentInstance.childTrigger.open(undefined);
      fixture.detectChanges();

      expect(fixture.componentInstance.childMenu.tokenValue).toBe('hello');
    });

    it('should resolve value from node injector if it is lower than embedded view injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        selector: 'wrapper',
        providers: [{provide: token, useValue: 'hello from wrapper'}],
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
        `,
        standalone: false,
      })
      class Wrapper {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <wrapper></wrapper>
          </ng-template>
        `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Wrapper) wrapper!: Wrapper;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu, Wrapper]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(
        Injector.create({providers: [{provide: token, useValue: 'hello from injector'}]}),
      );
      fixture.detectChanges();

      fixture.componentInstance.wrapper.trigger.open(undefined);
      fixture.detectChanges();

      expect(fixture.componentInstance.wrapper.menu.tokenValue).toBe('hello from wrapper');
    });

    it('should be able to inject a value provided at the module level', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu],
        exports: [App, MenuTrigger, Menu],
        providers: [{provide: token, useValue: 'hello'}],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({providers: []});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello');
    });

    it('should have value from custom injector take precedence over module injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu],
        exports: [App, MenuTrigger, Menu],
        providers: [{provide: token, useValue: 'hello from module'}],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from injector');
    });

    it('should have value from custom injector take precedence over parent injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu],
        exports: [App, MenuTrigger, Menu],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from injector');
    });

    it('should be able to inject built-in tokens when a custom injector is provided', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(
          public elementRef: ElementRef,
          public changeDetectorRef: ChangeDetectorRef,
        ) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu]});
      const injector = Injector.create({providers: []});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.elementRef.nativeElement).toBe(
        fixture.nativeElement.querySelector('menu'),
      );
      expect(fixture.componentInstance.menu.changeDetectorRef).toBeTruthy();
    });

    it('should have value from parent component injector take precedence over module injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        template: `
            <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
            <ng-template #menuTemplate>
              <menu></menu>
            </ng-template>
          `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu],
        exports: [App, MenuTrigger, Menu],
        providers: [{provide: token, useValue: 'hello from module'}],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({providers: []});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from parent');
    });

    it('should be able to inject an injectable with dependencies', () => {
      @Injectable()
      class Greeter {
        constructor(@Inject(token) private tokenValue: string) {}

        greet() {
          return `hello from ${this.tokenValue}`;
        }
      }

      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(public greeter: Greeter) {}
      }

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
      `,
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu],
        exports: [App, MenuTrigger, Menu],
        providers: [{provide: token, useValue: 'module'}],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [
          {provide: Greeter, useClass: Greeter},
          {provide: token, useValue: 'injector'},
        ],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.greeter.greet()).toBe('hello from injector');
    });

    it('should be able to inject a value from a grandparent component when a custom injector is provided', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Component({
        selector: 'parent',
        template: `
            <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
            <ng-template #menuTemplate>
              <menu></menu>
            </ng-template>
           `,
        standalone: false,
      })
      class Parent {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @Component({
        template: '<parent></parent>',
        providers: [{provide: token, useValue: 'hello from grandparent'}],
        standalone: false,
      })
      class GrandParent {
        @ViewChild(Parent) parent!: Parent;
      }

      TestBed.configureTestingModule({declarations: [GrandParent, Parent, MenuTrigger, Menu]});
      const injector = Injector.create({providers: []});
      const fixture = TestBed.createComponent(GrandParent);
      fixture.detectChanges();

      fixture.componentInstance.parent.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.parent.menu.tokenValue).toBe('hello from grandparent');
    });

    it('should be able to use a custom injector when created through TemplateRef', () => {
      let injectedValue: string | undefined;

      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) tokenValue: string) {
          injectedValue = tokenValue;
        }
      }

      @Component({
        template: `
          <ng-template>
            <menu></menu>
          </ng-template>
        `,
        standalone: false,
      })
      class App {
        @ViewChild(TemplateRef) template!: TemplateRef<unknown>;
      }

      @NgModule({
        declarations: [App, Menu],
        exports: [App, Menu],
        providers: [{provide: token, useValue: 'hello from module'}],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.template.createEmbeddedView({}, injector);
      fixture.detectChanges();

      expect(injectedValue).toBe('hello from injector');
    });

    it('should use a custom injector when the view is created outside of the declaration view', () => {
      const declarerToken = new InjectionToken<string>('declarerToken');
      const creatorToken = new InjectionToken<string>('creatorToken');

      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(
          @Inject(token) public tokenValue: string,
          @Optional() @Inject(declarerToken) public declarerTokenValue: string,
          @Optional() @Inject(creatorToken) public creatorTokenValue: string,
        ) {}
      }

      @Component({
        selector: 'declarer',
        template: '<ng-template><menu></menu></ng-template>',
        providers: [{provide: declarerToken, useValue: 'hello from declarer'}],
        standalone: false,
      })
      class Declarer {
        @ViewChild(Menu) menu!: Menu;
        @ViewChild(TemplateRef) template!: TemplateRef<unknown>;
      }

      @Component({
        selector: 'creator',
        template: '<menu-trigger></menu-trigger>',
        providers: [{provide: creatorToken, useValue: 'hello from creator'}],
        standalone: false,
      })
      class Creator {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
      }

      @Component({
        template: `
              <declarer></declarer>
              <creator></creator>
            `,
        standalone: false,
      })
      class App {
        @ViewChild(Declarer) declarer!: Declarer;
        @ViewChild(Creator) creator!: Creator;
      }

      TestBed.configureTestingModule({declarations: [App, MenuTrigger, Menu, Declarer, Creator]});
      const injector = Injector.create({providers: [{provide: token, useValue: 'hello'}]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {declarer, creator} = fixture.componentInstance;

      creator.trigger.menu = declarer.template;
      creator.trigger.open(injector);
      fixture.detectChanges();

      expect(declarer.menu.tokenValue).toBe('hello');
      expect(declarer.menu.declarerTokenValue).toBe('hello from declarer');
      expect(declarer.menu.creatorTokenValue).toBeNull();
    });

    it('should give precedence to value provided lower in the tree over custom injector', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Directive({
        selector: '[provide-token]',
        providers: [{provide: token, useValue: 'hello from directive'}],
        standalone: false,
      })
      class ProvideToken {}

      @Component({
        template: `
          <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          <ng-template #menuTemplate>
            <section>
              <div provide-token>
                <menu></menu>
              </div>
            </section>
          </ng-template>
        `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu, ProvideToken],
        exports: [App, MenuTrigger, Menu, ProvideToken],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from directive');
    });

    it('should give precedence to value provided in custom injector over one provided higher', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Directive({
        selector: '[provide-token]',
        providers: [{provide: token, useValue: 'hello from directive'}],
        standalone: false,
      })
      class ProvideToken {}

      @Component({
        template: `
              <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
              <div provide-token>
                <ng-template #menuTemplate>
                  <menu></menu>
                </ng-template>
              </div>
            `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu, ProvideToken],
        exports: [App, MenuTrigger, Menu, ProvideToken],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from injector');
    });

    it('should give precedence to value provided lower in the tree over custom injector when crossing view boundaries', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Directive({
        selector: '[provide-token]',
        providers: [{provide: token, useValue: 'hello from directive'}],
        standalone: false,
      })
      class ProvideToken {}

      @Component({
        selector: 'wrapper',
        template: `<div><menu></menu></div>`,
        standalone: false,
      })
      class Wrapper {
        @ViewChild(Menu) menu!: Menu;
      }

      @Component({
        template: `
              <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
              <ng-template #menuTemplate>
                <section provide-token>
                  <wrapper></wrapper>
                </section>
              </ng-template>
            `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Wrapper) wrapper!: Wrapper;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu, ProvideToken, Wrapper],
        exports: [App, MenuTrigger, Menu, ProvideToken, Wrapper],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.wrapper.menu.tokenValue).toBe('hello from directive');
    });

    it('should give precedence to value provided in custom injector over one provided higher when crossing view boundaries', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Directive({
        selector: '[provide-token]',
        providers: [{provide: token, useValue: 'hello from directive'}],
        standalone: false,
      })
      class ProvideToken {}

      @Component({
        selector: 'wrapper',
        template: `<div><menu></menu></div>`,
        standalone: false,
      })
      class Wrapper {
        @ViewChild(Menu) menu!: Menu;
      }

      @Component({
        template: `
              <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
              <div provide-token>
                <ng-template #menuTemplate>
                  <wrapper></wrapper>
                </ng-template>
              </div>
            `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Wrapper) wrapper!: Wrapper;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu, ProvideToken, Wrapper],
        exports: [App, MenuTrigger, Menu, ProvideToken, Wrapper],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      const injector = Injector.create({
        providers: [{provide: token, useValue: 'hello from injector'}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.wrapper.menu.tokenValue).toBe('hello from injector');
    });

    it('should not resolve value at insertion location', () => {
      @Directive({
        selector: 'menu',
        standalone: false,
      })
      class Menu {
        constructor(@Inject(token) public tokenValue: string) {}
      }

      @Directive({
        selector: '[provide-token]',
        providers: [{provide: token, useValue: 'hello from directive'}],
        standalone: false,
      })
      class ProvideToken {}

      @Component({
        template: `
          <div provide-token>
            <menu-trigger [triggerFor]="menuTemplate"></menu-trigger>
          </div>

          <ng-template #menuTemplate>
            <menu></menu>
          </ng-template>
        `,
        providers: [{provide: token, useValue: 'hello from parent'}],
        standalone: false,
      })
      class App {
        @ViewChild(MenuTrigger) trigger!: MenuTrigger;
        @ViewChild(Menu) menu!: Menu;
      }

      @NgModule({
        declarations: [App, MenuTrigger, Menu, ProvideToken],
        exports: [App, MenuTrigger, Menu, ProvideToken],
      })
      class Module {}

      TestBed.configureTestingModule({imports: [Module]});
      // Provide an empty injector so we hit the new code path.
      const injector = Injector.create({providers: []});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.trigger.open(injector);
      fixture.detectChanges();

      expect(fixture.componentInstance.menu.tokenValue).toBe('hello from parent');
    });
  });

  it('should prioritize module providers over additional providers', () => {
    const token = new InjectionToken('token');

    @NgModule({providers: [{provide: token, useValue: 'module'}]})
    class ModuleWithProvider {}

    const injector = createInjector(ModuleWithProvider, null, [
      {provide: token, useValue: 'additional'},
    ]);

    expect(injector.get(token)).toBe('module');
  });

  it('should be able to destroy programmatically created injectors', () => {
    @Injectable()
    class Service {
      ngOnDestroy() {}
    }

    const parentInjector = Injector.create({
      providers: [Service],
      parent: TestBed.inject(Injector),
    });

    const childInjector = Injector.create({providers: [Service], parent: parentInjector});

    const instance = childInjector.get(Service);
    const destroySpy = spyOn(instance, 'ngOnDestroy');

    parentInjector.get(DestroyRef).onDestroy(() => childInjector.destroy());
    parentInjector.destroy();

    expect(destroySpy).toHaveBeenCalled();
  });

  describe('cyclic dependency detector', () => {
    it('should detect cyclic dependency in Module/Environment injector when @Inject is used', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');
      @Injectable()
      class ServiceB {
        constructor(@Inject(A) svc: any) {}
      }

      @Injectable()
      class ServiceA {
        constructor(@Inject(B) svc: any) {}
      }

      @Component({
        selector: 'my-comp',
        template: '...',
      })
      class MyComp {
        constructor(@Inject(A) svc: any) {}
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: A, useClass: ServiceA},
          {provide: B, useClass: ServiceB},
        ],
      });

      expect(() => TestBed.createComponent(MyComp)).toThrowError(
        'NG0200: Circular dependency detected for `InjectionToken A`. ' +
          'Source: DynamicTestModule. ' +
          'Path: InjectionToken A -> InjectionToken B -> InjectionToken A. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    it('should detect cyclic dependency in Module/Environment injector when `inject` is used', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');
      @Injectable()
      class ServiceB {
        a = inject(A);
      }

      @Injectable()
      class ServiceA {
        b = inject(B);
      }

      @Component({
        selector: 'my-comp',
        template: '...',
      })
      class MyComp {
        a = inject(A);
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: A, useClass: ServiceA},
          {provide: B, useClass: ServiceB},
        ],
      });

      expect(() => TestBed.createComponent(MyComp)).toThrowError(
        'NG0200: Circular dependency detected for `InjectionToken A`. ' +
          'Source: DynamicTestModule. ' +
          'Path: InjectionToken A -> InjectionToken B -> InjectionToken A. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    it('should detect cyclic dependency in Module/Environment injector when `Injector.get` is used', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');
      @Injectable()
      class ServiceB {
        a = inject(A);
      }

      @Injectable()
      class ServiceA {
        b = inject(B);
      }

      @Component({
        selector: 'my-comp',
        template: '...',
      })
      class MyComp {
        constructor(private injector: Injector) {}

        readTokenA() {
          this.injector.get(A);
        }
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: A, useClass: ServiceA},
          {provide: B, useClass: ServiceB},
        ],
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(() => fixture.componentInstance.readTokenA()).toThrowError(
        'NG0200: Circular dependency detected for `InjectionToken A`. ' +
          'Source: DynamicTestModule. ' +
          'Path: InjectionToken A -> InjectionToken B -> InjectionToken A. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    it('throws an error on circular module dependencies', () => {
      @NgModule({
        imports: [forwardRef(() => BModule)],
      })
      class AModule {}

      @NgModule({
        imports: [AModule],
      })
      class BModule {}

      expect(() => createInjector(AModule)).toThrowError(
        'NG0200: Circular dependency detected for `AModule`. ' +
          'Path: AModule -> BModule -> AModule. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    it('should detect cyclic dependency in Module/Environment injector when `Injector.get` is used', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');
      @Injectable()
      class ServiceB {
        a = inject(A);
      }

      @Injectable()
      class ServiceA {
        b = inject(B);
      }

      @Component({
        selector: 'my-comp',
        template: '...',
      })
      class MyComp {
        constructor(private injector: Injector) {}

        readTokenA() {
          this.injector.get(A);
        }
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: A, useClass: ServiceA},
          {provide: B, useClass: ServiceB, multi: true},
          {provide: B, useClass: ServiceB, multi: true},
        ],
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(() => fixture.componentInstance.readTokenA()).toThrowError(
        'NG0200: Circular dependency detected for `InjectionToken A`. ' +
          'Source: DynamicTestModule. ' +
          'Path: InjectionToken A -> InjectionToken B -> InjectionToken A. ' +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });

    it('should detect and log cyclic dependencies where multi: true', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');

      @Injectable()
      class AService {
        b = inject(B);
      }

      // BService depends on AService
      @Injectable()
      class BService {
        a = inject(A);
      }

      @Component({
        selector: 'app-root',
        imports: [],
        providers: [
          {provide: A, useClass: AService},
          {provide: B, useClass: BService, multi: true},
          {provide: B, useClass: BService, multi: true},
          {provide: B, useClass: BService, multi: true},
        ],
        template: ``,
      })
      class App {
        a = inject(A);
      }

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0200: Circular dependency detected for `InjectionToken A`. ' +
          "Path: App -> ('InjectionToken A':AService) -> ('InjectionToken B':BService) -> ('InjectionToken A':AService). " +
          'Find more at https://angular.dev/errors/NG0200',
      );
    });
  });
});
