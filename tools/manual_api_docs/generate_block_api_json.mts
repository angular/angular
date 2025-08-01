/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {
  DocEntry,
  DocEntryWithSourceInfo,
  EntryType,
  EntryCollection,
} from '@angular/compiler-cli/src/ngtsc/docs';
import {readFileSync, writeFileSync} from 'fs';
import {basename, join} from 'path';

function main() {
  const [paramFileExecPath] = process.argv.slice(2);
  const paramFileAbsolutePath = join(process.env.JS_BINARY__EXECROOT!, paramFileExecPath);

  const rawParamLines = readFileSync(paramFileAbsolutePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFileExecRootRelativePath] = rawParamLines;

  const developerPreview = [{'name': 'developerPreview', 'comment': ''}];

  const entries: DocEntry[] = srcs.split(',').map((sourceFilePath): DocEntryWithSourceInfo => {
    const fileContent = readFileSync(sourceFilePath, {encoding: 'utf8'});
    const isDeveloperPreview = fileContent.includes('developerPreview');

    const filteredContent = fileContent.replace(/^@developerPreview/, '');

    return {
      name: `@${basename(sourceFilePath, '.md')}`,
      entryType: 'block' as EntryType.Block,
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
