/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {runStaticQueryMigration} from './migration';

/** Entry point for the V8 static-query migration. */
export default function(): Rule {
  return (tree: Tree) => {
    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!projectTsConfigPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate queries ' +
          'to explicit timing.');
    }

    for (const tsconfigPath of projectTsConfigPaths) {
      runStaticQueryMigration(tree, tsconfigPath, basePath);
    }
  };
}
