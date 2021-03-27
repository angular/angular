/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {Rule, Tree} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {migrateFileContent} from './migration';

export default function(_options: Schema): Rule {
  return (tree: Tree) => {
    tree.visit((path, entry) => {
      if (extname(path) === '.scss') {
        const content = entry?.content.toString();
        const migratedContent = content ? migrateFileContent(content,
          '~@angular/material/', '~@angular/cdk/', '~@angular/material', '~@angular/cdk') : content;

        if (migratedContent && migratedContent !== content) {
          tree.overwrite(path, migratedContent);
        }
      }
    });
  };
}
