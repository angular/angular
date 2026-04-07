/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, Rule, SchematicsException} from '@angular-devkit/schematics';
import {migrate as toSignalQueries} from '../signal-queries-migration';
import {migrate as toSignalInputs} from '../signal-input-migration';
import {migrate as toInitializerOutputs} from '../output-migration';

const enum SupportedMigrations {
  inputs = 'inputs',
  outputs = 'outputs',
  queries = 'queries',
}

interface Options {
  path: string;
  migrations: SupportedMigrations[];
  analysisDir: string;
  bestEffortMode?: boolean;
  insertTodos?: boolean;
}

export function migrate(options: Options): Rule {
  // The migrations are independent so we can run them in any order, but we sort them here
  // alphabetically so we get a consistent execution order in case of issue reports.
  const migrations = options.migrations.slice().sort();
  const rules: Rule[] = [];

  for (const migration of migrations) {
    switch (migration) {
      case SupportedMigrations.inputs:
        rules.push(toSignalInputs(options));
        break;

      case SupportedMigrations.outputs:
        rules.push(toInitializerOutputs(options));
        break;

      case SupportedMigrations.queries:
        rules.push(toSignalQueries(options));
        break;

      default:
        throw new SchematicsException(`Unsupported migration "${migration}"`);
    }
  }

  return chain(rules);
}
