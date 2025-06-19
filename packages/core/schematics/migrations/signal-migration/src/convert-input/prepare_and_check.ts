/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Decorator, NgCompilerOptions} from '@angular/compiler-cli';
import assert from 'assert';
import ts from 'typescript';
import {ExtractedInput} from '../input_detection/input_decorator';
import {InputNode} from '../input_detection/input_node';
import {
  FieldIncompatibility,
  FieldIncompatibilityReason,
} from '../passes/problematic_patterns/incompatibility';

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
): FieldIncompatibility | ConvertInputPreparation {
  // Accessor inputs cannot be migrated right now.
  if (ts.isAccessor(node)) {
    return {
      context: node,
      reason: FieldIncompatibilityReason.Accessor,
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

  const strictNullChecksEnabled = options.strict === true || options.strictNullChecks === true;
  const strictPropertyInitialization =
    options.strict === true || options.strictPropertyInitialization === true;

  // Shorthand should never be used, as would expand the type of `T` to be `T|undefined`.
  // This wouldn't matter with strict null checks disabled, but it can break if this is
  // a library that is later consumed with strict null checks enabled.
  const avoidTypeExpansion = !strictNullChecksEnabled;

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
    !avoidTypeExpansion
  ) {
    preferShorthandIfPossible = {originalType: node.type};
  }

  // If the input is using `@Input() bla?: string;` with the "optional question mark",
  // then we try to explicitly add `undefined` as type, if it's not part of the type already.
  // This is ensuring correctness, as `bla?` automatically includes `undefined` currently.
  if (node.questionToken !== undefined) {
    // If there is no type, but we have an initial value, try inferring
    // it from the initializer.
    if (typeToAdd === undefined && initialValue !== undefined) {
      const inferredType = inferImportableTypeForInput(checker, node, initialValue);
      if (inferredType !== null) {
        typeToAdd = inferredType;
      }
    }
    if (typeToAdd === undefined) {
      return {
        context: node,
        reason:
          FieldIncompatibilityReason.SignalInput__QuestionMarkButNoGoodExplicitTypeExtractable,
      };
    }

    if (
      !checker.isTypeAssignableTo(
        checker.getUndefinedType(),
        checker.getTypeFromTypeNode(typeToAdd),
      )
    ) {
      typeToAdd = ts.factory.createUnionTypeNode([
        typeToAdd,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
      ]);
    }
  }

  let leadingTodoText: string | null = null;

  // If the input does not have an initial value, and strict property initialization
  // is disabled, while strict null checks are enabled; then we know that `undefined`
  // cannot be used as initial value, nor do we want to expand the input's type magically.
  // Instead, we detect this case and migrate to `undefined!` which leaves the behavior unchanged.
  if (
    strictNullChecksEnabled &&
    !strictPropertyInitialization &&
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
    const inferredType = inferImportableTypeForInput(checker, node, initialValue);
    if (inferredType !== null) {
      typeToAdd = inferredType;
    } else {
      // Note that we could use `typeToTypeNode` here but it's likely breaking because
      // the generated type might depend on imports that we cannot add here (nor want).
      return {
        context: node,
        reason: FieldIncompatibilityReason.SignalInput__RequiredButNoGoodExplicitTypeExtractable,
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

function inferImportableTypeForInput(
  checker: ts.TypeChecker,
  node: InputNode,
  initialValue: ts.Node,
): ts.TypeNode | null {
  const propertyType = checker.getTypeAtLocation(node);

  // If the resolved type is a primitive, or union of primitive types,
  // return a type node fully derived from the resolved type.
  if (
    isPrimitiveImportableTypeNode(propertyType) ||
    (propertyType.isUnion() && propertyType.types.every(isPrimitiveImportableTypeNode))
  ) {
    return checker.typeToTypeNode(propertyType, node, ts.NodeBuilderFlags.NoTypeReduction) ?? null;
  }

  // Alternatively, try to infer a simple importable type from\
  // the initializer.

  if (ts.isIdentifier(initialValue)) {
    // @Input({required: true}) bla = SOME_DEFAULT;
    return ts.factory.createTypeQueryNode(initialValue);
  } else if (
    ts.isPropertyAccessExpression(initialValue) &&
    ts.isIdentifier(initialValue.name) &&
    ts.isIdentifier(initialValue.expression)
  ) {
    // @Input({required: true}) bla = prop.SOME_DEFAULT;
    return ts.factory.createTypeQueryNode(
      ts.factory.createQualifiedName(initialValue.name, initialValue.expression),
    );
  }

  return null;
}

function isPrimitiveImportableTypeNode(type: ts.Type): boolean {
  return !!(
    type.flags & ts.TypeFlags.BooleanLike ||
    type.flags & ts.TypeFlags.StringLike ||
    type.flags & ts.TypeFlags.NumberLike ||
    type.flags & ts.TypeFlags.Undefined ||
    type.flags & ts.TypeFlags.Null
  );
}
