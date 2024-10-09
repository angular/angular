/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ClassFieldDescriptor, KnownFields} from '../passes/reference_resolution/known_fields';
import {ProblematicFieldRegistry} from '../passes/problematic_patterns/problematic_field_registry';
import {FieldIncompatibilityReason} from '../passes/problematic_patterns/incompatibility';

/**
 * Detects `spyOn(dirInstance, 'myInput')` calls that likely modify
 * the input signal. There is no way to change the value inside the input signal,
 * and hence observing is not possible.
 */
export class SpyOnFieldPattern<D extends ClassFieldDescriptor> {
  constructor(
    private checker: ts.TypeChecker,
    private fields: KnownFields<D> & ProblematicFieldRegistry<D>,
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

      const fieldTarget = this.fields.attemptRetrieveDescriptorFromSymbol(spyProperty);
      if (fieldTarget === null) {
        return;
      }

      this.fields.markFieldIncompatible(fieldTarget, {
        reason: FieldIncompatibilityReason.SpyOnThatOverwritesField,
        context: node,
      });
    }
  }
}
