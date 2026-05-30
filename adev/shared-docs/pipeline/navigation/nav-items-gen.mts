/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import readline from 'readline';
import {basename, dirname, resolve} from 'path';

import {NavigationItem} from '../../interfaces';
import {NavigationItemGenerationStrategy} from './types.mjs';

/**
 * Generate navigations items by a provided strategy.
 *
 * @param mdFilesPaths Paths to the Markdown files that represent the page contents
 * @param strategy Strategy
 * @returns An array with navigation items
 */
export async function generateNavItems(
  mdFilesPaths: string[],
  strategy: NavigationItemGenerationStrategy,
): Promise<NavigationItem[]> {
  const navItems: NavigationItem[] = [];
  const {labelGeneratorFn, pathPrefix, contentPath} = strategy;

  for (const path of mdFilesPaths) {
    const fullPath = resolve(dirname(path), basename(path));
    const name = path.split('/').pop()?.replace('.md', '')!;
    const firstLine = await getMdFileHeading(fullPath);

    navItems.push({
      label: labelGeneratorFn(name, firstLine),
      path: `${pathPrefix}/${name}`,
      contentPath: `${contentPath}/${name}`,
    });
  }

  return navItems;
}

/** Extract the first heading from a Markdown file. */
async function getMdFileHeading(filePath: string): Promise<string> {
  const readStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({input: readStream});

  for await (const line of rl) {
    if (line.trim().startsWith('#')) {
      rl.close();
      readStream.destroy();
      return line.replace(/^#+[ \t]+/, '');
    }
  }

  return '';
}
