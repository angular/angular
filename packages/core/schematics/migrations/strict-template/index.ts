/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';

/**
 * Migration that adds `strictTemplates: false` to `tsconfig.json` files.
 */
export function migrate(): Rule {
  return async (tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const allPaths = [...new Set([...buildPaths, ...testPaths])];

    for (const path of allPaths) {
      const content = tree.read(path);
      if (!content) continue;

      const contentStr = content.toString('utf-8');

      // Check if it's already there to avoid parsing if not needed.
      if (contentStr.includes('strictTemplates')) {
        continue;
      }

      try {
        // Use a simple JSON.parse for now. In a real world scenario we might want to use
        // a parser that supports comments (JSONC), but for this migration it's likely
        // that tsconfig files are standard enough or that overwriting them is acceptable
        // in the context of an ng update.
        const json = JSON.parse(contentStr);

        if (!json.compilerOptions || Object.keys(json.compilerOptions).length === 0) {
          continue;
        }

        if (!json.angularCompilerOptions) {
          json.angularCompilerOptions = {strictTemplates: false};
          tree.overwrite(path, JSON.stringify(json, null, 2));
          continue;
        }

        if (json.angularCompilerOptions.strictTemplates === undefined) {
          json.angularCompilerOptions.strictTemplates = false;
          tree.overwrite(path, JSON.stringify(json, null, 2));
        }
      } catch (e) {
        // If parsing fails, skip the file to avoid corrupting it.
        continue;
      }
    }
  };
}
