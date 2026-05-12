/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Creates a debug name object for an internal signal specific to a `form`.
 */
export function formDebugObj(
  formDebugName: string | undefined,
  internalSignalDebugName: string,
): {debugName?: string} {
  return {
    debugName: `Form${formDebugName ? '#' + formDebugName : ''}.${internalSignalDebugName}`,
  };
}

/**
 * Creates a debug name object for an internal signal specific to a `[formField]`.
 */
export function formFieldDebugObj(
  formFieldDebugName: string | undefined,
  internalSignalDebugName: string,
): {debugName?: string} {
  return {
    debugName: `FormField${formFieldDebugName ? '#' + formFieldDebugName : ''}.${internalSignalDebugName}`,
  };
}
