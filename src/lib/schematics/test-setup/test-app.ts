/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {join} from 'path';

/** Path to the collection file for the Material schematics */
export const collectionPath = join(__dirname, '..', 'collection.json');

/** Path to the migration file for the Material update schematics */
export const migrationCollection = join(__dirname, '..', 'migration.json');

/** Create a base app used for testing. */
export function createTestApp(appOptions = {}): UnitTestTree {
  const baseRunner = new SchematicTestRunner('material-schematics', collectionPath);

  const workspaceTree = baseRunner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '6.0.0',
    newProjectRoot: 'projects',
  });

  return baseRunner.runExternalSchematic('@schematics/angular', 'application',
      {...appOptions, name: 'material'}, workspaceTree);
}
