/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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

  // TODO: Can we consult, based on references and non-null assertions?
  const isIndicatedAsRequired = node.exclamationToken !== undefined;

  // If the query is required already via some indicators, and this is a "single"
  // query, use the available `.required` method.
  if (isIndicatedAsRequired && metadata.queryInfo.first) {
    newQueryFn = ts.factory.createPropertyAccessExpression(newQueryFn, 'required');
  }

  // If this query is still nullable (i.e. not required), attempt to remove
  // explicit `undefined` types if possible.
  if (!isIndicatedAsRequired && type !== undefined && ts.isUnionTypeNode(type)) {
    type = removeFromUnionIfPossible(type, (v) => v.kind !== ts.SyntaxKind.UndefinedKeyword);
  }

  const locatorType = Array.isArray(metadata.queryInfo.predicate)
    ? null
    : metadata.queryInfo.predicate.expression;
  const readType = metadata.queryInfo.read ?? locatorType;

  // If the type and the read type are matching, we can rely on the TS generic
  // signature rather than repeating e.g. `viewChild<Button>(Button)`.
  if (
    type !== undefined &&
    readType instanceof WrappedNodeExpr &&
    ts.isIdentifier(readType.node) &&
    ts.isTypeReferenceNode(type) &&
    ts.isIdentifier(type.typeName) &&
    type.typeName.text === readType.node.text
  ) {
    type = undefined;
  }

  const call = ts.factory.createCallExpression(newQueryFn, type ? [type] : undefined, args);
  const updated = ts.factory.updatePropertyDeclaration(
    node,
    [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
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
