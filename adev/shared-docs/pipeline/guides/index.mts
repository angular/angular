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

type ApiManifest = ApiManifestPackage[];
interface ApiManifestPackage {
  moduleName: string;
  entries: {name: string}[];
}

async function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFilenameExecRootRelativePath, apiManifestPath] = rawParamLines;

  // The highlighter needs to be setup asynchronously
  // so we're doing it at the start of the pipeline
  await initHighlighter();

  for (const filePath of srcs.split(',')) {
    if (!filePath.endsWith('.md')) {
      throw new Error(`Input file "${filePath}" does not end in a ".md" file extension.`);
    }

    let apiManifest: ApiManifest = [];
    if (apiManifestPath) {
      try {
        const apiManifestStr = readFileSync(apiManifestPath, {encoding: 'utf8'});
        apiManifest = JSON.parse(apiManifestStr);
      } catch (error) {
        console.warn('Failed to load API entries:', error);
      }
    }

    const markdownContent = readFileSync(filePath, {encoding: 'utf8'});
    const htmlOutputContent = await parseMarkdown(markdownContent, {
      markdownFilePath: filePath,
      apiEntries: mapManifestToEntries(apiManifest),
    });

    // The expected file name structure is the [name of the file].md.html.
    const htmlFileName = filePath + '.html';
    const htmlOutputPath = path.join(outputFilenameExecRootRelativePath, htmlFileName);

    writeFileSync(htmlOutputPath, htmlOutputContent, {encoding: 'utf8'});
  }
}

main();

function mapManifestToEntries(apiManifest: ApiManifest): Record<string, string> {
  const duplicateEntries = new Set<string>();

  const entryToModuleMap: Record<string, string> = {};
  for (const pkg of apiManifest) {
    for (const entry of pkg.entries) {
      if (duplicateEntries.has(entry.name)) {
        continue;
      } else if (entryToModuleMap[entry.name]) {
        delete entryToModuleMap[entry.name];
        duplicateEntries.add(entry.name);
      } else {
        entryToModuleMap[entry.name] = pkg.moduleName.replace(/^@angular\//, '');
      }
    }
  }
  return entryToModuleMap;
}
