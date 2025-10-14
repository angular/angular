/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class Version {
  sha;
  constructor(sha = '') {
    this.sha = sha;
  }
}
export const VERSION = new Version('123abc');
//# sourceMappingURL=index.mjs.map
