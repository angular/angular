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
import {elementSelectors, MaterialElementSelectorData} from '../../material/data/element-selectors';
import {findAllSubstringIndices} from '../../typescript/literal';

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

  visitStringLiteral(node: ts.StringLiteral) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const textContent = node.getFullText();

    elementSelectors.forEach(selector => {
      findAllSubstringIndices(textContent, selector.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, selector.replace.length, selector.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(node, replacement, selector));
    });
  }

  /** Adds an element selector failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     name: MaterialElementSelectorData) {
    this.addFailureAtNode(node, `Found deprecated element selector "${red(name.replace)}" which ` +
      `has been renamed to "${green(name.replaceWith)}"`, replacement);
  }
}
