/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {ChangeDetectionEagerMigration} from './migration';

interface Options {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) => new ChangeDetectionEagerMigration(),
    });
  };
}
