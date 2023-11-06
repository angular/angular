/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {copyFile, mkdir} from 'fs/promises';
import {glob} from 'glob';

import {filesAndContentsToRecord} from '../utils/filesystem';
import {TUTORIALS_COMMON_DIRECTORY} from '../utils/web-constants';
import {getFileSystemTree, shouldUseFileInWebContainer} from '../utils/webcontainers';

import type {FileAndContent, TutorialFiles} from '../tutorials-types';
import {TUTORIALS_COMMON_ASSETS_DEST, TUTORIALS_COMMON_ASSETS_SRC} from '../utils/node-constants';

const BEFORE_COMMON_PATH_REGEX = new RegExp(`.*\/${TUTORIALS_COMMON_DIRECTORY}\/`);

export async function getTutorialCommonFiles(
  files: string[],
  filesContents: FileAndContent[],
): Promise<TutorialFiles> {
  const filesPath = files.filter(shouldUseFileInWebContainer).map(getCleanFilePath);

  const filesContentsWithoutPath = filesContents.map(({path, content}) => ({
    path: getCleanFilePath(path),
    content,
  }));

  const fileSystemTree = getFileSystemTree(
    filesPath,
    filesAndContentsToRecord(filesContentsWithoutPath),
  );

  return {sourceCode: fileSystemTree};
}

export function getCleanFilePath(path: string) {
  return path.replace(BEFORE_COMMON_PATH_REGEX, '');
}

export async function copyCommonAssetsToAppAssets() {
  const [commonAssets] = await Promise.all([
    // List of files for the assets from the tutorial common directory/app.
    glob(['**/*.png', '**/*.jpg'], {
      cwd: TUTORIALS_COMMON_ASSETS_SRC,
      nodir: true,
      absolute: true,
    }),

    // Ensure the common directory for tutorial assets exists.
    mkdir(TUTORIALS_COMMON_ASSETS_DEST, {recursive: true}),
  ]);

  await Promise.all(
    commonAssets.map((asset) =>
      copyFile(asset, asset.replace(TUTORIALS_COMMON_ASSETS_SRC, TUTORIALS_COMMON_ASSETS_DEST)),
    ),
  );
}
