/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {FileAndContentRecord} from '../../interfaces/index';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {addDirectoryToFilesRecord, findAllConfigs} from './utils.mjs';
import {generateMetadata} from './metadata.mjs';
import {generateSourceCode} from './source-code.mjs';
import {generatePlaygroundRoutes} from './routes.mjs';

/**
 * Generates the playground files for the playground directory.
 *
 * Creates a routes file for the overall playground, and metadata and soure-code files for
 * each of the plaground entries.
 */
async function generatePlaygroundFiles(
  playgroundDir: string,
  commonDir: string,
  outputDir: string,
) {
  /** All files available in the playground entries. */
  const files: FileAndContentRecord = {};
  /** All of the configs, one for each playground entry. */
  const configs = await findAllConfigs(playgroundDir);

  // Add all of the files from the common directory into the files record.
  await addDirectoryToFilesRecord(files, commonDir);

  // If the playground directory provides additional common files, add them to the files record.
  const commonPlaygroundDir = join(playgroundDir, 'common');
  if (existsSync(commonPlaygroundDir)) {
    await addDirectoryToFilesRecord(files, commonPlaygroundDir);
  }

  // For each playground entry, generate the metadata and source-code files.
  for (const [path, config] of Object.entries(configs)) {
    /** Duplication of the common shared files to add the playground entry files in. */
    const itemFiles = {...files};
    /** Directory of the current config. */
    const configDir = join(playgroundDir, path);

    await addDirectoryToFilesRecord(itemFiles, configDir);

    // Ensure the directory for the playground entry exists, then write the metadata
    // and source-code files.
    mkdirSync(join(outputDir, path), {recursive: true});
    writeFileSync(
      join(outputDir, path, 'metadata.json'),
      JSON.stringify(await generateMetadata(configDir, config, itemFiles)),
    );
    writeFileSync(
      join(outputDir, path, 'source-code.json'),
      JSON.stringify(await generateSourceCode(config, itemFiles)),
    );
  }

  // Generate the playground routes, and write the file.
  writeFileSync(
    join(outputDir, 'routes.json'),
    JSON.stringify(await generatePlaygroundRoutes(configs)),
  );
}

// Immediately invoke the generation.
(async () => {
  const [playgroundDir, commonDir, outputDir] = process.argv.slice(2);
  await generatePlaygroundFiles(playgroundDir, commonDir, outputDir);
})();
