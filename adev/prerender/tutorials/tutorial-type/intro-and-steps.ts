/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, dirname, join} from 'path';

import {
  filesAndContentsToRecord,
  getFilesContents,
  getPackageJsonFromFiles,
  getZipBuffer,
  globWithCwdPath,
  recordToFilesAndContents,
} from '../utils/filesystem';
import {
  ANSWER_DIRECTORY,
  GLOB_OPTIONS,
  INTRO_DIRECTORY,
  STEPS_DIRECTORY,
  TUTORIALS_PROJECT_PATH,
} from '../utils/node-constants';
import {getFileSystemTree, shouldUseFileInWebContainer} from '../utils/webcontainers';
import {getCleanFilePath as getCleanCommonFilePath} from './common';

import {TutorialNavigationItemWithStep} from '../generate-tutorials-routes';
import {getTutorialConfig, validateOpenFilesConfig} from '../tutorials-config';
import type {
  FileAndContent,
  FileAndContentRecord,
  TutorialConfig,
  TutorialFiles,
  TutorialMetadata,
  TutorialStep,
} from '../tutorials-types';
import {
  TUTORIALS_COMMON_DIRECTORY,
  TUTORIALS_DIST_PATH,
  TUTORIALS_SOURCE_CODE_WEB_PATH,
  TutorialType,
} from '../utils/web-constants';
import {getAllFiles, validatePackageJson} from '../utils/metadata';

export const TUTORIALS_DIRECTORY_REGEX = /^[a-z-0-9]*$/;
export const STEPS_DIRECTORY_REGEX = /^([0-9]|[0-9][0-9])-[A-Za-z-0-9]*$/;
const BEFORE_STEP_PATH_REGEX = new RegExp(`.*\/${STEPS_DIRECTORY}\/[^\/]+\/`);
const BEFORE_INTRO_PATH_REGEX = new RegExp(`.*\/${INTRO_DIRECTORY}\/`);

export async function getIntroAndStepsTutorialFiles(
  tutorialName: string,
  tutorialDirectories: string[],
  tutorialFiles: string[],
  commonTutorialFiles: FileAndContent[],
): Promise<Map<string, TutorialFiles>> {
  const tutorialSteps = getTutorialSteps(tutorialName, tutorialDirectories);

  const introAndStepsFiles = new Map<TutorialStep['url'], TutorialFiles>();

  const tutorialCommonFiles = tutorialFiles.filter((file) =>
    isCommonTutorialFile(tutorialName, file),
  );

  const introFiles = await getTutorialIntroFiles(
    tutorialName,
    [
      ...tutorialCommonFiles,
      ...tutorialFiles.filter((file) => file.includes(`/${INTRO_DIRECTORY}/`)),
    ],
    tutorialSteps,
    commonTutorialFiles,
  );

  introAndStepsFiles.set(tutorialName, introFiles);

  await Promise.all(
    tutorialSteps.map(async (step) => {
      const stepFiles = tutorialFiles.filter((file) => file.includes(step.path));

      let nextTutorial;
      if (introFiles.route && 'tutorialData' in introFiles.route) {
        nextTutorial = introFiles.route.tutorialData.nextTutorial;
      }

      const stepSourceCodeAndMetadata = await getStepFiles(
        [...tutorialCommonFiles, ...stepFiles],
        {
          ...step,
          nextTutorial,
        },
        commonTutorialFiles,
      );

      introAndStepsFiles.set(step.url, stepSourceCodeAndMetadata);
    }),
  );

  return introAndStepsFiles;
}

async function getTutorialIntroFiles(
  tutorialName: string,
  introTutorialFiles: string[],
  tutorialSteps: TutorialStep[],
  commonFilesContents: FileAndContent[],
) {
  return getStepFiles(
    introTutorialFiles,
    {
      step: 0,
      name: tutorialName,
      path: dirname(introTutorialFiles[0]),
      nextStep: tutorialSteps.find((step) => step.step === 0 || step.step === 1)?.url, // assume the first tutorialSteps array item is the first step
      url: tutorialName,
    },
    commonFilesContents,
  );
}

