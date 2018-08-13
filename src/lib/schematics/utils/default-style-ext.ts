/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@schematics/angular/utility/config';

/**
 * Style extension that will be used if no default style extension for the CLI project
 * could be determined.
 */
const fallbackStyleExtension = 'css';

/**
 * Determines the default style extension in the Angular CLI project by looking for the default
 * component schematic options. This is necessary for now because when creating CLI projects,
 * the CLI only makes the default `--style` option available for the `angular:component` schematic.
 */
export function determineDefaultStyleExt(project: WorkspaceProject): string | null {
  if (project.schematics &&
      project.schematics['@schematics/angular:component'] &&
      project.schematics['@schematics/angular:component']['styleext']) {

    return project.schematics['@schematics/angular:component']['styleext'];
  }

  return fallbackStyleExtension;
}
