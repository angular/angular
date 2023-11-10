/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {migrateFor} from './fors';
import {migrateIf} from './ifs';
import {migrateSwitch} from './switches';
import {MigrateError} from './types';
import {processNgTemplates} from './util';

/**
 * Actually migrates a given template to the new syntax
 */
export function migrateTemplate(template: string): {migrated: string, errors: MigrateError[]} {
  const ifResult = migrateIf(template);
  const forResult = migrateFor(ifResult.migrated);
  const switchResult = migrateSwitch(forResult.migrated);

  const migrated = processNgTemplates(switchResult.migrated);

  const errors = [
    ...ifResult.errors,
    ...forResult.errors,
    ...switchResult.errors,
  ];
  return {migrated, errors};
}
