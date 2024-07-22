/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ExtractedInput} from '../input_detection/input_decorator';
import {
  InputIncompatibilityReason,
  InputMemberIncompatibility,
} from '../input_detection/incompatibility';
import {InputNode} from '../input_detection/input_node';

/**
 * Interface describing analysis performed when the input
 * was verified to be convert-able.
 */
export interface ConvertInputPreparation {
  resolvedType: ts.TypeNode | undefined;
  isResolvedTypeCheckable: boolean;
  resolvedMetadata: ExtractedInput;
}

/**
 * Prepares a potential migration of the given node by performing
 * initial analysis and checking whether it an be migrated.
 *
 * For example, required inputs that don't have an explicit type may not
 * be migrated as we don't have a good type for `input.required<T>`.
 *   (Note: `typeof Bla` may be usable— but isn't necessarily a good practice
 *    for complex expressions)
 */
export function prepareAndCheckForConversion(
  node: InputNode,
  metadata: ExtractedInput,
  checker: ts.TypeChecker,
): InputMemberIncompatibility | ConvertInputPreparation {
  // Accessor inputs cannot be migrated right now.
  if (ts.isAccessor(node)) {
    return {
      context: node,
      reason: InputIncompatibilityReason.Accessor,
    };
  }
  const initialValue = node.initializer;

  // If an input can be required, due to the non-null assertion on the property,
  // make it required if there is no initializer.
  if (node.exclamationToken !== undefined && initialValue === undefined) {
    metadata.required = true;
  }

  let typeToAdd: ts.TypeNode | undefined = node.type;
  let isResolvedTypeCheckable = true;

  // If the input was using `@Input() bla?: string;`, then we try to explicitly
  // add `undefined` as type, if it's not part of the type already.
  if (
    node.type !== undefined &&
    node.questionToken !== undefined &&
    !checker.isTypeAssignableTo(checker.getUndefinedType(), checker.getTypeFromTypeNode(node.type))
  ) {
    // Synthetic types are never checkable.
    isResolvedTypeCheckable = false;
    typeToAdd = ts.factory.createUnionTypeNode([
      node.type,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
    ]);
  }

  // Attempt to extract type from input initial value. No explicit type, but input is required.
  // Hence we need an explicit type, or fall back to `typeof`.
  if (typeToAdd === undefined && initialValue !== undefined && metadata.required) {
    // Synthetic types are never checkable.
    isResolvedTypeCheckable = false;

    const propertyType = checker.getTypeAtLocation(node);
    if (propertyType.flags & ts.TypeFlags.Boolean) {
      typeToAdd = ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    } else if (propertyType.flags & ts.TypeFlags.String) {
      typeToAdd = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    } else if (propertyType.flags & ts.TypeFlags.Number) {
      typeToAdd = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    } else if (ts.isIdentifier(initialValue)) {
      // @Input({required: true}) bla = SOME_DEFAULT;
      typeToAdd = ts.factory.createTypeQueryNode(initialValue);
    } else if (
      ts.isPropertyAccessExpression(initialValue) &&
      ts.isIdentifier(initialValue.name) &&
      ts.isIdentifier(initialValue.expression)
    ) {
      // @Input({required: true}) bla = prop.SOME_DEFAULT;
      typeToAdd = ts.factory.createTypeQueryNode(
        ts.factory.createQualifiedName(initialValue.name, initialValue.expression),
      );
    } else {
      // Note that we could use `typeToTypeNode` here but it's likely breaking because
      // the generated type might depend on imports that we cannot add here (nor want).
      return {
        context: node,
        reason: InputIncompatibilityReason.RequiredInputButNoGoodExplicitTypeExtractable,
      };
    }
  }

  return {
    resolvedMetadata: metadata,
    isResolvedTypeCheckable,
    resolvedType: typeToAdd,
  };
}
