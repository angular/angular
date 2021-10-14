/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Migration} from '../../update-tool/migration';
import {SymbolRemovalUpgradeData} from '../data';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/** Migration that flags imports for symbols that have been removed. */
export class SymbolRemovalMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: SymbolRemovalUpgradeData[] = getVersionUpgradeData(this, 'symbolRemoval');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  override visitNode(node: ts.Node): void {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }

    const namedBindings = node.importClause && node.importClause.namedBindings;

    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      return;
    }

    const moduleNameMatches = this.data.filter(
      entry => (node.moduleSpecifier as ts.StringLiteral).text === entry.module,
    );

    if (!moduleNameMatches.length) {
      return;
    }

    namedBindings.elements.forEach(element => {
      const elementName = element.propertyName?.text || element.name.text;

      moduleNameMatches.forEach(match => {
        if (match.name === elementName) {
          this.createFailureAtNode(element, match.message);
        }
      });
    });
  }
}
