/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {RuleFailure, Rules, RuleWalker} from 'tslint';
import * as ts from 'typescript';
import {
  isExportSpecifierNode,
  isImportSpecifierNode,
  isNamespaceImportNode,
} from '../../typescript/imports';
import {
  isMaterialExportDeclaration,
  isMaterialImportDeclaration,
} from '../../typescript/module-specifiers';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that walks through every identifier that is part of Angular Material or thr CDK
 * and replaces the outdated name with the new one if specified in the upgrade data.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends RuleWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'classNames');

  /**
   * List of identifier names that have been imported from `@angular/material` or `@angular/cdk`
   * in the current source file and therefore can be considered trusted.
   */
  trustedIdentifiers: Set<string> = new Set();

  /** List of namespaces that have been imported from `@angular/material` or `@angular/cdk`. */
  trustedNamespaces: Set<string> = new Set();

  /** Method that is called for every identifier inside of the specified project. */
  visitIdentifier(identifier: ts.Identifier) {
    // For identifiers that aren't listed in the className data, the whole check can be
    // skipped safely.
    if (!this.data.some(data => data.replace === identifier.text)) {
      return;
    }

    // For namespace imports that are referring to Angular Material or the CDK, we store the
    // namespace name in order to be able to safely find identifiers that don't belong to the
    // developer's application.
    if (isNamespaceImportNode(identifier) && isMaterialImportDeclaration(identifier)) {
      this.trustedNamespaces.add(identifier.text);

      return this._createFailureWithReplacement(identifier);
    }

    // For export declarations that are referring to Angular Material or the CDK, the identifier
    // can be immediately updated to the new name.
    if (isExportSpecifierNode(identifier) && isMaterialExportDeclaration(identifier)) {
      return this._createFailureWithReplacement(identifier);
    }

    // For import declarations that are referring to Angular Material or the CDK, the name of
    // the import identifiers. This allows us to identify identifiers that belong to Material and
    // the CDK, and we won't accidentally touch a developer's identifier.
    if (isImportSpecifierNode(identifier) && isMaterialImportDeclaration(identifier)) {
      this.trustedIdentifiers.add(identifier.text);

      return this._createFailureWithReplacement(identifier);
    }

    // In case the identifier is part of a property access expression, we need to verify that the
    // property access originates from a namespace that has been imported from Material or the CDK.
    if (ts.isPropertyAccessExpression(identifier.parent)) {
      const expression = identifier.parent.expression;

      if (ts.isIdentifier(expression) && this.trustedNamespaces.has(expression.text)) {
        return this._createFailureWithReplacement(identifier);
      }
    } else if (this.trustedIdentifiers.has(identifier.text)) {
      return this._createFailureWithReplacement(identifier);
    }
  }

  /** Creates a failure and replacement for the specified identifier. */
  private _createFailureWithReplacement(identifier: ts.Identifier) {
    const classData = this.data.find(data => data.replace === identifier.text);

    if (!classData) {
      console.error(`Could not find updated name for identifier "${identifier.text}" in ` +
        ` in file ${this.getSourceFile().fileName}.`);
      return;
    }

    const replacement = this.createReplacement(
      identifier.getStart(), identifier.getWidth(), classData.replaceWith);

    this.addFailureAtNode(
      identifier,
      `Found deprecated identifier "${red(classData.replace)}" which has been renamed to` +
      ` "${green(classData.replaceWith)}"`,
      replacement);
  }
}
