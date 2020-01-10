/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageToPackageJson} from './package-config';

/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @angular/cdk`.
 *
 * By default, the CLI already installs the package that has been specified with `ng add`.
 * We just store the version in the `package.json` in case the package manager didn't. Also
 * this ensures that there will be no error that says that the CDK does not support `ng add`.
 */
export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {
    // In order to align the CDK version with other Angular dependencies that are setup
    // by "@schematics/angular", we use tilde instead of caret. This is default for Angular
    // dependencies in new CLI projects.
    addPackageToPackageJson(host, '@angular/cdk', `~0.0.0-PLACEHOLDER`);

    // Add a task to run the package manager. This is necessary because we updated the
    // workspace "package.json" file and we want lock files to reflect the new version range.
    context.addTask(new NodePackageInstallTask());
  };
}
