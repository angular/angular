/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {parseTemplate} from './tree-traversal';
import {ComponentMigrator} from '.';
import {Update} from './template-migrator';

export class TemplateMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    const ast = parseTemplate(template.content, template.filePath);
    const migrators = this.upgradeData.filter(m => m.template).map(m => m.template!);

    const updates: Update[] = [];
    migrators.forEach(m => updates.push(...m.getUpdates(ast)));

    updates.sort((a, b) => b.location.offset - a.location.offset);
    updates.forEach(update => {
      template.content = update.updateFn(template.content);
    });

    this.fileSystem.overwrite(template.filePath, template.content);
  }
}
