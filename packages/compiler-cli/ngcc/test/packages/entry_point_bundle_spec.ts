/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {EntryPoint} from '../../src/packages/entry_point';
import {makeEntryPointBundle} from '../../src/packages/entry_point_bundle';

runInEachFileSystem(() => {
  describe('entry point bundle', () => {

    function setupMockFileSystem(): void {
      const _ = absoluteFrom;
      loadTestFiles([
        {
          name: _('/node_modules/test/package.json'),
          contents:
              '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/test/index.d.ts'), contents: 'export * from "./public_api";'},
        {name: _('/node_modules/test/index.js'), contents: 'export * from "./public_api";'},
        {name: _('/node_modules/test/index.metadata.json'), contents: '...'},
        {
          name: _('/node_modules/test/public_api.d.ts'),
          contents: `
        // Note: no import from './internal';
        export * from "test/secondary";
        export * from "./nested";
        export declare class TestClass {};
      `
        },
        {
          name: _('/node_modules/test/public_api.js'),
          contents: `
        import {internal} from './internal';
        export * from "test/secondary";
        export * from "./nested";
        export const TestClass = function() {};
       `
        },
        {
          name: _('/node_modules/test/root.d.ts'),
          contents: `
        import * from 'other';
        export declare class RootClass {};
      `
        },
        {
          name: _('/node_modules/test/root.js'),
          contents: `
        import * from 'other';
        export const RootClass = function() {};
      `
        },
        {
          name: _('/node_modules/test/internal.d.ts'),
          contents: `export declare function internal(): void;`
        },
        {name: _('/node_modules/test/internal.js'), contents: `export function internal() {}`},
        {name: _('/node_modules/test/nested/index.d.ts'), contents: 'export * from "../root";'},
        {name: _('/node_modules/test/nested/index.js'), contents: 'export * from "../root";'},
        {name: _('/node_modules/test/es2015/index.js'), contents: 'export * from "./public_api";'},
        {
          name: _('/node_modules/test/es2015/public_api.js'),
          contents: 'export class TestClass {};'
        },
        {
          name: _('/node_modules/test/es2015/root.js'),
          contents: `
          import * from 'other';
          export class RootClass {};
        `
        },
        {
          name: _('/node_modules/test/es2015/nested/index.js'),
          contents: 'export * from "../root";'
        },
        {
          name: _('/node_modules/test/secondary/package.json'),
          contents:
              '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}'
        },
        {
          name: _('/node_modules/test/secondary/index.d.ts'),
          contents: 'export * from "./public_api";'
        },
        {
          name: _('/node_modules/test/secondary/index.js'),
          contents: 'export * from "./public_api";'
        },
        {name: _('/node_modules/test/secondary/index.metadata.json'), contents: '...'},
        {
          name: _('/node_modules/test/secondary/public_api.d.ts'),
          contents: 'export declare class SecondaryClass {};'
        },
        {
          name: _('/node_modules/test/secondary/public_api.js'),
          contents: 'export class SecondaryClass {};'
        },
        {
          name: _('/node_modules/test/secondary/es2015/index.js'),
          contents: 'export * from "./public_api";'
        },
        {
          name: _('/node_modules/test/secondary/es2015/public_api.js'),
          contents: 'export class SecondaryClass {};'
        },
        {
          name: _('/node_modules/other/package.json'),
          contents:
              '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/other/index.d.ts'), contents: 'export * from "./public_api";'},
        {name: _('/node_modules/other/index.js'), contents: 'export * from "./public_api";'},
        {name: _('/node_modules/other/index.metadata.json'), contents: '...'},
        {
          name: _('/node_modules/other/public_api.d.ts'),
          contents: 'export declare class OtherClass {};'
        },
        {name: _('/node_modules/other/public_api.js'), contents: 'export class OtherClass {};'},
        {name: _('/node_modules/other/es2015/index.js'), contents: 'export * from "./public_api";'},
        {
          name: _('/node_modules/other/es2015/public_api.js'),
          contents: 'export class OtherClass {};'
        },
      ]);
    }

    // https://github.com/angular/angular/issues/29939
    it('should resolve JavaScript sources instead of declaration files if they are adjacent',
       () => {
         setupMockFileSystem();
         const fs = getFileSystem();
         const entryPoint: EntryPoint = {
           name: 'test',
           packageJson: {name: 'test'},
           package: absoluteFrom('/node_modules/test'),
           path: absoluteFrom('/node_modules/test'),
           typings: absoluteFrom('/node_modules/test/index.d.ts'),
           compiledByAngular: true,
         };
         const esm5bundle =
             makeEntryPointBundle(fs, entryPoint, './index.js', false, 'esm5', 'esm5', true) !;

         expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
             .toEqual(jasmine.arrayWithExactContents([
               // Modules from the entry-point itself should be source files
               '/node_modules/test/index.js',
               '/node_modules/test/public_api.js',
               '/node_modules/test/nested/index.js',
               '/node_modules/test/root.js',
               '/node_modules/test/internal.js',

               // Modules from a secondary entry-point should be declaration files
               '/node_modules/test/secondary/public_api.d.ts',
               '/node_modules/test/secondary/index.d.ts',

               // Modules resolved from "other" should be declaration files
               '/node_modules/other/public_api.d.ts',
               '/node_modules/other/index.d.ts',
             ].map(p => absoluteFrom(p).toString())));

         expect(esm5bundle.dts !.program.getSourceFiles().map(sf => sf.fileName))
             .toEqual(jasmine.arrayWithExactContents([
               // All modules in the dts program should be declaration files
               '/node_modules/test/index.d.ts',
               '/node_modules/test/public_api.d.ts',
               '/node_modules/test/nested/index.d.ts',
               '/node_modules/test/root.d.ts',
               '/node_modules/test/secondary/public_api.d.ts',
               '/node_modules/test/secondary/index.d.ts',
               '/node_modules/other/public_api.d.ts',
               '/node_modules/other/index.d.ts',
             ].map(p => absoluteFrom(p).toString())));
       });

    it('should include equivalently named, internally imported, src files in the typings program, if `mirrorDtsFromSrc` is true',
       () => {
         setupMockFileSystem();
         const fs = getFileSystem();
         const entryPoint: EntryPoint = {
           name: 'test',
           packageJson: {name: 'test'},
           package: absoluteFrom('/node_modules/test'),
           path: absoluteFrom('/node_modules/test'),
           typings: absoluteFrom('/node_modules/test/index.d.ts'),
           compiledByAngular: true,
         };
         const esm5bundle = makeEntryPointBundle(
             fs, entryPoint, './index.js', false, 'esm5', 'esm5', /* transformDts */ true,
             /* pathMappings */ undefined, /* mirrorDtsFromSrc */ true) !;
         expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
             .toContain(absoluteFrom('/node_modules/test/internal.js'));
         expect(esm5bundle.dts !.program.getSourceFiles().map(sf => sf.fileName))
             .toContain(absoluteFrom('/node_modules/test/internal.d.ts'));
       });

    it('should ignore, internally imported, src files in the typings program, if `mirrorDtsFromSrc` is false',
       () => {
         setupMockFileSystem();
         const fs = getFileSystem();
         const entryPoint: EntryPoint = {
           name: 'test',
           packageJson: {name: 'test'},
           package: absoluteFrom('/node_modules/test'),
           path: absoluteFrom('/node_modules/test'),
           typings: absoluteFrom('/node_modules/test/index.d.ts'),
           compiledByAngular: true,
         };
         const esm5bundle = makeEntryPointBundle(
             fs, entryPoint, './index.js', false, 'esm5', 'esm5', /* transformDts */ true,
             /* pathMappings */ undefined, /* mirrorDtsFromSrc */ false) !;
         expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
             .toContain(absoluteFrom('/node_modules/test/internal.js'));
         expect(esm5bundle.dts !.program.getSourceFiles().map(sf => sf.fileName))
             .not.toContain(absoluteFrom('/node_modules/test/internal.d.ts'));
       });
  });
});
