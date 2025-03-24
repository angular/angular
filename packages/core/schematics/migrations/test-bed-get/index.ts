/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {TestBedGetMigration} from './test_bed_get_migration';
import {runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';

export function migrate(): Rule {
  return async (tree) => {
    await runMigrationInDevkit({
      tree,
      getMigration: () => new TestBedGetMigration(),
    });
  };
}
