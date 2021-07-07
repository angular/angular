/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {identifyDynamicQueryNodes, removeOptionsParameter, removeStaticFlag} from '../dynamic-queries/util';

const RULE_NAME = 'dynamic-queries';
const FAILURE_MESSAGE =
    'The static flag defaults to false, so setting it false manually is unnecessary.';

/**
 * TSLint rule that removes the `static` flag from dynamic queries.
 */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const printer = ts.createPrinter();
    const failures: RuleFailure[] = [];
    const result = identifyDynamicQueryNodes(program.getTypeChecker(), sourceFile);

    result.removeProperty.forEach(node => {
      failures.push(new RuleFailure(
          sourceFile, node.getStart(), node.getEnd(), FAILURE_MESSAGE, RULE_NAME,
          new Replacement(
              node.getStart(), node.getWidth(),
              printer.printNode(ts.EmitHint.Unspecified, removeStaticFlag(node), sourceFile))));
    });

    result.removeParameter.forEach(node => {
      failures.push(new RuleFailure(
          sourceFile, node.getStart(), node.getEnd(), FAILURE_MESSAGE, RULE_NAME,
          new Replacement(
              node.getStart(), node.getWidth(),
              printer.printNode(
                  ts.EmitHint.Unspecified, removeOptionsParameter(node), sourceFile))));
    });

    return failures;
  }
}
