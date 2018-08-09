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
import * as path from 'path';

/** Entry point for `ng update` from Angular CLI. */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const allTsConfigPaths = getTsConfigPaths(tree);
    const tslintFixTasks: TaskId[] = [];

    if (!allTsConfigPaths.length) {
      throw new Error('Could not find any tsconfig file. Please submit an issue on the Angular ' +
        'Material repository that includes the name of your TypeScript configuration.');
    }

    for (const tsconfig of allTsConfigPaths) {
      // Run the update tslint rules.
      tslintFixTasks.push(context.addTask(new TslintFixTask({
        rulesDirectory: [
          path.join(__dirname, 'rules/'),
          path.join(__dirname, 'rules/attribute-selectors'),
        ],
        rules: {
          // Automatic fixes.
          'switch-identifiers': true,
          'switch-property-names': true,
          'switch-string-literal-css-names': true,
          'switch-string-literal-element-selectors': true,
          'switch-stylesheet-css-names': true,
          'switch-stylesheet-element-selectors': true,
          'switch-stylesheet-input-names': true,
          'switch-stylesheet-output-names': true,
          'switch-template-css-names': true,
          'switch-template-element-selectors': true,
          'switch-template-export-as-names': true,
          'switch-template-input-names': true,
          'switch-template-output-names': true,

          // Attribute selector update rules.
          'attribute-selectors-string-literal': true,
          'attribute-selectors-stylesheet': true,
          'attribute-selectors-template': true,

          // Additional issues we can detect but not automatically fix.
          'check-class-declaration-misc': true,
          'check-identifier-misc': true,
          'check-import-misc': true,
          'check-inheritance': true,
          'check-method-calls': true,
          'check-property-access-misc': true,
          'check-template-misc': true
        }
      }, {
        silent: false,
        ignoreErrors: true,
        tsConfigPath: tsconfig,
      })));
    }

    // Delete the temporary schematics directory.
    context.addTask(new RunSchematicTask('ng-post-update', {}), tslintFixTasks);
  };
}

/** Post-update schematic to be called when update is finished. */
export function postUpdate(): Rule {
  return () => console.log(
      '\nComplete! Please check the output above for any issues that were detected but could not' +
      ' be automatically fixed.');
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
