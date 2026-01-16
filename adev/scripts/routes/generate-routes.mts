/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ALL_ITEMS} from '../../src/app/routing/navigation-entries/index.js';
import {NavigationItem} from '@angular/docs';
import {writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';

const outputFile = 'defined-routes.json';
const contentRoot = resolve(process.cwd(), '../../src/content');

/**
 * The scripts generates a list of all defined routes in the guides section and stores them
 * in a JSON file. This file then used by other bazel targets to know which routes are valid.
 */

function extractRoutes(items: NavigationItem[]): string[] {
  const routes: string[] = [];
  for (const item of items) {
    if (item.path && !item.path.startsWith('http')) {
      routes.push(item.path);
      if (item.contentPath) {
        const content = readFileSync(join(contentRoot, `${item.contentPath}.md`), {
          encoding: 'utf-8',
        });
        const headings = extractHeadings(content);
        routes.push(
          ...headings.map(
            (heading) => `${item.path}#${heading.toLowerCase().replace(/\s+/g, '-')}`,
          ),
        );
      }
    }
    if (item.children) {
      routes.push(...extractRoutes(item.children));
    }
  }
  return routes;
}

function extractHeadings(content: string): string[] {
  const headings = content
    .split('\n')
    // Top level heading (H1) are used for the page title only
    // and yes, headings can have leading spaces
    .filter((line) => line.trim().startsWith('##'))
    .map((line) => line.replace(/^#+\s*/, '').trim());

  const stepRegex = /<docs-step[^>]*title="([^"]*)"/g;
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    headings.push(match[1]);
  }

  return headings.map((heading: string) => getIdFromHeading(heading));
}

function main() {
  const allRoutes: string[] = [];

  allRoutes.push(...extractRoutes(ALL_ITEMS));

  const uniqueRoutes = Array.from(new Set(allRoutes.filter((r) => !!r)));

  console.warn('Generated routes:', JSON.stringify(uniqueRoutes, null, 2));
  writeFileSync(outputFile, JSON.stringify(uniqueRoutes, null, 2));
}

main();

// TODO: refactor so this function is shared with the generation pipeline (adev/shared-docs/pipeline/shared/marked/transformations/heading.mts)
function getIdFromHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/\s|\//g, '-') // replace spaces and slashes with dashes
    .replace(/[^\p{L}\d\-]/gu, ''); // only keep letters, digits & dashes
}
