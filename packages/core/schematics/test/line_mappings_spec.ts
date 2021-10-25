/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computeLineStartsMap, getLineAndCharacterFromPosition} from '../utils/line_mappings';

describe('line mappings', () => {
  it('should properly compute line starts',
     () => {
       expect(computeLineStartsMap(`
      1
      2`)).toEqual([0, 1, 9, 16]);
     });

  it('should properly get line and character from line starts', () => {
    const lineStarts = computeLineStartsMap(`
      1
      2`);

    expect(getLineAndCharacterFromPosition(lineStarts, 8)).toEqual({
      line: 1,
      character: 7,
    });
  });
});
