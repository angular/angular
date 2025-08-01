/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {DocEntry, EntryCollection, EntryType} from '@angular/compiler-cli/src/ngtsc/docs';
import {readFileSync, writeFileSync} from 'fs';
import {basename, join} from 'path';

function main() {
  const [paramFileExecPath] = process.argv.slice(2);
  const paramFileAbsolutePath = join(process.env.JS_BINARY__EXECROOT!, paramFileExecPath);

  const rawParamLines = readFileSync(paramFileAbsolutePath, {encoding: 'utf8'}).split('\n');
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
      entryType: 'element' as EntryType.Element,
      description: fileContent,
      rawComment: fileContent,
      jsdocTags: [],
    };
  });

  writeFileSync(
    outputFileExecRootRelativePath,
    JSON.stringify({
      repo: 'angular/angular',
      moduleName: '@angular/core',
      normalizedModuleName: 'angular_core',
      moduleLabel: 'core',
      entries,
    } satisfies EntryCollection),
    {encoding: 'utf8'},
  );
}

main();
