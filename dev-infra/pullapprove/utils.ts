/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {IMinimatch, Minimatch} from 'minimatch';

/** Map that holds patterns and their corresponding Minimatch globs. */
const patternCache = new Map<string, IMinimatch>();

/**
 * Gets a glob for the given pattern. The cached glob will be returned
 * if available. Otherwise a new glob will be created and cached.
 */
export function getOrCreateGlob(pattern: string) {
  if (patternCache.has(pattern)) {
    return patternCache.get(pattern)!;
  }
  const glob = new Minimatch(pattern, {dot: true});
  patternCache.set(pattern, glob);
  return glob;
}