async function getStepFiles(
  stepFiles: string[],
  step: TutorialStep,
  commonFilesContents: FileAndContent[],
): Promise<TutorialFiles> {
  const config = await getTutorialConfig(stepFiles);

  // if src is present in the config, add files to the step files
  if (config.src) {
    const srcFiles = await getExternalTutorialFiles(step, config.src);

    stepFiles.push(...srcFiles);
  }

  const filesContents = await getFilesContents(stepFiles);

  const route: Omit<TutorialNavigationItemWithStep, 'path'> = {
    label: config.title,

    contentPath: getTutorialContentPath(stepFiles),

    tutorialData: {
      type: config.type,
      title: config.title,

      step: step.step,
      nextStep: step.nextStep,
      previousStep: step.previousStep,
      nextTutorial: config.nextTutorial ?? step.nextTutorial,
    },
  };

  if (config.type === TutorialType.LOCAL) {
    const hasFilesToDownload =
      filesContents.filter(({path}) => shouldUseFileInWebContainer(path)).length > 0;

    if (!hasFilesToDownload) {
      return {route};
    } else {
      const filesToDownload = getFilesToDownload(commonFilesContents, filesContents);

      route.tutorialData.sourceCodeZipPath = join(
        TUTORIALS_SOURCE_CODE_WEB_PATH,
        step.url + '.zip',
      );

      return {
        sourceCodeZip: await getZipBuffer(filesToDownload),
        route,
      };
    }
  }

  const tutorialFiles = getTutorialFiles(filesContents);

  if (config.openFiles) {
    validateOpenFilesConfig(step.path, config.openFiles, Object.keys(tutorialFiles));
  } else if (config.type === TutorialType.EDITOR) {
    config.openFiles = Object.keys(tutorialFiles);
  }

  const hasPackageJson = stepFiles.some((file) => basename(file) === 'package.json');

  let dependencies: TutorialMetadata['dependencies'];

  if (hasPackageJson) {
    const packageJson = getPackageJsonFromFiles(filesContents);

    dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    validatePackageJson(stepFiles, packageJson, getPackageJsonFromFiles(commonFilesContents));
  }

  const fileSystemTreeContents = filesContents
    .filter(({path}) => shouldUseFileInWebContainer(path))
    .map(({path, content}) => ({path: getCleanFilePath(path), content}));

  const fileSystemTreeFiles = stepFiles.filter(shouldUseFileInWebContainer).map(getCleanFilePath);

  const allFiles = getAllFiles(
    stepFiles,
    commonFilesContents.map(({path}) => path),
    getCleanFilePath,
  );

  const metadata: TutorialMetadata = {
    type: config.type,
    allFiles,
    tutorialFiles,
    answerFiles: await getAnswerFiles(step, filesContents, config.answerSrc),
    openFiles: config.openFiles ?? Object.keys(tutorialFiles),
    hiddenFiles: config.openFiles
      ? Object.keys(tutorialFiles).filter((filename) => !config.openFiles!.includes(filename))
      : [],
    dependencies,
  };

  return {
    metadata,
    sourceCode: getFileSystemTree(
      fileSystemTreeFiles,
      filesAndContentsToRecord(fileSystemTreeContents),
    ),
    route,
  };
}

export function getTutorialSteps(
  tutorialName: string,
  tutorialDirectories: string[],
): TutorialStep[] {
  const stepsDirectories = tutorialDirectories.filter((directory) => {
    const isStepDirectory = directory.includes(`${tutorialName}/${STEPS_DIRECTORY}/`);
    if (!isStepDirectory) return false;

    const stepPathParts = directory.split('/');

    // steps directory is always right after STEPS_DIRECTORY in the path, e.g. `learn-angular/steps/1-getting-started`
    const stepDirectoryIndex = stepPathParts.indexOf(STEPS_DIRECTORY) + 1;
    const step = stepPathParts[stepDirectoryIndex];

    return step === stepPathParts.at(-1);
  });

  const steps: TutorialStep[] = [];

  for (const stepDirectoryPath of stepsDirectories) {
    const stepDirectory = basename(stepDirectoryPath);

    // force the tutorials steps to follow the pattern steps/{step}-{name}
    if (!STEPS_DIRECTORY_REGEX.test(stepDirectory))
      throw `Invalid step directory '${stepDirectory}'. The step directory must start with a number > 0, followed by a hyphen and a name. For example: '1-intro'`;

    const [step, ...nameParts] = stepDirectory.replace(`${STEPS_DIRECTORY}/`, '').split('-');
    const name = nameParts.join('-');

    steps.push({
      step: Number(step),
      name,
      path: stepDirectoryPath,
      url: join(tutorialName, name),
    });
  }

  return steps.map((step) => {
    const previousStep = steps.find(({step: previousStep}) => previousStep === step.step - 1);
    const nextStep = steps.find(({step: nextStep}) => nextStep === step.step + 1);

    return {
      ...step,
      nextStep: nextStep?.url,
      previousStep: previousStep?.url ?? tutorialName,
    };
  });
}

