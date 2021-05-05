/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {DevkitMigration, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import {migrateFileContent} from './migration';

/** Migration that switches all Sass files using Material theming APIs to `@use`. */
export class ThemingApiMigration extends DevkitMigration<null> {
  enabled = this.targetVersion === TargetVersion.V12;

  visitStylesheet(stylesheet: ResolvedResource): void {
    if (extname(stylesheet.filePath) === '.scss') {
      const content = stylesheet.content;
      const migratedContent = content ? migrateFileContent(content,
        '~@angular/material/', '~@angular/cdk/', '~@angular/material', '~@angular/cdk') : content;

      if (migratedContent && migratedContent !== content) {
        this.fileSystem.edit(stylesheet.filePath)
          .remove(0, stylesheet.content.length)
          .insertLeft(0, migratedContent);
      }
    }
  }
}
