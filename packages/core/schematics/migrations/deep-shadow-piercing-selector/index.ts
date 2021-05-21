/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname, join} from '@angular-devkit/core';
import {DirEntry, Rule} from '@angular-devkit/schematics';

const VALID_EXTENSIONS = ['.scss', '.sass', '.css', '.styl', '.less', '.ts'];

function* visitFiles(directory: DirEntry): IterableIterator<string> {
  for (const path of directory.subfiles) {
    const extension = extname(path);
    if (VALID_EXTENSIONS.includes(extension)) {
      yield join(directory.path, path);
    }
  }

  for (const path of directory.subdirs) {
    if (path === 'node_modules' || path.startsWith('.') || path === 'dist') {
      continue;
    }

    yield* visitFiles(directory.dir(path));
  }
}

export default function(): Rule {
  return (tree) => {
    // Visit all files in an Angular workspace monorepo.
    for (const file of visitFiles(tree.root)) {
      const content = tree.read(file)?.toString();
      if (content?.includes('/deep/ ')) {
        tree.overwrite(file, content.replace(/\/deep\/ /g, '::ng-deep '));
      }
    }
  };
}
