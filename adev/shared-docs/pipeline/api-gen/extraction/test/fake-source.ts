/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// @ts-ignore Intentionally nonexistent path for testing purposes.
import {Version} from '@angular/dummy-package';

/**
 * I have a description with some `Code`.
 */
export class UserProfile {
  /** The user's name */
  name: string = 'Morgan';
}

// By using an implicit type coming from a path-mapped import,
// we test that the extractor can correctly resolve type information
// from other packages.
export const VERSION = new Version('789def');
