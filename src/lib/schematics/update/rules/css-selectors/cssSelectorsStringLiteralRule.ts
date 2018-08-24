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
import {cssSelectors, MaterialCssSelectorData} from '../../material/data/css-selectors';
import {findAllSubstringIndices} from '../../typescript/literal';

/**
 * Rule that walks through every string literal that is wrapped inside of a call expression.
 * All string literals which include an outdated CSS selector will be migrated.
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

    cssSelectors.forEach(data => {
      if (data.whitelist && !data.whitelist.strings) {
        return;
      }

      findAllSubstringIndices(textContent, data.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, data.replace.length, data.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(node, replacement, data));
    });
  }

  /** Adds a css selector failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     data: MaterialCssSelectorData) {
    this.addFailureAtNode(node, `Found deprecated CSS selector "${red(data.replace)}" which has ` +
      `been renamed to "${green(data.replaceWith)}"`, replacement);
  }
}
