/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Path} from '@angular-devkit/core';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {defaultTargetBuilders, getTargetsByBuilderName} from './project-targets';

/** Gets the path of the index file in the given project. */
export function getProjectIndexFiles(project: ProjectDefinition): Path[] {
  const paths = getTargetsByBuilderName(project, defaultTargetBuilders.build)
    .filter(t => t.options?.index)
    .map(t => t.options!.index as Path);

  // Use a set to remove duplicate index files referenced in multiple build targets of a project.
  return Array.from(new Set(paths));
}
