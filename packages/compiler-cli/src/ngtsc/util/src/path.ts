/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as path from 'path';

const TS_DTS_EXTENSION = /(\.d)?\.ts$/;

export function relativePathBetween(from: string, to: string): string|null {
  let relative = path.posix.relative(path.dirname(from), to).replace(TS_DTS_EXTENSION, '');

  if (relative === '') {
    return null;
  }

  // path.relative() does not include the leading './'.
  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  return relative;
}