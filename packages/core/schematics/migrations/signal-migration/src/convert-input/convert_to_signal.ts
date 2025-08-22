/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'node:assert';
import ts from 'typescript';

import {ConvertInputPreparation} from './prepare_and_check';
import {DecoratorInputTransform} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ImportManager} from '@angular/compiler-cli/src/ngtsc/translator';
import {removeFromUnionIfPossible} from '../utils/remove_from_union';
import {MigrationResult} from '../result';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../utils/tsurge';
import {insertPrecedingLine} from '../../../../utils/tsurge/helpers/ast/insert_preceding_line';
import {cutStringToLineLimit} from '../../../../utils/tsurge/helpers/string_manipulation/cut_string_line_length';

// TODO: Consider initializations inside the constructor. Those are not migrated right now
// though, as they are writes.

/**
 * Converts an `@Input()` property declaration to a signal input.
 *
 * @returns Replacements for converting the input.
 */
export function convertToSignalInput(
  node: ts.PropertyDeclaration,
  {
    resolvedMetadata: metadata,
    resolvedType,
    preferShorthandIfPossible,
    originalInputDecorator,
    initialValue,
    leadingTodoText,
  }: ConvertInputPreparation,
  info: ProgramInfo,
  checker: ts.TypeChecker,
  importManager: ImportManager,
  result: MigrationResult,
): Replacement[] {
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
      const transformRes = extractTransformOfInput(metadata.transform, resolvedType, checker);
      properties.push(transformRes.node);

      // Propagate TODO if one was requested from the transform extraction/validation.
      if (transformRes.leadingTodoText !== null) {
        leadingTodoText =
          (leadingTodoText ? `${leadingTodoText} ` : '') + transformRes.leadingTodoText;
      }
    }

    optionsLiteral = ts.factory.createObjectLiteralExpression(properties);
  }

  // The initial value is `undefined` or none is present:
  //    - We may be able to use the `input()` shorthand
  //    - or we use an explicit `undefined` initial value.
  if (initialValue === undefined) {
    // Shorthand not possible, so explicitly add `undefined`.
    if (preferShorthandIfPossible === null) {
      initialValue = ts.factory.createIdentifier('undefined');
    } else {
      resolvedType = preferShorthandIfPossible.originalType;

      // When using the `input()` shorthand, try cutting of `undefined` from potential
      // union types. `undefined` will be automatically included in the type.
      if (ts.isUnionTypeNode(resolvedType)) {
        resolvedType = removeFromUnionIfPossible(
          resolvedType,
          (t) => t.kind !== ts.SyntaxKind.UndefinedKeyword,
        );
      }
    }
  }

  const inputArgs: ts.Expression[] = [];
  const typeArguments: ts.TypeNode[] = [];

  if (resolvedType !== undefined) {
    typeArguments.push(resolvedType);

    if (metadata.transform !== null) {
      // Note: The TCB code generation may use the same type node and attach
      // synthetic comments for error reporting. We remove those explicitly here.
      typeArguments.push(ts.setSyntheticTrailingComments(metadata.transform.type.node, undefined));
    }
  }

  // Always add an initial value when the input is optional, and we have one, or we need one
  // to be able to pass options as the second argument.
  if (!metadata.required && (initialValue !== undefined || optionsLiteral !== null)) {
    inputArgs.push(initialValue ?? ts.factory.createIdentifier('undefined'));
  }

  if (optionsLiteral !== null) {
    inputArgs.push(optionsLiteral);
  }

  const inputFnRef = importManager.addImport({
    exportModuleSpecifier: '@angular/core',
    exportSymbolName: 'input',
    requestedFile: node.getSourceFile(),
  });
  const inputInitializerFn = metadata.required
    ? ts.factory.createPropertyAccessExpression(inputFnRef, 'required')
    : inputFnRef;

  const inputInitializer = ts.factory.createCallExpression(
    inputInitializerFn,
    typeArguments,
    inputArgs,
  );

  let modifiersWithoutInputDecorator =
    node.modifiers?.filter((m) => m !== originalInputDecorator.node) ?? [];

  // Add `readonly` to all new signal input declarations.
  if (!modifiersWithoutInputDecorator?.some((s) => s.kind === ts.SyntaxKind.ReadonlyKeyword)) {
    modifiersWithoutInputDecorator.push(ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword));
  }

  const newNode = ts.factory.createPropertyDeclaration(
    modifiersWithoutInputDecorator,
    node.name,
    undefined,
    undefined,
    inputInitializer,
  );

  const newPropertyText = result.printer.printNode(
    ts.EmitHint.Unspecified,
    newNode,
    node.getSourceFile(),
  );

  const replacements: Replacement[] = [];

  if (leadingTodoText !== null) {
    replacements.push(
      insertPrecedingLine(node, info, '// TODO: Notes from signal input migration:'),
      ...cutStringToLineLimit(leadingTodoText, 70).map((line) =>
        insertPrecedingLine(node, info, `//  ${line}`),
      ),
    );
  }

  replacements.push(
    new Replacement(
      projectFile(node.getSourceFile(), info),
      new TextUpdate({
        position: node.getStart(),
        end: node.getEnd(),
        toInsert: newPropertyText,
      }),
    ),
  );

  return replacements;
}

/**
 * Extracts the transform for the given input and returns a property assignment
 * that works for the new signal `input()` API.
 */
function extractTransformOfInput(
  transform: DecoratorInputTransform,
  resolvedType: ts.TypeNode | undefined,
  checker: ts.TypeChecker,
): {node: ts.PropertyAssignment; leadingTodoText: string | null} {
  assert(ts.isExpression(transform.node), `Expected transform to be an expression.`);
  let transformFn: ts.Expression = transform.node;
  let leadingTodoText: string | null = null;

  // If there is an explicit type, check if the transform return type actually works.
  // In some cases, the transform function is not compatible because with decorator inputs,
  // those were not checked. We cast the transform to `any` and add a TODO.
  // TODO: Capture this in the design doc.
  if (resolvedType !== undefined && !ts.isSyntheticExpression(resolvedType)) {
    // Note: If the type is synthetic, we cannot check, and we accept that in the worst case
    // we will create code that is not necessarily compiling. This is unlikely, but notably
    // the errors would be correct and valuable.
    const transformType = checker.getTypeAtLocation(transform.node);
    const transformSignature = transformType.getCallSignatures()[0];
    assert(transformSignature !== undefined, 'Expected transform to be an invoke-able.');

    if (
      !checker.isTypeAssignableTo(
        checker.getReturnTypeOfSignature(transformSignature),
        checker.getTypeFromTypeNode(resolvedType),
      )
    ) {
      leadingTodoText =
        'Input type is incompatible with transform. The migration added an `any` cast. ' +
        'This worked previously because Angular was unable to check transforms.';
      transformFn = ts.factory.createAsExpression(
        ts.factory.createParenthesizedExpression(transformFn),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
    }
  }

  return {
    node: ts.factory.createPropertyAssignment('transform', transformFn),
    leadingTodoText,
  };
}
