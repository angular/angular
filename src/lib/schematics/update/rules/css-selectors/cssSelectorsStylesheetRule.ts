/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {sync as globSync} from 'glob';
import {IOptions, Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {cssSelectors} from '../../material/data/css-selectors';
import {getChangesForTarget} from '../../material/transform-change-data';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {
  addFailureAtReplacement,
  createExternalReplacementFailure,
} from '../../tslint/rule-failures';
import {findAllSubstringIndices} from '../../typescript/literal';

/**
 * Rule that walks through every inline or external CSs stylesheet and updates outdated
 * CSS selectors.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  /** Change data that upgrades to the specified target version. */
  data = getChangesForTarget(this.getOptions()[0], cssSelectors);

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    // In some applications, developers will have global stylesheets that are not specified in any
    // Angular component. Therefore we glob up all css and scss files outside of node_modules and
    // dist and check them as well.
    super(sourceFile, options, globSync('!(node_modules|dist)/**/*.+(css|scss)'));
    this._reportExtraStylesheetFiles();
  }

  visitInlineStylesheet(literal: ts.StringLiteral) {
    this._createReplacementsForContent(literal, literal.getText())
      .forEach(data => addFailureAtReplacement(this, data.failureMessage, data.replacement));
  }

  visitExternalStylesheet(node: ExternalResource) {
    this._createReplacementsForContent(node, node.getFullText())
      .map(data => createExternalReplacementFailure(node, data.failureMessage,
          this.getRuleName(), data.replacement))
      .forEach(failure => this.addFailure(failure));
  }

  /**
   * Searches for outdated CSS selectors in the specified content and creates replacements
   * with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, stylesheetContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    this.data.forEach(data => {
      if (data.whitelist && !data.whitelist.stylesheet) {
        return;
      }

      const failureMessage = `Found deprecated CSS selector "${red(data.replace)}" ` +
          `which has been renamed to "${green(data.replaceWith)}"`;

      findAllSubstringIndices(stylesheetContent, data.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, data.replace.length, data.replaceWith))
        .forEach(replacement => replacements.push({replacement, failureMessage}));
    });

    return replacements;
  }
}
