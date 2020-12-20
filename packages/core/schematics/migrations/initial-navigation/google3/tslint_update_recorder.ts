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

  updateNode(node: ts.Node, newText: string): void {
    this.failures.push(new RuleFailure(
        this.sourceFile, node.getStart(), node.getEnd(), `Node needs to be updated to: ${newText}`,
        this.ruleName, Replacement.replaceFromTo(node.getStart(), node.getEnd(), newText)));
  }

  commitUpdate() {}
}
