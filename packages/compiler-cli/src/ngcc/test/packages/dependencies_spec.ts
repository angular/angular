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

import {Helpers as deps, sortEntryPointsByDependency} from '../../src/packages/dependencies';
import {EntryPoint} from '../../src/packages/entry_point';

const Module = require('module');

interface DepMap {
  [path: string]: {resolved: string[], missing: string[]};
}

describe('sortEntryPointsByDependency()', () => {
  const first = { path: 'first', esm2015: 'first/index.ts' } as EntryPoint;
  const second = { path: 'second', esm2015: 'second/index.ts' } as EntryPoint;
  const third = { path: 'third', esm2015: 'third/index.ts' } as EntryPoint;
  const fourth = { path: 'fourth', esm2015: 'fourth/index.ts' } as EntryPoint;
  const fifth = { path: 'fifth', esm2015: 'fifth/index.ts' } as EntryPoint;
  const dependencies = {
    'first/index.ts': {resolved: ['second', 'third', 'ignored-1'], missing: []},
    'second/index.ts': {resolved: ['third', 'fifth'], missing: []},
    'third/index.ts': {resolved: ['fourth', 'ignored-2'], missing: []},
    'fourth/index.ts': {resolved: ['fifth'], missing: []},
    'fifth/index.ts': {resolved: [], missing: []},
  };

  it('should order the entry points by their dependency on each other', () => {
    spyOn(deps, 'getDependencies').and.callFake(createFakeGetDependencies(dependencies));
    const result = sortEntryPointsByDependency([fifth, first, fourth, second, third]);
    expect(result.entryPoints).toEqual([fifth, fourth, third, second, first]);
  });

  it('should remove entry points that have missing dependencies, transitively', () => {
    spyOn(deps, 'getDependencies').and.callFake(createFakeGetDependencies({
      ...dependencies,
      'third/index.ts': {resolved: ['fourth'], missing: ['sixth']},
    }));
    const result = sortEntryPointsByDependency([fifth, first, fourth, second, third]);
    expect(result.entryPoints).toEqual([fifth, fourth]);
    expect(result.ignoredEntryPoints).toEqual([
      {entryPoint: third, missingDeps: ['sixth']},
      {entryPoint: first, missingDeps: ['sixth']},
      {entryPoint: second, missingDeps: ['sixth']},
    ]);
  });

  it('should error if the entry point does not have the esm2015 format', () => {
    expect(() => sortEntryPointsByDependency([{ path: 'first' } as EntryPoint]))
        .toThrowError(`Esm2015 format missing in 'first' entry-point.`);
  });

  it('should capture any dependencies that were ignored', () => {
    spyOn(deps, 'getDependencies').and.callFake(createFakeGetDependencies(dependencies));
    const result = sortEntryPointsByDependency([fifth, first, fourth, second, third]);
    expect(result.ignoredDependencies).toEqual([
      {entryPoint: first, dependencyPath: 'ignored-1'},
      {entryPoint: third, dependencyPath: 'ignored-2'},
    ]);
  });

  function createFakeGetDependencies(dependencies: DepMap) {
    return (entryPoint: string, resolved: Set<string>, missing: Set<string>) => {
      dependencies[entryPoint].resolved.forEach(dep => resolved.add(dep));
      dependencies[entryPoint].missing.forEach(dep => missing.add(dep));
    };
  }
});

