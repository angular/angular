/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Migration} from '../../update-tool/migration';

import {MethodCallUpgradeData} from '../data';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that visits every TypeScript method call expression and checks if the
 * argument count is invalid and needs to be *manually* updated.
 */
export class MethodCallArgumentsMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: MethodCallUpgradeData[] = getVersionUpgradeData(this, 'methodCallChecks');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  visitNode(node: ts.Node): void {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      this._checkPropertyAccessMethodCall(node);
    }
  }

  private _checkPropertyAccessMethodCall(node: ts.CallExpression) {
    const propertyAccess = node.expression as ts.PropertyAccessExpression;

    if (!ts.isIdentifier(propertyAccess.name)) {
      return;
    }

    const hostType = this.typeChecker.getTypeAtLocation(propertyAccess.expression);
    const hostTypeName = hostType.symbol && hostType.symbol.name;
    const methodName = propertyAccess.name.text;

    if (!hostTypeName) {
      return;
    }

    // TODO(devversion): Revisit the implementation of this upgrade rule. It seems difficult
    // and ambiguous to maintain the data for this rule. e.g. consider a method which has the
    // same amount of arguments but just had a type change. In that case we could still add
    // new entries to the upgrade data that match the current argument length to just show
    // a failure message, but adding that data becomes painful if the method has optional
    // parameters and it would mean that the error message would always show up, even if the
    // argument is in some cases still assignable to the new parameter type. We could re-use
    // the logic we have in the constructor-signature checks to check for assignability and
    // to make the upgrade data less verbose.
    const failure =
        this.data.filter(data => data.method === methodName && data.className === hostTypeName)
            .map(data => data.invalidArgCounts.find(f => f.count === node.arguments.length))[0];

    if (!failure) {
      return;
    }

    this.createFailureAtNode(
        node,
        `Found call to "${hostTypeName + '.' + methodName}" ` +
            `with ${failure.count} arguments. Message: ${failure.message}`);
  }
}
