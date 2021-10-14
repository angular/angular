/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProjectDefinition, TargetDefinition} from '@angular-devkit/core/src/workspace';
import {JsonValue} from '@angular-devkit/core';
import {SchematicsException} from '@angular-devkit/schematics';

/** Object that maps a CLI target to its default builder name. */
export const defaultTargetBuilders = {
  build: '@angular-devkit/build-angular:browser',
  test: '@angular-devkit/build-angular:karma',
};

/** Resolves the architect options for the build target of the given project. */
export function getProjectTargetOptions(
  project: ProjectDefinition,
  buildTarget: string,
): Record<string, JsonValue | undefined> {
  const options = project.targets?.get(buildTarget)?.options;

  if (!options) {
    throw new SchematicsException(
      `Cannot determine project target configuration for: ${buildTarget}.`,
    );
  }

  return options;
}

/** Gets all targets from the given project that match the specified builder name. */
export function getTargetsByBuilderName(
  project: ProjectDefinition,
  builderName: string,
): TargetDefinition[] {
  return Array.from(project.targets.keys())
    .filter(name => project.targets.get(name)?.builder === builderName)
    .map(name => project.targets.get(name)!);
}
