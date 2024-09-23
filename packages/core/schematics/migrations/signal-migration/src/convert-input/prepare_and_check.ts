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
import {Decorator} from '@angular/compiler-cli/src/ngtsc/reflection';
import assert from 'assert';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';

/**
 * Interface describing analysis performed when the input
 * was verified to be convert-able.
 */
export interface ConvertInputPreparation {
  resolvedType: ts.TypeNode | undefined;
  preferShorthandIfPossible: {originalType: ts.TypeNode} | null;
  requiredButIncludedUndefinedPreviously: boolean;
  resolvedMetadata: ExtractedInput;
  originalInputDecorator: Decorator;
  initialValue: ts.Expression | undefined;
  leadingTodoText: string | null;
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
  options: NgCompilerOptions,
): InputMemberIncompatibility | ConvertInputPreparation {
  // Accessor inputs cannot be migrated right now.
  if (ts.isAccessor(node)) {
    return {
      context: node,
      reason: InputIncompatibilityReason.Accessor,
    };
  }

  assert(
    metadata.inputDecorator !== null,
    'Expected an input decorator for inputs that are being migrated.',
  );

  let initialValue = node.initializer;
  let isUndefinedInitialValue =
    node.initializer === undefined ||
    (ts.isIdentifier(node.initializer) && node.initializer.text === 'undefined');

  const loosePropertyInitializationWithStrictNullChecks =
    options.strict !== true && options.strictPropertyInitialization !== true;

  // If an input can be required, due to the non-null assertion on the property,
  // make it required if there is no initializer.
  if (node.exclamationToken !== undefined && initialValue === undefined) {
    metadata.required = true;
  }

  let typeToAdd: ts.TypeNode | undefined = node.type;
  let preferShorthandIfPossible: {originalType: ts.TypeNode} | null = null;

  // If there is no initial value, or it's `undefined`, we can prefer the `input()`
  // shorthand which automatically uses `undefined` as initial value, and includes it
  // in the input type.
  if (
    !metadata.required &&
    node.type !== undefined &&
    isUndefinedInitialValue &&
    !loosePropertyInitializationWithStrictNullChecks
  ) {
    preferShorthandIfPossible = {originalType: node.type};
  }

  // If the input is using `@Input() bla?: string;` with the "optional question mark",
  // then we try to explicitly add `undefined` as type, if it's not part of the type already.
  // This is ensuring correctness, as `bla?` automatically includes `undefined` currently.
  if (
    node.type !== undefined &&
    node.questionToken !== undefined &&
    !checker.isTypeAssignableTo(checker.getUndefinedType(), checker.getTypeFromTypeNode(node.type))
  ) {
    typeToAdd = ts.factory.createUnionTypeNode([
      node.type,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
    ]);
  }

  let leadingTodoText: string | null = null;

  // If the input does not have an initial value, and strict property initialization
  // is disabled, while strict null checks are enabled; then we know that `undefined`
  // cannot be used as initial value, nor do we want to expand the input's type magically.
  // Instead, we detect this case and migrate to `undefined!` which leaves the behavior unchanged.
  // TODO: This would be a good spot for a clean-up TODO.
  if (
    loosePropertyInitializationWithStrictNullChecks &&
    node.initializer === undefined &&
    node.type !== undefined &&
    node.questionToken === undefined &&
    node.exclamationToken === undefined &&
    metadata.required === false &&
    !checker.isTypeAssignableTo(checker.getUndefinedType(), checker.getTypeFromTypeNode(node.type))
  ) {
    leadingTodoText =
      'Input is initialized to `undefined` but type does not allow this value. ' +
      'This worked with `@Input` because your project uses `--strictPropertyInitialization=false`.';
    isUndefinedInitialValue = false;
    initialValue = ts.factory.createNonNullExpression(ts.factory.createIdentifier('undefined'));
  }

  // Attempt to extract type from input initial value. No explicit type, but input is required.
  // Hence we need an explicit type, or fall back to `typeof`.
  if (typeToAdd === undefined && initialValue !== undefined && metadata.required) {
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
    requiredButIncludedUndefinedPreviously: metadata.required && node.questionToken !== undefined,
    resolvedMetadata: metadata,
    resolvedType: typeToAdd,
    preferShorthandIfPossible,
    originalInputDecorator: metadata.inputDecorator,
    initialValue: isUndefinedInitialValue ? undefined : initialValue,
    leadingTodoText,
  };
}
