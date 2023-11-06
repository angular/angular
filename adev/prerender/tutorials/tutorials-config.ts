/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, join} from 'path';
import {readdir} from 'fs/promises';
import {glob} from 'glob';

import {getFileContents} from './utils/filesystem';
import {
  CONFIG_FILE,
  CONFIG_KEYS,
  REQUIRED_CONFIGS,
  TUTORIALS_PROJECT_PATH,
} from './utils/node-constants';

import type {TutorialConfig} from './tutorials-types';
import {TutorialType} from './utils/web-constants';

export async function getTutorialConfig(tutorialFiles: string[]): Promise<TutorialConfig> {
  const configFilePath = tutorialFiles.find((file) => basename(file) === CONFIG_FILE);

  if (!configFilePath) throw `Can't find ${CONFIG_FILE}`;

  const configFileContents = await getFileContents(configFilePath);

  let config: TutorialConfig;

  try {
    config = JSON.parse(String(configFileContents));
    config = await parseConfig(config);

    return config;
  } catch (err) {
    throw `${configFilePath.replace(`${TUTORIALS_PROJECT_PATH}/`, '')}: ${err}`;
  }
}

export async function parseConfig(config: TutorialConfig): Promise<TutorialConfig> {
  const tutorialConfigKeys = Object.keys(config);

  REQUIRED_CONFIGS.forEach((requiredConfig) => {
    if (!tutorialConfigKeys.includes(requiredConfig)) {
      throw `missing required config '${requiredConfig}'`;
    }
  });

  for (const key of tutorialConfigKeys) {
    // @ts-expect-error
    if (!CONFIG_KEYS.includes(key)) throw `invalid config '${key}'`;
  }

  if (config.nextTutorial) {
    if (typeof config.nextTutorial !== 'string') {
      throw '"nextTutorial" must be a string';
    }

    const path = join(TUTORIALS_PROJECT_PATH, config.nextTutorial);

    // check if nextTutorial directory exists
    try {
      await readdir(path);
    } catch (error) {
      throw `the nextTutorial "${config.nextTutorial}" doesn't exist at ${path}`;
    }
  }

  if (config.src) {
    if (typeof config.src !== 'string') {
      throw '"src" must be a string';
    }

    // check if src directory exists
    const srcFiles = await glob(`**/${config.src}`, {cwd: TUTORIALS_PROJECT_PATH});

    if (!srcFiles.length) throw `could not find "src" "${config.src}"`;
  }

  if (config.answerSrc) {
    if (typeof config.answerSrc !== 'string') {
      throw '"answerSrc" must be a string';
    }

    // check if answerSrc directory exists
    const answerSrcFiles = await glob(`**/${config.answerSrc}`, {cwd: TUTORIALS_PROJECT_PATH});

    if (!answerSrcFiles.length) throw `could not find "answerSrc" "${config.answerSrc}"`;
  }

  switch (config.type) {
    case TutorialType.EDITOR:
      assertOpenFiles(config.openFiles);

      return config;

    case TutorialType.CLI:
      return config;

    case TutorialType.LOCAL:
      return config;

    case TutorialType.EDITOR_ONLY:
      assertOpenFiles(config.openFiles);

      return config;

    default:
      throw 'invalid config';
  }
}

function assertOpenFiles(
  openFiles: TutorialConfig['openFiles'],
): asserts openFiles is string[] | undefined {
  if (openFiles === undefined) return;

  const errorMessage = '"openFiles" must be an array of strings';

  if (!Array.isArray(openFiles)) {
    throw errorMessage;
  }

  for (const openFile of openFiles) {
    if (typeof openFile !== 'string') throw errorMessage;
  }
}

/**
 * Check if openFiles exist in tutorial files.
 */
export function validateOpenFilesConfig(
  tutorialPath: string,
  openFiles: NonNullable<TutorialConfig['openFiles']>,
  tutorialFiles: string[],
) {
  for (const openFile of openFiles) {
    if (!tutorialFiles.includes(openFile)) {
      throw `At: ${tutorialPath}/${CONFIG_FILE}\n\tCould not find "${openFile}" in the tutorial files`;
    }
  }
}
