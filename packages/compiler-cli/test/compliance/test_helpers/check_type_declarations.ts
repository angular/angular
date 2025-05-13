/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';

/**
 * Check that the content of each emitted type declaration file matches the content of their
 * associated reference file. The content of the files is in the filesystem. The reference file is
 * defined by the {@link getReferenceFileForTypeDeclaration} function.
 *
 * @param fs The mock file-system where the files can be found.
 * @param emittedFiles The list of type declaration files to check.
 */
export function checkTypeDeclarations(fs: FileSystem, emittedFiles: AbsoluteFsPath[]) {
  const emittedDeclarationFiles = emittedFiles.filter((file) => file.endsWith('.d.ts'));
  if (!emittedDeclarationFiles.length) {
    throw new Error('No type declarations emitted.');
  }
  const diff = emittedDeclarationFiles
    .map((file) => ({
      expectedFilename: getReferenceFileForTypeDeclaration(fs, file),
      generatedFilename: file,
    }))
    .map(({expectedFilename, generatedFilename}) => ({
      expectedFile: {name: expectedFilename, content: fs.readFile(expectedFilename)},
      generatedFile: {name: generatedFilename, content: fs.readFile(generatedFilename)},
    }))
    .find(({expectedFile, generatedFile}) => expectedFile.content !== generatedFile.content);

  if (diff) {
    throw new Error(
      [
        `Type declarations don't match between full compilation and declaration-only emission\n\n`,
        `/** FULL COMPILATION: ${diff.expectedFile.name} **/\n`,
        `${diff.expectedFile.content}\n\n`,
        `/** DECLARATION-ONLY EMISSION: ${diff.generatedFile.name} */\n`,
        `${diff.generatedFile.content}\n`,
      ].join(''),
    );
  }
}

/**
 * Adds a '.ref' pre-extension to a type declaration file representing its reference file.
 *
 * Example: my_declarations.d.ts -> my_declarations.ref.d.ts
 *
 * @param fs The file-system used for file name and path manipulation.
 * @param file The path of the original type declaration file.
 * @returns The path of the reference type declaration file.
 */
export function getReferenceFileForTypeDeclaration(fs: FileSystem, file: AbsoluteFsPath) {
  return fs.join(fs.dirname(file), fs.basename(file, 'd.ts') + '.ref.d.ts');
}
