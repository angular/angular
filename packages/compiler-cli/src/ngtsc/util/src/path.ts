/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathSegment} from '../../path';

const TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;

export function relativePathBetween(from: AbsoluteFsPath, to: AbsoluteFsPath): PathSegment|null {
  let relative =
      PathSegment.relative(AbsoluteFsPath.dirname(from), to).replace(TS_DTS_JS_EXTENSION, '');

  if (relative === '') {
    return null;
  }

  // PathSegment.relative() does not include the leading './'.
  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  return PathSegment.fromFsPath(relative);
}

export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}
