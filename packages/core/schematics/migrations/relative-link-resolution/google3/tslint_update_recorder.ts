/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure} from 'tslint';
import * as ts from 'typescript';

import {UpdateRecorder} from '../update_recorder';

export class TslintUpdateRecorder implements UpdateRecorder {
  failures: RuleFailure[] = [];

  constructor(private ruleName: string, private sourceFile: ts.SourceFile) {}

  updateNode(node: ts.Node, newText: string) {
    this.failures.unshift(new RuleFailure(
        this.sourceFile, node.getStart(), 0,
        'The relativeLinkResolution default is changing from `legacy` to `corrected`. To keep behavior consistent' +
            ' when the change is merged, specify `legacy` rather than using the default.',
        this.ruleName, Replacement.replaceFromTo(node.getStart(), node.getEnd(), `${newText}`)));
  }

  commitUpdate() {}
}
