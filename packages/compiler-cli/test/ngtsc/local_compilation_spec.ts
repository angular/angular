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
  describe('local compilation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
        },
        angularCompilerOptions: {
          compilationMode: 'experimental-local',
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    });

    it('should produce no TS semantic diagnostics', () => {
      env.write('test.ts', `
        import {SubExternalStuff} from './some-where';
        `);

      env.driveMain();
      const diags = env.driveDiagnostics();

      expect(diags).toEqual([]);
    });

    describe('ng module injector def', () => {
      it('should produce empty injector def imports when module has no imports/exports', () => {
        env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class MainModule {
        }
        `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({})');
      });

      it('should include raw module imports (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
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
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })');
         });

      it('should include raw module exports (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
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
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })');
         });

      it('should combine raw module imports and exports (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1, SubModule2} from './some-where';
        import {SubModule3, SubModule4} from './another-where';

        @NgModule({
          imports: [SubModule1, forwardRef(() => SubModule2)],
          exports: [SubModule3, forwardRef(() => SubModule4)],
        })
        export class MainModule {
        }
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), SubModule3, forwardRef(() => SubModule4)] })');
         });
    });
  });
});
