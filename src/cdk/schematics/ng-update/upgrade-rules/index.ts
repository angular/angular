/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, TaskId, Tree} from '@angular-devkit/schematics';
import {RunSchematicTask, TslintFixTask} from '@angular-devkit/schematics/tasks';
import {sync as globSync} from 'glob';
import {getProjectTsConfigPaths} from './project-tsconfig-paths';
import {TargetVersion} from '../target-version';
import {createTslintConfig, UpgradeTSLintConfig} from './tslint-config';

/** Creates a Angular schematic rule that runs the upgrade for the specified target version. */
export function createUpgradeRule(targetVersion: TargetVersion,
                                  upgradeConfig: UpgradeTSLintConfig): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const tslintFixTasks: TaskId[] = [];

    if (!projectTsConfigPaths.length) {
      throw new Error('Could not find any tsconfig file. Please submit an issue on the Angular ' +
        'Material repository that includes the name of your TypeScript configuration.');
    }
    // In some applications, developers will have global stylesheets which are not specified in any
    // Angular component. Therefore we glob up all CSS and SCSS files outside of node_modules and
    // dist. The files will be read by the individual stylesheet rules and checked.
    const extraStyleFiles = globSync('!(node_modules|dist)/**/*.+(css|scss)', {absolute: true});
    const tslintConfig = createTslintConfig(targetVersion, {
      // Default options that can be overwritten if specified explicitly. e.g. if the
      // Material update schematic wants to specify a different upgrade data.
      extraStyleFiles: extraStyleFiles,
      // Custom upgrade configuration options.
      ...upgradeConfig,
    });

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
