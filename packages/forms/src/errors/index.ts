/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵcreateRuntimeErrorClass as createRuntimeErrorClass, ɵPackageErrorPrefix as PackageErrorPrefix} from '@angular/core';

export const enum RuntimeErrorCode {
  // Reactive Forms errors (1xx)

  // Basic structure validation errors
  NO_CONTROLS = 100,
  MISSING_CONTROL = 101,
  MISSING_CONTROL_VALUE = 102,

  // Template-driven Forms errors (2xx)
}

// Main class that should be used to throw runtime errors in the forms package
// tslint:disable-next-line:no-toplevel-property-access
export const RuntimeError = createRuntimeErrorClass<RuntimeErrorCode>(PackageErrorPrefix.FORMS);
