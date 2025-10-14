/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @description Represents the version of Angular
 *
 * @publicApi
 */
export class Version {
  constructor(full) {
    this.full = full;
    const parts = full.split('.');
    this.major = parts[0];
    this.minor = parts[1];
    this.patch = parts.slice(2).join('.');
  }
}
/**
 * @publicApi
 */
export const VERSION = /* @__PURE__ */ new Version('0.0.0-PLACEHOLDER');
//# sourceMappingURL=version.js.map
