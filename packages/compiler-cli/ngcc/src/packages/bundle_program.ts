/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, resolve} from 'canonical-path';
import {existsSync, lstatSync, readdirSync} from 'fs';
import * as ts from 'typescript';

/**
* An entry point bundle contains one or two programs, e.g. `src` and `dts`,
* that are compiled via TypeScript.
*
* To aid with processing the program, this interface exposes the program itself,
* as well as path and TS file of the entry-point to the program and the r3Symbols
* file, if appropriate.
*/
export interface BundleProgram {
  program: ts.Program;
  options: ts.CompilerOptions;
  host: ts.CompilerHost;
  path: string;
  file: ts.SourceFile;
  r3SymbolsPath: string|null;
  r3SymbolsFile: ts.SourceFile|null;
}

/**
 * Create a bundle program.
 */
export function makeBundleProgram(
    isCore: boolean, path: string, r3FileName: string, options: ts.CompilerOptions,
    host: ts.CompilerHost): BundleProgram {
  const r3SymbolsPath = isCore ? findR3SymbolsPath(dirname(path), r3FileName) : null;
  const rootPaths = r3SymbolsPath ? [path, r3SymbolsPath] : [path];
  const program = ts.createProgram(rootPaths, options, host);
  const file = program.getSourceFile(path) !;
  const r3SymbolsFile = r3SymbolsPath && program.getSourceFile(r3SymbolsPath) || null;

  return {program, options, host, path, file, r3SymbolsPath, r3SymbolsFile};
}

/**
 * Search the given directory hierarchy to find the path to the `r3_symbols` file.
 */
export function findR3SymbolsPath(directory: string, filename: string): string|null {
  const r3SymbolsFilePath = resolve(directory, filename);
  if (existsSync(r3SymbolsFilePath)) {
    return r3SymbolsFilePath;
  }

  const subDirectories =
      readdirSync(directory)
          // Not interested in hidden files
          .filter(p => !p.startsWith('.'))
          // Ignore node_modules
          .filter(p => p !== 'node_modules')
          // Only interested in directories (and only those that are not symlinks)
          .filter(p => {
            const stat = lstatSync(resolve(directory, p));
            return stat.isDirectory() && !stat.isSymbolicLink();
          });

  for (const subDirectory of subDirectories) {
    const r3SymbolsFilePath = findR3SymbolsPath(resolve(directory, subDirectory, ), filename);
    if (r3SymbolsFilePath) {
      return r3SymbolsFilePath;
    }
  }

  return null;
}
