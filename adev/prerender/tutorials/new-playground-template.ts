/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {glob} from 'glob';
import {input} from '@inquirer/prompts';

import {TutorialType} from './utils/web-constants';
import {parseConfig} from './tutorials-config';
import {createDirectoryAndWriteFile} from './utils/filesystem';
import {CONFIG_FILE, GLOB_OPTIONS, TUTORIALS_PLAYGROUND_NODE_PATH} from './utils/node-constants';
import {validatePathAnswer} from './utils/cli';

createTemplate();

async function createTemplate() {
  const existingTemplates = await glob('**/', {
    ...GLOB_OPTIONS,
    absolute: false,
    cwd: TUTORIALS_PLAYGROUND_NODE_PATH,
    maxDepth: 1,
  });

  const path = await askTemplatePath(existingTemplates);
  const title = await input({message: 'What is the title for the template?'});

  const templatePath = `${TUTORIALS_PLAYGROUND_NODE_PATH}/${path}`;

  const config = await parseConfig({
    type: TutorialType.EDITOR_ONLY,
    title,
    openFiles: ['src/main.ts'],
  });

  await Promise.all([
    createDirectoryAndWriteFile(join(templatePath, CONFIG_FILE), JSON.stringify(config, null, 2)),
    createDirectoryAndWriteFile(join(templatePath, 'src', 'main.ts'), ''),
  ]);

  console.info(`\n✅ Template created at ${templatePath}`);
}

function askTemplatePath(existingTemplates: string[]) {
  const placeholder = 'path-to-template';

  return input({
    message: 'What is the path of the template?',
    default: placeholder,
    validate: (answer) => validatePathAnswer(answer, existingTemplates, placeholder),
  });
}
