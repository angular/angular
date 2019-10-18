/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {areArraysEqual} from '../../src/utils/collection';

describe('collection', () => {
  it('#areArraysEqual should return true for equal arrays', () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(areArraysEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
  });

  it('#areArraysEqual should return false for different arrays', () => {
    expect(areArraysEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(areArraysEqual([[1, 2], [3, 4]], [[1, 2]])).toBe(false);
    expect(areArraysEqual([[1, 2], [3, 4]], [[1, 2], [4, 5]])).toBe(false);
  });
});
