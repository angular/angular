/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getPropertyNameText} from '../../utils/typescript/property_name';
import {NgQueryDefinition, QueryTiming} from './angular/query-definition';

const TODO_COMMENT = 'TODO: add static flag';

/**
 * Transforms the given query decorator by explicitly specifying the timing based on the
 * determined timing. The updated decorator call expression node will be returned.
 */
export function getTransformedQueryCallExpr(
    query: NgQueryDefinition, timing: QueryTiming | null, createTodo: boolean): ts.CallExpression|
    null {
  const queryExpr = query.decorator.node.expression;
  const queryArguments = queryExpr.arguments;
  const queryPropertyAssignments = timing === null ?
      [] :
      [ts.createPropertyAssignment(
          'static', timing === QueryTiming.STATIC ? ts.createTrue() : ts.createFalse())];

  // If the query decorator is already called with two arguments, we need to
  // keep the existing options untouched and just add the new property if needed.
  if (queryArguments.length === 2) {
    const existingOptions = queryArguments[1] as ts.ObjectLiteralExpression;

    // In case the options already contains a property for the "static" flag, we just
    // skip this query and leave it untouched.
    if (existingOptions.properties.some(
            p => !!p.name && getPropertyNameText(p.name) === 'static')) {
      return null;
    }

    const updatedOptions = ts.updateObjectLiteral(
        existingOptions, existingOptions.properties.concat(queryPropertyAssignments));

    // In case we want to add a todo and the options do not have the todo
    // yet, we add the query timing todo as synthetic multi-line comment.
    if (createTodo && !existingOptions.getFullText().includes(TODO_COMMENT)) {
      addQueryTimingTodoToNode(updatedOptions);
    }

    return ts.updateCall(
        queryExpr, queryExpr.expression, queryExpr.typeArguments,
        [queryArguments[0], updatedOptions]);
  }

  const optionsNode = ts.createObjectLiteral(queryPropertyAssignments);

  if (createTodo) {
    addQueryTimingTodoToNode(optionsNode);
  }

  return ts.updateCall(
      queryExpr, queryExpr.expression, queryExpr.typeArguments, [queryArguments[0], optionsNode]);
}

/**
 * Adds a to-do to the given TypeScript node which reminds developers to specify
 * an explicit query timing.
 */
function addQueryTimingTodoToNode(node: ts.Node) {
  ts.setSyntheticLeadingComments(node, [{
                                   pos: -1,
                                   end: -1,
                                   hasTrailingNewLine: false,
                                   kind: ts.SyntaxKind.MultiLineCommentTrivia,
                                   text: ` ${TODO_COMMENT} `
                                 }]);
}
