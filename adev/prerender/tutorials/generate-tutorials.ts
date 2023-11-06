/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {mkdir, rm, writeFile} from 'fs/promises';
import {basename, join, sep} from 'path';

import {
  GLOB_OPTIONS,
  INTRO_DIRECTORY,
  PLAYGROUND_ROUTE_NODE_PATH,
  STEPS_DIRECTORY,
  TUTORIALS_ASSETS_NODE_PATH,
  TUTORIALS_COMMON_NODE_PATH,
  TUTORIALS_METADATA_NODE_PATH,
  TUTORIALS_PROJECT_PATH,
  TUTORIALS_SOURCE_CODE_NODE_PATH,
} from './utils/node-constants';

import {createDirectoryAndWriteFile, getFilesContents, globWithCwdPath} from './utils/filesystem';

import {
  TutorialNavigationItemWithStep,
  buildTutorialsNavigationItems,
} from './generate-tutorials-routes';

import {copyCommonAssetsToAppAssets, getTutorialCommonFiles} from './tutorial-type/common';
import {getHomepagePlaygroundFiles} from './tutorial-type/homepage';
import {getIntroAndStepsTutorialFiles} from './tutorial-type/intro-and-steps';
import {getTutorialPlaygroundFiles, isPlaygroundRouteData} from './tutorial-type/playground';
import {PlaygroundFiles, TutorialFiles} from './tutorials-types';
import {
  TUTORIALS_COMMON_DIRECTORY,
  TUTORIALS_HOMEPAGE_DIRECTORY,
  TUTORIALS_PLAYGROUND_DIRECTORY,
} from './utils/web-constants';

main();

/**
 * Builds and stores the tutorials source codes and metadata into JSON files.
 * These files are later used to load the tutorials into the WebContainer file system
 * and manage the tutorials in the embedded editor.
 *
 * @see https://webcontainers.io/guides/working-with-the-file-system
 */
export async function main() {
  const consoleTimeLabel = 'Tutorials files build done in';

  // Informs the developers that this script is running and how much time it took
  console.info('Building tutorials files...');
  console.time(consoleTimeLabel);

  const tutorialsFiles = await getTutorialsFiles();

  // Clean up the directory before writing the files
  await rm(TUTORIALS_ASSETS_NODE_PATH, {recursive: true}).catch(() => {
    // `rm` throws if the directory doesn't exist, meaning this script is
    //  being executed for the first time
  });
  await Promise.all([
    mkdir(TUTORIALS_ASSETS_NODE_PATH, {recursive: true}),
    mkdir(TUTORIALS_SOURCE_CODE_NODE_PATH, {recursive: true}),
    mkdir(TUTORIALS_METADATA_NODE_PATH, {recursive: true}),
  ]);

  const writeFilesPromises: Promise<void>[] = [];
  const tutorialsRoutes: TutorialNavigationItemWithStep[] = [];

  tutorialsFiles.forEach(({sourceCode, metadata, route, sourceCodeZip}, tutorialName) => {
    if (sourceCode) {
      const filePath = join(TUTORIALS_SOURCE_CODE_NODE_PATH, tutorialName + '.json');
      const fileContents = JSON.stringify(sourceCode);

      if (tutorialName.includes(sep)) {
        writeFilesPromises.push(createDirectoryAndWriteFile(filePath, fileContents));
      } else {
        writeFilesPromises.push(writeFile(filePath, fileContents));
      }
    }

    if (metadata) {
      const filePath = join(TUTORIALS_METADATA_NODE_PATH, tutorialName + '.json');
      const fileContents = JSON.stringify(metadata);

      if (tutorialName.includes(sep)) {
        writeFilesPromises.push(createDirectoryAndWriteFile(filePath, fileContents));
      } else {
        writeFilesPromises.push(writeFile(filePath, fileContents));
      }
    }

    if (route) {
      if (isPlaygroundRouteData(route)) {
        writeFilesPromises.push(
          createDirectoryAndWriteFile(PLAYGROUND_ROUTE_NODE_PATH, JSON.stringify(route)),
        );
      } else {
        tutorialsRoutes.push({
          ...route,
          path: tutorialName,
        });
      }
    }

    if (sourceCodeZip) {
      const filePath = join(TUTORIALS_SOURCE_CODE_NODE_PATH, tutorialName + '.zip');
      writeFilesPromises.push(createDirectoryAndWriteFile(filePath, sourceCodeZip));
    }
  });

  await Promise.all([
    ...writeFilesPromises,
    copyCommonAssetsToAppAssets(),
    buildTutorialsNavigationItems(tutorialsRoutes),
  ]);

  console.timeEnd(consoleTimeLabel);
}

