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
  advisors: {
    debugElComponentInstanceTracker: DebugElementComponentInstance;
  },
) {
  let target = checker.getSymbolAtLocation(node);

  // Resolve binding elements to their declaration symbol.
  // Commonly inputs are accessed via object expansion. e.g. `const {input} = this;`.
  if (target?.declarations?.[0] && ts.isBindingElement(target?.declarations[0])) {
    const bindingElement = target.declarations[0];
    const bindingParent = bindingElement.parent;
    const bindingType = checker.getTypeAtLocation(bindingParent);
    const bindingName = bindingElement.propertyName ?? bindingElement.name;

    if (ts.isIdentifier(bindingName) && bindingType.getProperty(bindingName.text)) {
      target = bindingType.getProperty(bindingName.text);
    }
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

  // track accesses from source files to inputs.
  result.references.push({
    kind: InputReferenceKind.TsInputReference,
    from: {fileId: host.fileToId(node.getSourceFile()), node},
    target: targetInput?.descriptor,
  });

  const accessParent = unwrapParent(traverseAccess(node).parent);

  if (
    ts.isBinaryExpression(accessParent) &&
    writeBinaryOperators.includes(accessParent.operatorToken.kind)
  ) {
    knownInputs.markInputAsIncompatible(targetInput.descriptor, {
      context: accessParent,
      reason: InputIncompatibilityReason.WriteAssignment,
    });
  }
}
