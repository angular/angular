/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpperCasePipe} from '@angular/common';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  describe('UpperCasePipe', () => {
    var upper: string;
    var lower: string;
    var pipe: UpperCasePipe;

    beforeEach(() => {
      lower = 'something';
      upper = 'SOMETHING';
      pipe = new UpperCasePipe();
    });

    describe('transform', () => {

      it('should return uppercase', () => {
        var val = pipe.transform(lower);
        expect(val).toEqual(upper);
      });

      it('should uppercase when there is a new value', () => {
        var val = pipe.transform(lower);
        expect(val).toEqual(upper);
        var val2 = pipe.transform('wat');
        expect(val2).toEqual('WAT');
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
}
