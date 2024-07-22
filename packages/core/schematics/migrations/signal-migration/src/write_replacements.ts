/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import fs from 'fs';
import {applyReplacements} from './replacement';
import {MigrationResult} from './result';

/** Applies the migration result and applies it to the file system. */
export function writeMigrationReplacements(tsHost: ts.CompilerHost, result: MigrationResult) {
  for (const filePath of result.replacements.keys()) {
    const fileText = tsHost.readFile(filePath)!;
    const newText = applyReplacements(fileText, result.replacements.get(filePath)!);

    fs.writeFileSync(filePath, newText, 'utf8');
  }
}
