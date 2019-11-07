/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as minimatch from 'minimatch';
import {PathMatcher} from './mapped_file_translation_handler';

/**
 * A `PathMatcher` that matches paths based on a glob pattern.
 */
export class GlobPathMatcher implements PathMatcher {
  constructor(private pattern: string) {}
  matchesPath(sourcePath: string): boolean {
    return minimatch(sourcePath, this.pattern);
  }
}
