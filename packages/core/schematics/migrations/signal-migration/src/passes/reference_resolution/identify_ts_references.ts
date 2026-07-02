/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../../../../utils/tsurge';
import {lookupPropertyAccess} from '../../../../../utils/tsurge/helpers/ast/lookup_property_access';
import {DebugElementComponentInstance} from '../../pattern_advisors/debug_element_component_instance';
import {resolveBindingElement} from '../../utils/binding_elements';
import {traverseAccess} from '../../utils/traverse_access';
import {unwrapParent} from '../../utils/unwrap_parent';
import {writeBinaryOperators} from '../../utils/write_operators';
import {ReferenceResult} from './reference_result';
import {ClassFieldDescriptor, KnownFields} from './known_fields';
import {ReferenceKind} from './reference_kinds';

/**
 * Checks whether given TypeScript reference refers to an Angular input, and captures
 * the reference if possible.
 *
 * @param fieldNamesToConsiderForReferenceLookup List of field names that should be
 *   respected when expensively looking up references to known fields.
 *   May be null if all identifiers should be inspected.
 */
export function identifyPotentialTypeScriptReference<D extends ClassFieldDescriptor>(
  node: ts.Identifier,
  programInfo: ProgramInfo,
  checker: ts.TypeChecker,
  knownFields: KnownFields<D>,
  result: ReferenceResult<D>,
  fieldNamesToConsiderForReferenceLookup: Set<string> | null,
  advisors: {
    debugElComponentInstanceTracker: DebugElementComponentInstance;
  },
): void {
  // Skip all identifiers that never can point to a migrated field.
  // TODO: Capture these assumptions and performance optimizations in the design doc.
  if (
    fieldNamesToConsiderForReferenceLookup !== null &&
    !fieldNamesToConsiderForReferenceLookup.has(node.text)
  ) {
    return;
  }

  let target: ts.Symbol | undefined = undefined;

  try {
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
  } catch (e) {
    console.error('Unexpected error while trying to resolve identifier reference:');
    console.error(e);

    // Gracefully skip analyzing. This can happen when e.g. a reference is named similar
    // to an input, but is dependant on `.d.ts` that is not necessarily available (clutz dts).
    return;
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

  let targetInput = knownFields.attemptRetrieveDescriptorFromSymbol(target);
  if (targetInput === null) {
    return;
  }

  const access = unwrapParent(traverseAccess(node));
  const accessParent = access.parent;
  const isWriteReference =
    ts.isBinaryExpression(accessParent) &&
    accessParent.left === access &&
    writeBinaryOperators.includes(accessParent.operatorToken.kind);

  // track accesses from source files to known fields.
  result.references.push({
    kind: ReferenceKind.TsReference,
    from: {
      node,
      file: projectFile(node.getSourceFile(), programInfo),
      isWrite: isWriteReference,
      isPartOfElementBinding: ts.isBindingElement(node.parent),
    },
    target: targetInput,
  });
}
