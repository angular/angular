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
import {cssNames, MaterialCssNameData} from '../../material/data/css-names';
import {findAllSubstringIndices} from '../../typescript/literal';

/**
 * Rule that walks through every string literal that is wrapped inside of a call expression.
 * All string literals which include an outdated CSS class name will be migrated.
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

    cssNames.forEach(name => {
      if (name.whitelist && !name.whitelist.strings) {
        return;
      }

      findAllSubstringIndices(textContent, name.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, name.replace.length, name.replaceWith))
        .forEach(replacement => this._addFailureWithReplacement(node, replacement, name));
    });
  }

  /** Adds a css name failure with the given replacement at the specified node. */
  private _addFailureWithReplacement(node: ts.Node, replacement: Replacement,
                                     name: MaterialCssNameData) {
    this.addFailureAtNode(node, `Found deprecated CSS class "${red(name.replace)}" which has ` +
      `been renamed to "${green(name.replaceWith)}"`, replacement);
  }
}
