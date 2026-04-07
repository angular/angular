/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: Try to keep mostly in sync with
// //depot/google3/javascript/angular2/tools/ngc_wrapped/tsc_plugin.ts
// TODO: Consider moving this logic into the 1P launcher.

import * as path from 'node:path';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export function fileNameToModuleNameFactory(
  rootDirs: readonly string[],
  workspaceName: string,
): (importedFilePath: string) => string {
  return (importedFilePath: string) => {
    let relativePath = '';
    for (const rootDir of rootDirs) {
      const rel = path.posix.relative(rootDir, importedFilePath);
      if (!rel.startsWith('.')) {
        relativePath = rel;
        break;
      }
    }

    if (relativePath) {
      return `${workspaceName}/${relativePath.replace(EXT, '')}`;
    } else {
      return importedFilePath.replace(EXT, '');
    }
  };
}
