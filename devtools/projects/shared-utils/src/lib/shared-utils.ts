/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// works with arrays of string, numbers and booleans
export const arrayEquals =
    (a: (string|number|boolean)[], b: (string|number|boolean)[]): boolean => {
      if (a.length !== b.length) {
        return false;
      }
      if (a.length === 0) {
        return b.length === 0;
      }

      let equal;
      for (let i = 0; i < a.length; i++) {
        equal = i === 0 ? a[i] === b[i] : a[i] === b[i] && equal;
        if (!equal) {
          break;
        }
      }
      return equal ?? false;
    };
