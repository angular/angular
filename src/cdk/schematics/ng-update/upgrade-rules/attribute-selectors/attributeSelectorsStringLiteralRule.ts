/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {Replacement, RuleFailure, Rules, RuleWalker} from 'tslint';
import * as ts from 'typescript';
import {AttributeSelectorUpgradeData} from '../../data/attribute-selectors';
import {findAllSubstringIndices} from '../../typescript/literal';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that walks through every string literal that is part of a call expression and
 * switches deprecated attribute selectors to the updated selector.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends RuleWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'attributeSelectors');

  visitStringLiteral(literal: ts.StringLiteral) {
    if (literal.parent && literal.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const literalText = literal.getText();

    this.data.forEach(selector => {
      findAllSubstringIndices(literalText, selector.replace)
        .map(offset => literal.getStart() + offset)
        .map(start => new Replacement(start, selector.replace.length, selector.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(literal, replacement, selector));
    });
  }

  /** Adds an attribute selector failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     data: AttributeSelectorUpgradeData) {

    this.addFailureAtNode(
      node,
      `Found deprecated attribute selector "${red('[' + data.replace + ']')}" which ` +
      `has been renamed to "${green('[' + data.replaceWith + ']')}"`,
      replacement);
  }
}
