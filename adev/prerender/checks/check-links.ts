/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console */
import {NavigationItem} from '@angular/docs';
import {readFileSync} from 'fs';
import {glob} from 'glob';
import {join} from 'path';

import {SUB_NAVIGATION_DATA} from '../../src/app/sub-navigation-data';

// PATHS
const PROJECT_FOLDER_PATH = join(__dirname, '../../src');

// SKIP Files
const SKIPED_ORPHAN = ['kitchen-sink', 'error', 'examples'];

main();

async function main() {
  const contentDir = join(PROJECT_FOLDER_PATH, 'content');
  const mdFiles = await retrieveAllMarkdownFiles(contentDir);

  const allowedPaths = new Set([
    ...SUB_NAVIGATION_DATA.docs.flatMap((item: any) => getPaths(item)),
    SUB_NAVIGATION_DATA.reference.flatMap((item: any) => getPaths(item)),
    SUB_NAVIGATION_DATA.footer.flatMap((item: any) => getPaths(item)),
  ]);

  const contentPaths = new Set([
    ...SUB_NAVIGATION_DATA.docs.flatMap((item: any) => getContentPaths(item)),
    ...SUB_NAVIGATION_DATA.reference.flatMap((item: any) => getContentPaths(item)),
    ...SUB_NAVIGATION_DATA.footer.flatMap((item: any) => getContentPaths(item)),
  ]);

  // Regular expression to match relative links
  const regex = /\]\((?!https?:\/\/)([^)]+)\)/g;

  const orphanFiles: string[] = [];
  for (const {path} of mdFiles) {
    if (
      !contentPaths.has(path.slice(0, -3)) &&
      !path.startsWith('tutorials') &&
      !SKIPED_ORPHAN.some((skip) => path.startsWith(skip))
    ) {
      orphanFiles.push(path.slice(0, -3));
    }
  }
  if (orphanFiles.length > 0) {
    console.log('======== ORPHAN FILES =========\n');
    orphanFiles.forEach((file) => console.warn(file));
  }

  const deadLinks: {path: string; links: string[]}[] = [];
  for (const {content, path} of mdFiles) {
    let match;
    const matches = [];
    while ((match = regex.exec(content)) !== null) {
      const relativeLink = match[1].split('#')[0];
      if (!allowedPaths.has(relativeLink) && relativeLink.startsWith('guide')) {
        matches.push(relativeLink);
      }
    }
    if (matches.length) {
      deadLinks.push({path, links: matches});
    }
  }
  if (deadLinks.length > 0) {
    console.warn('\n\n======== DEAD RELATIVE LINKS =========\n');
    deadLinks.forEach(({path, links}) => {
      console.warn(path);
      links.forEach((path) => console.log(`\t ${path}`));
    });
  }

  if (deadLinks.length > 0 || orphanFiles.length > 0) {
    throw new Error('Check fails');
  }
}

function getPaths(navItem: NavigationItem): string[] {
  return [
    ...(navItem.path ? [navItem.path] : []),
    ...(navItem.children ?? []).flatMap((item) => getPaths(item)),
  ];
}

function getContentPaths(navItem: NavigationItem): string[] {
  return [
    ...(navItem.contentPath ? [navItem.contentPath] : []),
    ...(navItem.children ?? []).flatMap((item) => getContentPaths(item)),
  ];
}

/**
 * Recursively search the provided directory for all markdown files and
 * asyncronously load them.
 */
async function retrieveAllMarkdownFiles(
  baseDir: string,
): Promise<{path: string; content: string}[]> {
  const files = await glob('**/*.md', {
    root: baseDir,
    cwd: baseDir,
    ignore: ['**/node_modules/**'],
  });

  return files.map((fullPathToFile) => ({
    path: fullPathToFile,
    content: readFileSync(join(baseDir, fullPathToFile), {encoding: 'utf-8'}),
  }));
}
