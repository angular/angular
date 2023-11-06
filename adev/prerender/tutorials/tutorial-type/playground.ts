/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {glob} from 'glob';
import {basename, join, sep} from 'path';

import {
  filesAndContentsToRecord,
  getFilesContents,
  getPackageJsonFromFiles,
  globWithCwdPath,
} from '../utils/filesystem';
import {CONFIG_FILE, GLOB_OPTIONS, TUTORIALS_PLAYGROUND_NODE_PATH} from '../utils/node-constants';
import {
  DEFAULT_PLAYGROUND_TEMPLATE,
  STARTER_PLAYGROUND_TEMPLATE,
  TUTORIALS_COMMON_DIRECTORY,
  TUTORIALS_PLAYGROUND_DIRECTORY,
  TutorialType,
} from '../utils/web-constants';
import {getFileSystemTree, shouldUseFileInWebContainer} from '../utils/webcontainers';

import {getTutorialConfig, validateOpenFilesConfig} from '../tutorials-config';
import {
  FileAndContent,
  FileAndContentRecord,
  PlaygroundFiles,
  PlaygroundRouteData,
  PlaygroundTemplate,
  TutorialConfig,
  TutorialFiles,
  TutorialMetadata,
} from '../tutorials-types';
import {getAllFiles, validatePackageJson} from '../utils/metadata';
import {getCleanFilePath as getCleanCommonFilePath} from './common';

// used to avoid recreating a regex in loops
const beforePlaygroundPathRegexCache = new Map<string, RegExp>();

export async function getTutorialPlaygroundFiles(
  commonFiles: FileAndContent[],
): Promise<Map<string, PlaygroundFiles>> {
  const cwd = TUTORIALS_PLAYGROUND_NODE_PATH;

  const [playgroundProjects, playgroundFiles] = await Promise.all([
    glob('*/', {
      ignore: [TUTORIALS_COMMON_DIRECTORY],
      cwd,
    }),

    globWithCwdPath('**', {
      ...GLOB_OPTIONS,
      nodir: true,
      cwd,
    }),
  ]);

  const playgroundCommonFiles = playgroundFiles.filter(isPlaygroundCommonFile);

  const playgroundFilesMap = new Map<string, PlaygroundFiles>();

  const templates: PlaygroundTemplate[] = [];

  await Promise.all(
    playgroundProjects.map(async (project) => {
      const projectFiles = playgroundFiles.filter((file) =>
        file.startsWith(`${cwd}${sep}${project}${sep}`),
      );

      if (!projectFiles.length) {
        throw new Error(
          `Project at ${join(TUTORIALS_PLAYGROUND_NODE_PATH, project)} has no files.`,
        );
      }

      const projectFilesAndPlaygroundCommonFiles = [...playgroundCommonFiles, ...projectFiles];

      const projectPath = join(TUTORIALS_PLAYGROUND_DIRECTORY, project);

      const {sourceCode, metadata, route} = await getPlaygroundFiles(
        projectPath,
        projectFilesAndPlaygroundCommonFiles,
        commonFiles,
      );

      // store only sourceCode and metadata per playground template
      playgroundFilesMap.set(projectPath, {sourceCode, metadata});

      // compose playground templates from each project route object
      if (route) templates.push(...route!.templates);
    }),
  );

  const defaultTemplate = templates.find((template) =>
    template.path.endsWith(DEFAULT_PLAYGROUND_TEMPLATE),
  );
  if (!defaultTemplate) {
    throw new Error(`Invalid default playground template path '${DEFAULT_PLAYGROUND_TEMPLATE}'`);
  }

  const starterTemplate = templates.find((template) =>
    template.path.endsWith(STARTER_PLAYGROUND_TEMPLATE),
  );
  if (!starterTemplate) {
    throw new Error(`Invalid starter playground template path '${STARTER_PLAYGROUND_TEMPLATE}'`);
  }

  playgroundFilesMap.set(TUTORIALS_PLAYGROUND_DIRECTORY, {
    route: {
      templates: templates.sort((a, b) => {
        const aPath = a.path.toLowerCase();
        const bPath = b.path.toLowerCase();

        if (aPath < bPath) return -1;
        if (aPath > bPath) return 1;
        return 0;
      }),
      defaultTemplate,
      starterTemplate,
    },
  });

  return playgroundFilesMap;
}

