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
import {ElementSelectorUpgradeData} from '../../data/element-selectors';
import {findAllSubstringIndices} from '../../typescript/literal';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that walks through every string literal that is wrapped inside of a call expression.
 * All string literals which include an outdated element selector will be migrated.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends RuleWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'elementSelectors');

  visitStringLiteral(node: ts.StringLiteral) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const textContent = node.getText();

    this.data.forEach(selector => {
      findAllSubstringIndices(textContent, selector.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, selector.replace.length, selector.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(node, replacement, selector));
    });
  }

  /** Adds an element selector failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     data: ElementSelectorUpgradeData) {
    this.addFailureAtNode(node, `Found deprecated element selector "${red(data.replace)}" which ` +
      `has been renamed to "${green(data.replaceWith)}"`, replacement);
  }
}
