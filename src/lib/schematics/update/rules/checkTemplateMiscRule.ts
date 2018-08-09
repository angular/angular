/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, red} from 'chalk';
import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {findInputsOnElementWithTag, findOutputsOnElementWithTag} from '../html/angular';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAllSubstringIndices} from '../typescript/literal';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * templates.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new CheckTemplateMiscWalker(sourceFile, this.getOptions()));
  }
}

export class CheckTemplateMiscWalker extends ComponentWalker {
  visitInlineTemplate(template: ts.StringLiteral) {
    this.checkTemplate(template.getText()).forEach(failure => {
      const ruleFailure = new RuleFailure(template.getSourceFile(), failure.start, failure.end,
          failure.message, this.getRuleName());
      this.addFailure(ruleFailure);
    });
  }

  visitExternalTemplate(template: ExternalResource) {
    this.checkTemplate(template.getFullText()).forEach(failure => {
      const ruleFailure = new RuleFailure(template, failure.start + 1, failure.end + 1,
          failure.message, this.getRuleName());
      this.addFailure(ruleFailure);
    });
  }

  /**
   * Replaces the outdated name in the template with the new one and returns an updated template.
   */
  private checkTemplate(templateContent: string):
      {start: number, end: number, message: string}[] {
    let failures: {message: string, start: number, end: number}[] = [];

    failures = failures.concat(
      findAllSubstringIndices(templateContent, 'cdk-focus-trap').map(offset => ({
        start: offset,
        end: offset + 'cdk-focus-trap'.length,
        message: `Found deprecated element selector "${red('cdk-focus-trap')}" which has been` +
            ` changed to an attribute selector "${green('[cdkTrapFocus]')}"`
      }))
    );

    failures = failures.concat(
        findOutputsOnElementWithTag(templateContent, 'selectionChange', ['mat-list-option'])
            .map(offset => ({
              start: offset,
              end: offset + 'selectionChange'.length,
              message: `Found deprecated @Output() "${red('selectionChange')}" on` +
                  ` "${bold('mat-list-option')}". Use "${green('selectionChange')}" on` +
                  ` "${bold('mat-selection-list')}" instead`
            })));

    failures = failures.concat(
      findOutputsOnElementWithTag(templateContent, 'selectedChanged', ['mat-datepicker'])
            .map(offset => ({
              start: offset,
              end: offset + 'selectionChange'.length,
              message: `Found deprecated @Output() "${red('selectedChanged')}" on` +
                  ` "${bold('mat-datepicker')}". Use "${green('dateChange')}" or` +
                  ` "${green('dateInput')}" on "${bold('<input [matDatepicker]>')}" instead`
            })));

    failures = failures.concat(
        findInputsOnElementWithTag(templateContent, 'selected', ['mat-button-toggle-group'])
            .map(offset => ({
              start: offset,
              end: offset + 'selected'.length,
              message: `Found deprecated @Input() "${red('selected')}" on` +
                  ` "${bold('mat-radio-button-group')}". Use "${green('value')}" instead`
            })));

    return failures;
  }
}
