/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Error that will be thrown if the user manually aborted a release action. */
export class UserAbortedReleaseActionError extends Error {
  constructor() {
    super();
    // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
    // a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, UserAbortedReleaseActionError.prototype);
  }
}

/** Error that will be thrown if the action has been aborted due to a fatal error. */
export class FatalReleaseActionError extends Error {
  constructor() {
    super();
    // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
    // a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, FatalReleaseActionError.prototype);
  }
}
