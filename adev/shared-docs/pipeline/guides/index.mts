/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {initHighlighter} from '../shared/shiki.mjs';
import {parseMarkdownAsync} from '../shared/marked/parse.mjs';
import {hasUnknownAnchors} from './helpers.mjs';

type ApiManifest = ApiManifestPackage[];
interface ApiManifestPackage {
  moduleName: string;
  entries: {name: string; aliases?: string[]}[];
}

async function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = (await readFile(paramFilePath, {encoding: 'utf8'})).split('\n');
  const [srcs, outputFilenameExecRootRelativePath, apiManifestPath] = rawParamLines;

  // The highlighter needs to be setup asynchronously
  // so we're doing it at the start of the pipeline
  const highlighter = await initHighlighter();

  await Promise.all(
    srcs.split(',').map(async (filePath) => {
      if (!filePath.endsWith('.md')) {
        throw new Error(`Input file "${filePath}" does not end in a ".md" file extension.`);
      }

      let apiManifest: ApiManifest = [];
      if (apiManifestPath) {
        try {
          const apiManifestStr = await readFile(apiManifestPath, {encoding: 'utf8'});
          apiManifest = JSON.parse(apiManifestStr);
        } catch (error) {
          console.warn('Failed to load API entries:', error);
        }
      }

      const markdownContent = await readFile(filePath, {encoding: 'utf8'});
      const htmlOutputContent = await parseMarkdownAsync(markdownContent, {
        markdownFilePath: filePath,
        apiEntries: mapManifestToEntries(apiManifest),
        highlighter,
      });

      // The expected file name structure is the [name of the file].md.html.
      const htmlFileName = filePath + '.html';
      const htmlOutputPath = path.join(outputFilenameExecRootRelativePath, htmlFileName);

      const unknownAnchor = hasUnknownAnchors(htmlOutputContent);
      if (unknownAnchor) {
        throw new Error(
          `The file "${filePath}" contains an anchor link to "${unknownAnchor}" which does not exist in the document.`,
        );
      }

      await writeFile(htmlOutputPath, htmlOutputContent, {encoding: 'utf8'});
    }),
  );
}

main();

function mapManifestToEntries(
  apiManifest: ApiManifest,
): Record<string, {moduleName: string; targetSymbol?: string}> {
  const duplicateEntries = new Set<string>();

  const entryToModuleMap: Record<string, {moduleName: string; targetSymbol?: string}> = {};
  for (const pkg of apiManifest) {
    for (const entry of pkg.entries) {
      if (duplicateEntries.has(entry.name)) {
        continue;
      } else if (entryToModuleMap[entry.name]) {
        delete entryToModuleMap[entry.name];
        duplicateEntries.add(entry.name);
      } else {
        const normalizedModuleName = pkg.moduleName.replace(/^@angular\//, '');

        entryToModuleMap[entry.name] = {moduleName: normalizedModuleName};

        // If there are aliases, create entries for each alias
        if (entry.aliases) {
          for (const alias of entry.aliases) {
            entryToModuleMap[alias] = {
              moduleName: normalizedModuleName,
              targetSymbol: entry.name,
            };
          }
        }
      }
    }
  }
  return entryToModuleMap;
}
