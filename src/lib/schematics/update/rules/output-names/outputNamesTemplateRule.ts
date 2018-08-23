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
import {findOutputsOnElementWithAttr, findOutputsOnElementWithTag} from '../../html/angular';
import {outputNames} from '../../material/data/output-names';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {
  addFailureAtReplacement,
  createExternalReplacementFailure,
} from '../../tslint/rule-failures';

/**
 * Rule that walks through every inline or external HTML template and switches changed output
 * bindings to the proper new output name.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  visitInlineTemplate(template: ts.StringLiteral) {
    this._createReplacementsForContent(template, template.getText())
      .forEach(data => addFailureAtReplacement(this, data.failureMessage, data.replacement));
  }

  visitExternalTemplate(template: ExternalResource) {
    this._createReplacementsForContent(template, template.getFullText())
      .map(data => createExternalReplacementFailure(template, data.failureMessage,
        this.getRuleName(), data.replacement))
      .forEach(failure => this.addFailure(failure));
  }

  /**
   * Searches for outdated output bindings in the specified content and creates
   * replacements with the according messages that can be added to a rule failure.
   */
  private _createReplacementsForContent(node: ts.Node, templateContent: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];

    outputNames.forEach(name => {
      const whitelist = name.whitelist;
      const relativeOffsets = [];
      const failureMessage = `Found deprecated @Output() "${red(name.replace)}"` +
        ` which has been renamed to "${green(name.replaceWith)}"`;

      if (!whitelist || whitelist.attributes) {
        relativeOffsets.push(
          ...findOutputsOnElementWithAttr(templateContent, name.replace, whitelist.attributes));
      }

      if (!whitelist || whitelist.elements) {
        relativeOffsets.push(
          ...findOutputsOnElementWithTag(templateContent, name.replace, whitelist.elements));
      }

      relativeOffsets
        .map(offset => node.getStart() + offset)
        .map(start => new Replacement(start, name.replace.length, name.replaceWith))
        .forEach(replacement => replacements.push({replacement, failureMessage}));
    });

    return replacements;
  }
}
