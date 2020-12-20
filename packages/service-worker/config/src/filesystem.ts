/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An abstraction over a virtual file system used to enable testing and operation
 * of the config generator in different environments.
 *
 * @publicApi
 */
export interface Filesystem {
  list(dir: string): Promise<string[]>;
  read(file: string): Promise<string>;
  hash(file: string): Promise<string>;
  write(file: string, contents: string): Promise<void>;
}
