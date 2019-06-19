/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isRelativePath} from '../src/utils';

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
