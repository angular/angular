/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getOrDefault, isRelativePath, stripExtension} from '../src/utils';

describe('getOrDefault()', () => {
  it('should return an existing value', () => {
    const map = new Map([['k1', 'v1'], ['k2', 'v2']]);
    const factorySpy = jasmine.createSpy('factory');

    expect(getOrDefault(map, 'k1', factorySpy)).toBe('v1');
    expect(getOrDefault(map, 'k2', factorySpy)).toBe('v2');
    expect(factorySpy).not.toHaveBeenCalled();
  });

  it('should create, store and return the value if it does not exist', () => {
    const map = new Map([['k1', 'v1'], ['k2', 'v2']]);
    const factorySpy = jasmine.createSpy('factory').and.returnValues('v3', 'never gonna happen');

    expect(getOrDefault(map, 'k3', factorySpy)).toBe('v3');
    expect(factorySpy).toHaveBeenCalledTimes(1);

    factorySpy.calls.reset();

    expect(getOrDefault(map, 'k3', factorySpy)).toBe('v3');
    expect(factorySpy).not.toHaveBeenCalled();
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
