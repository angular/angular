/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {absoluteFrom as _abs} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {KnownDeclaration} from '../../src/ngtsc/reflection';
import {FactoryMap, getTsHelperFnFromDeclaration, getTsHelperFnFromIdentifier, isRelativePath, stripExtension} from '../src/utils';

describe('FactoryMap', () => {
  it('should return an existing value', () => {
    const factoryFnSpy = jasmine.createSpy('factory');
    const factoryMap = new FactoryMap<string, string>(factoryFnSpy, [['k1', 'v1'], ['k2', 'v2']]);

    expect(factoryMap.get('k1')).toBe('v1');
    expect(factoryMap.get('k2')).toBe('v2');
    expect(factoryFnSpy).not.toHaveBeenCalled();
  });

  it('should not treat falsy values as missing', () => {
    const factoryFnSpy = jasmine.createSpy('factory').and.returnValue('never gonna happen');
    const factoryMap = new FactoryMap<string, any>(factoryFnSpy, [
      ['k1', ''],
      ['k2', 0],
      ['k3', false],
      ['k4', null],
      ['k5', undefined],
    ]);

    expect(factoryMap.get('k1')).toBe('');
    expect(factoryMap.get('k2')).toBe(0);
    expect(factoryMap.get('k3')).toBe(false);
    expect(factoryMap.get('k4')).toBe(null);
    expect(factoryMap.get('k5')).toBe(undefined);
    expect(factoryFnSpy).not.toHaveBeenCalled();
  });

  it('should create, store and return the value if it does not exist', () => {
    const factoryFnSpy = jasmine.createSpy('factory').and.returnValues('v3', 'never gonna happen');
    const factoryMap = new FactoryMap(factoryFnSpy, [['k1', 'v1'], ['k2', 'v2']]);

    expect(factoryMap.get('k3')).toBe('v3');
    expect(factoryFnSpy).toHaveBeenCalledTimes(1);

    factoryFnSpy.calls.reset();

    expect(factoryMap.get('k3')).toBe('v3');
    expect(factoryFnSpy).not.toHaveBeenCalled();
  });
});

