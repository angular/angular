/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {ResolvedResource} from '../../../update-tool/component-resource-collector';
import {TargetVersion} from '../../../update-tool/target-version';
import {DevkitMigration} from '../../devkit-migration';

/** Migration that removes tilde symbols from imports. */
export class TildeImportMigration extends DevkitMigration<null> {
  enabled = this.targetVersion === TargetVersion.V13;

  override visitStylesheet(stylesheet: ResolvedResource): void {
    const extension = extname(stylesheet.filePath);

    if (extension === '.scss' || extension === '.css') {
      const content = stylesheet.content;
      const migratedContent = content.replace(
        /@(?:import|use) +['"](~@angular\/.*)['"].*;?/g,
        (match, importPath) => {
          const index = match.indexOf(importPath);
          const newImportPath = importPath.replace(/^~|\.scss$/g, '');
          return match.slice(0, index) + newImportPath + match.slice(index + importPath.length);
        },
      );

      if (migratedContent && migratedContent !== content) {
        this.fileSystem
          .edit(stylesheet.filePath)
          .remove(0, stylesheet.content.length)
          .insertLeft(0, migratedContent);
      }
    }
  }
}
