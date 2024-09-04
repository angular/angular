/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {InputIncompatibilityReason} from '../../input_detection/incompatibility';
import {KnownInputs} from '../../input_detection/known_inputs';
import {attemptRetrieveInputFromSymbol} from '../../input_detection/nodes_to_input';
import {MigrationHost} from '../../migration_host';
import {DebugElementComponentInstance} from '../../pattern_advisors/debug_element_component_instance';
import {MigrationResult} from '../../result';
import {InputReferenceKind} from '../../utils/input_reference';
import {traverseAccess} from '../../utils/traverse_access';
import {unwrapParent} from '../../utils/unwrap_parent';
import {writeBinaryOperators} from '../../utils/write_operators';
import {resolveBindingElement} from '../../utils/binding_elements';
import {lookupPropertyAccess} from '../../../../../utils/tsurge/helpers/ast/lookup_property_access';

/**
 * Checks whether given TypeScript reference refers to an Angular input, and captures
 * the reference if possible.
 */
export function identifyPotentialTypeScriptReference(
  node: ts.Identifier,
  host: MigrationHost,
  checker: ts.TypeChecker,
  knownInputs: KnownInputs,
  result: MigrationResult,
  migratedInputFieldNames: Set<string>,
  advisors: {
    debugElComponentInstanceTracker: DebugElementComponentInstance;
  },
): void {
  // Skip all identifiers that never can point to a migrated input.
  // TODO: Capture these assumptions and performance optimizations in the design doc.
  if (!migratedInputFieldNames.has(node.text)) {
    return;
  }

  let target: ts.Symbol | undefined = undefined;

  // Resolve binding elements to their declaration symbol.
  // Commonly inputs are accessed via object expansion. e.g. `const {input} = this;`.
  if (ts.isBindingElement(node.parent)) {
    // Skip binding elements that are using spread.
    if (node.parent.dotDotDotToken !== undefined) {
      return;
    }

    const bindingInfo = resolveBindingElement(node.parent);
    if (bindingInfo === null) {
      // The declaration could not be resolved. Skip analyzing this.
      return;
    }

    const bindingType = checker.getTypeAtLocation(bindingInfo.pattern);
    const resolved = lookupPropertyAccess(checker, bindingType, [bindingInfo.propertyName]);
    target = resolved?.symbol;
  } else {
    target = checker.getSymbolAtLocation(node);
  }

  noTargetSymbolCheck: if (target === undefined) {
    if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
      const propAccessSymbol = checker.getSymbolAtLocation(node.parent.expression);
      if (
        propAccessSymbol !== undefined &&
        propAccessSymbol.valueDeclaration !== undefined &&
        ts.isVariableDeclaration(propAccessSymbol.valueDeclaration) &&
        propAccessSymbol.valueDeclaration.initializer !== undefined
      ) {
        target = advisors.debugElComponentInstanceTracker
          .detect(propAccessSymbol.valueDeclaration.initializer)
          ?.getProperty(node.text);

        // We found a target in the fallback path. Break out.
        if (target !== undefined) {
          break noTargetSymbolCheck;
        }
      }
    }
    return;
  }

  let targetInput = attemptRetrieveInputFromSymbol(host, target, knownInputs);
  if (targetInput === null) {
    return;
  }

  const accessParent = unwrapParent(traverseAccess(node).parent);
  const isWriteReference =
    ts.isBinaryExpression(accessParent) &&
    writeBinaryOperators.includes(accessParent.operatorToken.kind);

  // track accesses from source files to inputs.
  result.references.push({
    kind: InputReferenceKind.TsInputReference,
    from: {
      node,
      fileId: host.fileToId(node.getSourceFile()),
      isWrite: isWriteReference,
      isPartOfElementBinding: ts.isBindingElement(node.parent),
    },
    target: targetInput?.descriptor,
  });

  if (isWriteReference) {
    knownInputs.markInputAsIncompatible(targetInput.descriptor, {
      context: accessParent,
      reason: InputIncompatibilityReason.WriteAssignment,
    });
  }
}
