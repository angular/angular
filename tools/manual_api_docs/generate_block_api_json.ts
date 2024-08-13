/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry, DocEntryWithSourceInfo, EntryType} from '@angular/compiler-cli';
import {readFileSync, writeFileSync} from 'fs';
import {basename} from 'path';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFileExecRootRelativePath] = rawParamLines;

  const developerPreview = [{'name': 'developerPreview', 'comment': ''}];

  const entries: DocEntry[] = srcs.split(',').map((sourceFilePath): DocEntryWithSourceInfo => {
    const fileContent = readFileSync(sourceFilePath, {encoding: 'utf8'});
    const isDeveloperPreview = fileContent.includes('developerPreview');

    const filteredContent = fileContent.replace(/^@developerPreview/, '');

    return {
      name: `@${basename(sourceFilePath, '.md')}`,
      entryType: EntryType.Block,
      description: filteredContent,
      rawComment: filteredContent,
      source: {
        filePath: '/' + sourceFilePath,
        startLine: 0,
        endLine: 0,
      },
      jsdocTags: isDeveloperPreview ? developerPreview : [],
    };
  });

  writeFileSync(
    outputFileExecRootRelativePath,
    JSON.stringify({
      moduleName: '@angular/core',
      entries,
    }),
    {encoding: 'utf8'},
  );
}

main();
