
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';
import {newTrustedFunctionForDev} from './security/trusted_types';

/**
 * THIS FILE CONTAINS CODE WHICH SHOULD BE TREE SHAKEN AND NEVER CALLED FROM PRODUCTION CODE!!!
 */


/**
 * Creates an `Array` construction with a given name. This is useful when
 * looking for memory consumption to see what time of array it is.
 *
 *
 * @param name Name to give to the constructor
 * @returns A subclass of `Array` if possible. This can only be done in
 *          environments which support `class` construct.
 */
export function createNamedArrayType(name: string): typeof Array {
  // This should never be called in prod mode, so let's verify that is the case.
  if (ngDevMode) {
    try {
      // If this function were compromised the following could lead to arbitrary
      // script execution. We bless it with Trusted Types anyway since this
      // function is stripped out of production binaries.
      return (newTrustedFunctionForDev('Array', `return class ${name} extends Array{}`))(Array);
    } catch (e) {
      // If it does not work just give up and fall back to regular Array.
      return Array;
    }
  } else {
    throw new Error(
        'Looks like we are in \'prod mode\', but we are creating a named Array type, which is wrong! Check your code');
  }
}
