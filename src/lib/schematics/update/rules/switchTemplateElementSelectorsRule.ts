/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {elementSelectors} from '../material/data/element-selectors';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAllSubstringIndices} from '../typescript/literal';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * templates.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchTemplateElementSelectorsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchTemplateElementSelectorsWalker extends ComponentWalker {
  visitInlineTemplate(template: ts.StringLiteral) {
    this.replaceNamesInTemplate(template, template.getText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(template.getSourceFile(), fix.start, fix.end,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  visitExternalTemplate(template: ExternalResource) {
    this.replaceNamesInTemplate(template, template.getFullText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(template, fix.start + 1, fix.end + 1,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  /**
   * Replaces the outdated name in the template with the new one and returns an updated template.
   */
  private replaceNamesInTemplate(node: ts.Node, templateContent: string):
      {message: string, replacement: Replacement}[] {
    const replacements: {message: string, replacement: Replacement}[] = [];

    elementSelectors.forEach(selector => {
      // Being more aggressive with that replacement here allows us to also handle inline
      // style elements. Normally we would check if the selector is surrounded by the HTML tag
      // characters.
      const foundOffsets = findAllSubstringIndices(templateContent, selector.replace);

      this.createReplacementsForOffsets(node, selector, foundOffsets).forEach(replacement => {
        replacements.push({
          message: `Found deprecated element selector "${red(selector.replace)}" which has` +
              ` been renamed to "${green(selector.replaceWith)}"`,
          replacement
        });
      });
    });

    return replacements;
  }

  private createReplacementsForOffsets(node: ts.Node,
                                       update: {replace: string, replaceWith: string},
                                       offsets: number[]): Replacement[] {
    return offsets.map(offset => this.createReplacement(
        node.getStart() + offset, update.replace.length, update.replaceWith));
  }
}
