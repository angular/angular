/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An interface for retrieving documents by URL that the compiler uses
 * to load templates.
 */
export class ResourceLoader {
  get(url: string): Promise<string>|string {
    return '';
  }
}
