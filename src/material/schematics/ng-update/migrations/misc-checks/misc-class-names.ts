/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';

/**
 * Migration that looks for class name identifiers that have been removed but
 * cannot be automatically migrated.
 */
export class MiscClassNamesMigration extends Migration<null> {

  // Only enable this rule if the migration targets version 6. The rule
  // currently only includes migrations for V6 deprecations.
  enabled = this.targetVersion === TargetVersion.V6;

  visitNode(node: ts.Node): void {
    if (ts.isIdentifier(node)) {
      this._visitIdentifier(node);
    }
  }

  private _visitIdentifier(identifier: ts.Identifier) {
    // Migration for: https://github.com/angular/components/pull/10279 (v6)
    if (identifier.getText() === 'MatDrawerToggleResult') {
      this.createFailureAtNode(
          identifier,
          `Found "MatDrawerToggleResult" which has changed from a class type to a string ` +
              `literal type. Your code may need to be updated.`);
    }

    // Migration for: https://github.com/angular/components/pull/10398 (v6)
    if (identifier.getText() === 'MatListOptionChange') {
      this.createFailureAtNode(
          identifier,
          `Found usage of "MatListOptionChange" which has been removed. Please listen for ` +
              `"selectionChange" on "MatSelectionList" instead.`);
    }
  }
}
