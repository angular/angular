/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe} from '@angular/common';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  describe('LowerCasePipe', () => {
    let upper: string;
    let lower: string;
    let pipe: LowerCasePipe;

    beforeEach(() => {
      lower = 'something';
      upper = 'SOMETHING';
      pipe = new LowerCasePipe();
    });

    describe('transform', () => {
      it('should return lowercase', () => {
        const val = pipe.transform(upper);
        expect(val).toEqual(lower);
      });

      it('should lowercase when there is a new value', () => {
        const val = pipe.transform(upper);
        expect(val).toEqual(lower);
        const val2 = pipe.transform('WAT');
        expect(val2).toEqual('wat');
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
}
