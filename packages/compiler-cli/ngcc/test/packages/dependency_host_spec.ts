/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as mockFs from 'mock-fs';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {DependencyHost} from '../../src/packages/dependency_host';
import {EntryPoint} from '../../src/packages/entry_point';
import {ModuleResolver} from '../../src/packages/module_resolver';

const _ = AbsoluteFsPath.from;

describe('DependencyHost', () => {
  let host: DependencyHost;
  beforeEach(() => host = new DependencyHost(new ModuleResolver()));

  describe('getDependencies()', () => {
    let entryPoints: Map<AbsoluteFsPath, EntryPoint>;
    beforeEach(createMockFileSystem);
    afterEach(restoreRealFileSystem);

    it('should error if the entry point typings do not exist', () => {
      expect(() => host.computeDependencies(_('/missing/index.d.ts'))).toThrowError();
      // TODO: `Cannot find typings for '/missing' entry-point. Tried '/missing/index.d.ts'.`);
    });

    it('should not generate a TS AST if the source does not contain any imports or re-exports',
       () => {
         spyOn(ts, 'createSourceFile');
         host.computeDependencies(_('/no/imports/or/re-exports/index.d.ts'));
         expect(ts.createSourceFile).not.toHaveBeenCalled();
       });

    it('should resolve all the external imports of the source file', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/external/imports/index.d.ts'));
      expect(dependencies.size).toBe(2);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
    });

    it('should resolve all the external re-exports of the source file', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/external/re-exports/index.d.ts'));
      expect(dependencies.size).toBe(2);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
    });

    it('should capture missing external imports', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/external/imports-missing/index.d.ts'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(missing.size).toBe(1);
      expect(missing.has('missing')).toBe(true);
      expect(deepImports.size).toBe(0);
    });

    it('should not register deep imports as missing', () => {
      // This scenario verifies the behavior of the dependency analysis when an external import
      // is found that does not map to an entry-point but still exists on disk, i.e. a deep import.
      // Such deep imports are captured for diagnostics purposes.
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/external/deep-import/index.d.ts'));

      expect(dependencies.size).toBe(0);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(1);
      expect(deepImports.has('/node_modules/lib-1/deep/import')).toBe(true);
    });

    it('should recurse into internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/internal/outer/index.d.ts'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should handle circular internal dependencies', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/internal/circular-a/index.d.ts'));
      expect(dependencies.size).toBe(2);
      expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
      expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    it('should handle re-directed typings files', () => {
      const {dependencies, missing, deepImports} =
          host.computeDependencies(_('/re-directed/index.d.ts'));

      expect(dependencies.size).toBe(1);
      expect(dependencies.has(_('/node_modules/lib-1/sub-2'))).toBe(true);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(0);
    });

    function createMockFileSystem() {
      mockFs({
        '/no/imports/or/re-exports/index.d.ts': '// some text but no import-like statements',
        '/no/imports/or/re-exports/package.json': '{"typings": "./index.d.ts"}',
        '/no/imports/or/re-exports/index.metadata.json': 'MOCK METADATA',
        '/external/imports/index.d.ts': `import {X} from 'lib-1';\nimport {Y} from 'lib-1/sub-1';`,
        '/external/imports/package.json': '{"typings": "./index.d.ts"}',
        '/external/imports/index.metadata.json': 'MOCK METADATA',
        '/external/re-exports/index.d.ts':
            `export {X} from 'lib-1';\nexport {Y} from 'lib-1/sub-1';`,
        '/external/re-exports/package.json': '{"typings": "./index.d.ts"}',
        '/external/re-exports/index.metadata.json': 'MOCK METADATA',
        '/external/imports-missing/index.d.ts':
            `import {X} from 'lib-1';\nimport {Y} from 'missing';`,
        '/external/imports-missing/package.json': '{"typings": "./index.d.ts"}',
        '/external/imports-missing/index.metadata.json': 'MOCK METADATA',
        '/external/deep-import/index.d.ts': `import {Y} from 'lib-1/deep/import';`,
        '/external/deep-import/package.json': '{"typings": "./index.d.ts"}',
        '/external/deep-import/index.metadata.json': 'MOCK METADATA',
        '/internal/outer/index.d.ts': `import {X} from '../inner';`,
        '/internal/outer/package.json': '{"typings": "./index.d.ts"}',
        '/internal/outer/index.metadata.json': 'MOCK METADATA',
        '/internal/inner/index.d.ts': `import {Y} from 'lib-1/sub-1'; export declare class X {}`,
        '/internal/circular-a/index.d.ts':
            `import {B} from '../circular-b'; import {X} from '../circular-b'; export {Y} from 'lib-1/sub-1';`,
        '/internal/circular-b/index.d.ts':
            `import {A} from '../circular-a'; import {Y} from '../circular-a'; export {X} from 'lib-1';`,
        '/internal/circular-a/package.json': '{"typings": "./index.d.ts"}',
        '/internal/circular-a/index.metadata.json': 'MOCK METADATA',
        '/re-directed/index.d.ts': `import {Z} from 'lib-1/sub-2';`,
        '/re-directed/package.json': '{"typings": "./index.d.ts"}',
        '/re-directed/index.metadata.json': 'MOCK METADATA',
        '/node_modules/lib-1/index.d.ts': 'export declare class X {}',
        '/node_modules/lib-1/package.json': '{"typings": "./index.d.ts"}',
        '/node_modules/lib-1/index.metadata.json': 'MOCK METADATA',
        '/node_modules/lib-1/deep/import/index.d.ts': 'export declare class DeepImport {}',
        '/node_modules/lib-1/sub-1/index.d.ts': 'export declare class Y {}',
        '/node_modules/lib-1/sub-1/package.json': '{"typings": "./index.d.ts"}',
        '/node_modules/lib-1/sub-1/index.metadata.json': 'MOCK METADATA',
        '/node_modules/lib-1/sub-2.d.ts': `export * from './sub-2/sub-2';`,
        '/node_modules/lib-1/sub-2/sub-2.d.ts': `export declare class Z {}';`,
        '/node_modules/lib-1/sub-2/package.json': '{"typings": "./sub-2.d.ts"}',
        '/node_modules/lib-1/sub-2/sub-2.metadata.json': 'MOCK METADATA',
      });
    }

    function restoreRealFileSystem() { mockFs.restore(); }
  });

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
          .createSourceFile('source.d.ts', source, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS)
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