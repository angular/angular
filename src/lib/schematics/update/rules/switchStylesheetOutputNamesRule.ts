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
import {outputNames} from '../material/data/output-names';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAllSubstringIndices} from '../typescript/literal';
import * as ts from 'typescript';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * stylesheets.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchStylesheetOutputNamesWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStylesheetOutputNamesWalker extends ComponentWalker {

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    // In some applications, developers will have global stylesheets that are not specified in any
    // Angular component. Therefore we glob up all css and scss files outside of node_modules and
    // dist and check them as well.
    const extraFiles = globSync('!(node_modules|dist)/**/*.+(css|scss)');
    super(sourceFile, options, extraFiles);
    extraFiles.forEach(styleUrl => this._reportExternalStyle(styleUrl));
  }

  visitInlineStylesheet(stylesheet: ts.StringLiteral) {
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(stylesheet.getSourceFile(), fix.start, fix.end,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  visitExternalStylesheet(stylesheet: ExternalResource) {
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getFullText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(stylesheet, fix.start + 1, fix.end + 1,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  /**
   * Replaces the outdated name in the stylesheet with the new one and returns an updated
   * stylesheet.
   */
  private replaceNamesInStylesheet(node: ts.Node, stylesheetContent: string):
      {message: string, replacement: Replacement}[] {
    const replacements: {message: string, replacement: Replacement}[] = [];

    outputNames.forEach(name => {
      if (!name.whitelist || name.whitelist.css) {
        const bracketedName = {replace: `[${name.replace}]`, replaceWith: `[${name.replaceWith}]`};
        const foundOffsets = findAllSubstringIndices(stylesheetContent, bracketedName.replace);

        this.createReplacementsForOffsets(node, name, foundOffsets).forEach(replacement => {
          replacements.push({
            message: `Found deprecated @Output() "${red(name.replace)}" which has been` +
              ` renamed to "${green(name.replaceWith)}"`,
            replacement
          });
        });
      }
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
