/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Gets a RegExp used to detect an angular wrapped error message.
 * See https://github.com/angular/angular/issues/8348
 */
export function wrappedErrorMessage(e: Error) {
  const escapedMessage = e.message.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  return new RegExp(escapedMessage);
}
