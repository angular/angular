/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

/** Create a base app used for testing. */
export async function createTestApp(runner: SchematicTestRunner, appOptions = {}):
    Promise<UnitTestTree> {
  const workspaceTree = runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '6.0.0',
    newProjectRoot: 'projects',
  });

  return runner.runExternalSchematicAsync('@schematics/angular', 'application',
      {name: 'material', ...appOptions}, workspaceTree).toPromise();
}