describe('getDependencies()', () => {
  beforeEach(createMockFileSystem);
  afterEach(restoreRealFileSystem);

  it('should not generate a TS AST if the source does not contain any imports or re-exports',
     () => {
       spyOn(ts, 'createSourceFile');
       deps.getDependencies('/no/imports/or/re-exports.js', new Set(), new Set());
       expect(ts.createSourceFile).not.toHaveBeenCalled();
     });

  it('should resolve all the external imports of the source file', () => {
    spyOn(deps, 'tryResolveExternal')
        .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
    const resolved = new Set();
    const missing = new Set();
    deps.getDependencies('/external/imports.js', resolved, missing);
    expect(resolved.size).toBe(2);
    expect(resolved.has('RESOLVED/path/to/x'));
    expect(resolved.has('RESOLVED/path/to/y'));
  });

  it('should resolve all the external re-exports of the source file', () => {
    spyOn(deps, 'tryResolveExternal')
        .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
    const resolved = new Set();
    const missing = new Set();
    deps.getDependencies('/external/re-exports.js', resolved, missing);
    expect(resolved.size).toBe(2);
    expect(resolved.has('RESOLVED/path/to/x'));
    expect(resolved.has('RESOLVED/path/to/y'));
  });

  it('should capture missing external imports', () => {
    spyOn(deps, 'tryResolveExternal')
        .and.callFake(
            (from: string, importPath: string) =>
                importPath === 'missing' ? null : `RESOLVED/${importPath}`);
    const resolved = new Set();
    const missing = new Set();
    deps.getDependencies('/external/imports-missing.js', resolved, missing);
    expect(resolved.size).toBe(1);
    expect(resolved.has('RESOLVED/path/to/x'));
    expect(missing.size).toBe(1);
    expect(missing.has('missing'));
  });

  it('should recurse into internal dependencies', () => {
    spyOn(deps, 'resolveInternal')
        .and.callFake(
            (from: string, importPath: string) => path.join('/internal', importPath + '.js'));
    spyOn(deps, 'tryResolveExternal')
        .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
    const getDependenciesSpy = spyOn(deps, 'getDependencies').and.callThrough();
    const resolved = new Set();
    const missing = new Set();
    deps.getDependencies('/internal/outer.js', resolved, missing);
    expect(getDependenciesSpy).toHaveBeenCalledWith('/internal/outer.js', resolved, missing);
    expect(getDependenciesSpy)
        .toHaveBeenCalledWith('/internal/inner.js', resolved, missing, jasmine.any(Set));
    expect(resolved.size).toBe(1);
    expect(resolved.has('RESOLVED/path/to/y'));
  });


  it('should handle circular internal dependencies', () => {
    spyOn(deps, 'resolveInternal')
        .and.callFake(
            (from: string, importPath: string) => path.join('/internal', importPath + '.js'));
    spyOn(deps, 'tryResolveExternal')
        .and.callFake((from: string, importPath: string) => `RESOLVED/${importPath}`);
    const resolved = new Set();
    const missing = new Set();
    deps.getDependencies('/internal/circular-a.js', resolved, missing);
    expect(resolved.size).toBe(2);
    expect(resolved.has('RESOLVED/path/to/x'));
    expect(resolved.has('RESOLVED/path/to/y'));
  });

  function createMockFileSystem() {
    mockFs({
      '/no/imports/or/re-exports.js': 'some text but no import-like statements',
      '/external/imports.js': `import {X} from 'path/to/x';\nimport {Y} from 'path/to/y';`,
      '/external/re-exports.js': `export {X} from 'path/to/x';\nexport {Y} from 'path/to/y';`,
      '/external/imports-missing.js': `import {X} from 'path/to/x';\nimport {Y} from 'missing';`,
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
    const result = deps.resolveInternal('/SOURCE/PATH/FILE', '../TARGET/PATH/FILE');
    expect(result).toEqual('RESOLVED_PATH');
  });

  it('should first resolve the `to` on top of the `from` directory', () => {
    const resolveSpy = spyOn(Module, '_resolveFilename').and.returnValue('RESOLVED_PATH');
    deps.resolveInternal('/SOURCE/PATH/FILE', '../TARGET/PATH/FILE');
    expect(resolveSpy)
        .toHaveBeenCalledWith('/SOURCE/TARGET/PATH/FILE', jasmine.any(Object), false, undefined);
  });
});

describe('tryResolveExternal', () => {
  it('should call `tryResolve`, appending `package.json` to the target path', () => {
    const tryResolveSpy = spyOn(deps, 'tryResolve').and.returnValue('PATH/TO/RESOLVED');
    deps.tryResolveExternal('SOURCE_PATH', 'TARGET_PATH');
    expect(tryResolveSpy).toHaveBeenCalledWith('SOURCE_PATH', 'TARGET_PATH/package.json');
  });

  it('should return the directory containing the result from `tryResolve', () => {
    spyOn(deps, 'tryResolve').and.returnValue('PATH/TO/RESOLVED');
    expect(deps.tryResolveExternal('SOURCE_PATH', 'TARGET_PATH')).toEqual('PATH/TO');
  });

  it('should return null if `tryResolve` returns null', () => {
    spyOn(deps, 'tryResolve').and.returnValue(null);
    expect(deps.tryResolveExternal('SOURCE_PATH', 'TARGET_PATH')).toEqual(null);
  });
});

describe('tryResolve()', () => {
  it('should resolve the dependency via `Module._resolveFilename`, passing the `from` path to the `paths` option',
     () => {
       const resolveSpy = spyOn(Module, '_resolveFilename').and.returnValue('RESOLVED_PATH');
       const result = deps.tryResolve('SOURCE_PATH', 'TARGET_PATH');
       expect(resolveSpy).toHaveBeenCalledWith('TARGET_PATH', jasmine.any(Object), false, {
         paths: ['SOURCE_PATH']
       });
       expect(result).toEqual('RESOLVED_PATH');
     });

  it('should return null if `Module._resolveFilename` throws an error', () => {
    const resolveSpy =
        spyOn(Module, '_resolveFilename').and.throwError(`Cannot find module 'TARGET_PATH'`);
    const result = deps.tryResolve('SOURCE_PATH', 'TARGET_PATH');
    expect(result).toBe(null);
  });
});

describe('isStringImportOrReexport', () => {
  it('should return true if the statement is an import', () => {
    expect(deps.isStringImportOrReexport(createStatement('import {X} from "some/x";'))).toBe(true);
    expect(deps.isStringImportOrReexport(createStatement('import * as X from "some/x";')))
        .toBe(true);
  });

  it('should return true if the statement is a re-export', () => {
    expect(deps.isStringImportOrReexport(createStatement('export {X} from "some/x";'))).toBe(true);
    expect(deps.isStringImportOrReexport(createStatement('export * from "some/x";'))).toBe(true);
  });

  it('should return false if the statement is not an import or a re-export', () => {
    expect(deps.isStringImportOrReexport(createStatement('class X {}'))).toBe(false);
    expect(deps.isStringImportOrReexport(createStatement('export function foo() {}'))).toBe(false);
    expect(deps.isStringImportOrReexport(createStatement('export const X = 10;'))).toBe(false);
  });

  function createStatement(source: string) {
    return ts.createSourceFile('source.js', source, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS)
        .statements[0];
  }
});

describe('hasImportOrReeportStatements', () => {
  it('should return true if there is an import statement', () => {
    expect(deps.hasImportOrReeportStatements('import {X} from "some/x";')).toBe(true);
    expect(deps.hasImportOrReeportStatements('import * as X from "some/x";')).toBe(true);
    expect(deps.hasImportOrReeportStatements('blah blah\n\n  import {X} from "some/x";\nblah blah'))
        .toBe(true);
    expect(deps.hasImportOrReeportStatements('\t\timport {X} from "some/x";')).toBe(true);
  });
  it('should return true if there is a re-export statement', () => {
    expect(deps.hasImportOrReeportStatements('export {X} from "some/x";')).toBe(true);
    expect(deps.hasImportOrReeportStatements('blah blah\n\n  export {X} from "some/x";\nblah blah'))
        .toBe(true);
    expect(deps.hasImportOrReeportStatements('\t\texport {X} from "some/x";')).toBe(true);
    expect(deps.hasImportOrReeportStatements(
               'blah blah\n\n  export * from "@angular/core;\nblah blah'))
        .toBe(true);
  });
  it('should return false if there is no import nor re-export statement', () => {
    expect(deps.hasImportOrReeportStatements('blah blah')).toBe(false);
    expect(deps.hasImportOrReeportStatements('export function moo() {}')).toBe(false);
    expect(deps.hasImportOrReeportStatements('Some text that happens to include the word import'))
        .toBe(false);
  });
});

function restoreRealFileSystem() {
  mockFs.restore();
}
