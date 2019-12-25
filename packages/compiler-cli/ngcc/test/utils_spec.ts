/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FactoryMap, isRelativePath, stripExtension} from '../src/utils';

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

describe('isRelativePath()', () => {
  it('should return true for relative paths', () => {
    expect(isRelativePath('.')).toBe(true);
    expect(isRelativePath('..')).toBe(true);
    expect(isRelativePath('./')).toBe(true);
    expect(isRelativePath('../')).toBe(true);
    expect(isRelativePath('./abc/xyz')).toBe(true);
    expect(isRelativePath('../abc/xyz')).toBe(true);
  });

  it('should return true for absolute paths', () => {
    expect(isRelativePath('/')).toBe(true);
    expect(isRelativePath('/abc/xyz')).toBe(true);
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
