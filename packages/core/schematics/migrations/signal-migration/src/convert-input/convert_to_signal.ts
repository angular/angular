/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import assert from 'assert';
import ts from 'typescript';

import {MigrationHost} from '../migration_host';
import {ConvertInputPreparation} from './prepare_and_check';
import {DecoratorInputTransform} from '../../../../../../compiler-cli/src/ngtsc/metadata';

const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

/**
 *
 * Converts an `@Input()` property declaration to a signal input.
 *
 * @returns The transformed property declaration, printed as a string.
 */
export function convertToSignalInput(
  host: MigrationHost,
  node: ts.PropertyDeclaration,
  {resolvedMetadata: metadata, resolvedType, isResolvedTypeCheckable}: ConvertInputPreparation,
  checker: ts.TypeChecker,
): string {
  let initialValue = node.initializer;
  let optionsLiteral: ts.ObjectLiteralExpression | null = null;

  // We need an options array for the input because:
  //   - the input is either aliased,
  //   - or we have a transform.
  if (metadata.bindingPropertyName !== metadata.classPropertyName || metadata.transform !== null) {
    const properties: ts.ObjectLiteralElementLike[] = [];
    if (metadata.bindingPropertyName !== metadata.classPropertyName) {
      properties.push(
        ts.factory.createPropertyAssignment(
          'alias',
          ts.factory.createStringLiteral(metadata.bindingPropertyName),
        ),
      );
    }
    if (metadata.transform !== null) {
      properties.push(
        extractTransformOfInput(metadata.transform, resolvedType, isResolvedTypeCheckable, checker),
      );
    }

    optionsLiteral = ts.factory.createObjectLiteralExpression(properties);
  }

  const strictPropertyInitialization =
    !!host.tsOptions.strict || !!host.tsOptions.strictPropertyInitialization;
  const inputArgs: ts.Expression[] = [];
  const typeArguments: ts.TypeNode[] = [];

  if (resolvedType !== undefined) {
    typeArguments.push(resolvedType);

    if (metadata.transform !== null) {
      typeArguments.push(metadata.transform.type.node);
    }
  }

  // If we have no initial value but strict property initialization is enabled, we
  // need to add an explicit value. Alternatively, if we have an explicit type, we
  // need to add an explicit initial value as per the API signature of `input()`.
  if (initialValue === undefined && (strictPropertyInitialization || resolvedType !== undefined)) {
    // TODO: Consider initializations inside the constructor. Those are not migrated right now
    // though, as they are writes.

    // TODO: We can use the `input()` shorthand if there is a question mark?
    // We can assume `undefined` is part of the type already, either already was included, or
    // we added synthetically as part of the preparation.
    initialValue = ts.factory.createIdentifier('undefined');
  }

  // Always add an initial value when the input is optional, and we have one, or we need one
  // to be able to pass options as the second argument.
  if (!metadata.required && (initialValue !== undefined || optionsLiteral !== null)) {
    // TODO: undefined `input()` shorthand support!
    inputArgs.push(initialValue ?? ts.factory.createIdentifier('undefined'));
  }

  if (optionsLiteral !== null) {
    inputArgs.push(optionsLiteral);
  }

  const inputFnRef =
    metadata.inputDecoratorRef !== null && ts.isPropertyAccessExpression(metadata.inputDecoratorRef)
      ? ts.factory.createPropertyAccessExpression(metadata.inputDecoratorRef.expression, 'input')
      : ts.factory.createIdentifier('input');

  const inputInitializerFn = metadata.required
    ? ts.factory.createPropertyAccessExpression(inputFnRef, 'required')
    : inputFnRef;

  const inputInitializer = ts.factory.createCallExpression(
    inputInitializerFn,
    typeArguments,
    inputArgs,
  );

  // TODO:
  //   - modifiers (but private does not work)
  //   - preserve custom decorators etc.

  const result = ts.factory.createPropertyDeclaration(
    undefined,
    node.name,
    undefined,
    undefined,
    inputInitializer,
  );

  return printer.printNode(ts.EmitHint.Unspecified, result, node.getSourceFile());
}

/**
 * Extracts the transform for the given input and returns a property assignment
 * that works for the new signal `input()` API.
 */
function extractTransformOfInput(
  transform: DecoratorInputTransform,
  resolvedType: ts.TypeNode | undefined,
  isResolvedTypeCheckable: boolean,
  checker: ts.TypeChecker,
): ts.PropertyAssignment {
  assert(ts.isExpression(transform.node), `Expected transform to be an expression.`);
  let transformFn: ts.Expression = transform.node;

  // If there is an explicit type, check if the transform return type actually works.
  // In some cases, the transform function is not compatible because with decorator inputs,
  // those were not checked. We cast the transform to `any` and add a TODO.
  // TODO: Insert a TODO and capture this in the design doc.
  if (resolvedType !== undefined && isResolvedTypeCheckable) {
    const transformType = checker.getTypeAtLocation(transform.node);
    const transformSignature = transformType.getCallSignatures()[0];
    assert(transformSignature !== undefined, 'Expected transform to be an invoke-able.');

    if (
      !checker.isTypeAssignableTo(
        checker.getReturnTypeOfSignature(transformSignature),
        checker.getTypeFromTypeNode(resolvedType),
      )
    ) {
      transformFn = ts.factory.createAsExpression(
        ts.factory.createParenthesizedExpression(transformFn),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
    }
  }

  return ts.factory.createPropertyAssignment('transform', transformFn);
}
