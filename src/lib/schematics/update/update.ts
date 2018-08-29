/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, TaskId, Tree} from '@angular-devkit/schematics';
import {RunSchematicTask, TslintFixTask} from '@angular-devkit/schematics/tasks';
import {getWorkspace} from '@schematics/angular/utility/config';
import {TargetVersion} from './index';
import {createTslintConfig} from './tslint-update';

/** Entry point for `ng update` from Angular CLI. */
export function createUpdateRule(targetVersion: TargetVersion): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const allTsConfigPaths = getTsConfigPaths(tree);
    const tslintFixTasks: TaskId[] = [];

    if (!allTsConfigPaths.length) {
      throw new Error('Could not find any tsconfig file. Please submit an issue on the Angular ' +
        'Material repository that includes the name of your TypeScript configuration.');
    }

    const tslintConfig = createTslintConfig(targetVersion);

    for (const tsconfig of allTsConfigPaths) {
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

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 */
function getTsConfigPaths(tree: Tree): string[] {
  // Start with some tsconfig paths that are generally used.
  const tsconfigPaths = [
    './tsconfig.json',
    './src/tsconfig.json',
    './src/tsconfig.app.json',
  ];

  // Add any tsconfig directly referenced in a build or test task of the angular.json workspace.
  const workspace = getWorkspace(tree);

  for (const project of Object.values(workspace.projects)) {
    if (project && project.architect) {
      for (const taskName of ['build', 'test']) {
        const task = project.architect[taskName];
        if (task && task.options && task.options.tsConfig) {
          const tsConfigOption = task.options.tsConfig;
          if (typeof tsConfigOption === 'string') {
            tsconfigPaths.push(tsConfigOption);
          } else if (Array.isArray(tsConfigOption)) {
            tsconfigPaths.push(...tsConfigOption);
          }
        }
      }
    }
  }

  // Filter out tsconfig files that don't exist and remove any duplicates.
  return tsconfigPaths
      .filter(p => tree.exists(p))
      .filter((value, index, self) => self.indexOf(value) === index);
}
