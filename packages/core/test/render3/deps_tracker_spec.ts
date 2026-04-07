/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, forwardRef, NgModule, Pipe} from '../../src/core';

import {NgModuleDef} from '../../src/r3_symbols';
import {
  ComponentType,
  NgModuleType,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
} from '../../src/render3';
import {TEST_ONLY} from '../../src/render3/deps_tracker/deps_tracker';

const {DepsTracker} = TEST_ONLY;

describe('runtime dependency tracker', () => {
  let depsTracker = new DepsTracker();

  beforeEach(() => {
    depsTracker = new DepsTracker();
  });

  describe('getNgModuleScope method', () => {
    it('should include empty scope for a module without any import/declarations/exports', () => {
      @NgModule({})
      class MainModule {}

      const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

      expect(ans.compilation).toEqual({
        directives: new Set(),
        pipes: new Set(),
      });
      expect(ans.exported).toEqual({
        directives: new Set(),
        pipes: new Set(),
      });
    });

    it('should throw if applied to a non NgModule type', () => {
      class RandomClass {}

      expect(() => depsTracker.getNgModuleScope(RandomClass as NgModuleType)).toThrow();
    });

    describe('exports specs', () => {
      it('should include the exported components/directives/pipes in exported scope', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        // No ɵcmp added yet.
        class AsyncComponent {}

        @NgModule({
          exports: [Directive1, Pipe1, Component1, AsyncComponent],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1, AsyncComponent]),
        });
      });

      it('should include the exported scope of an exported module in the exported scope and compilation scope', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @NgModule({
          exports: [Directive1, Pipe1, Component1],
        })
        class SubModule {}

        @NgModule({
          exports: [SubModule],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1]),
        });

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1]),
        });
      });

      it('should combine the directly exported elements with the exported scope of exported module in both exported and compilation scopes', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @NgModule({
          exports: [Directive1, Pipe1, Component1],
        })
        class SubModule {}

        @Component({
          standalone: false,
        })
        class MainComponent {}

        @NgModule({
          exports: [SubModule, MainComponent],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1, MainComponent]),
        });

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1]),
        });
      });
    });

    describe('import specs', () => {
      it('should contain the exported scope of an imported module in compilation scope', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Component({
          standalone: false,
        })
        class PrivateComponent {}

        @NgModule({
          exports: [Directive1, Component1, Pipe1],
          declarations: [PrivateComponent],
        })
        class SubModule {}

        @NgModule({
          imports: [SubModule],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          directives: new Set([Directive1, Component1]),
          pipes: new Set([Pipe1]),
        });
      });

      it('should contain imported standalone components/directive/pipes in compilation scope', () => {
        @Directive()
        class Directive1 {}

        @Pipe({name: 'pipe1'})
        class Pipe1 {}

        @Component({})
        class Component1 {}

        @NgModule({
          imports: [Directive1, Pipe1, Component1],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          directives: new Set([Directive1, Component1]),
          pipes: new Set([Pipe1]),
        });
      });

      it('should contain the exported scope of a depth-2 transitively imported module in compilation scope', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Component({
          standalone: false,
        })
        class PrivateComponent {}

        @NgModule({
          exports: [Directive1, Component1, Pipe1],
          declarations: [PrivateComponent],
        })
        class SubSubModule {}

        @NgModule({exports: [SubSubModule]})
        class SubModule {}

        @NgModule({
          imports: [SubModule],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          directives: new Set([Directive1, Component1]),
          pipes: new Set([Pipe1]),
        });
      });

      it('should poison compilation scope if an import is neither a NgModule nor a standalone component', () => {
        class RandomClass {}

        @NgModule({
          imports: [RandomClass],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation.isPoisoned).toBeTrue();
      });
    });

    describe('declarations specs', () => {
      it('should include declared components/directives/pipes as part of compilation scope', () => {
        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        // No ɵcmp added yet.
        class AsyncComponent {}

        @NgModule({
          declarations: [Directive1, Pipe1, Component1, AsyncComponent],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Directive1, Component1, AsyncComponent]),
        });
        expect(ans.exported).toEqual({
          pipes: new Set(),
          directives: new Set(),
        });
      });

      it('should poison the compilation scope if a standalone component is declared', () => {
        @Component({})
        class Component1 {}

        @NgModule({
          declarations: [Component1],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation.isPoisoned).toBeTrue();
      });

      it('should poison compilation scope if declare a module', () => {
        @NgModule({})
        class SubModule {}

        @NgModule({
          declarations: [SubModule],
        })
        class MainModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation.isPoisoned).toBeTrue();
      });
    });

    describe('cache specs', () => {
      it('should use cache for re-calculation', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @NgModule({
          declarations: [Component1],
        })
        class MainModule {}

        let ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set(),
          directives: new Set([Component1]),
        });

        // Modify the module
        (MainModule as NgModuleType).ɵmod.declarations = [];

        ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set(),
          directives: new Set([Component1]),
        });
      });

      it('should bust the cache correctly', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @NgModule({
          declarations: [Component1],
        })
        class MainModule {}

        let ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set(),
          directives: new Set([Component1]),
        });

        // Modify the module
        (MainModule as NgModuleType).ɵmod.declarations = [];
        depsTracker.clearScopeCacheFor(MainModule as NgModuleType);

        ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set(),
          directives: new Set([]),
        });
      });
    });

    describe('forward ref specs', () => {
      it('should include the exported scope of a forward ref imported module in the compilation scope when compiling in JIT mode', () => {
        @NgModule({imports: [forwardRef(() => SubModule)]})
        class MainModule {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({exports: [Component1, Directive1, Pipe1]})
        class SubModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the exported scope of a forward ref imported module in the compilation scope when compiling in AOT mode', () => {
        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({imports: () => [SubModule]});

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({exports: [Component1, Directive1, Pipe1]})
        class SubModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include forward ref imported standalone component in the compilation scope when compiling in JIT mode', () => {
        @NgModule({imports: [forwardRef(() => Component1)]})
        class MainModule {}

        @Component({})
        class Component1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([]),
          directives: new Set([Component1]),
        });
      });

      it('should include forward ref imported standalone component in the compilation scope when compiling in AOT mode', () => {
        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({imports: () => [Component1]});

        @Component({})
        class Component1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([]),
          directives: new Set([Component1]),
        });
      });

      it('should include the forward ref declarations in the compilation scope when compiling in JIT mode', () => {
        @NgModule({
          declarations: [
            forwardRef(() => Component1),
            forwardRef(() => Directive1),
            forwardRef(() => Pipe1),
          ],
        })
        class MainModule {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the forward ref declarations in the compilation scope when compiling in AOT mode', () => {
        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({
          declarations: () => [Component1, Directive1, Pipe1],
        });

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the exported forward ref components/directives/pipes in exported scope when compiling in JIT mode', () => {
        @NgModule({
          exports: [
            forwardRef(() => Component1),
            forwardRef(() => Directive1),
            forwardRef(() => Pipe1),
          ],
        })
        class MainModule {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the exported forward ref components/directives/pipes in exported scope when compiling in AOT mode', () => {
        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({
          exports: () => [Component1, Directive1, Pipe1],
        });

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the exported scope of an exported forward ref module in the exported and compilation scope when compiling in JIT mode', () => {
        @NgModule({exports: [forwardRef(() => SubModule)]})
        class MainModule {}

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({exports: [Component1, Directive1, Pipe1]})
        class SubModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });

      it('should include the exported scope of an exported forward ref module in the exported and compilation scopes when compiling in AOT mode', () => {
        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({exports: () => [SubModule]});

        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({exports: [Component1, Directive1, Pipe1]})
        class SubModule {}

        const ans = depsTracker.getNgModuleScope(MainModule as NgModuleType);

        expect(ans.compilation).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
        expect(ans.exported).toEqual({
          pipes: new Set([Pipe1]),
          directives: new Set([Component1, Directive1]),
        });
      });
    });
  });

  describe('getStandaloneComponentScope method', () => {
    it('should only include the component itself in the compilation scope when there is no imports', () => {
      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, []);

      expect(ans.compilation).toEqual({
        pipes: new Set([]),
        directives: new Set([MainComponent]),
        ngModules: new Set([]),
      });
    });

    it('should include the imported standalone component/directive/pipes in the compilation scope', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        Component1,
        Directive1,
        Pipe1,
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([]),
      });
    });

    it('should include the imported standalone component/directive/pipes in the compilation scope - nested array case', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        [[Component1], Directive1],
        [[[Pipe1]]],
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([]),
      });
    });

    it('should poison the compilation scope if an import is not standalone', () => {
      @Component({
        standalone: false,
      })
      class Component1 {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        Component1,
      ]);

      expect(ans.compilation.isPoisoned).toBeTrue();
    });

    it('should include the imported module and its exported scope in the compilation scope', () => {
      @Directive({
        standalone: false,
      })
      class Directive1 {}

      @Pipe({
        name: 'pipe1',
        standalone: false,
      })
      class Pipe1 {}

      @Component({
        standalone: false,
      })
      class Component1 {}

      @Component({
        standalone: false,
      })
      class PrivateComponent {}

      @NgModule({
        exports: [Directive1, Component1, Pipe1],
        declarations: [PrivateComponent],
      })
      class SubSubModule {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        SubSubModule,
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([SubSubModule]),
      });
    });

    it('should include the imported module and its exported scope in the compilation scope - case of nested array imports', () => {
      @Directive({
        standalone: false,
      })
      class Directive1 {}

      @Pipe({
        name: 'pipe1',
        standalone: false,
      })
      class Pipe1 {}

      @Component({
        standalone: false,
      })
      class Component1 {}

      @Component({
        standalone: false,
      })
      class PrivateComponent {}

      @NgModule({
        exports: [Directive1, Component1, Pipe1],
        declarations: [PrivateComponent],
      })
      class SubSubModule {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        [SubSubModule],
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([SubSubModule]),
      });
    });

    it('should resolve the imported forward refs and include them in the compilation scope', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      @Component({
        standalone: false,
      })
      class SubModuleComponent {}

      @Directive({
        standalone: false,
      })
      class SubModuleDirective {}

      @Pipe({
        name: 'submodule pipe',
        standalone: false,
      })
      class SubModulePipe {}

      @NgModule({exports: [SubModuleComponent, SubModulePipe, SubModuleDirective]})
      class SubModule {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        forwardRef(() => Component1),
        forwardRef(() => Directive1),
        forwardRef(() => Pipe1),
        forwardRef(() => SubModule),
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1, SubModulePipe]),
        directives: new Set([
          MainComponent,
          Component1,
          Directive1,
          SubModuleComponent,
          SubModuleDirective,
        ]),
        ngModules: new Set([SubModule]),
      });
    });

    it('should resolve the imported forward refs and include them in the compilation scope - case of nested array imports', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      @Component({
        standalone: false,
      })
      class SubModuleComponent {}

      @Directive({
        standalone: false,
      })
      class SubModuleDirective {}

      @Pipe({
        name: 'submodule pipe',
        standalone: false,
      })
      class SubModulePipe {}

      @NgModule({exports: [SubModuleComponent, SubModulePipe, SubModuleDirective]})
      class SubModule {}

      class MainComponent {}

      const ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        [forwardRef(() => Component1)],
        [forwardRef(() => Directive1)],
        [forwardRef(() => Pipe1)],
        [forwardRef(() => SubModule)],
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1, SubModulePipe]),
        directives: new Set([
          MainComponent,
          Component1,
          Directive1,
          SubModuleComponent,
          SubModuleDirective,
        ]),
        ngModules: new Set([SubModule]),
      });
    });

    it('should cache the computed scopes', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      class MainComponent {}

      let ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        Component1,
        Directive1,
        Pipe1,
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([]),
      });

      ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, []);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([]),
      });
    });

    it('should clear the cache correctly', () => {
      @Component({})
      class Component1 {}

      @Directive()
      class Directive1 {}

      @Pipe({name: 'pipe1'})
      class Pipe1 {}

      @Component({
        standalone: false,
      })
      class MainComponent {}

      let ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, [
        Component1,
        Directive1,
        Pipe1,
      ]);

      expect(ans.compilation).toEqual({
        pipes: new Set([Pipe1]),
        directives: new Set([MainComponent, Component1, Directive1]),
        ngModules: new Set([]),
      });

      depsTracker.clearScopeCacheFor(MainComponent as ComponentType<any>);
      ans = depsTracker.getStandaloneComponentScope(MainComponent as ComponentType<any>, []);

      expect(ans.compilation).toEqual({
        pipes: new Set([]),
        directives: new Set([MainComponent]),
        ngModules: new Set([]),
      });
    });
  });

  describe('getComponentDependencies method', () => {
    describe('for non-standalone component', () => {
      it('should include the compilation scope of the declaring module', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class MainComponent {}

        @NgModule({
          declarations: [MainComponent, Component1, Directive1, Pipe1],
        })
        class MainModule {}
        depsTracker.registerNgModule(MainModule as NgModuleType, {});

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1]),
        );
      });

      it('should include the compilation scope of the declaring module when it is forward referenced', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({
          standalone: false,
        })
        class MainComponent {}

        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({
          declarations: () => [MainComponent, Component1, Directive1, Pipe1],
        });
        depsTracker.registerNgModule(MainModule as NgModuleType, {});

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1]),
        );
      });

      it('should return empty dependencies if component has no registered module', () => {
        @Component({
          standalone: false,
        })
        class MainComponent {}
        ɵsetClassDebugInfo(MainComponent, {
          className: 'MainComponent',
          filePath: 'main.ts',
          lineNumber: 11,
        });

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>);

        expect(ans.dependencies).toEqual([]);
      });

      it('should return empty deps if the compilation scope of the declaring module is corrupted', () => {
        class RandomClass {}

        @Component({
          standalone: false,
        })
        class MainComponent {}

        class MainModule {}
        (MainModule as NgModuleType).ɵmod = createNgModuleDef({
          declarations: [MainComponent],
          // Importing an invalid class makes the compilation scope corrupted.
          imports: [RandomClass],
        });
        depsTracker.registerNgModule(MainModule as NgModuleType, {});

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>);

        expect(ans.dependencies).toEqual([]);
      });
    });

    describe('for standalone component', () => {
      it('should always return self (even if component has empty imports)', () => {
        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>);

        expect(ans.dependencies).toEqual([MainComponent]);
      });

      it('should include imported standalone component/directive/pipe', () => {
        @Component({})
        class Component1 {}

        @Directive()
        class Directive1 {}

        @Pipe({name: 'pipe1'})
        class Pipe1 {}

        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          Component1,
          Directive1,
          Pipe1,
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1]),
        );
      });

      it('should include imported forward ref standalone component/directive/pipe', () => {
        @Component({})
        class Component1 {}

        @Directive()
        class Directive1 {}

        @Pipe({name: 'pipe1'})
        class Pipe1 {}

        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          forwardRef(() => Component1),
          forwardRef(() => Directive1),
          forwardRef(() => Pipe1),
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1]),
        );
      });

      it('should ignore imported non-standalone component/directive/pipe', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          Component1,
          Directive1,
          Pipe1,
        ]);

        expect(ans.dependencies).toEqual([]);
      });

      it('should include the imported module and its exported scope', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({
          exports: [Component1, Directive1, Pipe1],
        })
        class SubModule {}

        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          SubModule,
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1, SubModule]),
        );
      });

      it('should include the imported forward ref module and its exported scope', () => {
        @Component({
          standalone: false,
        })
        class Component1 {}

        @Directive({
          standalone: false,
        })
        class Directive1 {}

        @Pipe({
          name: 'pipe1',
          standalone: false,
        })
        class Pipe1 {}

        @NgModule({
          exports: [Component1, Directive1, Pipe1],
        })
        class SubModule {}

        @Component({})
        class MainComponent {}

        const ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          forwardRef(() => SubModule),
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1, Directive1, Pipe1, SubModule]),
        );
      });

      it('should use cache for re-calculation', () => {
        @Component({})
        class Component1 {}

        @Component({})
        class MainComponent {}

        let ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          Component1,
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1]),
        );

        ans = depsTracker.getComponentDependencies(MainComponent as ComponentType<any>, [
          Component1,
        ]);

        expect(ans.dependencies).toEqual(
          jasmine.arrayWithExactContents([MainComponent, Component1]),
        );
      });
    });
  });

  describe('isOrphanComponent method', () => {
    it('should return true for non-standalone component without NgModule', () => {
      @Component({
        standalone: false,
      })
      class MainComponent {}

      expect(depsTracker.isOrphanComponent(MainComponent as ComponentType<any>)).toBeTrue();
    });

    it('should return false for standalone component', () => {
      @Component({})
      class MainComponent {}

      expect(depsTracker.isOrphanComponent(MainComponent as ComponentType<any>)).toBeFalse();
    });

    it('should return false for non-standalone component with its NgModule', () => {
      @Component({
        standalone: false,
      })
      class MainComponent {}

      @NgModule({
        declarations: [MainComponent],
      })
      class MainModule {}
      depsTracker.registerNgModule(MainModule as NgModuleType, {});

      expect(depsTracker.isOrphanComponent(MainComponent as ComponentType<any>)).toBeFalse();
    });

    it('should return false for class which is not a component', () => {
      class RandomClass {}

      expect(depsTracker.isOrphanComponent(RandomClass as ComponentType<any>)).toBeFalse();
    });
  });
});

function createNgModuleDef(data: Partial<NgModuleDef<any>>): NgModuleDef<any> {
  return {
    bootstrap: [],
    declarations: [],
    exports: [],
    imports: [],
    ...data,
  } as NgModuleDef<any>;
}
