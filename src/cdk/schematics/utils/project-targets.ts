/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@angular-devkit/core/src/experimental/workspace';
import {SchematicsException} from '@angular-devkit/schematics';
import {BuilderTarget} from '@schematics/angular/utility/workspace-models';

/** Object that maps a CLI target to its default builder name. */
export const defaultTargetBuilders = {
  build: '@angular-devkit/build-angular:browser',
  test: '@angular-devkit/build-angular:karma',
};

/** Resolves the architect options for the build target of the given project. */
export function getProjectTargetOptions(project: WorkspaceProject, buildTarget: string) {
  if (project.targets && project.targets[buildTarget] && project.targets[buildTarget].options) {
    return project.targets[buildTarget].options;
  }

  // TODO(devversion): consider removing this architect check if the CLI completely switched
  // over to `targets`, and the `architect` support has been removed.
  // See: https://github.com/angular/angular-cli/commit/307160806cb48c95ecb8982854f452303801ac9f
  if (project.architect && project.architect[buildTarget] &&
      project.architect[buildTarget].options) {
    return project.architect[buildTarget].options;
  }

  throw new SchematicsException(
      `Cannot determine project target configuration for: ${buildTarget}.`);
}

/** Gets all targets from the given project that match the specified builder name. */
export function getTargetsByBuilderName(
    project: WorkspaceProject, builderName: string): BuilderTarget<any, unknown>[] {
  const targets = project.targets || project.architect || {};
  return Object.keys(targets)
      .filter(name => targets[name].builder === builderName)
      .map(name => targets[name]);
}
