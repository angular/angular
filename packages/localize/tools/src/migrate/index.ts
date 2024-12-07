/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getFileSystem, Logger} from '@angular/compiler-cli/private/localize';
import {migrateFile, MigrationMapping} from './migrate';

export interface MigrateFilesOptions {
  /**
   * The base path for other paths provided in these options.
   * This should either be absolute or relative to the current working directory.
   */
  rootPath: string;

  /** Paths to the files that should be migrated. Should be relative to the `rootPath`. */
  translationFilePaths: string[];

  /** Path to the file containing the message ID mappings. Should be relative to the `rootPath`. */
  mappingFilePath: string;

  /** Logger to use for diagnostic messages. */
  logger: Logger;
}

/** Migrates the legacy message IDs based on the passed in configuration. */
export function migrateFiles({
  rootPath,
  translationFilePaths,
  mappingFilePath,
  logger,
}: MigrateFilesOptions) {
  const fs = getFileSystem();
  const absoluteMappingPath = fs.resolve(rootPath, mappingFilePath);
  const mapping = JSON.parse(fs.readFile(absoluteMappingPath)) as MigrationMapping;

  if (Object.keys(mapping).length === 0) {
    logger.warn(
      `Mapping file at ${absoluteMappingPath} is empty. Either there are no messages ` +
        `that need to be migrated, or the extraction step failed to find them.`,
    );
  } else {
    translationFilePaths.forEach((path) => {
      const absolutePath = fs.resolve(rootPath, path);
      const sourceCode = fs.readFile(absolutePath);
      fs.writeFile(absolutePath, migrateFile(sourceCode, mapping));
    });
  }
}
