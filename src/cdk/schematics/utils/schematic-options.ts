/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@angular-devkit/core/src/experimental/workspace';


/**
 * Returns the default options for the `@schematics/angular:component` schematic which would
 * have been specified at project initialization (ng new or ng init).
 *
 * This is necessary because the Angular CLI only exposes the default values for the "--style",
 * "--inlineStyle", "--skipTests" and "--inlineTemplate" options to the "component" schematic.
 */
export function getDefaultComponentOptions(project: WorkspaceProject) {
  // Note: Not all options which are available when running "ng new" will be stored in the
  // workspace config. List of options which will be available in the configuration:
  // angular/angular-cli/blob/master/packages/schematics/angular/application/index.ts#L109-L131
  let skipTests = getDefaultComponentOption<boolean|null>(project, ['skipTests'], null);

  // In case "skipTests" is not set explicitly, also look for the "spec" option. The "spec"
  // option has been deprecated but can be still used in older Angular CLI projects.
  // See: https://github.com/angular/angular-cli/commit/a12a4e02a4689b5bdbc6e740c0d9865afb55671a
  if (skipTests === null) {
    skipTests = !getDefaultComponentOption(project, ['spec'], true);
  }

  return {
    style: getDefaultComponentOption(project, ['style', 'styleext'], 'css'),
    inlineStyle: getDefaultComponentOption(project, ['inlineStyle'], false),
    inlineTemplate: getDefaultComponentOption(project, ['inlineTemplate'], false),
    skipTests: skipTests,
  };
}

/**
 * Gets the default value for the specified option. The default options will be determined
 * by looking at the stored schematic options for `@schematics/angular:component` in the
 * CLI workspace configuration.
 */
function getDefaultComponentOption<T>(project: WorkspaceProject, optionNames: string[],
                                      fallbackValue: T): T {
  for (let optionName of optionNames) {
    if (project.schematics &&
        project.schematics['@schematics/angular:component'] &&
        project.schematics['@schematics/angular:component'][optionName] != null) {

      return project.schematics['@schematics/angular:component'][optionName];
    }
  }

  return fallbackValue;
}
