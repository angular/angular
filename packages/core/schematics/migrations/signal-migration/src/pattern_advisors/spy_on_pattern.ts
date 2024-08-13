/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {KnownInputs} from '../input_detection/known_inputs';
import {attemptRetrieveInputFromSymbol} from '../input_detection/nodes_to_input';
import {MigrationHost} from '../migration_host';
import {InputIncompatibilityReason} from '../input_detection/incompatibility';

/**
 * Detects `spyOn(dirInstance, 'myInput')` calls that likely modify
 * the input signal. There is no way to change the value inside the input signal,
 * and hence observing is not possible.
 */
export class SpyOnInputPattern {
  constructor(
    private host: MigrationHost,
    private checker: ts.TypeChecker,
    private knownInputs: KnownInputs,
  ) {}

  detect(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'spyOn' &&
      node.arguments.length === 2 &&
      ts.isStringLiteralLike(node.arguments[1])
    ) {
      const spyTargetType = this.checker.getTypeAtLocation(node.arguments[0]);
      const spyProperty = spyTargetType.getProperty(node.arguments[1].text);

      if (spyProperty === undefined) {
        return;
      }

      const inputTarget = attemptRetrieveInputFromSymbol(this.host, spyProperty, this.knownInputs);
      if (inputTarget === null) {
        return;
      }

      this.knownInputs.markInputAsIncompatible(inputTarget.descriptor, {
        context: node,
        reason: InputIncompatibilityReason.SpyOnThatOverwritesField,
      });
    }
  }
}
