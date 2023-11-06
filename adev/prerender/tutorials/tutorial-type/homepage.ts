/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename} from 'path';

import {
  filesAndContentsToRecord,
  getFilesContents,
  getPackageJsonFromFiles,
  globWithCwdPath,
} from '../utils/filesystem';
import {
  GLOB_OPTIONS,
  TUTORIALS_COMMON_NODE_PATH,
  TUTORIALS_HOMEPAGE_NODE_PATH,
} from '../utils/node-constants';
import {getCleanFilePath as getCleanCommonFilePath} from './common';

import {getTutorialConfig, validateOpenFilesConfig} from '../tutorials-config';
import {
  FileAndContent,
  FileAndContentRecord,
  TutorialFiles,
  TutorialMetadata,
} from '../tutorials-types';
import {getAllFiles, validatePackageJson} from '../utils/metadata';
import {TUTORIALS_HOMEPAGE_DIRECTORY, TutorialType} from '../utils/web-constants';
import {getFileSystemTree, shouldUseFileInWebContainer} from '../utils/webcontainers';

const BEFORE_HOMEPAGE_PATH_REGEX = new RegExp(`.*\/${TUTORIALS_HOMEPAGE_DIRECTORY}\/`);

export async function getHomepagePlaygroundFiles(
  commonFiles: FileAndContent[],
): Promise<TutorialFiles> {
  const homepagePlaygroundFiles = await globWithCwdPath('**', {
    ...GLOB_OPTIONS,
    cwd: TUTORIALS_HOMEPAGE_NODE_PATH,
    nodir: true,
  });

  const config = await getTutorialConfig(homepagePlaygroundFiles);

  if (config.type !== TutorialType.EDITOR_ONLY)
    throw new Error(`Homepage must be of type "${TutorialType.EDITOR_ONLY}"`);

  const filesContents = await getFilesContents(homepagePlaygroundFiles);

  const tutorialFiles = getTutorialFiles(filesContents, commonFiles);

  if (config.openFiles) {
    validateOpenFilesConfig(
      TUTORIALS_HOMEPAGE_NODE_PATH,
      config.openFiles,
      Object.keys(tutorialFiles),
    );
  } else {
    config.openFiles = Object.keys(tutorialFiles);
  }

  const hasPackageJson = homepagePlaygroundFiles.some((file) => basename(file) === 'package.json');

  let dependencies: TutorialMetadata['dependencies'];

  if (hasPackageJson) {
    const packageJson = getPackageJsonFromFiles(filesContents);

    dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    validatePackageJson(homepagePlaygroundFiles, packageJson, getPackageJsonFromFiles(commonFiles));
  }

  const allFiles = getAllFiles(
    homepagePlaygroundFiles,
    commonFiles.map(({path}) => path),
    getCleanFilePath,
  );

  return {
    sourceCode: getSourceCode(homepagePlaygroundFiles, filesContents),
    metadata: {
      type: config.type,
      allFiles,
      dependencies,
      tutorialFiles,
      openFiles: config.openFiles ?? Object.keys(tutorialFiles),
      hiddenFiles: config.openFiles
        ? Object.keys(tutorialFiles).filter((filename) => !config.openFiles!.includes(filename))
        : [],
    },
  };
}

function getSourceCode(tutorialFiles: string[], filesContents: FileAndContent[]) {
  // TODO: reuse this as it's duplicated in getTutorialFiles
  const fileSystemTreeContents = filesContents
    .filter(({path}) => shouldUseFileInWebContainer(path))
    // remove steps paths from file contents
    .map(({path, content}) => ({
      path: getCleanFilePath(path),
      content,
    }));

  const fileSystemTreeFiles = tutorialFiles
    .filter((filename) => shouldUseFileInWebContainer(filename))
    .map(getCleanFilePath);

  return getFileSystemTree(fileSystemTreeFiles, filesAndContentsToRecord(fileSystemTreeContents));
}

function getTutorialFiles(
  filesContents: FileAndContent[],
  commonFiles: FileAndContent[],
): FileAndContentRecord {
  const playgroundFilesForCodeEditor = filesContents
    .filter(({path}) => shouldUseFileInWebContainer(getCleanFilePath(path)))
    .map(({path, content}) => ({
      path: getCleanFilePath(path),
      content,
    }));

  const commonFilesForCodeEditor = commonFiles
    .filter(({path}) => shouldUseFileInWebContainer(path))
    .map(({path, content}) => ({
      path: getCleanCommonFilePath(path),
      content,
    }));

  return {
    ...filesAndContentsToRecord(commonFilesForCodeEditor),
    ...filesAndContentsToRecord(playgroundFilesForCodeEditor),
  };
}

function getCleanFilePath(path: string) {
  if (path.includes(TUTORIALS_COMMON_NODE_PATH)) return getCleanCommonFilePath(path);

  return path.replace(BEFORE_HOMEPAGE_PATH_REGEX, '');
}
