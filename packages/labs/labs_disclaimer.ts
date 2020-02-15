/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from '../core/src/util/assert';
import {global} from '../core/src/util/global';

/**
 * Global property name where the agreement is stored.
 */
interface GlobalDeclaimer {
  __ng_core_labs_agreement__?: boolean;
}

/**
 * Mandatory agreement about unstable APIs.
 *
 * The purpose of this function is to communicate the importance of the fact that developer is about
 * to use unstable APIs. As such Angular team makes no guarantee about the API stability.
 *
 * The agreement is important so that the developer is made fully aware of what they are about to
 * do. Without invoking this function the rest of the APIs will throw an error which prevents their
 * use. Agreeing here also prints a large warning in the console pointing out the experimental
 * nature of the API.
 *
 * ```
 * import {iWantToUseExperimentalAPIs} from `@angular/core/labs`
 *
 * iWantToUseExperimentalAPIs({
 *   iUnderstand: ['not ready for production', 'unstable API']
 * })
 * ```
 *
 * @param agreement Correctly formated input stating the agreement must be present. See above.
 *
 * @publicApi
 */
export function iWantToUseExperimentalAPIs(
    agreement: {iUnderstand: ['not ready for production', 'unstable API']}) {
  (global as GlobalDeclaimer).__ng_core_labs_agreement__ = false;
  if (agreement && agreement.iUnderstand &&
      agreement.iUnderstand[0] === 'not ready for production' &&
      agreement.iUnderstand[1] === 'unstable API') {
    (global as GlobalDeclaimer).__ng_core_labs_agreement__ = true;
    // tslint:disable-next-line:no-console
    console.warn(
        '%cYou are using experimental APIs! Not production ready! No guarantee of API stability! Use caution!',
        'background: red; color: yellow; font-size: x-large');
  } else {
    throw new Error('Sorry you must agree to experimental APIs before you can use them!');
  }
}


/**
 * Invoked by all unstable API to verify that the user has agreed to experimental API.
 *
 * Throws error if `iWantToUseExperimentalAPIs` was not invoked.
 */
export function assertExperimentalAgreement() {
  assertEqual(
      (global as GlobalDeclaimer).__ng_core_labs_agreement__, true,
      'Use my agree to use experimental APIs. See `iWantToUseExperimentalAPIs`');
}