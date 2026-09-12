/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ALL_ITEMS} from '../../src/app/routing/navigation-entries/index.js';
import {extractHeadingIds, findDuplicateIds} from '../../shared-docs/pipeline/shared/heading.mjs';
import {NavigationItem} from '@angular/docs';
import {writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';

const outputFile = 'defined-routes.json';
const contentRoot = resolve(process.cwd(), '../../src/content');

/**
 * The scripts generates a list of all defined routes in the guides section and stores them
 * in a JSON file. This file then used by other bazel targets to know which routes are valid.
 */

function extractRoutes(items: NavigationItem[], duplicatesByPage: Map<string, string[]>): string[] {
  const routes: string[] = [];
  for (const item of items) {
    if (item.path && !item.path.startsWith('http')) {
      routes.push(item.path);
      if (item.contentPath) {
        const content = readFileSync(join(contentRoot, `${item.contentPath}.md`), {
          encoding: 'utf-8',
        });
        const headings = extractHeadingIds(content);
        const duplicates = findDuplicateIds(headings);
        if (duplicates.length > 0) {
          duplicatesByPage.set(`${item.contentPath}.md`, duplicates);
        }
        routes.push(
          ...headings.map(
            (heading) => `${item.path}#${heading.toLowerCase().replace(/\s+/g, '-')}`,
          ),
        );
      }
    }
    if (item.children) {
      routes.push(...extractRoutes(item.children, duplicatesByPage));
    }
  }
  return routes;
}

function main() {
  const allRoutes: string[] = [];
  const duplicatesByPage = new Map<string, string[]>();

  allRoutes.push(...extractRoutes(ALL_ITEMS, duplicatesByPage));

  if (duplicatesByPage.size > 0) {
    const details = Array.from(duplicatesByPage)
      .map(([page, ids]) => `  ${page}: ${ids.map((id) => `#${id}`).join(', ')}`)
      .join('\n');
    throw new Error(
      `Headings must produce a unique anchor id within a page, otherwise every link to the ` +
        `anchor resolves to the first heading that claims it. Give the later heading its own ` +
        `id with the \`{#custom-id}\` syntax.\n${details}`,
    );
  }

  const uniqueRoutes = Array.from(new Set(allRoutes.filter((r) => !!r)));

  console.warn('Generated routes:', JSON.stringify(uniqueRoutes, null, 2));
  writeFileSync(outputFile, JSON.stringify(uniqueRoutes, null, 2));
}

main();
