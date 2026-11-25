/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Angular DevTools error. Use instead of `Error`. */
export class AngularDevtoolsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AngularDevtoolsError';
  }
}
