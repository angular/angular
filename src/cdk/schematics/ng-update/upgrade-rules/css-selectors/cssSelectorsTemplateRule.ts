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
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {findAllSubstringIndices} from '../../typescript/literal';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that walks through every inline or external HTML template and updates outdated
 * CSS selectors.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'cssSelectors');

  visitInlineTemplate(node: ts.StringLiteralLike) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addFailureAtReplacement(data.failureMessage, data.replacement);
    });
  }

  visitExternalTemplate(node: ExternalResource) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addExternalFailureAtReplacement(node, data.failureMessage, data.replacement);
    });
  }

  /**
   * Searches for outdated css selectors in the specified content and creates replacements
   * with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, templateContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    this.data.forEach(data => {
      if (data.whitelist && !data.whitelist.html) {
        return;
      }

      const failureMessage = `Found deprecated CSS selector "${red(data.replace)}"` +
        ` which has been renamed to "${green(data.replaceWith)}"`;

      findAllSubstringIndices(templateContent, data.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, data.replace.length, data.replaceWith))
        .forEach(replacement => replacements.push({replacement, failureMessage}));
    });

    return replacements;
  }
}
