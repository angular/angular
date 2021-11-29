/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';

export class ThemingStylesMigration extends Migration<null, SchematicContext> {
  enabled = true;

  override visitStylesheet(stylesheet: ResolvedResource) {
    // TODO: Implement this migration. This is just a placeholder currently.
    this.fileSystem.edit(stylesheet.filePath).insertRight(0, '$some-var: #fff;');
  }
}
