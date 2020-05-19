/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Tree} from '@angular-devkit/schematics';
import {dirname, relative, resolve} from 'path';
import * as ts from 'typescript';
import {parseTsconfigFile} from './parse_tsconfig';

export type FakeReadFileFn = (fileName: string) => string|null;

/**
 * Creates a TypeScript program instance for a TypeScript project within
 * the virtual file system tree.
 * @param tree Virtual file system tree that contains the source files.
 * @param tsconfigPath Virtual file system path that resolves to the TypeScript project.
 * @param basePath Base path for the virtual file system tree.
 * @param fakeFileRead Optional file reader function. Can be used to overwrite files in
 *   the TypeScript program, or to add in-memory files (e.g. to add global types).
 * @param additionalFiles Additional file paths that should be added to the program.
 */
export function createMigrationProgram(
    tree: Tree, tsconfigPath: string, basePath: string, fakeFileRead?: FakeReadFileFn,
    additionalFiles?: string[]) {
  // Resolve the tsconfig path to an absolute path. This is needed as TypeScript otherwise
  // is not able to resolve root directories in the given tsconfig. More details can be found
  // in the following issue: https://github.com/microsoft/TypeScript/issues/37731.
  tsconfigPath = resolve(basePath, tsconfigPath);
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = createMigrationCompilerHost(tree, parsed.options, basePath, fakeFileRead);
  const program =
      ts.createProgram(parsed.fileNames.concat(additionalFiles || []), parsed.options, host);
  return {parsed, host, program};
}

export function createMigrationCompilerHost(
    tree: Tree, options: ts.CompilerOptions, basePath: string,
    fakeRead?: FakeReadFileFn): ts.CompilerHost {
  const host = ts.createCompilerHost(options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run multiple migrations we might have intersecting changes and
  // source files.
  host.readFile = fileName => {
    const treeRelativePath = relative(basePath, fileName);
    const fakeOutput = fakeRead ? fakeRead(treeRelativePath) : null;
    const buffer = fakeOutput === null ? tree.read(treeRelativePath) : fakeOutput;
    // Strip BOM as otherwise TSC methods (Ex: getWidth) will return an offset,
    // which breaks the CLI UpdateRecorder.
    // See: https://github.com/angular/angular/pull/30719
    return buffer ? buffer.toString().replace(/^\uFEFF/, '') : undefined;
  };

  return host;
}
