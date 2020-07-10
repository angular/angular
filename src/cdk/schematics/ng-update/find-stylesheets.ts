/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';

/** Regular expression that matches stylesheet paths */
const STYLESHEET_REGEX = /.*\.(css|scss)/;

/** Finds stylesheets in the given directory from within the specified tree. */
export function findStylesheetFiles(tree: Tree, baseDir: string): string[] {
  const result: string[] = [];
  const visitDir = dirPath => {
    const {subfiles, subdirs} = tree.getDir(dirPath);
    result.push(...subfiles.filter(f => STYLESHEET_REGEX.test(f)));
    subdirs.forEach(fragment => {
      // Do not visit directories or files inside node modules or `dist/` folders.
      if (fragment !== 'node_modules' && fragment !== 'dist') {
        visitDir(join(dirPath, fragment));
      }
    });
  };
  visitDir(baseDir);
  return result;
}
