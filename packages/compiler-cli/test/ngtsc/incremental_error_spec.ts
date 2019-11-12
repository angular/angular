/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom as _} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../helpers/src/mock_file_loading';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc incremental compilation with errors', () => {
    let env !: NgtscTestEnvironment;

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
      for (const file of files) {
        expect(set).toContain(file);
        expect(set).toContain(file.replace(/\.js$/, '.d.ts'));
      }

      // Validate that 2x the size of `files` have been written (one .d.ts, one .js) and no more.
      expect(set.size).toBe(2 * files.length);
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

      // Introduce the error.
      env.write('other.ts', `
        export class Other // missing braces
      `);
      env.flushWrittenFileTracking();
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].file !.fileName).toBe(_('/other.ts'));
      expectToHaveWritten([]);

      // Remove the error. /other.js should now be emitted again.
      env.write('other.ts', `
        export class Other {}
      `);
      env.flushWrittenFileTracking();
      env.driveMain();

      expectToHaveWritten(['/other.js']);
    });

    it('should recover from an error in a component\'s metadata', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);

      // Start with a clean compilation.
      env.driveMain();

      // Introduce the error.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: ...})
        export class TestCmp {}
      `);
      env.flushWrittenFileTracking();
      const diags = env.driveDiagnostics();
      expect(diags.length).toBeGreaterThan(0);
      expect(env.getFilesWrittenSinceLastFlush()).not.toContain(_('/test.js'));

      // Clear the error and verify that the compiler now emits test.js again.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);

      env.flushWrittenFileTracking();
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
        import {NgModule} from '@angular/core';
        import {TargetCmp} from './target';
        import {TestCmp} from './test';

        @NgModule({
          declarations: [TestCmp, TargetCmp],
        })
        export class Module {}
      `);

      // Start with a clean compilation.
      env.driveMain();

      // Introduce the syntactic error.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: ..., template: '...'}) // ... is not valid syntax
        export class TestCmp {}
      `);
      env.flushWrittenFileTracking();
      const diags = env.driveDiagnostics();
      expect(diags.length).toBeGreaterThan(0);
      expectToHaveWritten([]);

      // Clear the error and trigger the rebuild.
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
        export class TestCmp {}
      `);

      env.flushWrittenFileTracking();
      env.driveMain();

      expectToHaveWritten([
        // The file which had the error should have been emitted, of course.
        '/test.js',

        // Because TestCmp belongs to a module, the module's file should also have been
        // re-emitted.
        '/module.js',

        // Because TargetCmp also belongs to the same module, it should be re-emitted since
        // TestCmp's elector may have changed.
        '/target.js',
      ]);
    });

    it('should recover from an error even across multiple NgModules', () => {
      // This test is a variation on the above. Two components (CmpA and CmpB) exist in an NgModule,
      // which indirectly imports a LibModule (via another NgModule in the middle). The test is
      // designed to verify that CmpA and CmpB are re-emitted if somewhere upstream in the NgModule
      // graph, an error is fixed. To check this, LibModule is broken and then fixed in incremental
      // build steps.
      env.write('a.ts', `
        import {Component} from '@angular/core';

        @Component({selector: 'test-cmp', template: '...'})
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
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'lib-cmp',
          template: '...',
        })
        export class LibCmp {}

        @NgModule({
          declarations: [LibCmp],
          exports: [LibCmp],
        })
        export class LibModule {}
      `);

      // Start with a clean compilation.
      env.driveMain();

      // Introduce the error in LibModule
      env.write('lib.ts', `
      import {Component, NgModule} from '@angular/core';

      @Component({
        selector: 'lib-cmp',
        template: '...',
      })
      export class LibCmp {}

      @NgModule({
        declarations: [LibCmp],
        exports: [LibCmp],
      })
      export class LibModule // missing braces
      `);
      env.flushWrittenFileTracking();
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

      @NgModule({
        declarations: [LibCmp],
        exports: [LibCmp],
      })
      export class LibModule {}
      `);

      env.flushWrittenFileTracking();
      env.driveMain();

      expectToHaveWritten([
        // Both CmpA and CmpB should be re-emitted.
        '/a.js',
        '/b.js',

        // So should the module itself.
        '/module.js',

        // And of course, the file with the error.
        '/lib.js',
      ]);
    });
  });
});
