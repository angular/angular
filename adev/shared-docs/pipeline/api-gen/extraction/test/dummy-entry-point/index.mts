/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export class Version {
  constructor(public sha: string = '') {}
}

export const VERSION = new Version('123abc');
