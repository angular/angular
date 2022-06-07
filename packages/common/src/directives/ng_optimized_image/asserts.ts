/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../errors';

/**
 * Asserts whether an ngDevMode is enabled and throws an error if it's not the case.
 * This assert can be used to make sure that there is no dev-mode code invoked in
 * the prod mode accidentally.
 */
export function assertDevMode(check: string) {
  if (!ngDevMode) {
    throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE,
        `Unexpected invocation of the ${check} in the prod mode. ` +
            `Please make sure that the prod mode is enabled for production builds.`);
  }
}
