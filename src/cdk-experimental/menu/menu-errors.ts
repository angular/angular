/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Throws an exception when the CdkMenuPanel cannot be injected and the developer did not
 * explicitly provide a reference to the enclosing CdkMenuPanel.
 * @docs-private
 */
export function throwMissingMenuPanelError() {
  throw Error(
    'CdkMenu must be placed inside a CdkMenuPanel or a reference to CdkMenuPanel' +
      ' must be explicitly provided if using ViewEngine'
  );
}
