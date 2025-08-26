/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {readFile} from 'fs/promises';
import {copyFolder, createFolder, removeFolder} from '../shared/file-system.mjs';
import jsdom from 'jsdom';
import {glob} from 'tinyglobby';
import {appendCopyrightToFile} from '../shared/copyright.mjs';
import {EXCLUDE_FILES_FOR_STACKBLITZ, STACKBLITZ_CONFIG_FILENAME} from './defaults.mjs';
import {regionParser} from '../../shared/regions/region-parser.mjs';
import {FileType} from '../../shared/regions/remove-eslint-comments.mjs';

interface StackblitzConfig {
  title: string;
  ignore: string[];
  file: string;
  tags: string[];
  description: string;
}

export async function generateStackblitzExample(
  exampleDir: string,
  temporaryExampleDir: string,
  stackblitzTemplateDir: string,
) {
  const config = await readFile(join(exampleDir, STACKBLITZ_CONFIG_FILENAME), 'utf-8');
  const stackblitzConfig: StackblitzConfig = JSON.parse(config) as StackblitzConfig;

  await createFolder(temporaryExampleDir);

  // Copy template files to TEMP folder
  await copyFolder(stackblitzTemplateDir, temporaryExampleDir);

  // Copy example files to TEMP folder
  await copyFolder(exampleDir, temporaryExampleDir);
  const result = await generateStackblitzHtml(temporaryExampleDir, stackblitzConfig);
  await removeFolder(temporaryExampleDir);
  return result;
}

async function generateStackblitzHtml(
  temporaryExampleDir: string,
  stackBlitzConfig: StackblitzConfig,
): Promise<string> {
  const defaultIncludes = [
    '**/*.ts',
    '**/*.js',
    '**/*.css',
    '**/*.html',
    '**/*.md',
    '**/*.json',
    '**/*.svg',
  ];
  const exampleFilePaths = await glob(defaultIncludes, {
    cwd: temporaryExampleDir,
    onlyFiles: true,
    dot: true,
    ignore: stackBlitzConfig.ignore,
  });

  const postData = await createPostData(temporaryExampleDir, stackBlitzConfig, exampleFilePaths);
  const primaryFile = getPrimaryFile(stackBlitzConfig.file, exampleFilePaths);
  return createStackblitzHtml(postData, primaryFile);
}

function getPrimaryFile(primaryFilePath: string, exampleFilePaths: string[]): string {
  if (primaryFilePath) {
    if (!exampleFilePaths.some((filePath) => filePath === primaryFilePath)) {
      throw new Error(`The specified primary file (${primaryFilePath}) does not exist!`);
    }
    return primaryFilePath;
  } else {
    const defaultPrimaryFilePaths = [
      'src/app/app.component.html',
      'src/app/app.component.ts',
      'src/app/main.ts',
    ];
    const primaryFile = defaultPrimaryFilePaths.find((path) =>
      exampleFilePaths.some((filePath) => filePath === path),
    );

    if (!primaryFile) {
      throw new Error(
        `None of the default primary files (${defaultPrimaryFilePaths.join(', ')}) exists.`,
      );
    }

    return primaryFile;
  }
}

async function createPostData(
  exampleDir: string,
  config: StackblitzConfig,
  exampleFilePaths: string[],
): Promise<Record<string, string>> {
  const postData: Record<string, string> = {};

  for (const filePath of exampleFilePaths) {
    if (EXCLUDE_FILES_FOR_STACKBLITZ.some((excludedFile) => filePath.endsWith(excludedFile))) {
      continue;
    }

    let content = await readFile(join(exampleDir, filePath), 'utf-8');
    content = appendCopyrightToFile(filePath, content);
    content = extractRegions(filePath, content);

    postData[`project[files][${filePath}]`] = content;
  }

  const tags = ['angular', 'example', ...(config.tags || [])];
  tags.forEach((tag, index) => (postData[`project[tags][${index}]`] = tag));

  postData['project[description]'] = `Angular Example - ${config.description}`;
  postData['project[template]'] = 'node';
  postData['project[title]'] = config.title ?? 'Angular Example';

  return postData;
}

function createStackblitzHtml(postData: Record<string, string>, primaryFile: string): string {
  const baseHtml = createBaseStackblitzHtml(primaryFile);
  const doc = new jsdom.JSDOM(baseHtml).window.document;
  const form = doc.querySelector('form');

  for (const [key, value] of Object.entries(postData)) {
    const element = htmlToElement(doc, `<input type="hidden" name="${key}">`);
    if (element && form) {
      element.setAttribute('value', value as string);
      form.appendChild(element);
    }
  }

  return doc.documentElement.outerHTML;
}

function createBaseStackblitzHtml(primaryFile: string) {
  const action = `https://stackblitz.com/run?file=${primaryFile}`;

  return `
    <!DOCTYPE html><html lang="en"><body>
      <form id="mainForm" method="post" action="${action}" target="_self"></form>
      <script>
        var embedded = 'ctl=1';
        var isEmbedded = window.location.search.indexOf(embedded) > -1;

        if (isEmbedded) {
          var form = document.getElementById('mainForm');
          var action = form.action;
          var actionHasParams = action.indexOf('?') > -1;
          var symbol = actionHasParams ? '&' : '?'
          form.action = form.action + symbol + embedded;
        }
        document.getElementById("mainForm").submit();
      </script>
    </body></html>
  `.trim();
}

function htmlToElement(document: Document, html: string) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

function extractRegions(path: string, contents: string): string {
  const fileType: FileType | undefined = path?.split('.').pop() as FileType;
  const regionParserResult = regionParser(contents, fileType);
  return regionParserResult.contents;
}
