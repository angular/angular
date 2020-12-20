/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @description Represents the version of Angular
 *
 * @publicApi
 */
export class Version {
  public readonly major: string;
  public readonly minor: string;
  public readonly patch: string;

  constructor(public full: string) {
    this.major = full.split('.')[0];
    this.minor = full.split('.')[1];
    this.patch = full.split('.').slice(2).join('.');
  }
}

/**
 * @publicApi
 */
export const VERSION = new Version('0.0.0-PLACEHOLDER');
