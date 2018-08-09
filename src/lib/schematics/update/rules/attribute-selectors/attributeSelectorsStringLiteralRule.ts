/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {Replacement, RuleFailure, Rules, RuleWalker} from 'tslint';
import {
  attributeSelectors,
  MaterialAttributeSelectorData,
} from '../../material/data/attribute-selectors';
import {findAllSubstringIndices} from '../../typescript/literal';
import * as ts from 'typescript';

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

  visitStringLiteral(literal: ts.StringLiteral) {
    if (literal.parent && literal.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const literalText = literal.getFullText();

    attributeSelectors.forEach(selector => {
      findAllSubstringIndices(literalText, selector.replace)
        .map(offset => literal.getStart() + offset)
        .map(start => new Replacement(start, selector.replace.length, selector.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(literal, replacement, selector));
    });
  }

  /** Adds an attribute selector failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     selector: MaterialAttributeSelectorData) {

    this.addFailureAtNode(
      node,
      `Found deprecated attribute selector "${red('[' + selector.replace + ']')}" which ` +
      `has been renamed to "${green('[' + selector.replaceWith + ']')}"`,
      replacement);
  }
}