/**
 * Filter files that won't be used in the WebContainer.
 */
function getTutorialFiles(
  tutorialFilesContents: FileAndContent[],
): Record<FileAndContent['path'], FileAndContent['content']> {
  const tutorialFiles = tutorialFilesContents
    .filter(({path}) => shouldUseFileInWebContainer(path))
    .map(({path, content}) => ({
      path: getCleanFilePath(path),
      content,
    }));

  return filesAndContentsToRecord(tutorialFiles);
}

async function getAnswerFiles(
  step: TutorialStep,
  filesContents: FileAndContent[],
  answerSrc: TutorialConfig['answerSrc'],
): Promise<FileAndContentRecord> {
  const removeAnswerPathFromFiles = (filesAndContents: FileAndContent[]) =>
    filesAndContents.map(({path, content}) => ({
      path: path.replace(`${ANSWER_DIRECTORY}/`, ''),
      content,
    }));

  if (answerSrc) {
    const answerSrcFiles = await getExternalTutorialFiles(step, answerSrc);

    const answerFiles = await getFilesContents(answerSrcFiles);

    return getTutorialFiles(removeAnswerPathFromFiles(answerFiles));
  }

  const answerFiles = filesContents.filter(({path}) => path.includes(`${ANSWER_DIRECTORY}/`));

  return getTutorialFiles(removeAnswerPathFromFiles(answerFiles));
}

/**
 * Get files external to the current tutorial directory.
 */
async function getExternalTutorialFiles(
  step: TutorialStep,
  relativePath: string,
): Promise<string[]> {
  const externalFilesPath = join(step.path, relativePath);

  const files = await globWithCwdPath('**', {
    ...GLOB_OPTIONS,
    cwd: externalFilesPath,
    nodir: true,
  });

  return files;
}

function getTutorialContentPath(stepFiles: string[]) {
  const tutorialContentPath = stepFiles.find((filename) => filename.endsWith('README.md'));

  if (!tutorialContentPath) {
    const tutorialPath = dirname(stepFiles[0]);

    throw `Tutorial at ${tutorialPath} is missing a README.md for content`;
  }

  const contentPathWithDistPath = tutorialContentPath.replace(
    TUTORIALS_PROJECT_PATH,
    TUTORIALS_DIST_PATH,
  );

  return contentPathWithDistPath.replace(/\.[^.]+$/, '');
}

/**
 * Clean the file path by making it relative to the project root.
 *
 * @example
 * ```ts
 *  getCleanFilePath('path-to-tutorial/intro/src/app/app.component.ts') => 'src/app/app.component.ts'
 *  getCleanFilePath('path-to-tutorial/steps/1-step/src/app/app.component.ts') => 'src/app/app.component.ts'
 * ```
 */
function getCleanFilePath(path: string) {
  if (path.includes(TUTORIALS_COMMON_DIRECTORY)) return getCleanCommonFilePath(path);
  if (path.includes(STEPS_DIRECTORY)) return path.replace(BEFORE_STEP_PATH_REGEX, '');

  return path.replace(BEFORE_INTRO_PATH_REGEX, '');
}

/**
 * Merge common project files with the step files to get the final files to download.
 */
function getFilesToDownload(
  commonFilesContents: FileAndContent[],
  stepFilesWithoutAnswer: FileAndContent[],
) {
  const commonFilesWithoutPath = commonFilesContents.map(({path, content}) => ({
    path: getCleanCommonFilePath(path),
    content,
  }));

  const stepFilesWithoutPath = stepFilesWithoutAnswer
    .filter(({path}) => shouldUseFileInWebContainer(path))
    .map(({path, content}) => ({
      path: getCleanFilePath(path),
      content,
    }));

  // use object to easily override common files with step files
  const filesToDownload = {
    ...filesAndContentsToRecord(commonFilesWithoutPath),
    ...filesAndContentsToRecord(stepFilesWithoutPath),
  };

  return recordToFilesAndContents(filesToDownload);
}

function isCommonTutorialFile(tutorialPath: string, filePath: string) {
  return filePath.includes(join(tutorialPath, TUTORIALS_COMMON_DIRECTORY));
}
