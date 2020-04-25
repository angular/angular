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
 * Migration that walks through every property access expression and and reports a failure if
 * a given property name no longer exists but cannot be automatically migrated.
 */
export class MiscPropertyNamesMigration extends Migration<null> {

  // Only enable this rule if the migration targets version 6. The rule
  // currently only includes migrations for V6 deprecations.
  enabled = this.targetVersion === TargetVersion.V6;

  visitNode(node: ts.Node): void {
    if (ts.isPropertyAccessExpression(node)) {
      this._visitPropertyAccessExpression(node);
    }
  }

  private _visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const hostType = this.typeChecker.getTypeAtLocation(node.expression);
    const typeName = hostType && hostType.symbol && hostType.symbol.getName();

    // Migration for: https://github.com/angular/components/pull/10398 (v6)
    if (typeName === 'MatListOption' && node.name.text === 'selectionChange') {
      this.createFailureAtNode(
          node,
          `Found deprecated property "selectionChange" of ` +
              `class "MatListOption". Use the "selectionChange" property on the ` +
              `parent "MatSelectionList" instead.`);
    }

    // Migration for: https://github.com/angular/components/pull/10413 (v6)
    if (typeName === 'MatDatepicker' && node.name.text === 'selectedChanged') {
      this.createFailureAtNode(
          node,
          `Found deprecated property "selectedChanged" of ` +
              `class "MatDatepicker". Use the "dateChange" or "dateInput" methods ` +
              `on "MatDatepickerInput" instead.`);
    }
  }
}
