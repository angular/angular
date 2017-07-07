/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sha1} from './sha1';

/**
 * @experimental
 */
export interface Manifest {
  [key: string]: any;
  _hash: string;
  _json: string;
}

/**
 * @experimental
 */
export function parseManifest(data: string): Manifest {
  const manifest: Manifest = JSON.parse(data) as Manifest;
  manifest._json = data;
  manifest._hash = sha1(data);
  return manifest;
}
