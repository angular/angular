/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {IOptions, Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {findAllSubstringIndices} from '../../typescript/literal';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that walks through every inline or external stylesheet and replaces outdated CSS selectors
 * that query for an @Input() with the new input name.
 *
 * Note that inputs inside of stylesheets usually don't make sense, but if developers use an
 * input as a plain one-time attribute, it can be targeted through CSS selectors.
 *
 * e.g. `<my-component color="primary">` becomes `my-component[color]`
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  /** Change data that upgrades to the specified target version. */
  data = getUpgradeDataFromWalker(this, 'inputNames');

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    this._reportExtraStylesheetFiles(options.ruleArguments[2]);
  }

  visitInlineStylesheet(node: ts.StringLiteralLike) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addFailureAtReplacement(data.failureMessage, data.replacement);
    });
  }

  visitExternalStylesheet(node: ExternalResource) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addExternalFailureAtReplacement(node, data.failureMessage, data.replacement);
    });
  }

  /**
   * Searches for outdated attribute selectors in the specified content and creates replacements
   * with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, stylesheetContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    this.data.forEach(name => {
      const currentSelector = `[${name.replace}]`;
      const updatedSelector = `[${name.replaceWith}]`;

      const failureMessage = `Found deprecated @Input() CSS selector "${red(currentSelector)}" ` +
        `which has been renamed to "${green(updatedSelector)}"`;

      findAllSubstringIndices(stylesheetContent, currentSelector)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, currentSelector.length, updatedSelector))
        .forEach(replacement => replacements.push({replacement, failureMessage}));
    });

    return replacements;
  }
}
