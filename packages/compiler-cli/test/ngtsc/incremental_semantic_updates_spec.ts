/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc incremental compilation with semantic updates', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.enableMultipleCompilations();
      env.tsconfig();
    });

    function expectToHaveWritten(files: string[]): void {
      const set = env.getFilesWrittenSinceLastFlush();

      const expectedSet = new Set<string>();
      for (const file of files) {
        expectedSet.add(file);
        expectedSet.add(file.replace(/\.js$/, '.d.ts'));
      }

      expect(set).toEqual(expectedSet);

      // Reset for the next compilation.
      env.flushWrittenFileTracking();
    }

    describe('pipes', () => {
      it('should only emit the pipe when its name did not change', () => {
        createVariousDeclarationsProgram();

        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe', pure: false})
          export class MyPipe {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/pipe.js']);
      });

      it('should emit the pipe and components in scope when the name is changed', () => {
        createVariousDeclarationsProgram();

        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'changed'})
          export class MyPipe {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/pipe.js', '/cmp.js']);
      });
    });

    describe('directives', () => {
      it(`should emit all components in scope if a directive's selector changed`, () => {
        createVariousDeclarationsProgram();

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[changed]',
          })
          export class MyDir {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/dir.js', '/cmp.js']);
      });

      it(`should emit all components in scope if a directive's exportAs changed`, () => {
        createVariousDeclarationsProgram();

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            exportAs: 'dir',
          })
          export class MyDir {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/dir.js', '/cmp.js']);
      });

      it(`should emit all components in scope if a directive's inputs changed`, () => {
        createVariousDeclarationsProgram();

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            inputs: ['input'],
          })
          export class MyDir {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/dir.js', '/cmp.js']);
      });

      it(`should emit all components in scope if a directive's outputs changed`, () => {
        createVariousDeclarationsProgram();

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            outputs: ['output'],
          })
          export class MyDir {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/dir.js', '/cmp.js']);
      });

      it(`should not emit all components in scope if its public API did not change`, () => {
        createVariousDeclarationsProgram();

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            providers: [],
          })
          export class MyDir {}
        `);
        env.driveMain();

        expectToHaveWritten(['/mod.js', '/dir.js']);
      });
    });

    function createVariousDeclarationsProgram() {
      env.write('pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'pipe'})
        export class MyPipe {}
      `);
      env.write('dir.ts', `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir]'
        })
        export class MyDir {}
      `);
      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '...',
        })
        export class MyCmp {}
      `);
      env.write('mod.ts', `
        import {NgModule} from '@angular/core';
        import {MyPipe} from './pipe';
        import {MyDir} from './dir';
        import {MyCmp} from './cmp';

        @NgModule({
          declarations: [MyPipe, MyDir, MyCmp],
        })
        export class MyModule {}
      `);

      env.driveMain();
      env.flushWrittenFileTracking();
    }

    describe('removing declarations', () => {
      it('should re-emit a component when its declaration is removed', () => {
        env.write('cmp-a.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a',
            template: '',
          })
          export class CmpA {}
        `);
        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {CmpA} from './cmp-a';

          @NgModule({
            declarations: [CmpA],
          })
          export class ModuleA {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ModuleA {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module-a.js', '/cmp-a.js']);
      });

      it('should re-emit a component and the scopes to which it is exported when its declaration is removed',
         () => {
           env.write('cmp-a.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp-a',
              template: '',
            })
            export class CmpA {}
          `);
           env.write('module-a.ts', `
            import {NgModule} from '@angular/core';
            import {CmpA} from './cmp-a';

            @NgModule({
              declarations: [CmpA],
              exports: [CmpA],
            })
            export class ModuleA {}
          `);
           env.write('cmp-b.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp-b',
              template: '',
            })
            export class CmpB {}
          `);
           env.write('module-b.ts', `
            import {NgModule} from '@angular/core';
            import {CmpB} from './cmp-b';
            import {ModuleA} from './module-a';

            @NgModule({
              declarations: [CmpB],
              imports: [ModuleA],
            })
            export class ModuleB {}
          `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('module-a.ts', `
            import {NgModule} from '@angular/core';

            @NgModule()
            export class ModuleA {}
          `);
           env.driveMain();

           expectToHaveWritten(['/module-a.js', '/module-b.js', '/cmp-a.js', '/cmp-b.js']);
         });

      it('should not re-emit a directive when its declaration is removed', () => {
        env.write('dir-a.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir-a',
          })
          export class DirA {}
        `);
        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {DirA} from './dir-a';

          @NgModule({
            declarations: [DirA],
          })
          export class ModuleA {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ModuleA {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module-a.js']);
      });

      it('should not re-emit a pipe when its declaration is removed', () => {
        env.write('pipe-a.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class PipeA {}
        `);
        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {PipeA} from './pipe-a';

          @NgModule({
            declarations: [PipeA],
          })
          export class ModuleA {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ModuleA {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module-a.js']);
      });
    });

    describe('symbolic changes', () => {
      it('should re-emit all directives in scope when a declaration is renamed', () => {
        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class MyPipe {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {MyPipe} from './pipe';

          @NgModule({
            declarations: [MyPipe, Cmp],
          })
          export class Module {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class MyPipeRenamed {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {MyPipeRenamed} from './pipe';

          @NgModule({
            declarations: [MyPipeRenamed, Cmp],
          })
          export class Module {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module.js', '/pipe.js', '/cmp.js']);
      });

      it('should emit all component in scope when an NgModule is changed into a component', () => {
        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class MyPipe {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {MyPipe} from './pipe';

          @NgModule({
            declarations: [MyPipe, Cmp],
          })
          export class Module {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('module.ts', `
          import {Component} from '@angular/core';

          @Component({
            template: '...',
          })
          export class Module {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module.js', '/cmp.js']);
      });

      it('should emit all component in scope when a pipe is changed into a directive', () => {
        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class MyPipe {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {MyPipe} from './pipe';

          @NgModule({
            declarations: [MyPipe, Cmp],
          })
          export class Module {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('pipe.ts', `
          import {Component} from '@angular/core';

          @Component({
            template: '...',
          })
          export class MyPipe {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module.js', '/cmp.js', '/pipe.js']);
      });

      it('should not emit all component in scope when a directive is changed into a component without affecting its public API',
         () => {
           env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({selector: '[dir]'})
          export class Dir {}
        `);
           env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
           env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir, Cmp],
          })
          export class Module {}
        `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('dir.ts', `
          import {Component} from '@angular/core';

          @Component({selector: '[dir]', template: ''})
          export class Dir {}
        `);
           env.driveMain();

           expectToHaveWritten(['/module.js', '/dir.js']);
         });

      it('should emit all component in scope when a directive is changed into a component and its public API is affected',
         () => {
           env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({selector: '[dir]'})
          export class Dir {}
        `);
           env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
           env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir, Cmp],
          })
          export class Module {}
        `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('dir.ts', `
          import {Component} from '@angular/core';

          @Component({selector: '[changed]', template: ''})
          export class Dir {}
        `);
           env.driveMain();

           expectToHaveWritten(['/module.js', '/dir.js', '/cmp.js']);
         });

      it('should emit all component in scope when an NgModule is deleted', () => {
        env.write('pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'pipe'})
          export class MyPipe {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '',
          })
          export class Cmp {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {MyPipe} from './pipe';

          @NgModule({
            declarations: [MyPipe, Cmp],
          })
          export class Module {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('module.ts', `
          export {}
        `);
        env.driveMain();

        expectToHaveWritten(['/module.js', '/cmp.js']);
      });
    });

    describe('export scope', () => {
      it('should not emit declarations when the public API of a declaration is unaffected', () => {
        setupDeepExportProgram(env);

        env.write('cmp-a1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a1',
            template: 'updated',
          })
          export class CmpA1 {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // CmpA1 itself was changed.
          '/cmp-a1.js',

          // Although not semantically affected, ModuleA and ModuleD are re-emitted as they
          // reference CmpA1 in analysis data.
          '/module-a.js',
          '/module-d.js',
        ]);
      });

      it('should emit declarations when the public API of a declaration is affected', () => {
        setupDeepExportProgram(env);

        env.write('cmp-a1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a1-updated',
            template: 'updated',
          })
          export class CmpA1 {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // The selector of CmpA1 was changed, so all declarations that have CmpA1 in their
          // compilation scope need to be re-emitted.

          // CmpA1 and CmpA2 are directly in scope, so should be emitted.
          '/cmp-a1.js',
          '/cmp-a2.js',

          // CmpB is not affected as its ModuleB only exports ModuleA, it does not import it.

          // CmpC1 is emitted because ModuleC imports from ModuleB, which exports ModulaA.
          '/cmp-c1.js',

          // CmpD1 is emitted because ModuleD imports ModuleC, which exports ModuleB which exports
          // ModuleA.
          '/cmp-d1.js',

          // CmpE1 is emitted because ModuleE imports from ModuleD, which exports CmpA1.
          '/cmp-e1.js',

          // CmpF1 is emitted because ModuleF imports ModuleB, which exports ModuleA.
          '/cmp-f1.js',

          // Not semantically affected, but re-emitted as they reference CmpA1 in analysis data.
          '/module-a.js',
          '/module-d.js',
        ]);

        // Now verify that updating CmpA2 only re-emits the components declared in ModuleA,
        // as CmpA2 is no exported from ModuleA.
        env.write('cmp-a2.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a2-updated',
            template: 'updated',
          })
          export class CmpA2 {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // CmpA1 is not exported from ModuleA, so only the local declarations are re-emitted.
          '/cmp-a1.js',
          '/cmp-a2.js',

          // ModuleA refers CmpA2 in its metadata so is considered affected.
          '/module-a.js',
        ]);
      });

      it('should not emit declarations when the NgModule scope is unaffected', () => {
        setupDeepExportProgram(env);

        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {CmpA1} from './cmp-a1';
          import {CmpA2} from './cmp-a2';
          import {ModuleB} from './module-b';

          @NgModule({
            declarations: [CmpA1, CmpA2],
            providers: [],
            exports: [CmpA1],
          })
          export class ModuleA {}
        `);
        env.driveMain();

        expectToHaveWritten([
          '/module-a.js',

          // ModuleB and ModuleC are emitted because they references ModuleA in their metadata.
          '/module-b.js',
          '/module-c.js',
        ]);
      });

      it('should only re-emit the NgModule scope itself if a declaration is added but not exported',
         () => {
           setupDeepExportProgram(env);

           env.write('module-a.ts', `
              import {NgModule, Pipe} from '@angular/core';
              import {CmpA1} from './cmp-a1';
              import {CmpA2} from './cmp-a2';
              import {ModuleB} from './module-b';

              @Pipe({name: 'pipe'})
              export class MyPipe {}

              @NgModule({
                declarations: [CmpA1, CmpA2, MyPipe],
                exports: [CmpA1],
              })
              export class ModuleA {}
            `);
           env.driveMain();

           expectToHaveWritten([
             // Adding MyPipe affects the local scope, so CmpA1 and CmpA2 have to be emitted. Since
             // MyPipe was not exported all other NgModules are not affected.
             '/cmp-a1.js',
             '/cmp-a2.js',

             // ModuleA was changed so should have been emitted.
             '/module-a.js',

             // ModuleB and ModuleC are emitted because they references ModuleA in their metadata.
             '/module-b.js',
             '/module-c.js',
           ]);
         });

      it('should re-emit all declarations in the NgModule and upstream NgModules if a declaration is added and exported',
         () => {
           setupDeepExportProgram(env);

           env.write('module-a.ts', `
            import {NgModule, Pipe} from '@angular/core';
            import {CmpA1} from './cmp-a1';
            import {CmpA2} from './cmp-a2';
            import {ModuleB} from './module-b';

            @Pipe({name: 'pipe'})
            export class MyPipe {}

            @NgModule({
              declarations: [CmpA1, CmpA2, MyPipe],
              exports: [CmpA1, CmpA2, MyPipe],
            })
            export class ModuleA {}
          `);
           env.driveMain();

           expectToHaveWritten([
             // CmpA1 and CmpA2 are emitted as MyPipe is in their scope.
             '/cmp-a1.js',
             '/cmp-a2.js',

             // CmpC1 is emitted because ModuleC imports ModuleA.
             '/cmp-c1.js',

             // CmpD1 is emitted because ModuleD imports ModuleC which imports from ModuleA.
             '/cmp-d1.js',

             // CmpE1 is not emitted as ModuleE imports from ModuleD which only exports CmpA1, and
             // CmpA1 was not affected.

             // CmpF1 is emitted because ModuleF imports ModuleB which exports ModuleA.
             '/cmp-f1.js',

             // ModuleA is emitted because it was changed.
             '/module-a.js',

             // ModuleB and ModuleC are emitted because they references ModuleA in their metadata.
             '/module-b.js',
             '/module-c.js',
           ]);
         });

      it('should only re-emit consuming NgModules if an export is added', () => {
        setupDeepExportProgram(env);

        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {CmpA1} from './cmp-a1';
          import {CmpA2} from './cmp-a2';
          import {ModuleB} from './module-b';

          @NgModule({
            declarations: [CmpA1, CmpA2],
            exports: [CmpA1, CmpA2],
          })
          export class ModuleA {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // CmpA1 and CmpA2 were not emitted as only the export scope of ModuleA was changed, not
          // its compilation scope.

          // CmpC1 is emitted as it sees the new CmpA2 export because ModuleC imports ModuleA.
          '/cmp-c1.js',

          // CmpD1 is emitted as it sees the new CmpA2 export because ModuleD imports from ModuleC,
          // which imports from ModuleA.
          '/cmp-d1.js',

          // CmpFq is emitted as it sees the new CmpA2 export because ModuleF imports ModuleB which
          // exports ModuleA.
          '/cmp-f1.js',

          // ModuleA is emitted because it was changed.
          '/module-a.js',

          // ModuleB and ModuleC are emitted because they references ModuleA in their metadata.
          '/module-b.js',
          '/module-c.js',
        ]);
      });

      function setupDeepExportProgram(env: NgtscTestEnvironment) {
        // Declare CmpA1 and CmpA2 in ModuleA, where only CmpA1 is exported from ModuleA.
        env.write('cmp-a1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a1',
            template: '',
          })
          export class CmpA1 {}
        `);
        env.write('cmp-a2.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-a2',
            template: '',
          })
          export class CmpA2 {}
        `);
        env.write('module-a.ts', `
          import {NgModule} from '@angular/core';
          import {CmpA1} from './cmp-a1';
          import {CmpA2} from './cmp-a2';
          import {ModuleB} from './module-b';

          @NgModule({
            declarations: [CmpA1, CmpA2],
            exports: [CmpA1],
          })
          export class ModuleA {}
        `);

        // Declare CmpB1 in ModuleB, which exports from ModuleA but does not import from it.
        // This means that exports from ModuleA are not in the compilation scope of ModuleB.
        env.write('cmp-b1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-b1',
            template: '',
          })
          export class CmpB1 {}
        `);
        env.write('module-b.ts', `
          import {NgModule} from '@angular/core';
          import {ModuleA} from './module-a';
          import {CmpB1} from './cmp-b1';

          @NgModule({
            declarations: [CmpB1],
            exports: [ModuleA],
          })
          export class ModuleB {}
        `);

        // Declare CmpC1 in ModuleC, which imports ModuleA and exports ModuleB. The import of
        // ModuleA makes the exports from ModuleA available in the compilation scope of ModuleC.
        env.write('cmp-c1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-c1',
            template: '',
          })
          export class CmpC1 {}
        `);
        env.write('module-c.ts', `
          import {NgModule} from '@angular/core';
          import {ModuleA} from './module-a';
          import {ModuleB} from './module-b';
          import {CmpC1} from './cmp-c1';

          @NgModule({
            declarations: [CmpC1],
            imports: [ModuleA],
            exports: [ModuleB],
          })
          export class ModuleC {}
        `);

        // Declare CmpD1 in ModuleD, which imports from ModuleC and exports CmpA1. The import from
        // ModuleC means that this module gains access to the exports of ModuleA, as ModuleC exports
        // ModuleB which exports ModuleA.
        // The export of CmpA1 is here to verify that changes to CmpA1 are correctly picked up by
        // ModuleE, as that module imports ModuleD.
        env.write('cmp-d1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-d1',
            template: '',
          })
          export class CmpD1 {}
        `);
        env.write('module-d.ts', `
          import {NgModule} from '@angular/core';
          import {ModuleC} from './module-c';
          import {CmpA1} from './cmp-a1';
          import {CmpD1} from './cmp-d1';

          @NgModule({
            declarations: [CmpD1],
            imports: [ModuleC],
            exports: [CmpA1],
          })
          export class ModuleD {}
        `);

        // Declares CmpE1 and ModuleE, where ModuleE imports from ModuleD.
        env.write('cmp-e1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-e1',
            template: '',
          })
          export class CmpE1 {}
        `);
        env.write('module-e.ts', `
          import {NgModule} from '@angular/core';
          import {ModuleD} from './module-d';
          import {CmpE1} from './cmp-e1';

          @NgModule({
            declarations: [CmpE1],
            imports: [ModuleD],
          })
          export class ModuleE {}
        `);

        // Declares CmpF1 and ModuleF, where ModuleF imports from ModuleB to gain access to ModuleA
        // as that is exported from ModuleB.
        env.write('cmp-f1.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp-f1',
            template: '',
          })
          export class CmpF1 {}
        `);
        env.write('module-f.ts', `
          import {NgModule} from '@angular/core';
          import {ModuleB} from './module-b';
          import {CmpF1} from './cmp-f1';

          @NgModule({
            declarations: [CmpF1],
            imports: [ModuleB],
          })
          export class ModuleF {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();
      }
    });

    describe('remote scoping', () => {
      it('should emit the NgModule if a declaration requires remote scoping', () => {
        env.write('a_component.ts', `
          import {Component} from '@angular/core';

          @Component({selector: 'a', templateUrl: './a_component.html'})
          export class CmpA {}
        `);
        env.write('a_component.html', `a`);

        env.write('b_component.ts', `
          import {Component} from '@angular/core';

          @Component({selector: 'b', templateUrl: './b_component.html'})
          export class CmpB {}
        `);
        env.write('b_component.html', `<c></c>`);

        env.write('c_component.ts', `
          import {Component} from '@angular/core';

          @Component({selector: 'c', templateUrl: './c_component.html'})
          export class CmpC {}
        `);
        env.write('c_component.html', `<a></a>`);

        env.write('foo_pipe.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({name: 'foo'})
          export class FooPipe {}
        `);
        env.write('remote_module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpA} from './a_component';
          import {CmpB} from './b_component';
          import {CmpC} from './c_component';
          import {FooPipe} from './foo_pipe';
          @NgModule({
            declarations: [CmpA, CmpB, CmpC, FooPipe],
            exports: [CmpA, CmpB, CmpC, FooPipe],
          })
          export class RemoteModule {}
        `);

        env.write('upstream_module.ts', `
          import {NgModule} from '@angular/core';
          import {RemoteModule} from './remote_module';
          @NgModule({
            imports: [RemoteModule],
          })
          export class BarModule {}
        `);
        env.driveMain();
        env.flushWrittenFileTracking();

        // Use CmpB in the template of CmpA to introduce a cycle CmpA -> CmpB -> CmpC -> CmpA.
        env.write('a_component.html', `<b></b> 1`);
        env.driveMain();

        // The cycle should cause the module to be re-emitted, as well as CmpC as that is where the
        // cycle is broken. CmpA should be emitted because it was changed.
        expectToHaveWritten(['/remote_module.js', '/a_component.js', '/c_component.js']);

        // Now change the template of CmpA which does not affect the cycle graph.
        env.write('a_component.html', `<b></b> 2`);
        env.driveMain();

        // Only CmpA should be emitted.
        expectToHaveWritten(['/a_component.js']);

        // Change the template again to remove the cycle.
        env.write('a_component.html', `3`);
        env.driveMain();

        // Breaking the cycle should cause the module to be re-emitted, as well as CmpC as that has
        // to be recompiled without remote scoping. CmpA should be written because it was changed.
        expectToHaveWritten(['/remote_module.js', '/a_component.js', '/c_component.js']);
      });
    });
  });
});
