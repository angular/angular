/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonParseMode, normalize, parseJson} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';
import {WorkspaceProject, WorkspaceSchema} from '@schematics/angular/utility/workspace-models';

/** Name of the default Angular CLI workspace configuration files. */
const defaultWorkspaceConfigPaths = ['/angular.json', '/.angular.json'];

/** Gets the tsconfig path from the given target within the specified project. */
export function getTargetTsconfigPath(project: WorkspaceProject, targetName: string): string|null {
  if (project.targets && project.targets[targetName] && project.targets[targetName].options &&
      project.targets[targetName].options.tsConfig) {
    return normalize(project.targets[targetName].options.tsConfig);
  }

  if (project.architect && project.architect[targetName] && project.architect[targetName].options &&
      project.architect[targetName].options.tsConfig) {
    return normalize(project.architect[targetName].options.tsConfig);
  }
  return null;
}

/**
 * Resolve the workspace configuration of the specified tree gracefully. We cannot use the utility
 * functions from the default Angular schematics because those might not be present in older
 * versions of the CLI. Also it's important to resolve the workspace gracefully because
 * the CLI project could be still using `.angular-cli.json` instead of thew new config.
 */
export function getWorkspaceConfigGracefully(tree: Tree): null|WorkspaceSchema {
  const path = defaultWorkspaceConfigPaths.find(filePath => tree.exists(filePath));
  const configBuffer = tree.read(path!);

  if (!path || !configBuffer) {
    return null;
  }

  try {
    // Parse the workspace file as JSON5 which is also supported for CLI
    // workspace configurations.
    return parseJson(configBuffer.toString(), JsonParseMode.Json5) as unknown as WorkspaceSchema;
  } catch (e) {
    return null;
  }
}
