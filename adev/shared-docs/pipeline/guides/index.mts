/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {parseMarkdown} from './parse.mjs';
import {initHighlighter} from './extensions/docs-code/format/highlight.mjs';

async function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFilenameExecRootRelativePath] = rawParamLines;

  // The highlighter needs to be setup asynchronously
  // so we're doing it at the start of the pipeline
  await initHighlighter();

  for (const filePath of srcs.split(',')) {
    if (!filePath.endsWith('.md')) {
      throw new Error(`Input file "${filePath}" does not end in a ".md" file extension.`);
    }

    const markdownContent = readFileSync(filePath, {encoding: 'utf8'});
    const htmlOutputContent = await parseMarkdown(markdownContent, {markdownFilePath: filePath});

    // The expected file name structure is the [name of the file].md.html.
    const htmlFileName = filePath + '.html';
    const htmlOutputPath = path.join(outputFilenameExecRootRelativePath, htmlFileName);

    writeFileSync(htmlOutputPath, htmlOutputContent, {encoding: 'utf8'});
  }
}

main();
