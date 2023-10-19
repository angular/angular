/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import glob from 'glob';

import ts from './node_modules/typescript';
import {AnalyzedFile} from './packages/core/schematics/ng-generate/control-flow-migration/types';
import {analyze, migrateTemplate} from './packages/core/schematics/ng-generate/control-flow-migration/util';

const files = glob.sync('./packages/**/*_spec.ts', {absolute: true});
const analysis = new Map<string, AnalyzedFile>();

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  analyze(sourceFile, analysis);
}

for (const [path, file] of analysis) {
  let content: string|null = null;

  try {
    content = readFileSync(path, 'utf8');
  } catch {
  }

  if (content === null) {
    continue;
  }

  const ranges = file.getSortedRanges();
  let migratedContent = content;

  for (const [start, end] of ranges) {
    const template = migratedContent.slice(start, end);
    const {migrated} = migrateTemplate(template);
    const length = (end ?? template.length) - start;

    if (migrated && migrated !== template) {
      migratedContent =
          migratedContent.slice(0, start) + migrated + migratedContent.slice(start + length);
    }
  }

  if (migratedContent !== content) {
    writeFileSync(path, migratedContent);
  }
}
