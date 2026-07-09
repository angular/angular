/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, Tree} from '@angular-devkit/schematics';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {JSONFile} from '@schematics/angular/utility/json-file';

export function migrate(): Rule {
  return async (tree: Tree) => {
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

      json.modify(
        ['angularCompilerOptions', 'extendedDiagnostics', 'checks', 'nullishCoalescingNotNullable'],
        'suppress',
      );
      json.modify(
        ['angularCompilerOptions', 'extendedDiagnostics', 'checks', 'optionalChainNotNullable'],
        'suppress',
      );
    }
  };
}
