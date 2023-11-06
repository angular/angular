/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {input, confirm} from '@inquirer/prompts';
import {existsSync} from 'fs';
import {copyFile, mkdir, writeFile} from 'fs/promises';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {copyFolder} from './utils/fs.mjs';

const EXAMPLES_BASE = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/content/examples',
);
const STACKBLITZ_TEMPLATE = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/content/stackblitz-template',
);

const MAIN_TS_FILENAME = 'main.ts';
const STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';

createExample();

async function createExample(): Promise<void> {
  console.info('Create example');
  const name = await input({message: 'What is the example name?'});
  const description = await input({message: 'Could you provide the description of the example?'});
  const tags: string[] = [];
  let addMoreTags = true;

  while (addMoreTags) {
    const tag = await input({message: 'Could you provide the tag of the example?'});

    if (!!tag) {
      tags.push(tag);
    }

    console.info();

    addMoreTags = await confirm({message: 'Would you like to add another tag?', default: true});
  }

  const shouldCopySrcAppFolderFromTemplate = await confirm({
    message: 'Would you like to copy /src/app/**.* from template?',
    default: true,
  });
  const shouldCopyMainTsFromTemplate = await confirm({
    message: 'Would you like to copy /src/main.ts from template?',
    default: false,
  });

  const examplePath = join(EXAMPLES_BASE, name);

  await createEmptyExample(examplePath, name, description, tags);
  await copyFilesFromTemplate(
    examplePath,
    shouldCopySrcAppFolderFromTemplate,
    shouldCopyMainTsFromTemplate,
  );
}

/**
 * Create the directory and marker files for the new example.
 */
async function createEmptyExample(
  examplePath: string,
  exampleName: string,
  description: string,
  tags: string[],
): Promise<void> {
  validateExampleName(exampleName);

  await ensureExamplePath(examplePath);
  await writeStackBlitzFile(examplePath, description, tags);
}

function validateExampleName(exampleName: string): void {
  if (/\s/.test(exampleName)) {
    throw new Error(`Unable to create example. The example name contains spaces: '${exampleName}'`);
  }
}

/**
 * Ensure that the new example directory exists.
 */
async function ensureExamplePath(examplePath: string): Promise<void> {
  if (existsSync(examplePath)) {
    throw new Error(
      `Unable to create example. The path to the new example already exists: ${examplePath}`,
    );
  }
  await mkdir(examplePath);
}

/**
 * Write the `stackblitz.json` file into the new example.
 */
async function writeStackBlitzFile(
  examplePath: string,
  description: string,
  tags: string[],
): Promise<void> {
  const config = {
    description,
    ignore: ['**/*.d.ts', '**/*.js', '**/*.[1,2].*'],
    tags,
  };
  await writeFile(
    join(examplePath, STACKBLITZ_CONFIG_FILENAME),
    JSON.stringify(config, null, 2) + '\n',
  );
}

async function copyFilesFromTemplate(
  examplePath: string,
  shouldCopySrcAppFolderFromTemplate: boolean,
  shouldCopyMainTsFromTemplate: boolean,
): Promise<void> {
  if (shouldCopySrcAppFolderFromTemplate) {
    const appTemplateFolderPath = join(STACKBLITZ_TEMPLATE, 'src/app');
    const exampleAppFolderPath = join(examplePath, 'src/app');
    await copyFolder(appTemplateFolderPath, exampleAppFolderPath);
  }
  if (shouldCopyMainTsFromTemplate) {
    const mainTsTemplatePath = join(STACKBLITZ_TEMPLATE, 'src', MAIN_TS_FILENAME);
    const exampleMainTsPath = join(examplePath, 'src', MAIN_TS_FILENAME);
    await copyFile(mainTsTemplatePath, exampleMainTsPath);
  }
}
