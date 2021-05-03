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

export type FakeReadFileFn = (fileName: string) => string|undefined;

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
  const defaultReadFile = host.readFile;

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run multiple migrations we might have intersecting changes and
  // source files.
  host.readFile = fileName => {
    const treeRelativePath = relative(basePath, fileName);
    let result: string|undefined = fakeRead?.(treeRelativePath);

    if (result === undefined) {
      // If the relative path resolved to somewhere outside of the tree, fall back to
      // TypeScript's default file reading function since the `tree` will throw an error.
      result = treeRelativePath.startsWith('..') ? defaultReadFile.call(host, fileName) :
                                                   tree.read(treeRelativePath)?.toString();
    }

    // Strip BOM as otherwise TSC methods (Ex: getWidth) will return an offset,
    // which breaks the CLI UpdateRecorder.
    // See: https://github.com/angular/angular/pull/30719
    return result ? result.replace(/^\uFEFF/, '') : undefined;
  };

  return host;
}

/**
 * Checks whether a file can be migrate by our automated migrations.
 * @param basePath Absolute path to the project.
 * @param sourceFile File being checked.
 * @param program Program that includes the source file.
 */
export function canMigrateFile(
    basePath: string, sourceFile: ts.SourceFile, program: ts.Program): boolean {
  // We shouldn't migrate .d.ts files or files from an external library.
  if (sourceFile.isDeclarationFile || program.isSourceFileFromExternalLibrary(sourceFile)) {
    return false;
  }

  // Our migrations are set up to create a `Program` from the project's tsconfig and to migrate all
  // the files within the program. This can include files that are outside of the Angular CLI
  // project. We can't migrate files outside of the project, because our file system interactions
  // go through the CLI's `Tree` which assumes that all files are within the project. See:
  // https://github.com/angular/angular-cli/blob/0b0961c9c233a825b6e4bb59ab7f0790f9b14676/packages/angular_devkit/schematics/src/tree/host-tree.ts#L131
  return !relative(basePath, sourceFile.fileName).startsWith('..');
}