async function getPlaygroundFiles(
  project: string,
  playgroundFiles: string[],
  commonFiles: FileAndContent[],
): Promise<PlaygroundFiles> {
  const config = await getTutorialConfig(playgroundFiles);

  if (config.type !== TutorialType.EDITOR_ONLY)
    throw new Error(`Playground must be of type "${TutorialType.EDITOR_ONLY}"`);

  const filesContents = await getFilesContents(playgroundFiles);

  const projectFiles = getProjectFiles(project, config.openFiles, filesContents, commonFiles);

  if (config.openFiles) {
    validateOpenFilesConfig(
      TUTORIALS_PLAYGROUND_NODE_PATH,
      config.openFiles,
      Object.keys(projectFiles),
    );
  }

  const hasPackageJson = playgroundFiles.some((file) => basename(file) === 'package.json');

  let dependencies: TutorialMetadata['dependencies'];

  if (hasPackageJson) {
    const packageJson = getPackageJsonFromFiles(filesContents);

    dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    validatePackageJson(playgroundFiles, packageJson, getPackageJsonFromFiles(commonFiles));
  }

  const allFiles = getAllFiles(
    playgroundFiles,
    commonFiles.map(({path}) => path),
    (path: string) => getCleanFilePath(project, path),
  );

  return {
    sourceCode: getSourceCode(project, playgroundFiles, filesContents),
    metadata: {
      type: config.type,
      allFiles,
      dependencies,
      tutorialFiles: projectFiles,
      openFiles: config.openFiles ?? Object.keys(projectFiles),
      hiddenFiles: config.openFiles
        ? Object.keys(projectFiles).filter((filename) => !config.openFiles!.includes(filename))
        : [],
    },
    route: {
      templates: [{path: project, label: config.title}],
    },
  };
}

function getProjectFiles(
  project: string,
  openFiles: TutorialConfig['openFiles'],
  playgroundFilesContents: FileAndContent[],
  commonFiles: FileAndContent[],
): FileAndContentRecord {
  const playgroundFilesForCodeEditor = playgroundFilesContents
    // remove files that should not be shown in the code editor
    .filter(({path}) => shouldUseFileInWebContainer(path))
    // remove playground path from file paths
    .map(({path, content}) => ({
      path: getCleanFilePath(project, path),
      content,
    }));

  if (!openFiles) return filesAndContentsToRecord(playgroundFilesForCodeEditor);

  const commonFilesForCodeEditor = commonFiles
    // remove files that should not be shown in the code editor
    .filter(({path}) => shouldUseFileInWebContainer(getCleanCommonFilePath(path)))
    // remove common path from file paths
    .map(({path, content}) => ({
      path: getCleanCommonFilePath(path),
      content,
    }));

  const commonAndPlaygroundFiles = {
    ...filesAndContentsToRecord(commonFilesForCodeEditor),
    ...filesAndContentsToRecord(playgroundFilesForCodeEditor),
  };

  const openFilesConfigWithContents: FileAndContentRecord = {};

  for (const openFile of openFiles) {
    if (commonAndPlaygroundFiles[openFile]) {
      openFilesConfigWithContents[openFile] = commonAndPlaygroundFiles[openFile];
    } else {
      throw `At ${TUTORIALS_PLAYGROUND_NODE_PATH}/${CONFIG_FILE}.\n\tCould not find file "${openFile}" in playground or common files`;
    }
  }

  return openFilesConfigWithContents;
}

export function getSourceCode(
  project: string,
  tutorialFiles: string[],
  filesContents: FileAndContent[],
) {
  const fileSystemTreeContents = filesContents
    // filter out config files
    .filter(({path}) => shouldUseFileInWebContainer(path))
    // remove steps paths from file contents
    .map(({path, content}) => ({
      path: getCleanFilePath(project, path),
      content,
    }));

  const fileSystemTreeFiles = tutorialFiles
    .filter(shouldUseFileInWebContainer)
    .map((filename) => getCleanFilePath(project, filename));

  return getFileSystemTree(fileSystemTreeFiles, filesAndContentsToRecord(fileSystemTreeContents));
}

/**
 * Create a regex that matches the string before the project name in a path.
 *
 * This is used to remove the project name from the path, keeping only the path
 * relative to the project root.
 */
function getBeforePlaygroundProjectRegex(project: string): RegExp {
  const projectRegex = beforePlaygroundPathRegexCache.get(project);
  if (projectRegex) return projectRegex;

  const newRegex = new RegExp(`.*\/${project}\/`);
  beforePlaygroundPathRegexCache.set(project, newRegex);

  return newRegex;
}

function getCleanFilePath(project: string, path: string) {
  if (isPlaygroundCommonFile(path)) {
    return getCleanCommonFilePath(path);
  }

  return path.replace(getBeforePlaygroundProjectRegex(project), '');
}

export function isPlaygroundRouteData(
  routeData: PlaygroundRouteData | TutorialFiles['route'],
): routeData is PlaygroundRouteData {
  return (routeData as PlaygroundRouteData).templates !== undefined;
}

function isPlaygroundCommonFile(path: string) {
  return path.includes(TUTORIALS_COMMON_DIRECTORY);
}
