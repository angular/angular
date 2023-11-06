/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {existsSync} from 'fs';
import {copyFile, mkdir, readdir, rm, stat, writeFile} from 'fs/promises';
import {marked} from 'marked';
import {dirname, join} from 'path';
import {PROJECT_FOLDER_PATH} from './constants.mjs';
import {MERMAID_TEMP_FOLDER, docsWalkTokens} from './docs-walk-tokens.mjs';
import {hooks} from './hooks.mjs';
import {renderer} from './renderer.mjs';
import {setCurrentParsedFilePath} from './state.mjs';
import {docsAlertExtension} from './tranformations/docs-alert.mjs';
import {docsCalloutExtension} from './tranformations/docs-callout.mjs';
import {docsCardContainerExtension, docsCardExtension} from './tranformations/docs-card.mjs';
import {
  docsCodeExtension,
  docsCodeMultifileExtension,
  docsTripleTickMarkdownCodeExtension,
} from './tranformations/docs-code.mjs';
import {docsDecorativeHeaderExtension} from './tranformations/docs-decorative-header.mjs';
import {docsPillExtension, docsPillRowExtension} from './tranformations/docs-pill.mjs';
import {docsVideoExtension} from './tranformations/docs-video.mjs';
import {docsStepExtension, docsWorkflowExtension} from './tranformations/docs-workflow.mjs';
import {retrieveAllMarkdownFiles} from './utils.mjs';

declare var logs: string[];
(globalThis as any).logs = [];

/**
 * Fully configured processor instance.
 *
 * Marked was chosen as our processor as it is a popular and well supported by the community. Additionally,
 * its processing of custom HTML allows for a more direct interactions rather than being done within a custom
 * AST representation as other solutions provide.
 */
marked.use({
  mangle: false,
  headerIds: false,
  renderer,
  hooks,
  extensions: [
    /** Custom Extensions are @type marked.TokenizerAndRendererExtension but the this.renderer uses a custom Token that extends marked.Tokens.Generic which is not exported by @types/marked */
    // @ts-ignore @types/marked
    docsCardExtension,
    // @ts-ignore @types/marked
    docsCardContainerExtension,
    // @ts-ignore @types/marked
    docsCalloutExtension,
    // @ts-ignore @types/marked
    docsDecorativeHeaderExtension,
    // @ts-ignore @types/marked
    docsPillRowExtension,
    // @ts-ignore @types/marked
    docsPillExtension,
    // @ts-ignore @types/marked
    docsWorkflowExtension,
    // @ts-ignore @types/marked
    docsStepExtension,
    // @ts-ignore @types/marked
    docsCodeExtension,
    // @ts-ignore @types/marked
    docsCodeMultifileExtension,
    // @ts-ignore @types/marked
    docsTripleTickMarkdownCodeExtension,
    // @ts-ignore @types/marked
    docsAlertExtension,
    // @ts-ignore @types/marked
    docsVideoExtension,
  ],
  // Marked will return a promise if the async option is true.
  // The async option will tell marked to await any walkTokens functions before parsing the tokens and returning an HTML string.
  // More details: https://marked.js.org/using_pro#async
  async: true,
  walkTokens: docsWalkTokens,
});

main();

async function main() {
  /** Create temporary folder which helps to generate mermaid diagrams in the svg format */
  await createTempMermaidFolder();

  /** Generate Docs Content */
  await generateContent(
    join(PROJECT_FOLDER_PATH, 'content'),
    join(PROJECT_FOLDER_PATH, 'assets', 'content'),
  );

  /** Copy the images from source content folder to assets */
  await copyFolder(
    join(PROJECT_FOLDER_PATH, 'content', 'images'),
    join(PROJECT_FOLDER_PATH, 'assets', 'content', 'images'),
  );

  /** Remove temp folder */
  await cleanUp();
}

async function generateContent(baseDir: string, distDir: string) {
  const consoleTimeLabel = '\nMarkdown files processed in';

  console.info(`Processing markdown files...`);
  console.time(consoleTimeLabel);

  /** List of all markdown files in the content directory. */
  const files = await retrieveAllMarkdownFiles(baseDir);

  /** These directories have no markdown destined to be in the docs */
  const skipDirectories = ['examples'];

  const filteredFiles = files.filter((f) => !skipDirectories.some((dir) => f.path.startsWith(dir)));

  await Promise.all(
    filteredFiles.map((file) =>
      mkdir(join(distDir, dirname(file.path)), {recursive: true}).catch(console.error),
    ),
  );

  let hadWarnings = false;
  for (let index = 0; index < filteredFiles.length; index++) {
    const file = filteredFiles[index];

    // Basic progress report
    process.stdout.write('\r\x1b[K');
    process.stdout.write(`${index}/${filteredFiles.length} - Processing ${file.path}`);
    // keep in mind write doesn't write a newline like console.log does

    // Logging is handcrafted because markedjs provides no solution
    // Moreover it has no context of filename as it is only string based
    // So we're using a global `logs` array
    if (logs.length) {
      console.warn('\n');
      logs.forEach((log) => {
        console.warn(`${file.path}: ${log}`);
      });
      console.warn('\n');
      logs.length = 0;
      hadWarnings = true;
    }

    setCurrentParsedFilePath(file.path);
    const processedFile = await marked.parse(file.content, {async: true});
    const htmlFilePath = `${file.path}.html`;
    await writeFile(join(distDir, htmlFilePath), processedFile.toString());
  }

  if (hadWarnings) {
    console.warn(
      `\n\nYou can resolve the ambiguities by editing the mentioned file(s) and adding a specific link using the Markdown syntax.`,
    );
  }

  console.timeEnd(consoleTimeLabel);
}

async function createTempMermaidFolder() {
  if (!existsSync(MERMAID_TEMP_FOLDER)) {
    await mkdir(MERMAID_TEMP_FOLDER);
  }
}

async function cleanUp() {
  if (existsSync(MERMAID_TEMP_FOLDER)) {
    await rm(MERMAID_TEMP_FOLDER, {recursive: true});
  }
}

async function copyFolder(source: string, destination: string) {
  if (!existsSync(destination)) {
    await mkdir(destination);
  }

  const files = await readdir(source);

  for (const file of files) {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);

    const stats = await stat(sourcePath);

    (await stats.isDirectory()) ? copyFolder(sourcePath, destPath) : copyFile(sourcePath, destPath);
  }
}
