/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {generateManifest} from './generate_manifest.mjs';
import type {EntryCollection} from '@angular/compiler-cli';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFilenameExecRootRelativePath] = rawParamLines;

  const sourceContents = srcs
    .split(',')
    .map((srcPath) => readFileSync(srcPath, {encoding: 'utf8'}));
  const apiCollections = sourceContents.map((s) => JSON.parse(s) as EntryCollection);

  const manifest = generateManifest(apiCollections);
  writeFileSync(outputFilenameExecRootRelativePath, JSON.stringify(manifest), {encoding: 'utf8'});
}

main();
