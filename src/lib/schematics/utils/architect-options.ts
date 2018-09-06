/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@schematics/angular/utility/config';

/** Resolves the architect options for the build target of the given project. */
export function getArchitectOptions(project: WorkspaceProject, buildTarget: string) {
  if (project.architect &&
      project.architect[buildTarget] &&
      project.architect[buildTarget].options) {

    return project.architect[buildTarget].options;
  }

  throw new Error(`Cannot determine architect configuration for target: ${buildTarget}.`);
}
