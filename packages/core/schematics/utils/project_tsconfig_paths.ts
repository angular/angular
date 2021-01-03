/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonParseMode, normalize, parseJson} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/workspace-models';

/** Name of the default Angular CLI workspace configuration files. */
const defaultWorkspaceConfigPaths = ['/angular.json', '/.angular.json'];

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 */
export function getProjectTsConfigPaths(tree: Tree): {buildPaths: string[], testPaths: string[]} {
  // Start with some tsconfig paths that are generally used within CLI projects. Note
  // that we are not interested in IDE-specific tsconfig files (e.g. /tsconfig.json)
  const buildPaths = new Set<string>(['src/tsconfig.app.json']);
  const testPaths = new Set<string>(['src/tsconfig.spec.json']);

  // Add any tsconfig directly referenced in a build or test task of the angular.json workspace.
  const workspace = getWorkspaceConfigGracefully(tree);

  if (workspace) {
    const projects = Object.keys(workspace.projects).map(name => workspace.projects[name]);
    for (const project of projects) {
      const buildPath = getTargetTsconfigPath(project, 'build');
      const testPath = getTargetTsconfigPath(project, 'test');

      if (buildPath) {
        buildPaths.add(buildPath);
      }

      if (testPath) {
        testPaths.add(testPath);
      }
    }
  }

  // Filter out tsconfig files that don't exist in the CLI project.
  return {
    buildPaths: Array.from(buildPaths).filter(p => tree.exists(p)),
    testPaths: Array.from(testPaths).filter(p => tree.exists(p)),
  };
}

/** Gets the tsconfig path from the given target within the specified project. */
function getTargetTsconfigPath(project: WorkspaceProject, targetName: string): string|null {
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
function getWorkspaceConfigGracefully(tree: Tree): any {
  const path = defaultWorkspaceConfigPaths.find(filePath => tree.exists(filePath));
  const configBuffer = tree.read(path!);

  if (!path || !configBuffer) {
    return null;
  }

  try {
    // Parse the workspace file as JSON5 which is also supported for CLI
    // workspace configurations.
    return parseJson(configBuffer.toString(), JsonParseMode.Json5);
  } catch (e) {
    return null;
  }
}
