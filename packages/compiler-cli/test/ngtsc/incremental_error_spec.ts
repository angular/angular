/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom as _} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc incremental compilation with errors', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.enableMultipleCompilations();
      env.tsconfig();

      // This file is part of the program, but not referenced by anything else. It can be used by
      // each test to verify that it isn't re-emitted after incremental builds.
      env.write('unrelated.ts', `
        export class Unrelated {}
      `);
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

    it('should handle an error in an unrelated file', () => {
      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);
      env.write('other.ts', `
        export class Other {}
      `);

      // Start with a clean compilation.
      env.driveMain();
      env.flushWrittenFileTracking();

      // Introduce the error.
      env.write('other.ts', `
        export class Other // missing braces
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].file!.fileName).toBe(_('/other.ts'));
      expectToHaveWritten([]);

      // Remove the error. /other.js should now be emitted again.
      env.write('other.ts', `
        export class Other {}
      `);
      env.driveMain();

      expectToHaveWritten(['/other.js']);
    });

    it('should emit all files after an error on the initial build', () => {
      // Intentionally start with a broken compilation.
      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);
      env.write('other.ts', `
        export class Other // missing braces
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].file!.fileName).toBe(_('/other.ts'));
      expectToHaveWritten([]);

      // Remove the error. All files should be emitted.
      env.write('other.ts', `
        export class Other {}
      `);
      env.driveMain();

      expectToHaveWritten(['/cmp.js', '/other.js', '/unrelated.js']);
    });

    it('should emit files introduced at the same time as an unrelated error', () => {
      env.write('other.ts', `
        // Needed so that the initial program contains @angular/core's .d.ts file.
        import '@angular/core';

        export class Other {}
      `);

      // Clean compile.
      env.driveMain();
      env.flushWrittenFileTracking();

      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);
      env.write('other.ts', `
        export class Other // missing braces
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].file!.fileName).toBe(_('/other.ts'));
      expectToHaveWritten([]);

      // Remove the error. All files should be emitted.
      env.write('other.ts', `
        export class Other {}
      `);
      env.driveMain();

      expectToHaveWritten(['/cmp.js', '/other.js']);
    });

    it('should emit dependent files even in the face of an error', () => {
      env.write('cmp.ts', `
        import {Component} from '@angular/core';
        import {SELECTOR} from './selector';

        @Component({selector: SELECTOR, template: '...'})
        export class TestCmp {}
      `);
      env.write('selector.ts', `
        export const SELECTOR = 'test-cmp';
      `);

      env.write('other.ts', `
        // Needed so that the initial program contains @angular/core's .d.ts file.
        import '@angular/core';

        export class Other {}
      `);

      // Clean compile.
      env.driveMain();
      env.flushWrittenFileTracking();

      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);
      env.write('other.ts', `
        export class Other // missing braces
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].file!.fileName).toBe(_('/other.ts'));
      expectToHaveWritten([]);

      // Remove the error. All files should be emitted.
      env.write('other.ts', `
        export class Other {}
      `);
      env.driveMain();

      expectToHaveWritten(['/cmp.js', '/other.js']);
    });

    it('should recover from an error in a component\'s metadata', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);

      // Start with a clean compilation.
      env.driveMain();
      env.flushWrittenFileTracking();

      // Introduce the error.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: ...}) // invalid template
        export class TestCmp {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBeGreaterThan(0);
      expectToHaveWritten([]);

      // Clear the error and verify that the compiler now emits test.js again.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);

      env.driveMain();
      expectToHaveWritten(['/test.js']);
    });

    it('should recover from an error in a component that is part of a module', () => {
      // In this test, there are two components, TestCmp and TargetCmp, that are part of the same
      // NgModule. TestCmp is broken in an incremental build and then fixed, and the test verifies
      // that TargetCmp is re-emitted.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);
      env.write('target.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'target-cmp', template: '<test-cmp></test-cmp>'})
        export class TargetCmp {}
      `);
      env.write('module.ts', `
        import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
        import {TargetCmp} from './target';
        import {TestCmp} from './test';

        @NgModule({
          declarations: [TestCmp, TargetCmp],
          schemas: [NO_ERRORS_SCHEMA],
        })
        export class Module {}
      `);

      // Start with a clean compilation.
      env.driveMain();
      env.flushWrittenFileTracking();

      // Introduce the syntactic error.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: ..., template: '...'}) // ... is not valid syntax
        export class TestCmp {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBeGreaterThan(0);
      expectToHaveWritten([]);

      // Clear the error and trigger the rebuild.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp-fixed', template: '...'})
        export class TestCmp {}
      `);

      env.driveMain();

      expectToHaveWritten([
        // The file which had the error should have been emitted, of course.
        '/test.js',

        // Because TestCmp belongs to a module, the module's file should also have been
        // re-emitted.
        '/module.js',

        // Because TargetCmp also belongs to the same module, it should be re-emitted since
        // TestCmp's selector was changed.
        '/target.js',
      ]);
    });

    it('should recover from an error in an external template', () => {
      env.write('mod.ts', `
        import {NgModule} from '@angular/core';
        import {Cmp} from './cmp';

        @NgModule({
          declarations: [Cmp],
        })
        export class Mod {}
      `);
      env.write('cmp.html', '{{ error = "true" }} ');
      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './cmp.html',
          selector: 'some-cmp',
        })
        export class Cmp {
          error = 'false';
        }
      `);

      // Diagnostics should show for the broken component template.
      expect(env.driveDiagnostics().length).toBeGreaterThan(0);

      env.write('cmp.html', '{{ error }} ');

      // There should be no diagnostics.
      env.driveMain();
    });

    it('should recover from an error even across multiple NgModules', () => {
      // This test is a variation on the above. Two components (CmpA and CmpB) exist in an NgModule,
      // which indirectly imports a LibModule (via another NgModule in the middle). The test is
      // designed to verify that CmpA and CmpB are re-emitted if somewhere upstream in the NgModule
      // graph, an error is fixed. To check this, LibModule is broken and then fixed in incremental
      // build steps.
      env.write('a.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '<div dir></div>'})
        export class CmpA {}
      `);
      env.write('b.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'target-cmp', template: '...'})
        export class CmpB {}
      `);
      env.write('module.ts', `
        import {NgModule} from '@angular/core';
        import {LibModule} from './lib';
        import {CmpA} from './a';
        import {CmpB} from './b';

        @NgModule({
          imports: [LibModule],
          exports: [LibModule],
        })
        export class IndirectModule {}

        @NgModule({
          declarations: [CmpA, CmpB],
          imports: [IndirectModule],
        })
        export class Module {}
      `);
      env.write('lib.ts', `
        import {Directive, NgModule} from '@angular/core';

        @Directive({
          selector: '[dir]',
        })
        export class LibDir {}

        @NgModule({
          declarations: [LibDir],
          exports: [LibDir],
        })
        export class LibModule {}
      `);

      // Start with a clean compilation.
      env.driveMain();
      env.flushWrittenFileTracking();

      // Introduce the error in LibModule
      env.write('lib.ts', `
      import {Directive, NgModule} from '@angular/core';

      @Directive({
        selector: '[dir]',
      })
      export class LibDir {}

      @Directive({
        selector: '[dir]',
      })
      export class NewDir {}

      @NgModule({
        declarations: [NewDir],
      })
      export class NewModule {}

      @NgModule({
        declarations: [LibDir],
        imports: [NewModule],
        exports: [LibDir, NewModule],
      })
      export class LibModule // missing braces
      `);
      // env.driveMain();
      const diags = env.driveDiagnostics();
      expect(diags.length).toBeGreaterThan(0);
      expectToHaveWritten([]);

      // Clear the error and recompile.
      env.write('lib.ts', `
      import {Component, NgModule} from '@angular/core';

      @Component({
        selector: 'lib-cmp',
        template: '...',
      })
      export class LibCmp {}

      @NgModule({})
      export class NewModule {}

      @NgModule({
        declarations: [LibCmp],
        imports: [NewModule],
        exports: [LibCmp, NewModule],
      })
      export class LibModule {}
      `);

      env.driveMain();

      expectToHaveWritten([
        // CmpA should be re-emitted as `NewModule` was added since the successful emit, which added
        // `NewDir` as a matching directive to CmpA. Alternatively, CmpB should not be re-emitted
        // as it does not use the newly added directive.
        '/a.js',

        // So should the module itself.
        '/module.js',

        // And of course, the file with the error.
        '/lib.js',
      ]);
    });

    describe('chained errors', () => {
      it('should remember a change to a TS file across broken builds', () => {
        // Two components, an NgModule, and a random file.
        writeTwoComponentSystem(env);
        writeRandomFile(env, 'other.ts');

        // Start with a clean build.
        env.driveMain();
        env.flushWrittenFileTracking();

        // Update ACmp
        env.write('a.ts', `
          import {Component} from '@angular/core';

          @Component({selector: 'a-cmp', template: 'new template'})
          export class ACmp {}
       `);

        // Update the file to have an error, simultaneously.
        writeRandomFile(env, 'other.ts', {error: true});

        // This build should fail.
        const diags = env.driveDiagnostics();
        expect(diags.length).not.toBe(0);
        expectToHaveWritten([]);

        // Fix the error.
        writeRandomFile(env, 'other.ts');

        // Rebuild.
        env.driveMain();

        // If the compiler behaves correctly, it should remember that 'a.ts' was updated before, and
        // should regenerate b.ts.
        expectToHaveWritten([
          // Because they directly changed
          '/other.js',
          '/a.js',

          // Because they depend on a.ts
          '/module.js',
        ]);
      });

      it('should remember a change to a template file across broken builds', () => {
        // This is basically the same test as above, except a.html is changed instead of a.ts.

        // Two components, an NgModule, and a random file.
        writeTwoComponentSystem(env);
        writeRandomFile(env, 'other.ts');

        // Start with a clean build.
        env.driveMain();
        env.flushWrittenFileTracking();

        // Invalidate ACmp's template.
        env.write('a.html', 'Changed template');

        // Update the file to have an error, simultaneously.
        writeRandomFile(env, 'other.ts', {error: true});

        // This build should fail.
        const diags = env.driveDiagnostics();
        expect(diags.length).not.toBe(0);
        expectToHaveWritten([]);

        // Fix the error.
        writeRandomFile(env, 'other.ts');

        // Rebuild.
        env.flushWrittenFileTracking();
        env.driveMain();

        // If the compiler behaves correctly, it should remember that 'a.html' was updated before,
        // and should regenerate a.js. Because the compiler knows a.html is a _resource_ dependency
        // of a.ts, it should only regenerate a.js and not its module and dependent components (as
        // it would if a.ts were itself changed like in the test above).
        expectToHaveWritten([
          // Because it directly changed.
          '/other.js',

          // Because a.html changed
          '/a.js',

          // module.js should not be re-emitted, as it is not affected by the change and its remote
          // scope is unaffected.

          // b.js and module.js should not be re-emitted, because specifically when tracking
          // resource dependencies, the compiler knows that a change to a resource file only affects
          // the direct emit of dependent file.
        ]);
      });
    });
  });
});

/**
 * Two components, ACmp and BCmp, where BCmp depends on ACmp.
 *
 * ACmp has its template in a separate file.
 */
export function writeTwoComponentSystem(env: NgtscTestEnvironment): void {
  env.write('a.html', 'This is the template for CmpA');
  env.write('a.ts', `
    import {Component} from '@angular/core';

    @Component({selector: 'a-cmp', templateUrl: './a.html'})
    export class ACmp {}
  `);
  env.write('b.ts', `
    import {Component} from '@angular/core';

    @Component({selector: 'b-cmp', template: '<a-cmp></a-cmp>'})
    export class BCmp {}
  `);
  env.write('module.ts', `
    import {NgModule} from '@angular/core';
    import {ACmp} from './a';
    import {BCmp} from './b';

    @NgModule({
      declarations: [ACmp, BCmp],
    })
    export class Module {}
`);
}

export function writeRandomFile(
    env: NgtscTestEnvironment, name: string, options: {error?: true} = {}): void {
  env.write(name, `
    // If options.error is set, this class has missing braces.
    export class Other ${options.error !== true ? '{}' : ''}
  `);
}
