/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵcreateRuntimeErrorClass as createRuntimeErrorClass, ɵPackageErrorPrefix as PackageErrorPrefix} from '@angular/core';

export const enum RuntimeErrorCode {
  TEMPLATE_STRUCTURE_ERROR = 100,
}

// Main class that should be used to throw runtime errors in the common package
// tslint:disable-next-line:no-toplevel-property-access
export const RuntimeError = createRuntimeErrorClass<RuntimeErrorCode>(PackageErrorPrefix.COMMON);
