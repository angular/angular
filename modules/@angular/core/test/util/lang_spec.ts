/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {isPromise} from '@angular/core/src/util/lang';

export function main() {
  describe('isPromise', () => {
    it('should be true for native Promises',
       () => expect(isPromise(Promise.resolve(true))).toEqual(true));

    it('should be true for thenables', () => expect(isPromise({then: () => {}})).toEqual(true));

    it('should be false if "then" is not a function',
       () => expect(isPromise({then: 0})).toEqual(false));

    it('should be false if the argument has no "then" function',
       () => expect(isPromise({})).toEqual(false));

    it('should be false if the argument is undefined or null', () => {
      expect(isPromise(undefined)).toEqual(false);
      expect(isPromise(null)).toEqual(false);
    });
  });
}