describe('getTsHelperFnFromDeclaration()', () => {
  const createFunctionDeclaration = (fnName?: string) => ts.createFunctionDeclaration(
      undefined, undefined, undefined, fnName, undefined, [], undefined, undefined);
  const createVariableDeclaration = (varName: string) =>
      ts.createVariableDeclaration(varName, undefined, undefined);

  it('should recognize the `__assign` helper as function declaration', () => {
    const decl1 = createFunctionDeclaration('__assign');
    const decl2 = createFunctionDeclaration('__assign$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperAssign);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperAssign);
  });

  it('should recognize the `__assign` helper as variable declaration', () => {
    const decl1 = createVariableDeclaration('__assign');
    const decl2 = createVariableDeclaration('__assign$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperAssign);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperAssign);
  });

  it('should recognize the `__spread` helper as function declaration', () => {
    const decl1 = createFunctionDeclaration('__spread');
    const decl2 = createFunctionDeclaration('__spread$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpread);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpread);
  });

  it('should recognize the `__spread` helper as variable declaration', () => {
    const decl1 = createVariableDeclaration('__spread');
    const decl2 = createVariableDeclaration('__spread$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpread);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpread);
  });

  it('should recognize the `__spreadArrays` helper as function declaration', () => {
    const decl1 = createFunctionDeclaration('__spreadArrays');
    const decl2 = createFunctionDeclaration('__spreadArrays$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpreadArrays);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpreadArrays);
  });

  it('should recognize the `__spreadArrays` helper as variable declaration', () => {
    const decl1 = createVariableDeclaration('__spreadArrays');
    const decl2 = createVariableDeclaration('__spreadArrays$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpreadArrays);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpreadArrays);
  });

  it('should recognize the `__spreadArray` helper as function declaration', () => {
    const decl1 = createFunctionDeclaration('__spreadArray');
    const decl2 = createFunctionDeclaration('__spreadArray$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpreadArray);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpreadArray);
  });

  it('should recognize the `__spreadArray` helper as variable declaration', () => {
    const decl1 = createVariableDeclaration('__spreadArray');
    const decl2 = createVariableDeclaration('__spreadArray$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(KnownDeclaration.TsHelperSpreadArray);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(KnownDeclaration.TsHelperSpreadArray);
  });

  it('should return null for unrecognized helpers', () => {
    const decl1 = createFunctionDeclaration('__foo');
    const decl2 = createVariableDeclaration('spread');
    const decl3 = createFunctionDeclaration('spread$42');

    expect(getTsHelperFnFromDeclaration(decl1)).toBe(null);
    expect(getTsHelperFnFromDeclaration(decl2)).toBe(null);
    expect(getTsHelperFnFromDeclaration(decl3)).toBe(null);
  });

  it('should return null for unnamed declarations', () => {
    const unnamledDecl = createFunctionDeclaration(undefined);

    expect(getTsHelperFnFromDeclaration(unnamledDecl)).toBe(null);
  });

  it('should return null for non-function/variable declarations', () => {
    const classDecl =
        ts.createClassDeclaration(undefined, undefined, '__assign', undefined, undefined, []);

    expect(classDecl.name!.text).toBe('__assign');
    expect(getTsHelperFnFromDeclaration(classDecl)).toBe(null);
  });
});

describe('getTsHelperFnFromIdentifier()', () => {
  it('should recognize the `__assign` helper', () => {
    const id1 = ts.createIdentifier('__assign');
    const id2 = ts.createIdentifier('__assign$42');

    expect(getTsHelperFnFromIdentifier(id1)).toBe(KnownDeclaration.TsHelperAssign);
    expect(getTsHelperFnFromIdentifier(id2)).toBe(KnownDeclaration.TsHelperAssign);
  });

  it('should recognize the `__spread` helper', () => {
    const id1 = ts.createIdentifier('__spread');
    const id2 = ts.createIdentifier('__spread$42');

    expect(getTsHelperFnFromIdentifier(id1)).toBe(KnownDeclaration.TsHelperSpread);
    expect(getTsHelperFnFromIdentifier(id2)).toBe(KnownDeclaration.TsHelperSpread);
  });

  it('should recognize the `__spreadArrays` helper', () => {
    const id1 = ts.createIdentifier('__spreadArrays');
    const id2 = ts.createIdentifier('__spreadArrays$42');

    expect(getTsHelperFnFromIdentifier(id1)).toBe(KnownDeclaration.TsHelperSpreadArrays);
    expect(getTsHelperFnFromIdentifier(id2)).toBe(KnownDeclaration.TsHelperSpreadArrays);
  });

  it('should recognize the `__spreadArray` helper', () => {
    const id1 = ts.createIdentifier('__spreadArray');
    const id2 = ts.createIdentifier('__spreadArray$42');

    expect(getTsHelperFnFromIdentifier(id1)).toBe(KnownDeclaration.TsHelperSpreadArray);
    expect(getTsHelperFnFromIdentifier(id2)).toBe(KnownDeclaration.TsHelperSpreadArray);
  });

  it('should return null for unrecognized helpers', () => {
    const id1 = ts.createIdentifier('__foo');
    const id2 = ts.createIdentifier('spread');
    const id3 = ts.createIdentifier('spread$42');

    expect(getTsHelperFnFromIdentifier(id1)).toBe(null);
    expect(getTsHelperFnFromIdentifier(id2)).toBe(null);
    expect(getTsHelperFnFromIdentifier(id3)).toBe(null);
  });
});

runInEachFileSystem(() => {
  describe('isRelativePath()', () => {
    it('should return true for relative paths', () => {
      expect(isRelativePath('.')).toBe(true);
      expect(isRelativePath('..')).toBe(true);
      expect(isRelativePath('./')).toBe(true);
      expect(isRelativePath('.\\')).toBe(true);
      expect(isRelativePath('../')).toBe(true);
      expect(isRelativePath('..\\')).toBe(true);
      expect(isRelativePath('./abc/xyz')).toBe(true);
      expect(isRelativePath('.\\abc\\xyz')).toBe(true);
      expect(isRelativePath('../abc/xyz')).toBe(true);
      expect(isRelativePath('..\\abc\\xyz')).toBe(true);
    });

    it('should return true for absolute paths', () => {
      expect(isRelativePath(_abs('/'))).toBe(true);
      expect(isRelativePath(_abs('/abc/xyz'))).toBe(true);
    });

    it('should return false for other paths', () => {
      expect(isRelativePath('abc')).toBe(false);
      expect(isRelativePath('abc/xyz')).toBe(false);
      expect(isRelativePath('.abc')).toBe(false);
      expect(isRelativePath('..abc')).toBe(false);
      expect(isRelativePath('@abc')).toBe(false);
      expect(isRelativePath('.abc/xyz')).toBe(false);
      expect(isRelativePath('..abc/xyz')).toBe(false);
      expect(isRelativePath('@abc/xyz')).toBe(false);
    });
  });
});

describe('stripExtension()', () => {
  it('should strip the extension from a file name', () => {
    expect(stripExtension('foo.ts')).toBe('foo');
    expect(stripExtension('/foo/bar.ts')).toBe('/foo/bar');
    expect(stripExtension('/foo/bar.d.ts')).toBe('/foo/bar');
  });

  it('should do nothing if there is no extension in a file name', () => {
    expect(stripExtension('foo')).toBe('foo');
    expect(stripExtension('/foo/bar')).toBe('/foo/bar');
    expect(stripExtension('/fo-o/b_ar')).toBe('/fo-o/b_ar');
  });
});
