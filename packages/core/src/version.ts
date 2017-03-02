/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @whatItDoes Represents the version of Angular
 *
 * @stable
 */
export class Version {
  constructor(public full: string) {}

  get major(): string { return this.full.split('.')[0]; }

  get minor(): string { return this.full.split('.')[1]; }

  get patch(): string { return this.full.split('.').slice(2).join('.'); }
}

/**
 * @stable
 */
export const VERSION = new Version('0.0.0-PLACEHOLDER');
