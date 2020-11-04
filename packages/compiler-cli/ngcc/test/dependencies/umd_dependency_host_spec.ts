/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, relativeFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {createDependencyInfo} from '../../src/dependencies/dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {UmdDependencyHost} from '../../src/dependencies/umd_dependency_host';

runInEachFileSystem(() => {
  describe('UmdDependencyHost', () => {
    let _: typeof absoluteFrom;
    let host: UmdDependencyHost;

    beforeEach(() => {
      _ = absoluteFrom;
      setupMockFileSystem();
      const fs = getFileSystem();
      host = new UmdDependencyHost(fs, new ModuleResolver(fs));
    });

    describe('collectDependencies()', () => {
      it('should not generate a TS AST if the source does not contain any require calls', () => {
        spyOn(ts, 'createSourceFile');
        host.collectDependencies(_('/no/imports/or/re-exports/index.js'), createDependencyInfo());
        expect(ts.createSourceFile).not.toHaveBeenCalled();
      });

      it('should resolve all the external imports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });

      it('should resolve all the external re-exports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/re-exports/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });

      it('should capture missing external imports', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports-missing/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(missing.size).toBe(1);
        expect(missing.has(relativeFrom('missing'))).toBe(true);
        expect(deepImports.size).toBe(0);
      });

      it('should not register deep imports as missing', () => {
        // This scenario verifies the behavior of the dependency analysis when an external import
        // is found that does not map to an entry-point but still exists on disk, i.e. a deep
        // import. Such deep imports are captured for diagnostics purposes.
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/deep-import/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(0);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(1);
        expect(deepImports.has(_('/node_modules/lib_1/deep/import'))).toBe(true);
      });

      it('should recurse into internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/outer/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should handle circular internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/circular_a/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should support `paths` alias mappings when resolving modules', () => {
        const fs = getFileSystem();
        host = new UmdDependencyHost(fs, new ModuleResolver(fs, {
                                       baseUrl: '/dist',
                                       paths: {
                                         '@app/*': ['*'],
                                         '@lib/*/test': ['lib/*/test'],
                                       }
                                     }));
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/path-alias/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(4);
        expect(dependencies.has(_('/dist/components'))).toBe(true);
        expect(dependencies.has(_('/dist/shared'))).toBe(true);
        expect(dependencies.has(_('/dist/lib/shared/test'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should handle entry-point paths with no extension', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports/index'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });
    });

    function setupMockFileSystem(): void {
      loadTestFiles([
        {
          name: _('/no/imports/or/re-exports/index.js'),
          contents: '// some text but no import-like statements'
        },
        {name: _('/no/imports/or/re-exports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/no/imports/or/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/imports/index.js'),
          contents: umd('imports_index', ['lib_1', 'lib_1/sub_1'])
        },
        {name: _('/external/imports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/imports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/re-exports/index.js'),
          contents: umd('imports_index', ['lib_1', 'lib_1/sub_1'], ['lib_1.X', 'lib_1sub_1.Y'])
        },
        {name: _('/external/re-exports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/imports-missing/index.js'),
          contents: umd('imports_missing', ['lib_1', 'missing'])
        },
        {name: _('/external/imports-missing/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/imports-missing/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/deep-import/index.js'),
          contents: umd('deep_import', ['lib_1/deep/import'])
        },
        {name: _('/external/deep-import/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/deep-import/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/internal/outer/index.js'), contents: umd('outer', ['../inner'])},
        {name: _('/internal/outer/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/internal/outer/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/internal/inner/index.js'), contents: umd('inner', ['lib_1/sub_1'], ['X'])},
        {
          name: _('/internal/circular_a/index.js'),
          contents: umd('circular_a', ['../circular_b', 'lib_1/sub_1'], ['Y'])
        },
        {
          name: _('/internal/circular_b/index.js'),
          contents: umd('circular_b', ['../circular_a', 'lib_1'], ['X'])
        },
        {name: _('/internal/circular_a/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/internal/circular_a/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/re-directed/index.js'), contents: umd('re_directed', ['lib_1/sub_2'])},
        {name: _('/re-directed/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/re-directed/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/path-alias/index.js'),
          contents:
              umd('path_alias', ['@app/components', '@app/shared', '@lib/shared/test', 'lib_1'])
        },
        {name: _('/path-alias/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/path-alias/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib_1/index.d.ts'), contents: 'export declare class X {}'},
        {
          name: _('/node_modules/lib_1/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/lib_1/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/node_modules/lib_1/deep/import/index.js'),
          contents: 'export class DeepImport {}'
        },
        {name: _('/node_modules/lib_1/sub_1/index.d.ts'), contents: 'export declare class Y {}'},
        {
          name: _('/node_modules/lib_1/sub_1/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/lib_1/sub_1/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib_1/sub_2.d.ts'), contents: `export * from './sub_2/sub_2';`},
        {name: _('/node_modules/lib_1/sub_2/sub_2.d.ts'), contents: `export declare class Z {}';`},
        {
          name: _('/node_modules/lib_1/sub_2/package.json'),
          contents: '{"esm2015": "./sub_2.js", "typings": "./sub_2.d.ts"}'
        },
        {name: _('/node_modules/lib_1/sub_2/sub_2.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/dist/components/index.d.ts'), contents: `export declare class MyComponent {};`},
        {
          name: _('/dist/components/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/components/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/dist/shared/index.d.ts'),
          contents: `import {X} from 'lib_1';\nexport declare class Service {}`
        },
        {
          name: _('/dist/shared/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/shared/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/dist/lib/shared/test/index.d.ts'), contents: `export class TestHelper {}`},
        {
          name: _('/dist/lib/shared/test/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/lib/shared/test/index.metadata.json'), contents: 'MOCK METADATA'},
      ]);
    }
  });

  function umd(moduleName: string, importPaths: string[], exportNames: string[] = []) {
    const commonJsRequires = importPaths.map(p => `,require('${p}')`).join('');
    const amdDeps = importPaths.map(p => `,'${p}'`).join('');
    const globalParams =
        importPaths.map(p => `,global.${p.replace('@angular/', 'ng.').replace(/\//g, '')}`)
            .join('');
    const params =
        importPaths.map(p => `,${p.replace('@angular/', '').replace(/\.?\.?\//g, '')}`).join('');
    const exportStatements =
        exportNames.map(e => `  exports.${e.replace(/.+\./, '')} = ${e};`).join('\n');
    return `
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports${
        commonJsRequires}) :
  typeof define === 'function' && define.amd ? define('${moduleName}', ['exports'${
        amdDeps}], factory) :
  (factory(global.${moduleName}${globalParams}));
}(this, (function (exports${params}) { 'use strict';
${exportStatements}
})));
  `;
  }
});
