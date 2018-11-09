/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'canonical-path';
import * as mockFs from 'mock-fs';
import * as ts from 'typescript';
import {DependencyHost} from '../../src/packages/dependency_host';
const Module = require('module');

interface DepMap {
  [path: string]: {resolved: string[], missing: string[]};
}

describe('DependencyHost', () => {
  let host: DependencyHost;
  beforeEach(() => host = new DependencyHost());

  describe('getDependencies()', () => {
    beforeEach(createMockFileSystem);
    afterEach(restoreRealFileSystem);

    it('should not generate a TS AST if the source does not contain any imports or re-exports',
       () => {
         spyOn(ts, 'createSourceFile');
         host.computeDependencies('/no/imports/or/re-exports.js', new Set(), new Set(), new Set());
         expect(ts.createSourceFile).not.toHaveBeenCalled();
       });

    it('should resolve all the external imports of the source file', () => {
      spyOn(host, 'tryResolveEntryPoint')
          .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/external/imports.js', resolved, missing, deepImports);
      expect(resolved.size).toBe(2);
      expect(resolved.has('RESOLVED/path/to/x')).toBe(true);
      expect(resolved.has('RESOLVED/path/to/y')).toBe(true);
    });

    it('should resolve all the external re-exports of the source file', () => {
      spyOn(host, 'tryResolveEntryPoint')
          .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/external/re-exports.js', resolved, missing, deepImports);
      expect(resolved.size).toBe(2);
      expect(resolved.has('RESOLVED/path/to/x')).toBe(true);
      expect(resolved.has('RESOLVED/path/to/y')).toBe(true);
    });

    it('should capture missing external imports', () => {
      spyOn(host, 'tryResolveEntryPoint')
          .and.callFake(
              (from: string, importPath: string) =>
                  importPath === 'missing' ? null : `RESOLVED/${importPath}`);
      spyOn(host, 'tryResolve').and.callFake(() => null);
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/external/imports-missing.js', resolved, missing, deepImports);
      expect(resolved.size).toBe(1);
      expect(resolved.has('RESOLVED/path/to/x')).toBe(true);
      expect(missing.size).toBe(1);
      expect(missing.has('missing')).toBe(true);
      expect(deepImports.size).toBe(0);
    });

    it('should not register deep imports as missing', () => {
      // This scenario verifies the behavior of the dependency analysis when an external import
      // is found that does not map to an entry-point but still exists on disk, i.e. a deep import.
      // Such deep imports are captured for diagnostics purposes.
      const tryResolveEntryPoint = (from: string, importPath: string) =>
          importPath === 'deep/import' ? null : `RESOLVED/${importPath}`;
      spyOn(host, 'tryResolveEntryPoint').and.callFake(tryResolveEntryPoint);
      spyOn(host, 'tryResolve')
          .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/external/deep-import.js', resolved, missing, deepImports);
      expect(resolved.size).toBe(0);
      expect(missing.size).toBe(0);
      expect(deepImports.size).toBe(1);
      expect(deepImports.has('deep/import')).toBe(true);
    });

    it('should recurse into internal dependencies', () => {
      spyOn(host, 'resolveInternal')
          .and.callFake(
              (from: string, importPath: string) => path.join('/internal', importPath + '.js'));
      spyOn(host, 'tryResolveEntryPoint')
          .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
      const getDependenciesSpy = spyOn(host, 'computeDependencies').and.callThrough();
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/internal/outer.js', resolved, missing, deepImports);
      expect(getDependenciesSpy)
          .toHaveBeenCalledWith('/internal/outer.js', resolved, missing, deepImports);
      expect(getDependenciesSpy)
          .toHaveBeenCalledWith(
              '/internal/inner.js', resolved, missing, deepImports, jasmine.any(Set));
      expect(resolved.size).toBe(1);
      expect(resolved.has('RESOLVED/path/to/y')).toBe(true);
    });


    it('should handle circular internal dependencies', () => {
      spyOn(host, 'resolveInternal')
          .and.callFake(
              (from: string, importPath: string) => path.join('/internal', importPath + '.js'));
      spyOn(host, 'tryResolveEntryPoint')
          .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
      const resolved = new Set();
      const missing = new Set();
      const deepImports = new Set();
      host.computeDependencies('/internal/circular-a.js', resolved, missing, deepImports);
      expect(resolved.size).toBe(2);
      expect(resolved.has('RESOLVED/path/to/x')).toBe(true);
      expect(resolved.has('RESOLVED/path/to/y')).toBe(true);
    });

    function createMockFileSystem() {
      mockFs({
        '/no/imports/or/re-exports.js': 'some text but no import-like statements',
        '/external/imports.js': `import {X} from 'path/to/x';\nimport {Y} from 'path/to/y';`,
        '/external/re-exports.js': `export {X} from 'path/to/x';\nexport {Y} from 'path/to/y';`,
        '/external/imports-missing.js': `import {X} from 'path/to/x';\nimport {Y} from 'missing';`,
        '/external/deep-import.js': `import {Y} from 'deep/import';`,
        '/internal/outer.js': `import {X} from './inner';`,
        '/internal/inner.js': `import {Y} from 'path/to/y';`,
        '/internal/circular-a.js': `import {B} from './circular-b'; import {X} from 'path/to/x';`,
        '/internal/circular-b.js': `import {A} from './circular-a'; import {Y} from 'path/to/y';`,
      });
    }
  });

  describe('resolveInternal', () => {
    it('should resolve the dependency via `Module._resolveFilename`', () => {
      spyOn(Module, '_resolveFilename').and.returnValue('RESOLVED_PATH');
      const result = host.resolveInternal('/SOURCE/PATH/FILE', '../TARGET/PATH/FILE');
      expect(result).toEqual('RESOLVED_PATH');
    });

    it('should first resolve the `to` on top of the `from` directory', () => {
      const resolveSpy = spyOn(Module, '_resolveFilename').and.returnValue('RESOLVED_PATH');
      host.resolveInternal('/SOURCE/PATH/FILE', '../TARGET/PATH/FILE');
      expect(resolveSpy)
          .toHaveBeenCalledWith('/SOURCE/TARGET/PATH/FILE', jasmine.any(Object), false, undefined);
    });
  });

  describe('tryResolveExternal', () => {
    it('should call `tryResolve`, appending `package.json` to the target path', () => {
      const tryResolveSpy = spyOn(host, 'tryResolve').and.returnValue('PATH/TO/RESOLVED');
      host.tryResolveEntryPoint('SOURCE_PATH', 'TARGET_PATH');
      expect(tryResolveSpy).toHaveBeenCalledWith('SOURCE_PATH', 'TARGET_PATH/package.json');
    });

    it('should return the directory containing the result from `tryResolve', () => {
      spyOn(host, 'tryResolve').and.returnValue('PATH/TO/RESOLVED');
      expect(host.tryResolveEntryPoint('SOURCE_PATH', 'TARGET_PATH')).toEqual('PATH/TO');
    });

    it('should return null if `tryResolve` returns null', () => {
      spyOn(host, 'tryResolve').and.returnValue(null);
      expect(host.tryResolveEntryPoint('SOURCE_PATH', 'TARGET_PATH')).toEqual(null);
    });
  });

  describe('tryResolve()', () => {
    it('should resolve the dependency via `Module._resolveFilename`, passing the `from` path to the `paths` option',
       () => {
         const resolveSpy = spyOn(Module, '_resolveFilename').and.returnValue('RESOLVED_PATH');
         const result = host.tryResolve('SOURCE_PATH', 'TARGET_PATH');
         expect(resolveSpy).toHaveBeenCalledWith('TARGET_PATH', jasmine.any(Object), false, {
           paths: ['SOURCE_PATH']
         });
         expect(result).toEqual('RESOLVED_PATH');
       });

    it('should return null if `Module._resolveFilename` throws an error', () => {
      const resolveSpy =
          spyOn(Module, '_resolveFilename').and.throwError(`Cannot find module 'TARGET_PATH'`);
      const result = host.tryResolve('SOURCE_PATH', 'TARGET_PATH');
      expect(result).toBe(null);
    });
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
          .createSourceFile('source.js', source, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS)
          .statements[0];
    }
  });

  describe('hasImportOrReeportStatements', () => {
    it('should return true if there is an import statement', () => {
      expect(host.hasImportOrReeportStatements('import {X} from "some/x";')).toBe(true);
      expect(host.hasImportOrReeportStatements('import * as X from "some/x";')).toBe(true);
      expect(
          host.hasImportOrReeportStatements('blah blah\n\n  import {X} from "some/x";\nblah blah'))
          .toBe(true);
      expect(host.hasImportOrReeportStatements('\t\timport {X} from "some/x";')).toBe(true);
    });
    it('should return true if there is a re-export statement', () => {
      expect(host.hasImportOrReeportStatements('export {X} from "some/x";')).toBe(true);
      expect(
          host.hasImportOrReeportStatements('blah blah\n\n  export {X} from "some/x";\nblah blah'))
          .toBe(true);
      expect(host.hasImportOrReeportStatements('\t\texport {X} from "some/x";')).toBe(true);
      expect(host.hasImportOrReeportStatements(
                 'blah blah\n\n  export * from "@angular/core;\nblah blah'))
          .toBe(true);
    });
    it('should return false if there is no import nor re-export statement', () => {
      expect(host.hasImportOrReeportStatements('blah blah')).toBe(false);
      expect(host.hasImportOrReeportStatements('export function moo() {}')).toBe(false);
      expect(host.hasImportOrReeportStatements('Some text that happens to include the word import'))
          .toBe(false);
    });
  });

  function restoreRealFileSystem() { mockFs.restore(); }
});
