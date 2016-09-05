/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SortPipe} from '@angular/common';
import {afterEach, beforeEach, ddescribe, describe, expect, iit, it, xit} from '@angular/core/testing/testing_internal';

export function main() {
  describe('SortPipe', () => {
    var pipe: SortPipe;

    beforeEach(() => { pipe = new SortPipe(); });

    describe('transform', () => {
      it('should return sorted array', () => {

        var list = ['b', 'c', 'a'];
        var sorted = pipe.transform(list);
        expect(sorted.toString()).toEqual('a,b,c');
      });

      it('should throw error if value is undefined',
         () => { expect(() => pipe.transform(undefined)).toThrowError(); });

      it('should throw error if value is null',
         () => { expect(() => pipe.transform(null)).toThrowError(); });
    });

  });
}
