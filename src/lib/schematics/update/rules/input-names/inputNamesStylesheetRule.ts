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
import {inputNames} from '../../material/data/input-names';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {
  addFailureAtReplacement,
  createExternalReplacementFailure,
} from '../../tslint/rule-failures';
import {findAllSubstringIndices} from '../../typescript/literal';

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

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    // In some applications, developers will have global stylesheets that are not specified in any
    // Angular component. Therefore we glob up all css and scss files outside of node_modules and
    // dist and check them as well.
    const extraFiles = globSync('!(node_modules|dist)/**/*.+(css|scss)');
    super(sourceFile, options, extraFiles);
    extraFiles.forEach(styleUrl => this._reportExternalStyle(styleUrl));
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
   * Searches for outdated attribute selectors in the specified content and creates replacements
   * with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, stylesheetContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    inputNames.forEach(name => {
      if (name.whitelist && !name.whitelist.stylesheet) {
        return;
      }

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
