/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleSpecifier} from '../../src/ngtsc/path';
import {isRelativePath} from '../src/utils';

const _Mod = ModuleSpecifier.from;

describe('isRelativePath()', () => {
  it('should return true for relative paths', () => {
    expect(isRelativePath(_Mod('.'))).toBe(true);
    expect(isRelativePath(_Mod('..'))).toBe(true);
    expect(isRelativePath(_Mod('./'))).toBe(true);
    expect(isRelativePath(_Mod('../'))).toBe(true);
    expect(isRelativePath(_Mod('./abc/xyz'))).toBe(true);
    expect(isRelativePath(_Mod('../abc/xyz'))).toBe(true);
  });

  it('should return true for absolute paths', () => {
    expect(isRelativePath(_Mod('/'))).toBe(true);
    expect(isRelativePath(_Mod('/abc/xyz'))).toBe(true);
  });

  it('should return false for other paths', () => {
    expect(isRelativePath(_Mod('abc'))).toBe(false);
    expect(isRelativePath(_Mod('abc/xyz'))).toBe(false);
    expect(isRelativePath(_Mod('.abc'))).toBe(false);
    expect(isRelativePath(_Mod('..abc'))).toBe(false);
    expect(isRelativePath(_Mod('@abc'))).toBe(false);
    expect(isRelativePath(_Mod('.abc/xyz'))).toBe(false);
    expect(isRelativePath(_Mod('..abc/xyz'))).toBe(false);
    expect(isRelativePath(_Mod('@abc/xyz'))).toBe(false);
  });
});
