/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {classIndexOf} from '../../../src/render3/styling/class_differ';

describe('class differ', () => {
  describe('classIndexOf', () => {
    it('should match simple case', () => {
      expect(classIndexOf('A', 'A', 0)).toEqual(0);
      expect(classIndexOf('AA', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_A_', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_ A_', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_ A _', 'A', 0)).toEqual(2);
    });

    it('should not match on partial matches', () => {
      expect(classIndexOf('ABC AB', 'AB', 0)).toEqual(4);
      expect(classIndexOf('AB ABC', 'AB', 1)).toEqual(-1);
      expect(classIndexOf('ABC BC', 'BC', 0)).toEqual(4);
      expect(classIndexOf('BC ABC', 'BB', 1)).toEqual(-1);
    });
  });
});
