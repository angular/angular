/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 */
export function getProjectTsConfigPaths(tree: Tree): string[] {
  // Start with some tsconfig paths that are generally used within CLI projects.
  const tsconfigPaths = new Set<string>([
    './tsconfig.json',
    './src/tsconfig.json',
    './src/tsconfig.app.json',
  ]);

  // Add any tsconfig directly referenced in a build or test task of the angular.json workspace.
  const workspace = getWorkspace(tree);

  for (const project of Object.values(workspace.projects)) {
    ['build', 'test'].forEach(targetName => {
      if (project.targets &&
          project.targets[targetName] &&
          project.targets[targetName].options &&
          project.targets[targetName].options.tsConfig) {
        tsconfigPaths.add(project.targets[targetName].options.tsConfig);
      }

      if (project.architect &&
          project.architect[targetName] &&
          project.architect[targetName].options &&
          project.architect[targetName].options.tsConfig) {
        tsconfigPaths.add(project.architect[targetName].options.tsConfig);
      }
    });
  }

  // Filter out tsconfig files that don't exist in the CLI project.
  return Array.from(tsconfigPaths).filter(p => tree.exists(p));
}
