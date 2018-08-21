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
import {cssNames} from '../../material/data/css-names';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {
  addFailureAtReplacement,
  createExternalReplacementFailure,
} from '../../tslint/rule-failures';
import {findAllSubstringIndices} from '../../typescript/literal';

/**
 * Rule that walks through every inline or external CSs stylesheet and updates outdated
 * CSS classes.
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
   * Searches for outdated CSs classes in the specified content and creates replacements
   * with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, stylesheetContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    cssNames.forEach(name => {
      if (name.whitelist && !name.whitelist.stylesheet) {
        return;
      }

      const failureMessage = `Found deprecated CSS class "${red(name.replace)}" ` +
          `which has been renamed to "${green(name.replaceWith)}"`;

      findAllSubstringIndices(stylesheetContent, name.replace)
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, name.replace.length, name.replaceWith))
        .forEach(replacement => replacements.push({replacement, failureMessage}));
    });

    return replacements;
  }
}
