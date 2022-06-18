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
import {Update, writeUpdates} from '../../../migration-utilities';

export class TemplateMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    const ast = parseTemplate(template.content, template.filePath);
    const migrators = this.upgradeData.filter(m => m.template).map(m => m.template!);

    const updates: Update[] = [];
    migrators.forEach(m => updates.push(...m.getUpdates(ast)));

    const content = writeUpdates(template.content, updates);
    this.fileSystem.overwrite(template.filePath, content);
  }
}
