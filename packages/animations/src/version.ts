/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the animation package.
 */

/**
 * @description
 *
 * Represents the version of angular/animations
 */
export class Version {
  public readonly major: string;
  public readonly minor: string;
  public readonly patch: string;

  constructor(public full: string) {
    const [major, minor, ...rest] = full.split('.');
    this.major = major;
    this.minor = minor;
    this.patch = rest.join('.');
  }
}

export const VERSION = new Version('0.0.0-PLACEHOLDER');
