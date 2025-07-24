/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {applyTextUpdates, Replacement} from '../../../utils/tsurge/replacement';
import {groupReplacementsByFile} from '../../../utils/tsurge/helpers/group_replacements';
import {AbsoluteFsPath, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';

/** Applies the migration result and applies it to the file system. */
export function writeMigrationReplacements(
  replacements: Replacement[],
  projectRoot: AbsoluteFsPath,
) {
  const fs = getFileSystem();

  for (const [projectRelativePath, updates] of groupReplacementsByFile(replacements)) {
    const filePath = fs.join(projectRoot, projectRelativePath);
    const fileText = fs.readFile(filePath);
    const newText = applyTextUpdates(fileText, updates);

    fs.writeFile(filePath, newText);
  }
}
