/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, Tree, SchematicContext, TaskId} from '@angular-devkit/schematics';
import {NodePackageInstallTask, RunSchematicTask} from '@angular-devkit/schematics/tasks';
import {addPackageToPackageJson, getPackageVersionFromPackageJson} from './package-json';
import {Schema} from './schema';
import {hammerjsVersion, materialVersion, requiredAngularVersionRange} from './version-names';

/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @angular/material`.
 *
 * Since the Angular Material schematics depend on the schematic utility functions from the CDK,
 * we need to install the CDK before loading the schematic files that import from the CDK.
 */
export default function(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    // Since the Angular Material schematics depend on the schematic utility functions from the
    // CDK, we need to install the CDK before loading the schematic files that import from the CDK.
    let installTaskId: TaskId;

    if (!options.skipPackageJson) {
      // Version tag of the `@angular/core` dependency that has been loaded from the `package.json`
      // of the CLI project. This tag should be preferred because all Angular dependencies should
      // have the same version tag if possible.
      const ngCoreVersionTag = getPackageVersionFromPackageJson(host, '@angular/core');

      addPackageToPackageJson(host, '@angular/cdk', `^${materialVersion}`);
      addPackageToPackageJson(host, '@angular/material', `^${materialVersion}`);
      addPackageToPackageJson(host, '@angular/animations',
          ngCoreVersionTag || requiredAngularVersionRange);

      if (options.gestures) {
        addPackageToPackageJson(host, 'hammerjs', hammerjsVersion);
      }

      installTaskId = context.addTask(new NodePackageInstallTask());
    } else {
      installTaskId = context.addTask(new NodePackageInstallTask({
        packageName: `@angular/cdk@^${materialVersion}`
      }));
    }

    context.addTask(new RunSchematicTask('ng-add-setup-project', options), [installTaskId]);
  };
}
