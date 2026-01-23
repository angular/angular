/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ExtractedQuery} from './identify_queries';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../utils/tsurge';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import assert from 'assert';
import {WrappedNodeExpr} from '@angular/compiler';
import {removeFromUnionIfPossible} from '../signal-migration/src/utils/remove_from_union';
import {extractQueryListType} from './query_list_type';

/**
 *  A few notes on changes:
 *
 *    @ViewChild()
 *       --> static is gone!
 *       --> read stays
 *
 *    @ViewChildren()
 *       --> emitDistinctChangesOnly is gone!
 *       --> read stays
 *
 *    @ContentChild()
 *       --> descendants stays
 *       --> read stays
 *       --> static is gone!
 *
 *    @ContentChildren()
 *       --> descendants stays
 *       --> read stays
 *       --> emitDistinctChangesOnly is gone!
 */
export function computeReplacementsToMigrateQuery(
  node: ts.PropertyDeclaration,
  metadata: ExtractedQuery,
  importManager: ImportManager,
  info: ProgramInfo,
  printer: ts.Printer,
  options: ts.CompilerOptions,
  checker: ts.TypeChecker,
): Replacement[] {
  const sf = node.getSourceFile();
  let newQueryFn = importManager.addImport({
    requestedFile: sf,
    exportModuleSpecifier: '@angular/core',
    exportSymbolName: metadata.kind,
  });

  // The default value for descendants is `true`, except for `ContentChildren`.
  const defaultDescendants = metadata.kind !== 'contentChildren';
  const optionProperties: ts.PropertyAssignment[] = [];
  const args: ts.Expression[] = [
    metadata.args[0], // Locator.
  ];
  let type = node.type;

  // For multi queries, attempt to unwrap `QueryList` types, or infer the
  // type from the initializer, if possible.
  if (!metadata.queryInfo.first) {
    if (type === undefined && node.initializer !== undefined) {
      type = extractQueryListType(node.initializer);
    } else if (type !== undefined) {
      type = extractQueryListType(type);
    }
  }

  if (metadata.queryInfo.read !== null) {
    assert(metadata.queryInfo.read instanceof WrappedNodeExpr);
    optionProperties.push(
      ts.factory.createPropertyAssignment('read', metadata.queryInfo.read.node),
    );
  }
  if (metadata.queryInfo.descendants !== defaultDescendants) {
    optionProperties.push(
      ts.factory.createPropertyAssignment(
        'descendants',
        metadata.queryInfo.descendants ? ts.factory.createTrue() : ts.factory.createFalse(),
      ),
    );
  }

  if (optionProperties.length > 0) {
    args.push(ts.factory.createObjectLiteralExpression(optionProperties));
  }

  const strictNullChecksEnabled = options.strict === true || options.strictNullChecks === true;
  const strictPropertyInitialization =
    options.strict === true || options.strictPropertyInitialization === true;
  let isRequired = node.exclamationToken !== undefined;

  // If we come across an application with strict null checks enabled, but strict
  // property initialization is disabled, there are two options:
  //   - Either the query is already typed to include `undefined` explicitly,
  //     in which case an option query makes sense.
  //   - OR, the query is not typed to include `undefined`. In which case, the query
  //     should be marked as required to not break the app. The user-code throughout
  //     the application (given strict null checks) already assumes non-nullable!
  if (
    strictNullChecksEnabled &&
    !strictPropertyInitialization &&
    node.initializer === undefined &&
    node.questionToken === undefined &&
    type !== undefined &&
    !checker.isTypeAssignableTo(checker.getUndefinedType(), checker.getTypeFromTypeNode(type))
  ) {
    isRequired = true;
  }

  if (isRequired && metadata.queryInfo.first) {
    // If the query is required already via some indicators, and this is a "single"
    // query, use the available `.required` method.
    newQueryFn = ts.factory.createPropertyAccessExpression(newQueryFn, 'required');
  }

  // If this query is still nullable (i.e. not required), attempt to remove
  // explicit `undefined` types if possible.
  if (!isRequired && type !== undefined && ts.isUnionTypeNode(type)) {
    type = removeFromUnionIfPossible(type, (v) => v.kind !== ts.SyntaxKind.UndefinedKeyword);
  }

  let locatorType = Array.isArray(metadata.queryInfo.predicate)
    ? null
    : metadata.queryInfo.predicate.expression;
  let resolvedReadType = metadata.queryInfo.read ?? locatorType;

  // If the original property type and the read type are matching, we can rely
  // on the TS inference, instead of repeating types, like in `viewChild<Button>(Button)`.
  if (
    type !== undefined &&
    resolvedReadType instanceof WrappedNodeExpr &&
    ts.isIdentifier(resolvedReadType.node) &&
    ts.isTypeReferenceNode(type) &&
    ts.isIdentifier(type.typeName) &&
    type.typeName.text === resolvedReadType.node.text
  ) {
    locatorType = null;
  }

  const call = ts.factory.createCallExpression(
    newQueryFn,
    // If there is no resolved `ReadT` (e.g. string predicate), we use the
    // original type explicitly as generic. Otherwise, query API is smart
    // enough to always infer.
    resolvedReadType === null && type !== undefined ? [type] : undefined,
    args,
  );

  const accessibilityModifier = getAccessibilityModifier(node);
  let modifiers: (ts.ModifierLike | ts.ModifierToken<ts.SyntaxKind.ReadonlyKeyword>)[] = [
    ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
  ];
  if (accessibilityModifier) {
    modifiers = [accessibilityModifier, ...modifiers];
  }

  const updated = ts.factory.createPropertyDeclaration(
    modifiers,
    node.name,
    undefined,
    undefined,
    call,
  );

  return [
    new Replacement(
      projectFile(node.getSourceFile(), info),
      new TextUpdate({
        position: node.getStart(),
        end: node.getEnd(),
        toInsert: printer.printNode(ts.EmitHint.Unspecified, updated, sf),
      }),
    ),
  ];
}

function getAccessibilityModifier(node: ts.PropertyDeclaration): ts.ModifierLike | undefined {
  return node.modifiers?.find(
    (mod) =>
      mod.kind === ts.SyntaxKind.PublicKeyword ||
      mod.kind === ts.SyntaxKind.PrivateKeyword ||
      mod.kind === ts.SyntaxKind.ProtectedKeyword,
  );
}
