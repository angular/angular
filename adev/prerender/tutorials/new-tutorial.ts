/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {select, input, confirm} from '@inquirer/prompts';
import {glob} from 'glob';

import {createDirectoryAndWriteFile} from './utils/filesystem';
import {
  CONFIG_FILE,
  CONTENT_PLACEHOLDER,
  GLOB_OPTIONS,
  INTRO_DIRECTORY,
  STEPS_DIRECTORY,
  TUTORIALS_PROJECT_PATH,
  TUTORIAL_CONTENT_FILENAME,
} from './utils/node-constants';

import type {TutorialConfig} from './tutorials-types';
import {parseConfig} from './tutorials-config';
import {
  TUTORIALS_COMMON_DIRECTORY,
  TUTORIALS_PLAYGROUND_DIRECTORY,
  TutorialType,
} from './utils/web-constants';
import {validatePathAnswer} from './utils/cli';

type TutorialFields = TutorialConfig & {
  path: string;
};

type TutorialToCreate = {
  intro: TutorialFields;
  steps: Array<TutorialFields & {step: number}>;
};

createTutorial();

async function createTutorial() {
  const existingTutorials = await glob('**/', {
    ignore: [
      ...(GLOB_OPTIONS.ignore as string[]),
      TUTORIALS_COMMON_DIRECTORY,
      TUTORIALS_PLAYGROUND_DIRECTORY,
    ],
    cwd: TUTORIALS_PROJECT_PATH,
    maxDepth: 1,
  });

  const introPath = await askTutorialPath(existingTutorials);
  const introType = await askTutorialType('What is the type of the tutorial intro?');
  const introTitle = await input({message: 'What is the title for the tutorial intro?'});
  const introNextTutorial = await askAboutNextTutorial(existingTutorials);

  const tutorialToCreate: TutorialToCreate = {
    intro: {
      type: introType as any, // Note: casting to any here as a workaround for the enum type error
      title: introTitle,
      path: introPath,
      openFiles: [''],
      nextTutorial: introNextTutorial,
    },
    steps: [],
  };

  let addMoreSteps = true;
  let step = 1;

  while (addMoreSteps) {
    console.info(`\nStep ${step}`);
    const path = await askTutorialStepPath(tutorialToCreate.steps);
    const type = await askTutorialType('What is the type of the step?');
    const title = await input({message: 'What is the title of the step?'});

    tutorialToCreate.steps.push({
      step,
      type: type as any, // Note: casting to any here as a workaround for the enum type error
      path,
      title,
      openFiles: [''],
    });

    step++;

    console.info();
    addMoreSteps = await confirm({message: 'Would you like to add another step?', default: true});
  }

  const tutorialPath = `${TUTORIALS_PROJECT_PATH}/${tutorialToCreate.intro.path}`;

  await Promise.all([
    createIntroFiles(tutorialToCreate.intro),
    ...createStepsFiles(tutorialPath, tutorialToCreate.steps),
  ]);

  console.info(`\n✅ Tutorial created at ${tutorialPath}`);
}

function askTutorialType(message: string = 'What is the type of the tutorial?') {
  return select<TutorialConfig['type']>({
    message: message,
    choices: [
      {
        name: 'CLI only: a tutorial for the Angular CLI in-browser unsing the embedded terminal',
        value: TutorialType.CLI,
      },
      {name: 'Local app: a tutorial for building an app locally', value: TutorialType.LOCAL},
      {
        name: 'Embedded editor: a tutorial for building an app in-browser using the embedded editor',
        value: TutorialType.EDITOR,
      },
    ],
  });
}

function askAboutNextTutorial(
  existingTutorials: string[],
  message: string = 'What should be the next tutorial?',
) {
  return select({
    message,
    choices: [
      ...existingTutorials.map((tutorial) => ({name: tutorial, value: tutorial})),
      {name: 'None', value: undefined},
    ],
  });
}

function askTutorialPath(existingTutorials: string[]) {
  const placeholder = 'path-to-tutorial';

  return input({
    message: 'What is the path of the tutorial?',
    default: placeholder,
    validate: (answer) => validatePathAnswer(answer, existingTutorials, placeholder),
  });
}

function askTutorialStepPath(createdSteps: TutorialToCreate['steps']) {
  const placeholder = 'path-to-step';

  const existingSteps = createdSteps.map((step) => step.path);

  return input({
    message: 'What is the path of the step?',
    default: placeholder,
    validate: (answer) => validatePathAnswer(answer, existingSteps, placeholder),
  });
}

async function createIntroFiles(intro: TutorialToCreate['intro']): Promise<Promise<void>[]> {
  const tutorialPath = `${TUTORIALS_PROJECT_PATH}/${intro.path}`;

  const config = await parseConfig({
    type: intro.type as any, // Note: casting to any here as a workaround for the enum type error
    title: intro.title,
    openFiles: intro.openFiles,
    nextTutorial: intro.nextTutorial,
  });

  return [
    createDirectoryAndWriteFile(
      join(tutorialPath, INTRO_DIRECTORY, CONFIG_FILE),
      JSON.stringify(config, null, 2),
    ),
    createDirectoryAndWriteFile(
      join(tutorialPath, INTRO_DIRECTORY, TUTORIAL_CONTENT_FILENAME),
      CONTENT_PLACEHOLDER,
    ),
  ];
}

function createStepsFiles(
  tutorialPath: string,
  steps: TutorialToCreate['steps'],
): Promise<Promise<void>[]>[] {
  const tutorialStepsPath = join(tutorialPath, STEPS_DIRECTORY);

  return steps
    .map(async (step) => {
      const stepPath = join(tutorialStepsPath, `${step.step}-${step.path}`);

      const config = await parseConfig({
        type: step.type as any, // Note: casting to any here as a workaround for the enum type error
        title: step.title,
        openFiles: step.openFiles,
      });

      return [
        createDirectoryAndWriteFile(`${stepPath}/${CONFIG_FILE}`, JSON.stringify(config, null, 2)),
        createDirectoryAndWriteFile(
          `${stepPath}/${TUTORIAL_CONTENT_FILENAME}`,
          CONTENT_PLACEHOLDER,
        ),
      ];
    })
    .flat();
}
