/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {Rule, Tree, chain, externalSchematic, schematic} from '@angular-devkit/schematics';
import {validateProjectName} from '@schematics/angular/utility/validation';
import {Schema} from './schema';

export default function(options: Schema): Rule {
  return (host: Tree) => {
    validateProjectName(options.name);

    return chain([
      externalSchematic('@schematics/angular', 'ng-new', options),
      schematic('ng-add', options, {
        scope: options.name,
      }),
    ]);
  };
}
