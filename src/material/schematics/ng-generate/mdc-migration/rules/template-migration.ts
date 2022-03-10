/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {visitElements, parseTemplate} from './tree-traversal';
import {ComponentMigrator} from '.';

export class TemplateMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    const ast = parseTemplate(template.content, template.filePath);
    const migrators = this.upgradeData.filter(m => m.template).map(m => m.template!);

    visitElements(
      ast.nodes,
      node => {
        migrators.forEach(m => {
          template.content = m.updateEndTag(template.content, node);
        });
      },
      node => {
        migrators.forEach(m => {
          template.content = m.updateStartTag(template.content, node);
        });
      },
    );

    this.fileSystem.overwrite(template.filePath, template.content);
  }
}
