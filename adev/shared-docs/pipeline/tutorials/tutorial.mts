/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, join} from 'path';
import {FileAndContentRecord} from '../../interfaces/index';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {addDirectoryToFilesRecord, findAllConfigs, findConfig} from './utils.mjs';
import {generateMetadata} from './metadata.mjs';
import {generateSourceCode} from './source-code.mjs';
import {generateTutorialRoutes} from './routes.mjs';

/**
 * Generates the files for the provided tutorial directory.
 *
 * Creates a routes file for the tutorial, and metadata and soure-code files for
 * each of the tutorial steps.
 */
async function generateTutorialFiles(tutorialDir: string, commonDir: string, outputDir: string) {
  /** All files available in the tutorial entries. */
  const files: FileAndContentRecord = {};
  /** List of configs for each step in the tutorial. */
  const stepConfigs = await findAllConfigs(join(tutorialDir, 'steps'));
  /** Directory of the intro. */
  const introDir = join(tutorialDir, 'intro');
  /** The configuration for the intro (landing page) of the tutorial. */
  const introConfig = await findConfig(introDir);
  /** The name of the tutorial, as determined by the tutorial directory name. */
  const tutorialName = basename(tutorialDir);

  // Add all of the files from the common directory into the files record
  await addDirectoryToFilesRecord(files, commonDir);

  // If the tutorial directory provides additional common files, add them to the files record.
  const commonTutorialDir = join(tutorialDir, 'common');
  if (existsSync(commonTutorialDir)) {
    await addDirectoryToFilesRecord(files, commonTutorialDir);
  }

  /** Duplication of the common shared files to add the tutorial intro files in. */
  const introFiles = {...files};
  await addDirectoryToFilesRecord(introFiles, introDir);

  // Ensure the directory for the tutorial exists, then write the metadata and source-code
  // files for the intro.
  mkdirSync(join(outputDir), {recursive: true});
  writeFileSync(
    join(outputDir, 'metadata.json'),
    JSON.stringify(await generateMetadata(introDir, introConfig, introFiles)),
  );
  writeFileSync(
    join(outputDir, 'source-code.json'),
    JSON.stringify(await generateSourceCode(introConfig, introFiles)),
  );

  // For each tutorial step, generate the metadata and source-code files.
  for (const [path, config] of Object.entries(stepConfigs)) {
    /** Duplication of the common shared files to add the tutorial step files in. */
    const itemFiles = {...files};
    /** Directory of the current step. */
    const stepDir = join(tutorialDir, 'steps', path);

    await addDirectoryToFilesRecord(itemFiles, stepDir);

    // Ensure the directory for the tutorial step exists, then write the metadata
    // and source-code files.
    mkdirSync(join(outputDir, path), {recursive: true});
    writeFileSync(
      join(outputDir, path, 'metadata.json'),
      JSON.stringify(await generateMetadata(stepDir, config, itemFiles)),
    );
    writeFileSync(
      join(outputDir, path, 'source-code.json'),
      JSON.stringify(await generateSourceCode(config, itemFiles)),
    );
  }

  // Generate the tutorial routes, and write the file.
  writeFileSync(
    join(outputDir, 'routes.json'),
    JSON.stringify(await generateTutorialRoutes(tutorialName, introConfig, stepConfigs)),
  );
}

(async () => {
  const [tutorialDir, commonDir, outputDir] = process.argv.slice(2);
  await generateTutorialFiles(tutorialDir, commonDir, outputDir);
})();
