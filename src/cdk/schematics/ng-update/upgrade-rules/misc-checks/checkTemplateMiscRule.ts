/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, red} from 'chalk';
import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {ExternalResource} from '../../tslint/component-file';
import {ComponentWalker} from '../../tslint/component-walker';
import {findAllSubstringIndices} from '../../typescript/literal';

/**
 * Rule that walks through every inline or external template and reports if there are outdated
 * usages of the Angular Material API that need to be updated manually.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  visitInlineTemplate(node: ts.StringLiteralLike) {
    this._createFailuresForContent(node, node.getText()).forEach(data => {
      this.addFailureFromStartToEnd(data.start, data.end, data.message);
    });
  }

  visitExternalTemplate(node: ExternalResource) {
    this._createFailuresForContent(node, node.getText()).forEach(data => {
      this.addExternalFailureFromStartToEnd(node, data.start, data.end, data.message);
    });
  }

  private _createFailuresForContent(node: ts.Node, content: string) {
    const failures: {message: string, start: number, end: number}[] = [];

    findAllSubstringIndices(content, 'cdk-focus-trap').forEach(offset => {
      failures.push({
        start: node.getStart() + offset,
        end: node.getStart() + offset + 'cdk-focus-trap'.length,
        message: `Found deprecated element selector "${red('cdk-focus-trap')}" which has been ` +
            `changed to an attribute selector "${green('[cdkTrapFocus]')}".`
      });
    });

    return failures;
  }
}
