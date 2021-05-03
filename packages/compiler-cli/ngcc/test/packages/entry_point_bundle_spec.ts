/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {DtsProcessing} from '../../src/execution/tasks/api';
import {EntryPoint} from '../../src/packages/entry_point';
import {makeEntryPointBundle} from '../../src/packages/entry_point_bundle';
import {createModuleResolutionCache, SharedFileCache} from '../../src/packages/source_file_cache';

runInEachFileSystem(() => {
  describe('entry point bundle', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => {
      _ = absoluteFrom;
    });

    function setupMockFileSystem(): void {
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

        // Mimic an AFP package with declaration files in a different tree than the sources
        {name: _('/node_modules/internal/index.d.ts'), contents: 'export * from "./src/index";'},
        {name: _('/node_modules/internal/src/index.d.ts'), contents: ''},
        {
          name: _('/node_modules/internal/src/internal.d.ts'),
          contents: 'export declare class Internal {}'
        },
        {
          name: _('/node_modules/internal/esm2015/index.js'),
          contents: 'export * from "./src/index";'
        },
        {
          name: _('/node_modules/internal/esm2015/src/index.js'),
          contents: 'import {Internal} from "./internal";'
        },
        {
          name: _('/node_modules/internal/esm2015/src/internal.js'),
          contents: 'export class Internal {}'
        },

        // A package with a secondary entry-point that has source files in a different tree
        {
          name: _('/node_modules/primary/secondary/index.d.ts'),
          contents: 'export declare function secondary();'
        },
        {
          name: _('/node_modules/primary/esm2015/secondary/index.js'),
          contents: 'export function secondary();'
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
           path: absoluteFrom('/node_modules/test'),
           packageName: 'test',
           packagePath: absoluteFrom('/node_modules/test'),
           packageJson: {name: 'test'},
           typings: absoluteFrom('/node_modules/test/index.d.ts'),
           compiledByAngular: true,
           ignoreMissingDependencies: false,
           generateDeepReexports: false,
         };
         const moduleResolutionCache = createModuleResolutionCache(fs);
         const esm5bundle = makeEntryPointBundle(
             fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache, './index.js', false,
             'esm5', DtsProcessing.Yes);

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

         expect(esm5bundle.dts!.program.getSourceFiles().map(sf => sf.fileName))
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

    it('does not include .js files outside of the package when no .d.ts file is available', () => {
      // Declare main "test" package with "entry" entry-point that imports all sorts of
      // internal and external modules.
      loadTestFiles([
        {
          name: _('/node_modules/test/entry/package.json'),
          contents: `{"name": "test", "main": "./index.js", "typings": "./index.d.ts"}`,
        },
        {
          name: _('/node_modules/test/entry/index.d.ts'),
          contents: `
              import 'external-js';
              import 'external-ts';
              import 'nested-js';
              import './local';
              import '../package';
          `,
        },
        {
          name: _('/node_modules/test/entry/index.js'),
          contents: `
              import 'external-js';
              import 'external-ts';
              import 'nested-js';
              import './local';
              import '../package';
            `,
        },
        {name: _('/node_modules/test/entry/local.d.ts'), contents: `export {};`},
        {name: _('/node_modules/test/entry/local.js'), contents: `export {};`},
        {name: _('/node_modules/test/package.d.ts'), contents: `export {};`},
        {name: _('/node_modules/test/package.js'), contents: `export {};`},
      ]);

      // Declare "external-js" package outside of the "test" package without .d.ts files, should
      // not be included in the program.
      loadTestFiles([
        {
          name: _('/node_modules/external-js/package.json'),
          contents: `{"name": "external-js", "main": "./index.js"}`,
        },
        {name: _('/node_modules/external-js/index.js'), contents: 'export {};'},
      ]);

      // Same as "external-js" but located in a nested node_modules directory, which should also
      // not be included in the program.
      loadTestFiles([
        {
          name: _('/node_modules/test/node_modules/nested-js/package.json'),
          contents: `{"name": "nested-js", "main": "./index.js"}`,
        },
        {name: _('/node_modules/test/node_modules/nested-js/index.js'), contents: 'export {}'},
      ]);

      // Declare "external-ts" which does have .d.ts files, so the .d.ts should be
      // loaded into the program.
      loadTestFiles([
        {
          name: _('/node_modules/external-ts/package.json'),
          contents: `{"name": "external-ts", "main": "./index.js", "typings": "./index.d.ts"}`,
        },
        {name: _('/node_modules/external-ts/index.d.ts'), contents: 'export {};'},
        {name: _('/node_modules/external-ts/index.js'), contents: 'export {};'},
      ]);

      const fs = getFileSystem();
      const entryPoint: EntryPoint = {
        name: 'test/entry',
        path: absoluteFrom('/node_modules/test/entry'),
        packageName: 'test',
        packagePath: absoluteFrom('/node_modules/test'),
        packageJson: {name: 'test/entry'},
        typings: absoluteFrom('/node_modules/test/entry/index.d.ts'),
        compiledByAngular: true,
        ignoreMissingDependencies: false,
        generateDeepReexports: false,
      };
      const moduleResolutionCache = createModuleResolutionCache(fs);
      const esm5bundle = makeEntryPointBundle(
          fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache, './index.js', false,
          'esm5', DtsProcessing.Yes,
          /* pathMappings */ undefined, /* mirrorDtsFromSrc */ true);

      expect(esm5bundle.src.program.getSourceFiles().map(sf => _(sf.fileName)))
          .toEqual(jasmine.arrayWithExactContents([
            _('/node_modules/test/entry/index.js'),
            _('/node_modules/test/entry/local.js'),
            _('/node_modules/test/package.js'),
            _('/node_modules/external-ts/index.d.ts'),
          ]));
      expect(esm5bundle.dts!.program.getSourceFiles().map(sf => _(sf.fileName)))
          .toEqual(jasmine.arrayWithExactContents([
            _('/node_modules/test/entry/index.d.ts'),
            _('/node_modules/test/entry/local.d.ts'),
            _('/node_modules/test/package.d.ts'),
            _('/node_modules/external-ts/index.d.ts'),
          ]));
    });

    describe(
        'including equivalently named, internally imported, src files in the typings program',
        () => {
          it('does include internal .d.ts files if `mirrorDtsFromSrc` is true', () => {
            setupMockFileSystem();
            const fs = getFileSystem();
            const entryPoint: EntryPoint = {
              name: 'test',
              path: absoluteFrom('/node_modules/test'),
              packageName: 'test',
              packagePath: absoluteFrom('/node_modules/test'),
              packageJson: {name: 'test'},
              typings: absoluteFrom('/node_modules/test/index.d.ts'),
              compiledByAngular: true,
              ignoreMissingDependencies: false,
              generateDeepReexports: false,
            };
            const moduleResolutionCache = createModuleResolutionCache(fs);
            const esm5bundle = makeEntryPointBundle(
                fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache, './index.js', false,
                'esm5', DtsProcessing.Yes,
                /* pathMappings */ undefined, /* mirrorDtsFromSrc */ true);
            expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
                .toContain(absoluteFrom('/node_modules/test/internal.js'));
            expect(esm5bundle.dts!.program.getSourceFiles().map(sf => sf.fileName))
                .toContain(absoluteFrom('/node_modules/test/internal.d.ts'));
          });

          it('should work when the .d.ts files are in a different tree than the sources', () => {
            setupMockFileSystem();
            const fs = getFileSystem();
            const entryPoint: EntryPoint = {
              name: 'internal',
              path: absoluteFrom('/node_modules/internal'),
              packageName: 'internal',
              packagePath: absoluteFrom('/node_modules/internal'),
              packageJson: {name: 'internal'},
              typings: absoluteFrom('/node_modules/internal/index.d.ts'),
              compiledByAngular: true,
              ignoreMissingDependencies: false,
              generateDeepReexports: false,
            };
            const moduleResolutionCache = createModuleResolutionCache(fs);
            const esm5bundle = makeEntryPointBundle(
                fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache,
                './esm2015/index.js', false, 'esm2015', DtsProcessing.Yes,
                /* pathMappings */ undefined, /* mirrorDtsFromSrc */ true);
            expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
                .toContain(absoluteFrom('/node_modules/internal/esm2015/src/internal.js'));
            expect(esm5bundle.dts!.program.getSourceFiles().map(sf => sf.fileName))
                .toContain(absoluteFrom('/node_modules/internal/src/internal.d.ts'));
          });

          it('ignores internal .d.ts files if `mirrorDtsFromSrc` is false', () => {
            setupMockFileSystem();
            const fs = getFileSystem();
            const entryPoint: EntryPoint = {
              name: 'test',
              path: absoluteFrom('/node_modules/test'),
              packageName: 'test',
              packagePath: absoluteFrom('/node_modules/test'),
              packageJson: {name: 'test'},
              typings: absoluteFrom('/node_modules/test/index.d.ts'),
              compiledByAngular: true,
              ignoreMissingDependencies: false,
              generateDeepReexports: false,
            };
            const moduleResolutionCache = createModuleResolutionCache(fs);
            const esm5bundle = makeEntryPointBundle(
                fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache, './index.js', false,
                'esm5', DtsProcessing.Yes,
                /* pathMappings */ undefined, /* mirrorDtsFromSrc */ false);
            expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
                .toContain(absoluteFrom('/node_modules/test/internal.js'));
            expect(esm5bundle.dts!.program.getSourceFiles().map(sf => sf.fileName))
                .not.toContain(absoluteFrom('/node_modules/test/internal.d.ts'));
          });
        });

    it('should set the `rootDir` to the package path not the entry-point path', () => {
      setupMockFileSystem();
      const fs = getFileSystem();
      const entryPoint: EntryPoint = {
        name: 'secondary',
        path: absoluteFrom('/node_modules/primary/secondary'),
        packageName: 'primary',
        packagePath: absoluteFrom('/node_modules/primary'),
        packageJson: {name: 'secondary'},
        typings: absoluteFrom('/node_modules/primary/secondary/index.d.ts'),
        compiledByAngular: true,
        ignoreMissingDependencies: false,
        generateDeepReexports: false,
      };
      const moduleResolutionCache = createModuleResolutionCache(fs);
      const bundle = makeEntryPointBundle(
          fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache, './index.js', false,
          'esm2015', DtsProcessing.Yes,
          /* pathMappings */ undefined, /* mirrorDtsFromSrc */ true);
      expect(bundle.rootDirs).toEqual([absoluteFrom('/node_modules/primary')]);
    });
  });
});
