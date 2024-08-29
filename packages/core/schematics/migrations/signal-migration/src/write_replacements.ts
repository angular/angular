/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import {applyTextUpdates, Replacement} from '../../../utils/tsurge/replacement';
import {groupReplacementsByFile} from '../../../utils/tsurge/helpers/group_replacements';

/** Applies the migration result and applies it to the file system. */
export function writeMigrationReplacements(replacements: Replacement[]) {
  for (const [filePath, updates] of groupReplacementsByFile(replacements)) {
    const fileText = fs.readFileSync(filePath, 'utf8')!;
    const newText = applyTextUpdates(fileText, updates);

    fs.writeFileSync(filePath, newText, 'utf8');
  }
}
