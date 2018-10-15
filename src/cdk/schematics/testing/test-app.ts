/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

/** Create a base app used for testing. */
export function createTestApp(runner: SchematicTestRunner, appOptions = {}): UnitTestTree {
  const workspaceTree = runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '6.0.0',
    newProjectRoot: 'projects',
  });

  return runner.runExternalSchematic('@schematics/angular', 'application',
      {name: 'material', ...appOptions}, workspaceTree);
}
