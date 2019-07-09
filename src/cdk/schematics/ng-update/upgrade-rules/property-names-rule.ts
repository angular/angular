/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {MigrationRule} from '../../update-tool/migration-rule';

import {PropertyNameUpgradeData} from '../data';
import {getVersionUpgradeData, RuleUpgradeData} from '../upgrade-data';

/**
 * Rule that walks through every property access expression and updates
 * accessed properties that have been updated to a new name.
 */
export class PropertyNamesRule extends MigrationRule<RuleUpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: PropertyNameUpgradeData[] = getVersionUpgradeData(this, 'propertyNames');

  // Only enable the migration rule if there is upgrade data.
  ruleEnabled = this.data.length !== 0;

  visitNode(node: ts.Node): void {
    if (ts.isPropertyAccessExpression(node)) {
      this._visitPropertyAccessExpression(node);
    }
  }

  private _visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const hostType = this.typeChecker.getTypeAtLocation(node.expression);
    const typeName = hostType && hostType.symbol && hostType.symbol.getName();

    this.data.forEach(data => {
      if (node.name.text !== data.replace) {
        return;
      }

      if (!data.whitelist || data.whitelist.classes.includes(typeName)) {
        const recorder = this.getUpdateRecorder(node.getSourceFile().fileName);
        recorder.remove(node.name.getStart(), node.name.getWidth());
        recorder.insertRight(node.name.getStart(), data.replaceWith);
      }
    });
  }
}
