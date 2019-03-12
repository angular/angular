/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function stripPrefix(val: string, prefix: string): string {
  // strip prefix
  return val.startsWith(prefix) ? val.substring(prefix.length) : val;
}