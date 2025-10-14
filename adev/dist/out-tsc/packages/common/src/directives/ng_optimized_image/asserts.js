/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError} from '@angular/core';
/**
 * Asserts that the application is in development mode. Throws an error if the application is in
 * production mode. This assert can be used to make sure that there is no dev-mode code invoked in
 * the prod mode accidentally.
 */
export function assertDevMode(checkName) {
  if (!ngDevMode) {
    throw new RuntimeError(
      2958 /* RuntimeErrorCode.UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE */,
      `Unexpected invocation of the ${checkName} in the prod mode. ` +
        `Please make sure that the prod mode is enabled for production builds.`,
    );
  }
}
//# sourceMappingURL=asserts.js.map
