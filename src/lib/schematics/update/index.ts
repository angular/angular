/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule} from '@angular-devkit/schematics';
import {TargetVersion} from './target-version';
import {createUpdateRule} from './update';

/** Entry point for the migration schematics with target of Angular Material 6.0.0 */
export function updateToV6(): Rule {
  return createUpdateRule(TargetVersion.V6);
}

/** Entry point for the migration schematics with target of Angular Material 7.0.0 */
export function updateToV7(): Rule {
  return createUpdateRule(TargetVersion.V7);
}

/** Post-update schematic to be called when update is finished. */
export function postUpdate(): Rule {
  return () => console.log(
    '\nComplete! Please check the output above for any issues that were detected but could not' +
    ' be automatically fixed.');
}
