/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {join} from 'path';
import type {TutorialConfigBase} from '../tutorials-types';
import {
  TUTORIALS_ASSETS_METADATA_DIRECTORY,
  TUTORIALS_ASSETS_ROUTES_DIRECTORY,
  TUTORIALS_ASSETS_SOURCE_CODE_DIRECTORY,
  TUTORIALS_COMMON_DIRECTORY,
  TUTORIALS_HOMEPAGE_DIRECTORY,
  TUTORIALS_PLAYGROUND_DIRECTORY,
} from './web-constants';
import {GlobOptionsWithFileTypesFalse} from 'glob';

export const CONTENT_PATH = join('projects', 'angular-dev', 'src', 'content');
export const TUTORIALS_PROJECT_PATH = join(CONTENT_PATH, 'tutorials');
export const TUTORIALS_ASSETS_NODE_PATH = join(
  'projects',
  'angular-dev',
  'src',
  'assets',
  'tutorials',
);

export const TUTORIALS_PLAYGROUND_NODE_PATH = join(
  TUTORIALS_PROJECT_PATH,
  TUTORIALS_PLAYGROUND_DIRECTORY,
);
export const TUTORIALS_HOMEPAGE_NODE_PATH = join(
  TUTORIALS_PROJECT_PATH,
  TUTORIALS_HOMEPAGE_DIRECTORY,
);
export const TUTORIALS_COMMON_NODE_PATH = join(TUTORIALS_PROJECT_PATH, TUTORIALS_COMMON_DIRECTORY);

/** The common location where the tutorial assets are stored. */
export const TUTORIALS_COMMON_ASSETS_SRC = join(TUTORIALS_COMMON_NODE_PATH, 'src', 'assets');

/** The common location for the tutorial assets to be served from. */
export const TUTORIALS_COMMON_ASSETS_DEST = join(TUTORIALS_ASSETS_NODE_PATH, 'common');

export const TUTORIALS_SOURCE_CODE_NODE_PATH = join(
  TUTORIALS_ASSETS_NODE_PATH,
  TUTORIALS_ASSETS_SOURCE_CODE_DIRECTORY,
);
export const TUTORIALS_METADATA_NODE_PATH = join(
  TUTORIALS_ASSETS_NODE_PATH,
  TUTORIALS_ASSETS_METADATA_DIRECTORY,
);
export const TUTORIALS_CONTENT_NODE_PATH = join(
  'projects',
  'angular-dev',
  'src',
  'content',
  'tutorials',
);
export const TUTORIALS_ROUTES_NODE_PATH = join(
  TUTORIALS_ASSETS_NODE_PATH,
  TUTORIALS_ASSETS_ROUTES_DIRECTORY,
  'tutorials.json',
);
export const PLAYGROUND_ROUTE_NODE_PATH = join(
  TUTORIALS_ASSETS_NODE_PATH,
  TUTORIALS_ASSETS_ROUTES_DIRECTORY,
  'playground.json',
);
export const TUTORIALS_COMMON_ASSETS_PATH = join(TUTORIALS_COMMON_NODE_PATH, 'src', 'assets');

export const IGNORED_BASENAMES = [
  '.DS_Store',
  'LICENSE',
  '.gitignore',
  '.editorconfig',
  '.gitkeep',
  'favicon.ico',
];
export const IGNORED_EXTENSIONS = ['.map'];
export const IGNORED_DIRECTORIES = ['.git'];

export const TUTORIAL_CONTENT_FILENAME = 'README.md';
export const ANSWER_DIRECTORY = 'answer';
export const INTRO_DIRECTORY = 'intro';
export const STEPS_DIRECTORY = 'steps';
export const CONFIG_FILE = 'config.json';
export const CONFIG_KEYS: Array<keyof TutorialConfigBase> = [
  'title',
  'type',
  'nextTutorial',
  'src',
  'answerSrc',
  'openFiles',
];
export const REQUIRED_CONFIGS: Array<keyof Pick<TutorialConfigBase, 'title' | 'type'>> = [
  'title',
  'type',
];

export const CONTENT_PLACEHOLDER = 'Insert content here';

export const GLOB_OPTIONS: GlobOptionsWithFileTypesFalse = {
  dot: false,
  absolute: true,
  posix: true,
  ignore: [
    '.',
    '**/node_modules/**',
    ...IGNORED_BASENAMES.map((ignoredBasename) => `**/${ignoredBasename}`),
    ...IGNORED_EXTENSIONS.map((ext) => `**/*${ext}`),
    ...IGNORED_DIRECTORIES.map((dir) => `**/${dir}/**`),
  ],
};
