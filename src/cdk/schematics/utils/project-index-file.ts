/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@angular-devkit/core/src/experimental/workspace';
import {BrowserBuilderTarget} from '@schematics/angular/utility/workspace-models';
import {defaultTargetBuilders, getTargetsByBuilderName} from './project-targets';

/** Gets the path of the index file in the given project. */
export function getProjectIndexFiles(project: WorkspaceProject): string[] {
  // Use a set to remove duplicate index files referenced in multiple build targets
  // of a project.
  return [...new Set(
      (getTargetsByBuilderName(project, defaultTargetBuilders.build) as BrowserBuilderTarget[])
          .filter(t => t.options.index)
          .map(t => t.options.index!))];
}
