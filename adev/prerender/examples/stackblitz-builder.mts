/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {dirname, join} from 'path';
import {readFile, writeFile} from 'fs/promises';
import {
  ASSETS_EXAMPLE_PATH,
  CSS_TS_COPYRIGHT,
  EXAMPLES_PATH,
  HTML_COPYRIGHT,
  STACKBLITZ_TEMPLATE_PATH,
  STACKBLITZ_CONFIG_FILENAME,
  TEMPORARY_EXAMPLES_PATH,
  EXCLUDE_FILES_FOR_STACKBLITZ,
} from './utils/examples-constants.mjs';
import {copyFolder, createFolder, removeFolder} from './utils/fs.mjs';
import jsdom from 'jsdom';
import {glob} from 'glob';
import {regionParser} from './../../prerender/markdown-pipeline/regions/region-parser.mjs';

interface StackblitzConfig {
  ignore: string[];
  file: string;
  tags: string[];
  description: string;
}

export async function generateStackblitzExample(
  exampleFolderName: string,
  primaryFilePath: string,
  title: string,
) {
  const exampleDir = join(EXAMPLES_PATH, exampleFolderName);
  const temporaryExampleDir = join(TEMPORARY_EXAMPLES_PATH, exampleFolderName);
  const config = await readFile(join(exampleDir, STACKBLITZ_CONFIG_FILENAME), 'utf-8');
  const stackblitzConfig: StackblitzConfig = JSON.parse(config);
  primaryFilePath = join(...primaryFilePath.split('/'));

  await createFolder(temporaryExampleDir);
  await combineTemplateWithExample(exampleDir, temporaryExampleDir);
  await generateStackblitzHtml(
    temporaryExampleDir,
    stackblitzConfig,
    exampleFolderName,
    primaryFilePath,
    title,
  );
  await removeFolder(temporaryExampleDir);
}

async function combineTemplateWithExample(
  exampleDir: string,
  temporaryExampleDir: string,
): Promise<void> {
  // Copy template files to TEMP folder
  await copyFolder(STACKBLITZ_TEMPLATE_PATH, temporaryExampleDir);

  // Copy example files to TEMP folder
  await copyFolder(exampleDir, temporaryExampleDir);
}

async function generateStackblitzHtml(
  temporaryExampleDir: string,
  stackBlitzConfig: StackblitzConfig,
  exampleFolderName: string,
  primaryFilePath: string,
  title: string,
): Promise<void> {
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
    nodir: true,
    dot: true,
    ignore: stackBlitzConfig.ignore,
  });

  const postData = await createPostData(
    temporaryExampleDir,
    stackBlitzConfig,
    exampleFilePaths,
    title,
  );
  const primaryFile = getPrimaryFile(primaryFilePath ?? stackBlitzConfig.file, exampleFilePaths);
  const html = createStackblitzHtml(postData, primaryFile);

  const stackblitzHtmlPath = join(
    join(ASSETS_EXAMPLE_PATH, exampleFolderName),
    `${primaryFile}.html`,
  );
  await createFolder(dirname(stackblitzHtmlPath));
  await writeFile(stackblitzHtmlPath, html, 'utf-8');
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
  title: string,
): Promise<Record<string, string>> {
  const postData: Record<string, string> = {};

  for (const filePath of exampleFilePaths) {
    if (EXCLUDE_FILES_FOR_STACKBLITZ.some((excludedFile) => filePath.endsWith(excludedFile))) {
      continue;
    }

    let content = await readFile(join(exampleDir, filePath), 'utf-8');
    content = appendCopyright(filePath, content);
    content = extractRegions(filePath, content);

    postData[`project[files][${filePath}]`] = content;
  }

  const tags = ['angular', 'example', ...(config.tags || [])];
  tags.forEach((tag, index) => (postData[`project[tags][${index}]`] = tag));

  postData['project[description]'] = `Angular Example - ${config.description}`;
  postData['project[template]'] = 'node';
  postData['project[title]'] = title ?? 'Angular Example';

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
  const file = `?file=${primaryFile}`;
  const action = `https://stackblitz.com/run${file}`;

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

function appendCopyright(filename: string, content: string): string {
  if (filename.endsWith('.html')) {
    return `${HTML_COPYRIGHT}${content}`;
  } else if (filename.endsWith('.ts') || filename.endsWith('.css')) {
    return `${CSS_TS_COPYRIGHT}${content}`;
  }
  return content;
}

function htmlToElement(document: Document, html: string) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

function extractRegions(path: string, contents: string): string {
  const regionParserResult = regionParser(contents, path);
  return regionParserResult.contents;
}
