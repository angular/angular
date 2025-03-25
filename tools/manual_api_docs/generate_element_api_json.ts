/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry, EntryType} from '@angular/compiler-cli';
import {readFileSync, writeFileSync} from 'fs';
import {basename} from 'path';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFileExecRootRelativePath] = rawParamLines;

  const entries: DocEntry[] = srcs.split(',').map((sourceFilePath) => {
    const fileContent = readFileSync(sourceFilePath, {encoding: 'utf8'});

    return {
      name: basename(sourceFilePath, '.md'),
      source: {
        filePath: '/' + sourceFilePath,
        startLine: 0,
        endLine: 0,
      },
      entryType: EntryType.Element,
      description: fileContent,
      rawComment: fileContent,
      jsdocTags: [],
    };
  });

  writeFileSync(
    outputFileExecRootRelativePath,
    JSON.stringify({
      moduleName: '@angular/core',
      normalizedModuleName: 'angular_core',
      moduleLabel: 'core',
      entries,
    }),
    {encoding: 'utf8'},
  );
}

main();
