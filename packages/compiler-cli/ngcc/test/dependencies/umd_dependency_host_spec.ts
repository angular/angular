/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {UmdDependencyHost} from '../../src/dependencies/umd_dependency_host';
import {MockFileSystem} from '../helpers/mock_file_system';

const _ = AbsoluteFsPath.from;

describe('UmdDependencyHost', () => {
  let host: UmdDependencyHost;
  beforeEach(() => {
    const fs = createMockFileSystem();
    host = new UmdDependencyHost(fs, new ModuleResolver(fs));
  });

  describe('getDependencies()', () => {
    it('should not generate a TS AST if the source does not contain any require calls', () => {
      spyOn(ts, 'createSourceFile');
      host.findDependencies(_('/no/imports/or/re-exports/index.js'));
      expect(ts.createSourceFile).not.toHaveBeenCalled();
    });

    it('should resolve all the external imports of the source file', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/imports/index.js'));
      expect(dependencies.size).toBe(2);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
      expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
    });

    it('should resolve all the external re-exports of the source file', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/re-exports/index.js'));
      expect(dependencies.size).toBe(2);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
      expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
    });

    it('should capture missing external imports', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/imports-missing/index.js'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
      expect(missing.size).toBe(1);
      expect(missing.has(PathSegment.fromFsPath('missing'))).toBe(true);
      expect(deepImports.size).toBe(0);
    });

    it('should not register deep imports as missing', () => {
      // This scenario verifies the behavior of the dependency analysis when an external import
      // is found that does not map to an entry-point but still exists on disk, i.e. a deep import.
      // Such deep imports are captured for diagnostics purposes.
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/deep-import/index.js'));

      expect(dependencies.size).toBe(0);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(1);
      expect(deepImports.has(_('/node_modules/lib_1/deep/import'))).toBe(true);
    });

    it('should recurse into internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/internal/outer/index.js'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should handle circular internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/internal/circular_a/index.js'));
      expect(dependencies.size).toBe(2);
      expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should support `paths` alias mappings when resolving modules', () => {
      const fs = createMockFileSystem();
      host = new UmdDependencyHost(fs, new ModuleResolver(fs, {
                                     baseUrl: '/dist',
                                     paths: {
                                       '@app/*': ['*'],
                                       '@lib/*/test': ['lib/*/test'],
                                     }
                                   }));
      const {dependencies, missing, deepImports} = host.findDependencies(_('/path-alias/index.js'));
      expect(dependencies.size).toBe(4);
      expect(dependencies.has(_('/dist/components'))).toBe(true);
      expect(dependencies.has(_('/dist/shared'))).toBe(true);
      expect(dependencies.has(_('/dist/lib/shared/test'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });
  });

  function createMockFileSystem() {
    return new MockFileSystem({
      '/no/imports/or/re-exports/index.js': '// some text but no import-like statements',
      '/no/imports/or/re-exports/package.json': '{"esm2015": "./index.js"}',
      '/no/imports/or/re-exports/index.metadata.json': 'MOCK METADATA',
      '/external/imports/index.js': umd('imports_index', ['lib_1', 'lib_1/sub_1']),
      '/external/imports/package.json': '{"esm2015": "./index.js"}',
      '/external/imports/index.metadata.json': 'MOCK METADATA',
      '/external/re-exports/index.js':
          umd('imports_index', ['lib_1', 'lib_1/sub_1'], ['lib_1.X', 'lib_1sub_1.Y']),
      '/external/re-exports/package.json': '{"esm2015": "./index.js"}',
      '/external/re-exports/index.metadata.json': 'MOCK METADATA',
      '/external/imports-missing/index.js': umd('imports_missing', ['lib_1', 'missing']),
      '/external/imports-missing/package.json': '{"esm2015": "./index.js"}',
      '/external/imports-missing/index.metadata.json': 'MOCK METADATA',
      '/external/deep-import/index.js': umd('deep_import', ['lib_1/deep/import']),
      '/external/deep-import/package.json': '{"esm2015": "./index.js"}',
      '/external/deep-import/index.metadata.json': 'MOCK METADATA',
      '/internal/outer/index.js': umd('outer', ['../inner']),
      '/internal/outer/package.json': '{"esm2015": "./index.js"}',
      '/internal/outer/index.metadata.json': 'MOCK METADATA',
      '/internal/inner/index.js': umd('inner', ['lib_1/sub_1'], ['X']),
      '/internal/circular_a/index.js': umd('circular_a', ['../circular_b', 'lib_1/sub_1'], ['Y']),
      '/internal/circular_b/index.js': umd('circular_b', ['../circular_a', 'lib_1'], ['X']),
      '/internal/circular_a/package.json': '{"esm2015": "./index.js"}',
      '/internal/circular_a/index.metadata.json': 'MOCK METADATA',
      '/re-directed/index.js': umd('re_directed', ['lib_1/sub_2']),
      '/re-directed/package.json': '{"esm2015": "./index.js"}',
      '/re-directed/index.metadata.json': 'MOCK METADATA',
      '/path-alias/index.js':
          umd('path_alias', ['@app/components', '@app/shared', '@lib/shared/test', 'lib_1']),
      '/path-alias/package.json': '{"esm2015": "./index.js"}',
      '/path-alias/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib_1/index.d.ts': 'export declare class X {}',
      '/node_modules/lib_1/package.json': '{"esm2015": "./index.js", "typings": "./index.d.ts"}',
      '/node_modules/lib_1/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib_1/deep/import/index.js': 'export class DeepImport {}',
      '/node_modules/lib_1/sub_1/index.d.ts': 'export declare class Y {}',
      '/node_modules/lib_1/sub_1/package.json':
          '{"esm2015": "./index.js", "typings": "./index.d.ts"}',
      '/node_modules/lib_1/sub_1/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib_1/sub_2.d.ts': `export * from './sub_2/sub_2';`,
      '/node_modules/lib_1/sub_2/sub_2.d.ts': `export declare class Z {}';`,
      '/node_modules/lib_1/sub_2/package.json':
          '{"esm2015": "./sub_2.js", "typings": "./sub_2.d.ts"}',
      '/node_modules/lib_1/sub_2/sub_2.metadata.json': 'MOCK METADATA',
      '/dist/components/index.d.ts': `export declare class MyComponent {};`,
      '/dist/components/package.json': '{"esm2015": "./index.js", "typings": "./index.d.ts"}',
      '/dist/components/index.metadata.json': 'MOCK METADATA',
      '/dist/shared/index.d.ts': `import {X} from 'lib_1';\nexport declare class Service {}`,
      '/dist/shared/package.json': '{"esm2015": "./index.js", "typings": "./index.d.ts"}',
      '/dist/shared/index.metadata.json': 'MOCK METADATA',
      '/dist/lib/shared/test/index.d.ts': `export class TestHelper {}`,
      '/dist/lib/shared/test/package.json': '{"esm2015": "./index.js", "typings": "./index.d.ts"}',
      '/dist/lib/shared/test/index.metadata.json': 'MOCK METADATA',
    });
  }
});

function umd(moduleName: string, importPaths: string[], exportNames: string[] = []) {
  const commonJsRequires = importPaths.map(p => `,require('${p}')`).join('');
  const amdDeps = importPaths.map(p => `,'${p}'`).join('');
  const globalParams =
      importPaths.map(p => `,global.${p.replace('@angular/', 'ng.').replace(/\//g, '')}`).join('');
  const params =
      importPaths.map(p => `,${p.replace('@angular/', '').replace(/\.?\.?\//g, '')}`).join('');
  const exportStatements =
      exportNames.map(e => `  exports.${e.replace(/.+\./, '')} = ${e};`).join('\n');
  return `
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports${commonJsRequires}) :
  typeof define === 'function' && define.amd ? define('${moduleName}', ['exports'${amdDeps}], factory) :
  (factory(global.${moduleName}${globalParams}));
}(this, (function (exports${params}) { 'use strict';
${exportStatements}
})));
  `;
}
