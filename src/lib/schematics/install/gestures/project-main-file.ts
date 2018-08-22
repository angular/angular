/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/config';

/** Looks for the main TypeScript file in the given project and returns its path. */
export function getProjectMainFile(project: WorkspaceProject): string {
  const buildTarget = project.architect.build.options;

  if (buildTarget.main) {
    return buildTarget.main;
  }

  throw new SchematicsException(
    'Could not find the project main file inside of the workspace config.');
}
