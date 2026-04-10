/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {JSONFile} from '@schematics/angular/utility/json-file';
import ts from 'typescript';
import {dirname, join} from 'node:path';

function getResolvedAngularCompilerOptions(tree: any, tsconfigPath: string): Record<string, any> {
  if (!tree.exists(tsconfigPath)) return {};

  const sourceFile = ts.readJsonConfigFile(tsconfigPath, (path) => tree.readText(path));
  const config = ts.convertToObject(sourceFile, []);

  let angularOptions = config.angularCompilerOptions || {};

  // Manually resolve inheritance for Angular-specific options.
  // Since the TypeScript API doesn't perform a deep merge of custom/non-standard keys
  // during config parsing, we must traverse the inheritance chain manually
  if (config.extends) {
    // Management extends property...
    const parentPath = join(dirname(tsconfigPath), config.extends);

    const parentOptions = getResolvedAngularCompilerOptions(tree, parentPath);

    // Merge: the options of the current file overwrite those of the parent
    angularOptions = {
      ...parentOptions,
      ...angularOptions,
    };
  }

  return angularOptions;
}

/**
 * Migration that adds `strictTemplates: false` to `tsconfig.json` files.
 */
export function migrate(): Rule {
  return async (tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const allPaths = [...new Set([...buildPaths, ...testPaths])];

    for (const tsconfigPath of allPaths) {
      const json = new JSONFile(tree, tsconfigPath);
      const compilerOptions = json.get(['compilerOptions']);

      if (
        !compilerOptions ||
        typeof compilerOptions !== 'object' ||
        Object.keys(compilerOptions).length === 0
      ) {
        continue;
      }

      const angularOptions = getResolvedAngularCompilerOptions(tree, tsconfigPath);

      if (angularOptions['strictTemplates'] !== undefined) {
        continue;
      }

      if (json.get(['angularCompilerOptions', 'strictTemplates']) === undefined) {
        json.modify(['angularCompilerOptions', 'strictTemplates'], false);
      }
    }
  };
}
