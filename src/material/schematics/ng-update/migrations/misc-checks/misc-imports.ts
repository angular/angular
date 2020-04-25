/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isMaterialImportDeclaration, Migration, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';

/**
 * Migration that detects import declarations that refer to outdated identifiers from
 * Angular Material which cannot be updated automatically.
 */
export class MiscImportsMigration extends Migration<null> {

  // Only enable this rule if the migration targets version 6. The rule
  // currently only includes migrations for V6 deprecations.
  enabled = this.targetVersion === TargetVersion.V6;

  visitNode(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      this._visitImportDeclaration(node);
    }
  }

  private _visitImportDeclaration(node: ts.ImportDeclaration) {
    if (!isMaterialImportDeclaration(node) || !node.importClause ||
        !node.importClause.namedBindings) {
      return;
    }

    const namedBindings = node.importClause.namedBindings;

    if (ts.isNamedImports(namedBindings)) {
      // Migration for: https://github.com/angular/components/pull/10405 (v6)
      this._checkAnimationConstants(namedBindings);
    }
  }

  /**
   * Checks for named imports that refer to the deleted animation constants.
   * https://github.com/angular/components/commit/9f3bf274c4f15f0b0fbd8ab7dbf1a453076e66d9
   */
  private _checkAnimationConstants(namedImports: ts.NamedImports) {
    namedImports.elements.filter(element => ts.isIdentifier(element.name)).forEach(element => {
      const importName = element.name.text;

      if (importName === 'SHOW_ANIMATION' || importName === 'HIDE_ANIMATION') {
        this.createFailureAtNode(
            element, `Found deprecated symbol "${importName}" which has been removed`);
      }
    });
  }
}
