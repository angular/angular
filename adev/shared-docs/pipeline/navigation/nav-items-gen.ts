// /*!
//  * @license
//  * Copyright Google LLC All Rights Reserved.
//  *
//  * Use of this source code is governed by an MIT-style license that can be
//  * found in the LICENSE file at https://angular.dev/license
//  */

import fs from 'fs';
import readline from 'readline';
import {basename, dirname, resolve} from 'path';

import {NavigationItem} from '../../interfaces';
import {NavigationItemGenerationStrategy} from './types';

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
    const firstLine = await getTextfileFirstLine(fullPath);

    navItems.push({
      label: labelGeneratorFn(name, firstLine),
      path: `${pathPrefix}/${name}`,
      contentPath: `${contentPath}/${name}`,
    });
  }

  return navItems;
}

/** Extract the first line of a text file optimally. */
async function getTextfileFirstLine(filePath: string): Promise<string> {
  const readStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({input: readStream});

  const line = await new Promise<string>((resolve) =>
    rl.on('line', (line) => {
      rl.close();
      resolve(line);
    }),
  );
  readStream.destroy();

  return line;
}
