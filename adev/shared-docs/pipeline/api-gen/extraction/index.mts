/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {
  ClassEntry,
  CompilerOptions,
  createCompilerHost,
  DocEntry,
  EntryCollection,
  InterfaceEntry,
  NgtscProgram,
} from '@angular/compiler-cli';
import ts from 'typescript';
import {EXAMPLES_PATH, interpolateCodeExamples} from './interpolate_code_examples.mjs';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');

  const [
    repo,
    moduleName,
    moduleLabel,
    serializedPrivateModules,
    entryPointExecRootRelativePath,
    srcs,
    outputFilenameExecRootRelativePath,
    serializedPathMapWithExecRootRelativePaths,
    extraEntriesSrcs,
  ] = rawParamLines;

  const privateModules = new Set(serializedPrivateModules.split(','));

  // The path map is a serialized JSON map of import path to index.ts file.
  // For example, {'@angular/core': 'path/to/some/index.ts'}
  const pathMap = JSON.parse(serializedPathMapWithExecRootRelativePaths) as Record<string, string>;

  // The tsconfig expects the path map in the form of path -> array of actual locations.
  // We also resolve the exec root relative paths to absolute paths to disambiguate.
  const resolvedPathMap: {[key: string]: string[]} = {};
  for (const [importPath, filePath] of Object.entries(pathMap)) {
    resolvedPathMap[importPath] = [path.resolve(filePath)];

    // In addition to the exact import path,
    // also add wildcard mappings for subdirectories.
    const importPathWithWildcard = path.join(importPath, '*');
    resolvedPathMap[importPathWithWildcard] = [
      path.join(path.resolve(path.dirname(filePath)), '*'),
    ];
  }

  const compilerOptions: CompilerOptions = {
    paths: resolvedPathMap,
    rootDir: '.',
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    // This is necessary because otherwise types that include `| null` are not included in the documentation.
    strictNullChecks: true,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    experimentalDecorators: true,
  };

  // Code examples should not be fed to the compiler.
  const filesWithoutExamples = srcs.split(',').filter((src) => !src.startsWith(EXAMPLES_PATH));
  const compilerHost = createCompilerHost({options: compilerOptions});
  const program: NgtscProgram = new NgtscProgram(
    filesWithoutExamples,
    compilerOptions,
    compilerHost,
  );

  const extraEntries: DocEntry[] = (extraEntriesSrcs ?? '')
    .split(',')
    .filter((path) => !!path)
    .reduce((result: DocEntry[], path) => {
      return result.concat(JSON.parse(readFileSync(path, {encoding: 'utf8'})) as DocEntry[]);
    }, []);

  const apiDoc = program.getApiDocumentation(entryPointExecRootRelativePath, privateModules);
  const extractedEntries = apiDoc.entries;
  const combinedEntries = extractedEntries.concat(extraEntries);

  interpolateCodeExamples(combinedEntries);

  const normalized = moduleName.replace('@', '').replace(/[\/]/g, '_');

  const output = JSON.stringify({
    repo,
    moduleLabel: moduleLabel || moduleName,
    moduleName: moduleName,
    normalizedModuleName: normalized,
    entries: combinedEntries,
    symbols: [
      // Symbols referenced, originating from other packages
      ...apiDoc.symbols.entries(),

      // Exported symbols from the current package
      ...apiDoc.entries.map((entry) => [entry.name, moduleName]),

      // Also doing it for every member of classes/interfaces
      ...apiDoc.entries.flatMap((entry) => [
        [entry.name, moduleName],
        ...getEntriesFromMembers(entry).map((member) => [member, moduleName]),
      ]),
    ],
  } satisfies EntryCollection);

  writeFileSync(outputFilenameExecRootRelativePath, output, {encoding: 'utf8'});
}

function getEntriesFromMembers(entry: DocEntry): string[] {
  if (!hasMembers(entry)) {
    return [];
  }

  return entry.members.map((member) => `${entry.name}.${member.name}`);
}

function hasMembers(entry: DocEntry): entry is InterfaceEntry | ClassEntry {
  return 'members' in entry && Array.isArray(entry.members);
}

main();
