/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import ts from 'typescript';

/**
 * A migration host is in practice a container object that
 * exposes commonly accessed contextual helpers throughout
 * the whole migration.
 */
export class MigrationHost {
  private _sourceFiles: WeakSet<ts.SourceFile>;

  constructor(
    public projectDir: string,
    public isMigratingCore: boolean,
    public tsOptions: ts.CompilerOptions,
    sourceFiles: readonly ts.SourceFile[],
  ) {
    this._sourceFiles = new WeakSet(sourceFiles);
  }

  /** Whether the given file is a source file to be migrated. */
  isSourceFileForCurrentMigration(file: ts.SourceFile): boolean {
    return this._sourceFiles.has(file);
  }

  /** Retrieves a unique serializable ID for the given source file or file path. */
  fileToId(file: ts.SourceFile | string): string {
    if (typeof file !== 'string') {
      // Assume that declaration files may appear in different workers,
      // and in practice e.g. the input is actually part of a `.ts` file.
      if (file.isDeclarationFile) {
        file = file.fileName.replace(/\.d\.ts$/, '.ts');
      } else {
        file = file.fileName;
      }
    }

    return path.relative(this.projectDir, file);
  }

  /** Converts a serialized file ID to an absolute file path. */
  idToFilePath(id: string): string {
    return path.join(this.projectDir, id);
  }
}
