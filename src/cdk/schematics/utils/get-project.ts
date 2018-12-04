/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceSchema, WorkspaceProject} from '@angular-devkit/core/src/workspace';
import {SchematicsException} from '@angular-devkit/schematics';

/**
 * Finds the specified project configuration in the workspace. Throws an error if the project
 * couldn't be found.
 */
export function getProjectFromWorkspace(
    workspace: WorkspaceSchema,
    projectName?: string): WorkspaceProject {

  const project = workspace.projects[projectName || workspace.defaultProject!];

  if (!project) {
    throw new SchematicsException(`Could not find project in workspace: ${projectName}`);
  }

  return project;
}
