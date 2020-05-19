/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {chain, externalSchematic, Rule, schematic, Tree} from '@angular-devkit/schematics';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {Schema} from './schema';

export default function(options: Schema): Rule {
  return (host: Tree) => {
    validateProjectName(options.name);

    return chain([
      externalSchematic('@schematics/angular', 'ng-new', options),
      schematic(
          'ng-add', {
            name: options.name,
            // skip install since `ng-new` above will schedule the task
            skipInstall: true,
          },
          {
            scope: options.name,
          }),
    ]);
  };
}
