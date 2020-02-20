/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Configuration for creating a ConfigurableFocusTrap.
 */
export class ConfigurableFocusTrapConfig {
  /**
   * Whether to defer the creation of FocusTrap elements to be
   * done manually by the user. Default is to create them
   * automatically.
   */
  defer: boolean = false;
}
