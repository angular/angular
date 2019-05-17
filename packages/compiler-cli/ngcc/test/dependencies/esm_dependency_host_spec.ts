/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {MockFileSystem} from '../helpers/mock_file_system';

const _ = AbsoluteFsPath.from;

describe('EsmDependencyHost', () => {
  let host: EsmDependencyHost;
  beforeEach(() => {
    const fs = createMockFileSystem();
    host = new EsmDependencyHost(fs, new ModuleResolver(fs));
  });

  describe('getDependencies()', () => {
    it('should not generate a TS AST if the source does not contain any imports or re-exports',
       () => {
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
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
    });

    it('should resolve all the external re-exports of the source file', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/re-exports/index.js'));
      expect(dependencies.size).toBe(2);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
    });

    it('should capture missing external imports', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/external/imports-missing/index.js'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
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
      expect(deepImports.has(_('/node_modules/lib-1/deep/import'))).toBe(true);
    });

    it('should recurse into internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/internal/outer/index.js'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should handle circular internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.findDependencies(_('/internal/circular-a/index.js'));
      expect(dependencies.size).toBe(2);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should support `paths` alias mappings when resolving modules', () => {
      const fs = createMockFileSystem();
      host = new EsmDependencyHost(fs, new ModuleResolver(fs, {
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
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });
  });

  function createMockFileSystem() {
    return new MockFileSystem({
      '/no/imports/or/re-exports/index.js': '// some text but no import-like statements',
      '/no/imports/or/re-exports/package.json': '{"esm2015": "./index.js"}',
      '/no/imports/or/re-exports/index.metadata.json': 'MOCK METADATA',
      '/external/imports/index.js': `import {X} from 'lib-1';\nimport {Y} from 'lib-1/sub-1';`,
      '/external/imports/package.json': '{"esm2015": "./index.js"}',
      '/external/imports/index.metadata.json': 'MOCK METADATA',
      '/external/re-exports/index.js': `export {X} from 'lib-1';\nexport {Y} from 'lib-1/sub-1';`,
      '/external/re-exports/package.json': '{"esm2015": "./index.js"}',
      '/external/re-exports/index.metadata.json': 'MOCK METADATA',
      '/external/imports-missing/index.js': `import {X} from 'lib-1';\nimport {Y} from 'missing';`,
      '/external/imports-missing/package.json': '{"esm2015": "./index.js"}',
      '/external/imports-missing/index.metadata.json': 'MOCK METADATA',
      '/external/deep-import/index.js': `import {Y} from 'lib-1/deep/import';`,
      '/external/deep-import/package.json': '{"esm2015": "./index.js"}',
      '/external/deep-import/index.metadata.json': 'MOCK METADATA',
      '/internal/outer/index.js': `import {X} from '../inner';`,
      '/internal/outer/package.json': '{"esm2015": "./index.js"}',
      '/internal/outer/index.metadata.json': 'MOCK METADATA',
      '/internal/inner/index.js': `import {Y} from 'lib-1/sub-1'; export declare class X {}`,
      '/internal/circular-a/index.js':
          `import {B} from '../circular-b'; import {X} from '../circular-b'; export {Y} from 'lib-1/sub-1';`,
      '/internal/circular-b/index.js':
          `import {A} from '../circular-a'; import {Y} from '../circular-a'; export {X} from 'lib-1';`,
      '/internal/circular-a/package.json': '{"esm2015": "./index.js"}',
      '/internal/circular-a/index.metadata.json': 'MOCK METADATA',
      '/re-directed/index.js': `import {Z} from 'lib-1/sub-2';`,
      '/re-directed/package.json': '{"esm2015": "./index.js"}',
      '/re-directed/index.metadata.json': 'MOCK METADATA',
      '/path-alias/index.js':
          `import {TestHelper} from '@app/components';\nimport {Service} from '@app/shared';\nimport {TestHelper} from '@lib/shared/test';\nimport {X} from 'lib-1';`,
      '/path-alias/package.json': '{"esm2015": "./index.js"}',
      '/path-alias/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib-1/index.js': 'export declare class X {}',
      '/node_modules/lib-1/package.json': '{"esm2015": "./index.js"}',
      '/node_modules/lib-1/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib-1/deep/import/index.js': 'export declare class DeepImport {}',
      '/node_modules/lib-1/sub-1/index.js': 'export declare class Y {}',
      '/node_modules/lib-1/sub-1/package.json': '{"esm2015": "./index.js"}',
      '/node_modules/lib-1/sub-1/index.metadata.json': 'MOCK METADATA',
      '/node_modules/lib-1/sub-2.js': `export * from './sub-2/sub-2';`,
      '/node_modules/lib-1/sub-2/sub-2.js': `export declare class Z {}';`,
      '/node_modules/lib-1/sub-2/package.json': '{"esm2015": "./sub-2.js"}',
      '/node_modules/lib-1/sub-2/sub-2.metadata.json': 'MOCK METADATA',
      '/dist/components/index.js': `class MyComponent {};`,
      '/dist/components/package.json': '{"esm2015": "./index.js"}',
      '/dist/components/index.metadata.json': 'MOCK METADATA',
      '/dist/shared/index.js': `import {X} from 'lib-1';\nexport class Service {}`,
      '/dist/shared/package.json': '{"esm2015": "./index.js"}',
      '/dist/shared/index.metadata.json': 'MOCK METADATA',
      '/dist/lib/shared/test/index.js': `export class TestHelper {}`,
      '/dist/lib/shared/test/package.json': '{"esm2015": "./index.js"}',
      '/dist/lib/shared/test/index.metadata.json': 'MOCK METADATA',
    });
  }

  describe('isStringImportOrReexport', () => {
    it('should return true if the statement is an import', () => {
      expect(host.isStringImportOrReexport(createStatement('import {X} from "some/x";')))
          .toBe(true);
      expect(host.isStringImportOrReexport(createStatement('import * as X from "some/x";')))
          .toBe(true);
    });

    it('should return true if the statement is a re-export', () => {
      expect(host.isStringImportOrReexport(createStatement('export {X} from "some/x";')))
          .toBe(true);
      expect(host.isStringImportOrReexport(createStatement('export * from "some/x";'))).toBe(true);
    });

    it('should return false if the statement is not an import or a re-export', () => {
      expect(host.isStringImportOrReexport(createStatement('class X {}'))).toBe(false);
      expect(host.isStringImportOrReexport(createStatement('export function foo() {}')))
          .toBe(false);
      expect(host.isStringImportOrReexport(createStatement('export const X = 10;'))).toBe(false);
    });

    function createStatement(source: string) {
      return ts
          .createSourceFile('source.js', source, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS)
          .statements[0];
    }
  });

  describe('hasImportOrReexportStatements', () => {
    it('should return true if there is an import statement', () => {
      expect(host.hasImportOrReexportStatements('import {X} from "some/x";')).toBe(true);
      expect(host.hasImportOrReexportStatements('import * as X from "some/x";')).toBe(true);
      expect(
          host.hasImportOrReexportStatements('blah blah\n\n  import {X} from "some/x";\nblah blah'))
          .toBe(true);
      expect(host.hasImportOrReexportStatements('\t\timport {X} from "some/x";')).toBe(true);
    });
    it('should return true if there is a re-export statement', () => {
      expect(host.hasImportOrReexportStatements('export {X} from "some/x";')).toBe(true);
      expect(
          host.hasImportOrReexportStatements('blah blah\n\n  export {X} from "some/x";\nblah blah'))
          .toBe(true);
      expect(host.hasImportOrReexportStatements('\t\texport {X} from "some/x";')).toBe(true);
      expect(host.hasImportOrReexportStatements(
                 'blah blah\n\n  export * from "@angular/core;\nblah blah'))
          .toBe(true);
    });
    it('should return false if there is no import nor re-export statement', () => {
      expect(host.hasImportOrReexportStatements('blah blah')).toBe(false);
      expect(host.hasImportOrReexportStatements('export function moo() {}')).toBe(false);
      expect(
          host.hasImportOrReexportStatements('Some text that happens to include the word import'))
          .toBe(false);
    });
  });
});