/**
 * Retrieve the tutorials source code and generate a Map representing the files
 * and contents that will be stored in the filesystem.
 *
 * Those files are later used by the `/tutorials` pages.
 *
 * The map key is the project name and the value contain the contents for each
 * .json file.
 */
async function getTutorialsFiles(): Promise<Map<string, TutorialFiles | PlaygroundFiles>> {
  const [tutorialsProjects, commonTutorialFiles] = await Promise.all([
    globWithCwdPath('**', {
      ...GLOB_OPTIONS,
      ignore: [...(GLOB_OPTIONS.ignore as string[]), '*.md', TUTORIALS_COMMON_DIRECTORY],
      maxDepth: 1,
      cwd: TUTORIALS_PROJECT_PATH,
    }),
    globWithCwdPath('**', {
      ...GLOB_OPTIONS,
      cwd: TUTORIALS_COMMON_NODE_PATH,
      nodir: true,
    }),
  ]);

  const tutorialsFiles = new Map<string, TutorialFiles | PlaygroundFiles>();

  // tutorials depends on the common project files so here we handle it first
  const commonFilesContents = await getFilesContents(commonTutorialFiles);

  tutorialsFiles.set(
    TUTORIALS_COMMON_DIRECTORY,
    await getTutorialCommonFiles(commonTutorialFiles, commonFilesContents),
  );

  await Promise.all(
    tutorialsProjects.map(async (tutorialPath) => {
      const tutorialName = basename(tutorialPath);

      const [tutorialDirectories, tutorialFiles] = await Promise.all([
        globWithCwdPath('**/', {...GLOB_OPTIONS, cwd: tutorialPath}),
        globWithCwdPath('**', {...GLOB_OPTIONS, nodir: true, cwd: tutorialPath}),
      ]);

      try {
        if (tutorialName === TUTORIALS_PLAYGROUND_DIRECTORY) {
          const playgroundFiles = await getTutorialPlaygroundFiles(commonFilesContents);

          playgroundFiles.forEach((playgroundFiles, playgroundName) => {
            tutorialsFiles.set(playgroundName, playgroundFiles);
          });
        } else if (tutorialName === TUTORIALS_HOMEPAGE_DIRECTORY) {
          const homepageFiles = await getHomepagePlaygroundFiles(commonFilesContents);
          tutorialsFiles.set(TUTORIALS_HOMEPAGE_DIRECTORY, homepageFiles);
        } else if (
          tutorialDirectories.some((directory) => directory.includes(STEPS_DIRECTORY)) &&
          tutorialDirectories.some((directory) => directory.includes(INTRO_DIRECTORY))
        ) {
          const tutorialStepsFiles = await getIntroAndStepsTutorialFiles(
            tutorialName,
            tutorialDirectories,
            tutorialFiles,
            commonFilesContents,
          );

          tutorialStepsFiles.forEach((stepFiles, stepName) => {
            tutorialsFiles.set(stepName, stepFiles);
          });
        } else {
          throw `Could not find "${INTRO_DIRECTORY}" and/or "${STEPS_DIRECTORY}" directories.`;
        }
      } catch (error) {
        console.error(`\n❌ Failed to parse tutorial at ${TUTORIALS_PROJECT_PATH}/${tutorialName}`);
        console.error(`\t${error}\n`);

        process.exit(1);
      }
    }),
  );

  return tutorialsFiles;
}
