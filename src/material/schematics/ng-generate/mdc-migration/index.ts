/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import * as path from 'path';
import {Schema} from './schema';

/** Groups of components that must be migrated together. */
const migrationGroups = [
  ['autocomplete', 'form-field', 'input', 'select'],
  ['button'],
  ['card'],
  ['checkbox'],
  ['chips'],
  ['dialog'],
  ['list'],
  ['menu'],
  ['paginator'],
  ['progress-bar'],
  ['progress-spinner'],
  ['radio'],
  ['slide-toggle'],
  ['slider'],
  ['snack-bar'],
  ['table'],
  ['tabs'],
  ['tooltip'],
];

function getComponentsToMigrate(requested: string[]): Set<string> {
  const componentsToMigrate = new Set<string>(requested);
  if (componentsToMigrate.has('all')) {
    componentsToMigrate.clear();
    migrationGroups.forEach(group =>
      group.forEach(component => componentsToMigrate.add(component)),
    );
  } else {
    for (const group of migrationGroups) {
      if (group.some(component => componentsToMigrate.has(component))) {
        group.forEach(component => componentsToMigrate.add(component));
      }
    }
  }
  return componentsToMigrate;
}

export default function (options: Schema): Rule {
  const componentsToMigrate = getComponentsToMigrate(options.components);
  // TOOD(mmalerba): Use a workspace-releative rather than absolute path.
  const pathToMigrate = path.resolve(options.path ?? process.cwd());

  console.log('Will migrate', [...componentsToMigrate], 'for', pathToMigrate);

  return (tree: Tree, context: SchematicContext) => tree;
}
