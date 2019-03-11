/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';

/** Name of the default Angular CLI workspace configuration files. */
const defaultWorkspaceConfigPaths = ['/angular.json', '/.angular.json'];

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 */
export function getProjectTsConfigPaths(tree: Tree): string[] {
  // Start with some tsconfig paths that are generally used within CLI projects.
  const tsconfigPaths = new Set<string>([
    'tsconfig.json',
    'src/tsconfig.json',
    'src/tsconfig.app.json',
  ]);

  // Add any tsconfig directly referenced in a build or test task of the angular.json workspace.
  const workspace = getWorkspaceConfigGracefully(tree);

  if (workspace) {
    for (const project of Object.values<any>(workspace.projects)) {
      ['build', 'test'].forEach(targetName => {
        if (project.targets && project.targets[targetName] && project.targets[targetName].options &&
            project.targets[targetName].options.tsConfig) {
          tsconfigPaths.add(normalize(project.targets[targetName].options.tsConfig));
        }

        if (project.architect && project.architect[targetName] &&
            project.architect[targetName].options &&
            project.architect[targetName].options.tsConfig) {
          tsconfigPaths.add(normalize(project.architect[targetName].options.tsConfig));
        }
      });
    }
  }

  // Filter out tsconfig files that don't exist in the CLI project.
  return Array.from(tsconfigPaths).filter(p => tree.exists(p));
}

/**
 * Resolve the workspace configuration of the specified tree gracefully. We cannot use the utility
 * functions from the default Angular schematics because those might not be present in older
 * versions of the CLI. Also it's important to resolve the workspace gracefully because
 * the CLI project could be still using `.angular-cli.json` instead of thew new config.
 */
function getWorkspaceConfigGracefully(tree: Tree): any {
  const path = defaultWorkspaceConfigPaths.find(filePath => tree.exists(filePath));
  const configBuffer = tree.read(path!);

  if (!path || !configBuffer) {
    return null;
  }

  try {
    return JSON.parse(configBuffer.toString());
  } catch {
    return null;
  }
}
