/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, TaskId, Tree} from '@angular-devkit/schematics';
import {RunSchematicTask, TslintFixTask} from '@angular-devkit/schematics/tasks';
import {TargetVersion} from './index';
import {getProjectTsConfigPaths} from './project-tsconfig-paths';
import {createTslintConfig} from './tslint-update';

/** Entry point for `ng update` from Angular CLI. */
export function createUpdateRule(targetVersion: TargetVersion): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const tslintFixTasks: TaskId[] = [];

    if (!projectTsConfigPaths.length) {
      throw new Error('Could not find any tsconfig file. Please submit an issue on the Angular ' +
        'Material repository that includes the name of your TypeScript configuration.');
    }

    const tslintConfig = createTslintConfig(targetVersion);

    for (const tsconfig of projectTsConfigPaths) {
      // Run the update tslint rules.
      tslintFixTasks.push(context.addTask(new TslintFixTask(tslintConfig, {
        silent: false,
        ignoreErrors: true,
        tsConfigPath: tsconfig,
      })));
    }

    // Delete the temporary schematics directory.
    context.addTask(new RunSchematicTask('ng-post-update', {}), tslintFixTasks);
  };
}
