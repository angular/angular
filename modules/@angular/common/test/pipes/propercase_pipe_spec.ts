/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProperCasePipe} from '@angular/common';
import {afterEach, beforeEach, ddescribe, describe, expect, iit, it, xit} from '@angular/core/testing/testing_internal';

export function main() {
  describe('ProperCasePipe', () => {
    var proper: string;
    var lower: string;
    var pipe: ProperCasePipe;

    beforeEach(() => {
      lower = 'hello there';
      proper = 'Hello there';
      pipe = new ProperCasePipe();
    });

    describe('transform', () => {

      it('should return propercase', () => {
        var val = pipe.transform(lower);
        expect(val).toEqual(proper);
      });

      it('should uppercase when there is a new value', () => {
        var val = pipe.transform(lower);
        expect(val).toEqual(proper);
        var val2 = pipe.transform('homospaiens');
        expect(val2).toEqual('Homosapines');
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
}
