import {green, red} from 'chalk';
import {Replacement, RuleFailure, Rules, RuleWalker} from 'tslint';
import * as ts from 'typescript';
import {attributeSelectors} from '../material/component-data';
import {findAll} from '../typescript/literal';

/**
 * Rule that walks through every string literal, which includes the outdated Material name and
 * is part of a call expression. Those string literals will be changed to the new name.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchStringLiteralAttributeSelectorsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStringLiteralAttributeSelectorsWalker extends RuleWalker {
  visitStringLiteral(stringLiteral: ts.StringLiteral) {
    if (stringLiteral.parent && stringLiteral.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    let stringLiteralText = stringLiteral.getFullText();

    attributeSelectors.forEach(selector => {
      this.createReplacementsForOffsets(stringLiteral, selector,
          findAll(stringLiteralText, selector.replace)).forEach(replacement => {
        this.addFailureAtNode(
            stringLiteral,
            `Found deprecated attribute selector "${red('[' + selector.replace + ']')}" which has` +
            ` been renamed to "${green('[' + selector.replaceWith + ']')}"`,
            replacement);
      });
    });
  }

  private createReplacementsForOffsets(node: ts.Node,
                                       update: {replace: string, replaceWith: string},
                                       offsets: number[]): Replacement[] {
    return offsets.map(offset => this.createReplacement(
        node.getStart() + offset, update.replace.length, update.replaceWith));
  }
}
