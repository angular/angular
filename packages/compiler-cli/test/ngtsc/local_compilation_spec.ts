/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment, TsConfigOptions} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('local compilation', () => {
    let env!: NgtscTestEnvironment;

    function tsconfig(extraOpts: TsConfigOptions = {}) {
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
        },
        angularCompilerOptions: {
          compilationMode: 'experimental-local',
          ...extraOpts,
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    }

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      tsconfig();
    });

    it('should produce no TS semantic diagnostics', () => {
      env.write(
        'test.ts',
        `
        import {SubExternalStuff} from './some-where';
        `,
      );

      env.driveMain();
      const diags = env.driveDiagnostics();

      expect(diags).toEqual([]);
    });

    describe('extra imports generation', () => {
      beforeEach(() => {
        const tsconfig: {[key: string]: any} = {
          extends: '../tsconfig-base.json',
          compilerOptions: {
            baseUrl: '.',
            rootDirs: ['/app'],
          },
          angularCompilerOptions: {
            compilationMode: 'experimental-local',
            generateExtraImportsInLocalMode: true,
          },
        };
        env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
      });

      it('should only include NgModule external import as global import', () => {
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import {SomeExternalStuff} from '/some_external_file';
        import {SomeExternalStuff2} from '/some_external_file2';

        import {BModule} from 'b';

        @NgModule({imports: [SomeExternalStuff, BModule]})
        export class AModule {
        }
        `,
        );
        env.write(
          'b.ts',
          `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BModule {
        }
        `,
        );

        env.driveMain();
        const Comp1Contents = env.getContents('comp1.js');

        expect(Comp1Contents)
          .withContext('NgModule external imports should be included in the global imports')
          .toContain('import "/some_external_file"');
        expect(Comp1Contents)
          .withContext(
            'External import which is not an NgModule import should not be included in the global import',
          )
          .not.toContain('import "/some_external_file2"');
        expect(Comp1Contents)
          .withContext('NgModule internal import should not be included in the global import')
          .not.toContain('import "b"');
      });

      it('should include global imports only in the eligible files', () => {
        env.write(
          'module_and_comp.ts',
          `
        import {NgModule, Component} from '@angular/core';

        @Component({template:'', standalone: true})
        export class Comp3 {
        }

        @NgModule({declarations:[Comp3]})
        export class Module3 {
        }
        `,
        );
        env.write(
          'standalone_comp.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:'', standalone: true})
        export class Comp2 {
        }
        `,
        );
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import {SomeExternalStuff} from '/some_external_file';
        import {SomeExternalStuff2} from '/some_external_file2';

        import {BModule} from 'b';

        @NgModule({imports: [SomeExternalStuff, BModule]})
        export class AModule {
        }
        `,
        );
        env.write(
          'b.ts',
          `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BModule {
        }
        `,
        );
        env.write(
          'c.ts',
          `
        // Some code
        `,
        );

        env.driveMain();

        expect(env.getContents('comp1.js'))
          .withContext(
            'Global imports should be generated when a component has its NgModule in a different file',
          )
          .toContain('import "/some_external_file"');
        expect(env.getContents('standalone_comp.js'))
          .withContext('Global imports should not be generated when all components are standalone')
          .not.toContain('import "/some_external_file"');
        expect(env.getContents('module_and_comp.js'))
          .withContext(
            'Global imports should not be generated when components and their NgModules are in the same file',
          )
          .not.toContain('import "/some_external_file"');
        expect(env.getContents('a.js'))
          .withContext('Global imports should not be generated when the file has no component')
          .not.toContain('import "/some_external_file"');
        expect(env.getContents('c.js'))
          .withContext('Global imports should not be generated for non-Angular files')
          .not.toContain('import "/some_external_file"');
      });

      it('should include NgModule namespace external import as global import', () => {
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import * as n from '/some_external_file';

        import {BModule} from 'b';

        @NgModule({imports: [n.SomeExternalStuff]})
        export class AModule {
        }
        `,
        );
        env.write(
          'test.ts',
          `
        // Some code
        `,
        );

        env.driveMain();

        expect(env.getContents('comp1.js')).toContain('import "/some_external_file"');
      });

      it('should include nested NgModule external import as global import - case of named import', () => {
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import {SomeExternalStuff} from '/some_external_file';

        import {BModule} from 'b';

        @NgModule({imports: [[[SomeExternalStuff]]]})
        export class AModule {
        }
        `,
        );

        env.driveMain();

        expect(env.getContents('comp1.js')).toContain('import "/some_external_file"');
      });

      it('should include nested NgModule external import as global import - case of namespace import', () => {
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import * as n from '/some_external_file';

        import {BModule} from 'b';

        @NgModule({imports: [[[n.SomeExternalStuff]]]})
        export class AModule {
        }
        `,
        );

        env.driveMain();

        expect(env.getContents('comp1.js')).toContain('import "/some_external_file"');
      });

      it('should include NgModule external imports as global imports - case of multiple nested imports including named and namespace imports', () => {
        env.write(
          'comp1.ts',
          `
        import {Component} from '@angular/core';

        @Component({template:''})
        export class Comp1 {
        }
        `,
        );
        env.write(
          'module1.ts',
          `
        import {NgModule} from '@angular/core';

        import {Comp1} from 'comp1';

        @NgModule({declarations:[Comp1]})
        export class Module1 {
        }
        `,
        );
        env.write(
          'a.ts',
          `
        import {NgModule} from '@angular/core';
        import {SomeExternalStuff} from '/some_external_file';
        import * as n from '/some_external_file2';

        import {BModule} from 'b';

        @NgModule({imports: [[SomeExternalStuff], [n.SomeExternalStuff]]})
        export class AModule {
        }
        `,
        );

        env.driveMain();

        expect(env.getContents('comp1.js')).toContain('import "/some_external_file"');
        expect(env.getContents('comp1.js')).toContain('import "/some_external_file2"');
      });

      it('should include extra import for the local component dependencies (component, directive and pipe)', () => {
        env.write(
          'internal_comp.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          template: '...', 
          selector: 'internal-comp',
          standalone: false,
        })
        export class InternalComp {
        }
        `,
        );
        env.write(
          'internal_dir.ts',
          `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[internal-dir]', 
          standalone: false,
        })
        export class InternalDir {
        }
        `,
        );
        env.write(
          'internal_pipe.ts',
          `
        import {Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'internalPipe',
          standalone: false,
        })
        export class InternalPipe implements PipeTransform {
          transform(value: number): number {
            return value*2;
          }
        }
        `,
        );
        env.write(
          'internal_module.ts',
          `
        import {NgModule} from '@angular/core';

        import {InternalComp} from 'internal_comp';
        import {InternalDir} from 'internal_dir';
        import {InternalPipe} from 'internal_pipe';

        @NgModule({declarations: [InternalComp, InternalDir, InternalPipe], exports: [InternalComp, InternalDir, InternalPipe]})
        export class InternalModule {
        }
        `,
        );
        env.write(
          'main_comp.ts',
          `
        import {Component} from '@angular/core';

        @Component({template: '<internal-comp></internal-comp> <span internal-dir></span> <span>{{2 | internalPipe}}</span>'})
        export class MainComp {
        }
        `,
        );
        env.write(
          'main_module.ts',
          `
        import {NgModule} from '@angular/core';

        import {MainComp} from 'main_comp';
        import {InternalModule} from 'internal_module';

        @NgModule({declarations: [MainComp], imports: [InternalModule]})
        export class MainModule {
        }
        `,
        );

        env.driveMain();

        expect(env.getContents('main_comp.js')).toContain('import "internal_comp"');
        expect(env.getContents('main_comp.js')).toContain('import "internal_dir"');
        expect(env.getContents('main_comp.js')).toContain('import "internal_pipe"');
      });

      it('should not include extra import and remote scope runtime for the local component dependencies when cycle is produced', () => {
        env.write(
          'internal_comp.ts',
          `
        import {Component} from '@angular/core';
        import {cycleCreatingDep} from './main_comp';

        @Component({template: '...', selector: 'internal-comp'})
        export class InternalComp {
        }
        `,
        );
        env.write(
          'internal_module.ts',
          `
        import {NgModule} from '@angular/core';

        import {InternalComp} from 'internal_comp';

        @NgModule({declarations: [InternalComp], exports: [InternalComp]})
        export class InternalModule {
        }
        `,
        );
        env.write(
          'main_comp.ts',
          `
        import {Component} from '@angular/core';

        @Component({template: '<internal-comp></internal-comp>'})
        export class MainComp {
        }
        `,
        );
        env.write(
          'main_module.ts',
          `
        import {NgModule} from '@angular/core';

        import {MainComp} from 'main_comp';
        import {InternalModule} from 'internal_module';

        @NgModule({declarations: [MainComp], imports: [InternalModule]})
        export class MainModule {
        }
        `,
        );

        env.driveMain();

        expect(env.getContents('main_comp.js')).not.toContain('import "internal_comp"');
        expect(env.getContents('main_module.js')).not.toContain('ɵɵsetComponentScope');
      });
    });

    describe('ng module injector def', () => {
      it('should produce empty injector def imports when module has no imports/exports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class MainModule {
        }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({})');
      });

      it('should include raw module imports array elements (including forward refs) in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)],
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })',
        );
      });

      it('should include non-array raw module imports as it is in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        const NG_IMPORTS = [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)];

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          imports: NG_IMPORTS,
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_IMPORTS] })',
        );
      });

      it('should include raw module exports array elements (including forward refs) in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          exports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)],
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })',
        );
      });

      it('should include non-array raw module exports (including forward refs) in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        const NG_EXPORTS = [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)];

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          exports: NG_EXPORTS,
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_EXPORTS] })',
        );
      });

      it('should concat raw module imports and exports arrays (including forward refs) in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1, SubModule2} from './some-where';
        import {SubModule3, SubModule4} from './another-where';

        @NgModule({
          imports: [SubModule1, forwardRef(() => SubModule2)],
          exports: [SubModule3, forwardRef(() => SubModule4)],
        })
        export class MainModule {
        }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), SubModule3, forwardRef(() => SubModule4)] })',
        );
      });

      it('should combines non-array raw module imports and exports (including forward refs) in the injector def imports', () => {
        env.write(
          'test.ts',
          `
        import {NgModule, forwardRef} from '@angular/core';
        import {NG_IMPORTS} from './some-where';
        import {NG_EXPORTS} from './another-where';

        @NgModule({
          imports: NG_IMPORTS,
          exports: NG_EXPORTS,
        })
        export class MainModule {
        }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_IMPORTS, NG_EXPORTS] })',
        );
      });
    });

    describe('component dependencies', () => {
      it('should generate ɵɵgetComponentDepsFactory for component def dependencies - for non-standalone component ', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Component} from '@angular/core';

          @Component({
            selector: 'test-main',
            template: '<span>Hello world!</span>',
            standalone: false,
          })
          export class MainComponent {
          }

          @NgModule({
            declarations: [MainComponent],
          })
          export class MainModule {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent)');
      });

      it('should generate ɵɵgetComponentDepsFactory with raw imports as second param for component def dependencies - for standalone component with non-empty imports', () => {
        env.write(
          'test.ts',
          `
          import {Component, forwardRef} from '@angular/core';
          import {SomeThing} from 'some-where';
          import {SomeThing2} from 'some-where2';

          @Component({
            standalone: true,
            imports: [SomeThing, forwardRef(()=>SomeThing2)],
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, [SomeThing, forwardRef(() => SomeThing2)])',
        );
      });

      it('should generate ɵɵgetComponentDepsFactory with raw non-array imports as second param for component def dependencies - for standalone component with non-empty imports', () => {
        env.write(
          'test.ts',
          `
          import {Component, forwardRef} from '@angular/core';
          import {SomeThing} from 'some-where';
          import {SomeThing2} from 'some-where2';

          const NG_IMPORTS = [SomeThing, forwardRef(()=>SomeThing2)];

          @Component({
            standalone: true,
            imports: NG_IMPORTS,
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, NG_IMPORTS)',
        );
      });

      it('should generate ɵɵgetComponentDepsFactory with empty array as secon d arg for standalone component with empty imports', () => {
        env.write(
          'test.ts',
          `
      import {Component} from '@angular/core';

      @Component({
        standalone: true,
        imports: [],
        selector: 'test-main',
        template: '<span>Hello world!</span>',
      })
      export class MainComponent {
      }
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, [])',
        );
      });

      it('should not generate ɵɵgetComponentDepsFactory for standalone component with no imports', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            standalone: true,
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).not.toContain('i0.ɵɵgetComponentDepsFactory');
      });
    });

    describe('component fields', () => {
      it('should place the changeDetection as it is into the component def', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {SomeWeirdThing} from 'some-where';

          @Component({
            changeDetection: SomeWeirdThing,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('changeDetection: SomeWeirdThing');
      });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.Emulated with no styles', () => {
        env.write(
          'test.ts',
          `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.Emulated,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // If there is no style, don't generate css selectors on elements by setting
        // encapsulation to none (=2)
        expect(jsContents).toContain('encapsulation: 2');
      });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.Emulated with styles', () => {
        env.write(
          'test.ts',
          `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.Emulated,
            styles: ['color: blue'],
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // encapsulation is set only for non-default value
        expect(jsContents).not.toContain('encapsulation: 0');
        expect(jsContents).toContain('styles: ["color: blue"]');
      });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.ShadowDom', () => {
        env.write(
          'test.ts',
          `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.ShadowDom,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('encapsulation: 3');
      });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.None', () => {
        env.write(
          'test.ts',
          `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.None,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('encapsulation: 2');
      });

      it('should default encapsulation to Emulated', () => {
        env.write(
          'test.ts',
          `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // If there is no style, don't generate css selectors on elements by setting
        // encapsulation to none (=2)
        expect(jsContents).toContain('encapsulation: 2');
      });
    });

    describe('constructor injection', () => {
      it('should include injector types with all possible import/injection styles into component factory', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Component({
            selector: 'test-main',
            template: '<span>Hello world</span>',
          })
          export class MainComponent {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainComponent],
          })
          export class MainModule {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainComponent.ɵfac = function MainComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainComponent)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into standalone component factory', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Component({
            standalone: true,
            selector: 'test-main',
            template: '<span>Hello world</span>',
          })
          export class MainComponent {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainComponent.ɵfac = function MainComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainComponent)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into directive factory', () => {
        env.write(
          'test.ts',
          `
          import {Directive, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Directive({
          })
          export class MainDirective {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainDirective],
          })
          export class MainModule {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainDirective.ɵfac = function MainDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainDirective)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into standalone directive factory', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Directive({
            standalone: true,
          })
          export class MainDirective {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainDirective.ɵfac = function MainDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainDirective)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into pipe factory', () => {
        env.write(
          'test.ts',
          `
          import {Pipe, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Pipe({name: 'pipe'})
          export class MainPipe {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainPipe],
          })
          export class MainModule {
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainPipe.ɵfac = function MainPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainPipe)(i0.ɵɵdirectiveInject(i1.SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(i2.SomeService3, 16), i0.ɵɵdirectiveInject(i3.nested.SomeService4, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into standalone pipe factory', () => {
        env.write(
          'test.ts',
          `
          import {Pipe, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Pipe({
            name: 'pipe',
            standalone: true,
          })
          export class MainPipe {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainPipe.ɵfac = function MainPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainPipe)(i0.ɵɵdirectiveInject(i1.SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(i2.SomeService3, 16), i0.ɵɵdirectiveInject(i3.nested.SomeService4, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into injectable factory', () => {
        env.write(
          'test.ts',
          `
          import {Injectable, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Injectable({
            providedIn: 'root',
          })
          export class MainService {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainService.ɵfac = function MainService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainService)(i0.ɵɵinject(i1.SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(i2.SomeService3), i0.ɵɵinject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should include injector types with all possible import/injection styles into ng module factory', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @NgModule({
          })
          export class MainModule {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainModule.ɵfac = function MainModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MainModule)(i0.ɵɵinject(i1.SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(i2.SomeService3), i0.ɵɵinject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`,
        );
      });

      it('should generate invalid factory for injectable when type parameter types are used as token', () => {
        env.write(
          'test.ts',
          `
          import {Injectable} from '@angular/core';

          @Injectable()
          export class MainService<S> {
            constructor(
              private someService1: S,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainService.ɵfac = function MainService_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for injectable when when token is imported as type', () => {
        env.write(
          'test.ts',
          `
          import {Injectable} from '@angular/core';
          import {type MyService} from './somewhere';

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainService.ɵfac = function MainService_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for injectable when when token is a type', () => {
        env.write(
          'test.ts',
          `
          import {Injectable} from '@angular/core';

          type MyService = {a:string};

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainService.ɵfac = function MainService_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for injectable when when token is an interface', () => {
        env.write(
          'test.ts',
          `
          import {Injectable} from '@angular/core';

          interface MyService {a:string}

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MainService.ɵfac = function MainService_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for directive without selector type parameter types are used as token', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive()
          export class MyDirective<S> {
            constructor(
              private myService: S,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MyDirective.ɵfac = function MyDirective_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for directive without selector when token is imported as type', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';
          import {type MyService} from './somewhere';

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MyDirective.ɵfac = function MyDirective_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for directive without selector when token is a type', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          type MyService = {a:string};

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MyDirective.ɵfac = function MyDirective_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });

      it('should generate invalid factory for directive without selector when token is an interface', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          interface MyService {a:string}

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          `MyDirective.ɵfac = function MyDirective_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory(); };`,
        );
      });
    });

    describe('LOCAL_COMPILATION_UNRESOLVED_CONST errors', () => {
      it('should show correct error message when using an external symbol for component template', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            template: ExternalString,
          })
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, length, relatedInformation} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14);
        expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          'Unresolved identifier found for @Component.template field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the template, 3) Move the template into a separate .html file and include it using @Component.templateUrl',
        );
      });

      it('should show correct error message when using an external symbol for component styles array', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          const InternalStyle = "p{color:blue}";

          @Component({
            styles: [InternalStyle, ExternalString],
            template: '',

          })
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          'Unresolved identifier found for @Component.styles field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the styles, 3) Move the styles into separate files and include it using @Component.styleUrls',
        );
      });

      it('should show correct error message when using an external symbol for component styles', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            styles: ExternalString,
            template: '',

          })
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          'Unresolved identifier found for @Component.styles field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the styles, 3) Move the styles into separate files and include it using @Component.styleUrls',
        );
      });

      it('should show correct error message when using an external symbol for component selector', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            selector: ExternalString,
            template: '',

          })
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          'Unresolved identifier found for @Component.selector field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the selector',
        );
      });

      it("should show correct error message when using an external symbol for component @HostListener's event name argument", () => {
        env.write(
          'test.ts',
          `
          import {Component, HostListener} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            template: '',
          })
          export class Main {
            @HostListener(ExternalString, ['$event'])
            handle() {}
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          `Unresolved identifier found for @HostListener's event name argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument`,
        );
      });

      it("should show correct error message when using an external symbol for directive @HostListener's event name argument", () => {
        env.write(
          'test.ts',
          `
          import {Directive, HostListener} from '@angular/core';
          import {ExternalString} from './some-where';

          @Directive({selector: '[test]'})
          export class Main {
            @HostListener(ExternalString, ['$event'])
            handle() {}
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          `Unresolved identifier found for @HostListener's event name argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument`,
        );
      });

      it("should show correct error message when using an external symbol for component @HostBinding's argument", () => {
        env.write(
          'test.ts',
          `
          import {Component, HostBinding} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({template: ''})
          export class Main {
            @HostBinding(ExternalString) id = 'some thing';
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          `Unresolved identifier found for @HostBinding's argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument`,
        );
      });

      it("should show correct error message when using an external symbol for directive @HostBinding's argument", () => {
        env.write(
          'test.ts',
          `
          import {Directive, HostBinding} from '@angular/core';
          import {ExternalString} from './some-where';

          @Directive({selector: '[test]'})
          export class Main {
            @HostBinding(ExternalString) id = 'some thing';
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          `Unresolved identifier found for @HostBinding's argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument`,
        );
      });

      it('should show correct error message when using an external symbol for @Directive.exportAs argument', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';
          import {ExternalString} from './some-where';

          @Directive({selector: '[test]', exportAs: ExternalString})
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(1);

        const {code, messageText, relatedInformation, length} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST));
        expect(length).toBe(14), expect(relatedInformation).toBeUndefined();

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toEqual(
          `Unresolved identifier found for exportAs field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the selector`,
        );
      });
    });

    describe('ng module bootstrap def', () => {
      it('should include the bootstrap definition in ɵɵsetNgModuleScope instead of ɵɵdefineNgModule', () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';
        import {App} from './some-where';

        @NgModule({
          declarations: [App],
          bootstrap: [App],
        })
        export class AppModule {
        }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });',
        );
        expect(jsContents).toContain(
          'ɵɵsetNgModuleScope(AppModule, { declarations: [App], bootstrap: [App] }); })();',
        );
      });

      it('should include no bootstrap definition in ɵɵsetNgModuleScope if the NgModule has no bootstrap field', () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';
        import {App} from './some-where';

        @NgModule({
          declarations: [App],
        })
        export class AppModule {
        }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });',
        );
        expect(jsContents).toContain(
          'ɵɵsetNgModuleScope(AppModule, { declarations: [App] }); })();',
        );
      });
    });

    describe('host directives', () => {
      it('should generate component hostDirectives definition without input and output', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {ExternalDirective} from 'some_where';
          import * as n from 'some_where2';

          @Directive({standalone: true})
          export class LocalDirective {
          }

          @Component({
            selector: 'my-comp',
            template: '',
            hostDirectives: [ExternalDirective, n.ExternalDirective, LocalDirective],
            standalone: false,
          })
          export class MyComp {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'features: [i0.ɵɵHostDirectivesFeature([ExternalDirective, n.ExternalDirective, LocalDirective])]',
        );
      });

      it('should generate component hostDirectives definition for externally imported directives with input and output', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {HostDir} from 'some_where';

          @Component({
            selector: 'my-comp',
            template: '',
            hostDirectives: [{
              directive: HostDir,
              inputs: ['value', 'color: colorAlias'],
              outputs: ['opened', 'closed: closedAlias'],
            }],
            standalone: false,
          })
          export class MyComp {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'features: [i0.ɵɵHostDirectivesFeature([{ directive: HostDir, ' +
            'inputs: ["value", "value", "color", "colorAlias"], ' +
            'outputs: ["opened", "opened", "closed", "closedAlias"] }])]',
        );
      });

      it('should generate component hostDirectives definition for local directives with input and output', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';

          @Directive({
            standalone: true
          })
          export class LocalDirective {
          }

          @Component({
            selector: 'my-comp',
            template: '',
            hostDirectives: [{
              directive: LocalDirective,
              inputs: ['value', 'color: colorAlias'],
              outputs: ['opened', 'closed: closedAlias'],
            }],
            standalone: false,
          })
          export class MyComp {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'features: [i0.ɵɵHostDirectivesFeature([{ directive: LocalDirective, ' +
            'inputs: ["value", "value", "color", "colorAlias"], ' +
            'outputs: ["opened", "opened", "closed", "closedAlias"] }])]',
        );
      });

      it('should generate directive hostDirectives definitions', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {ExternalDirective} from 'some_where';

          @Directive({
            standalone: true,
            hostDirectives: [ExternalDirective],
          })
          export class LocalDirective {
          }

          @Directive({
            standalone: true,
            hostDirectives: [LocalDirective],
          })
          export class LocalDirective2 {
          }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'ɵɵdefineDirective({ type: LocalDirective, ' +
            'features: [i0.ɵɵHostDirectivesFeature([ExternalDirective])] });',
        );
        expect(jsContents).toContain(
          'ɵɵdefineDirective({ type: LocalDirective2, ' +
            'features: [i0.ɵɵHostDirectivesFeature([LocalDirective])] });',
        );
      });

      it('should generate hostDirectives definition with forward references of local directives', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, forwardRef, Input} from '@angular/core';

          @Component({
            selector: 'my-component',
            template: '',
            hostDirectives: [forwardRef(() => DirectiveB)],
            standalone: false,
          })
          export class MyComponent {
          }

          @Directive({
            standalone: true,
            hostDirectives: [{directive: forwardRef(() => DirectiveA), inputs: ['value']}],
          })
          export class DirectiveB {
          }

          @Directive({standalone: true})
          export class DirectiveA {
            @Input() value: any;
          }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain(
          'features: [i0.ɵɵHostDirectivesFeature(function () { return [DirectiveB]; })]',
        );
        expect(jsContents).toContain(
          'features: [i0.ɵɵHostDirectivesFeature(function () { return [{ directive: DirectiveA, inputs: ["value", "value"] }]; })]',
        );
      });

      it('should produce fatal diagnostics for host directives with forward references of externally imported directive', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, forwardRef} from '@angular/core';
          import {ExternalDirective} from 'some_where';

          @Component({
            selector: 'my-component',
            template: '',
            hostDirectives: [forwardRef(() => ExternalDirective)]
            //hostDirectives: [ExternalDirective]
          })
          export class MyComponent {
          }
        `,
        );

        const messages = env.driveDiagnostics();

        expect(messages[0].code).toBe(
          ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION),
        );
        expect(messages[0].messageText).toEqual(
          'In local compilation mode, host directive cannot be an expression. Use an identifier instead',
        );
      });
    });

    describe('input transform', () => {
      it('should generate input info for transform function imported externally using name', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, Input} from '@angular/core';
        import {externalFunc} from './some_where';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: externalFunc})
          x: string = '';
        }
     `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('inputs: { x: [2, "x", "x", externalFunc] }');
      });

      it('should generate input info for transform function imported externally using namespace', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, Input} from '@angular/core';
        import * as n from './some_where';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: n.externalFunc})
          x: string = '';
        }
     `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('inputs: { x: [2, "x", "x", n.externalFunc] }');
      });

      it('should generate input info for transform function defined locally', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: localFunc})
          x: string = '';
        }

        function localFunc(value: string) {
          return value;
        }
     `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('inputs: { x: [2, "x", "x", localFunc] }');
      });

      it('should generate input info for inline transform function', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: (v: string) => v + 'TRANSFORMED!'})
          x: string = '';
        }
     `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('inputs: { x: [2, "x", "x", (v) => v + \'TRANSFORMED!\'] }');
      });

      it('should not check inline function param type', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: v => v + 'TRANSFORMED!'})
          x: string = '';
        }
     `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('inputs: { x: [2, "x", "x", v => v + \'TRANSFORMED!\'] }');
      });
    });

    describe('@defer', () => {
      beforeEach(() => {
        tsconfig({onlyExplicitDeferDependencyImports: true});
      });

      it('should handle `@Component.deferredImports` field', () => {
        env.write(
          'deferred-a.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-a',
            template: 'DeferredCmpA contents',
          })
          export class DeferredCmpA {
          }
        `,
        );

        env.write(
          'deferred-b.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-b',
            template: 'DeferredCmpB contents',
          })
          export class DeferredCmpB {
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {DeferredCmpA} from './deferred-a';
          import {DeferredCmpB} from './deferred-b';
          @Component({
            standalone: true,
            deferredImports: [DeferredCmpA, DeferredCmpB],
            template: \`
              @defer {
                <deferred-cmp-a />
              }
              @defer {
                <deferred-cmp-b />
              }
            \`,
          })
          export class AppCmp {
          }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that all deferrableImports in local compilation mode
        // are located in a single function (since we can't detect in
        // the local mode which components belong to which block).
        expect(jsContents).toContain(
          'const AppCmp_DeferFn = () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)];',
        );

        // Make sure there are no eager imports present in the output.
        expect(jsContents).not.toContain(`from './deferred-a'`);
        expect(jsContents).not.toContain(`from './deferred-b'`);

        // All defer instructions use the same dependency function.
        expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_DeferFn);');
        expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_DeferFn);');

        // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
        expect(jsContents).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
            '(DeferredCmpA, DeferredCmpB) => {',
        );
      });

      it('should handle `@Component.imports` field', () => {
        env.write(
          'deferred-a.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-a',
            template: 'DeferredCmpA contents',
          })
          export class DeferredCmpA {
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {DeferredCmpA} from './deferred-a';
          @Component({
            standalone: true,
            imports: [DeferredCmpA],
            template: \`
              @defer {
                <deferred-cmp-a />
              }
            \`,
          })
          export class AppCmp {
          }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // In local compilation mode we can't detect which components
        // belong to `@defer` blocks, thus can't determine whether corresponding
        // classes can be defer-loaded. In this case we retain eager imports
        // and do not generate defer dependency functions for `@defer` instructions.

        // Eager imports are retained in the output.
        expect(jsContents).toContain(`from './deferred-a'`);

        // Defer instructions do not have a dependency function,
        // since all dependencies were defined in `@Component.imports`.
        expect(jsContents).toContain('ɵɵdefer(1, 0);');

        // Expect `ɵsetClassMetadata` (sync) to be generated.
        expect(jsContents).toContain('ɵsetClassMetadata(AppCmp,');
      });

      it('should handle defer blocks that rely on deps from `deferredImports` and `imports`', () => {
        env.write(
          'eager-a.ts',
          `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'eager-cmp-a',
                template: 'EagerCmpA contents',
              })
              export class EagerCmpA {
              }
            `,
        );

        env.write(
          'deferred-a.ts',
          `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }
            `,
        );

        env.write(
          'deferred-b.ts',
          `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }
            `,
        );

        env.write(
          'test.ts',
          `
              import {Component} from '@angular/core';
              import {DeferredCmpA} from './deferred-a';
              import {DeferredCmpB} from './deferred-b';
              import {EagerCmpA} from './eager-a';
              @Component({
                standalone: true,
                imports: [EagerCmpA],
                deferredImports: [DeferredCmpA, DeferredCmpB],
                template: \`
                  @defer {
                    <eager-cmp-a />
                    <deferred-cmp-a />
                  }
                  @defer {
                    <eager-cmp-a />
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmp {
              }
            `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that all deferrableImports in local compilation mode
        // are located in a single function (since we can't detect in
        // the local mode which components belong to which block).
        // Eager dependencies are **not* included here.
        expect(jsContents).toContain(
          'const AppCmp_DeferFn = () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)];',
        );

        // Make sure there are no eager imports present in the output.
        expect(jsContents).not.toContain(`from './deferred-a'`);
        expect(jsContents).not.toContain(`from './deferred-b'`);

        // Eager dependencies retain their imports.
        expect(jsContents).toContain(`from './eager-a';`);

        // All defer instructions use the same dependency function.
        expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_DeferFn);');
        expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_DeferFn);');

        // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
        expect(jsContents).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
            '(DeferredCmpA, DeferredCmpB) => {',
        );
      });

      it(
        'should support importing multiple deferrable deps from a single file ' +
          'and use them within `@Component.deferrableImports` field',
        () => {
          env.write(
            'deferred-deps.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }

              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';

              // This import brings multiple symbols, but all of them are
              // used within @Component.deferredImports, thus this import
              // can be removed in favor of dynamic imports.
              import {DeferredCmpA, DeferredCmpB} from './deferred-deps';

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpA],
                template: \`
                  @defer {
                    <deferred-cmp-a />
                  }
                \`,
              })
              export class AppCmpA {}

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpB],
                template: \`
                  @defer {
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmpB {}
            `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Expect that we generate 2 different defer functions
          // (one for each component).
          expect(jsContents).toContain(
            'const AppCmpA_DeferFn = () => [' +
              'import("./deferred-deps").then(m => m.DeferredCmpA)]',
          );
          expect(jsContents).toContain(
            'const AppCmpB_DeferFn = () => [' +
              'import("./deferred-deps").then(m => m.DeferredCmpB)]',
          );

          // Make sure there are no eager imports present in the output.
          expect(jsContents).not.toContain(`from './deferred-deps'`);

          // Defer instructions use per-component dependency function.
          expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmpA_DeferFn)');
          expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmpB_DeferFn)');

          // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
          expect(jsContents).toContain(
            'ɵsetClassMetadataAsync(AppCmpA, () => [' +
              'import("./deferred-deps").then(m => m.DeferredCmpA)]',
          );
          expect(jsContents).toContain(
            'ɵsetClassMetadataAsync(AppCmpB, () => [' +
              'import("./deferred-deps").then(m => m.DeferredCmpB)]',
          );
        },
      );

      it(
        'should produce a diagnostic in case imports with symbols used ' +
          'in `deferredImports` can not be removed',
        () => {
          env.write(
            'deferred-deps.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }

              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }

              export function utilityFn() {}
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';

              // This import can not be removed, since it'd contain
              // 'utilityFn' symbol once we remove 'DeferredCmpA' and
              // 'DeferredCmpB' and generate a dynamic import for it.
              // In this situation compiler produces a diagnostic to
              // indicate that.
              import {DeferredCmpA, DeferredCmpB, utilityFn} from './deferred-deps';

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpA],
                template: \`
                  @defer {
                    <deferred-cmp-a />
                  }
                \`,
              })
              export class AppCmpA {
                ngOnInit() {
                  utilityFn();
                }
              }

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpB],
                template: \`
                  @defer {
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmpB {}

              @Component({
                standalone: true,
                template: 'Component without any dependencies'
              })
              export class ComponentWithoutDeps {}
            `,
          );

          const diags = env.driveDiagnostics();

          // Expect 2 diagnostics: one for each component `AppCmpA` and `AppCmpB`,
          // since both of them refer to symbols from an import declaration that
          // can not be removed.
          expect(diags.length).toBe(2);

          for (let i = 0; i < 2; i++) {
            const {code, messageText} = diags[i];
            expect(code).toBe(ngErrorCode(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY));
            expect(messageText).toContain(
              'This import contains symbols that are used both inside and outside ' +
                'of the `@Component.deferredImports` fields in the file.',
            );
          }
        },
      );
    });

    describe('custom decorator', () => {
      it('should produce diagnostic for each custom decorator', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {customDecorator1, customDecorator2} from './some-where';

          @customDecorator1('hello')
          @Component({
            template: ExternalString,
          })
          @customDecorator2
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBe(2);

        const text1 = ts.flattenDiagnosticMessageText(errors[0].messageText, '\n');
        const text2 = ts.flattenDiagnosticMessageText(errors[1].messageText, '\n');

        expect(errors[0].code).toBe(ngErrorCode(ErrorCode.DECORATOR_UNEXPECTED));
        expect(errors[1].code).toBe(ngErrorCode(ErrorCode.DECORATOR_UNEXPECTED));
        expect(text1).toContain(
          'In local compilation mode, Angular does not support custom decorators',
        );
        expect(text2).toContain(
          'In local compilation mode, Angular does not support custom decorators',
        );
      });
    });

    describe('template diagnostics', () => {
      it('should show correct error message for syntatic template errors - case of inline template', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '<span Hello! </span>',
          })
          export class Main {
          }
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBeGreaterThanOrEqual(1);

        const {code, messageText} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.TEMPLATE_PARSE_ERROR));

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toContain('Opening tag "span" not terminated');
      });

      it('should show correct error message for syntatic template errors - case of external template', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: 'test.ng.html',
          })
          export class Main {
          }
          `,
        );
        env.write(
          'test.ng.html',
          `
          <span Hello! </span>
          `,
        );

        const errors = env.driveDiagnostics();

        expect(errors.length).toBeGreaterThanOrEqual(1);

        const {code, messageText} = errors[0];

        expect(code).toBe(ngErrorCode(ErrorCode.TEMPLATE_PARSE_ERROR));

        const text = ts.flattenDiagnosticMessageText(messageText, '\n');

        expect(text).toContain('Opening tag "span" not terminated');
      });
    });
  });
});
