/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getPropertyNameText} from '../../utils/typescript/property_name';
import {NgQueryDefinition, QueryTiming} from './angular/query-definition';

export type TransformedQueryResult = null|{
  /** Transformed call expression. */
  node: ts.CallExpression;
  /** Failure message which is set when the query could not be transformed successfully. */
  failureMessage: string|null;
};

const TODO_SPECIFY_COMMENT = 'TODO: add static flag';
const TODO_CHECK_COMMENT = 'TODO: check static flag';

/**
 * Transforms the given query decorator by explicitly specifying the timing based on the
 * determined timing. The updated decorator call expression node will be returned.
 */
export function getTransformedQueryCallExpr(
    query: NgQueryDefinition, timing: QueryTiming|null,
    createTodo: boolean): TransformedQueryResult {
  const queryExpr = query.decorator.node.expression;
  const queryArguments = queryExpr.arguments;
  const queryPropertyAssignments = timing === null ?
      [] :
      [ts.createPropertyAssignment(
          'static', timing === QueryTiming.STATIC ? ts.createTrue() : ts.createFalse())];

  // If the query decorator is already called with two arguments, we need to
  // keep the existing options untouched and just add the new property if possible.
  if (queryArguments.length === 2) {
    const existingOptions = queryArguments[1];
    const existingOptionsText = existingOptions.getFullText();
    const hasTodoComment = existingOptionsText.includes(TODO_SPECIFY_COMMENT) ||
        existingOptionsText.includes(TODO_CHECK_COMMENT);
    let newOptionsNode: ts.Expression;
    let failureMessage: string|null = null;

    if (ts.isObjectLiteralExpression(existingOptions)) {
      // In case the options already contains a property for the "static" flag,
      // we just skip this query and leave it untouched.
      if (existingOptions.properties.some(
              p => !!p.name && getPropertyNameText(p.name) === 'static')) {
        return null;
      }

      newOptionsNode = ts.updateObjectLiteral(
          existingOptions, existingOptions.properties.concat(queryPropertyAssignments));

      // In case we want to add a todo and the options do not have the todo
      // yet, we add the query timing todo as synthetic multi-line comment.
      if (createTodo && !hasTodoComment) {
        addQueryTimingTodoToNode(newOptionsNode, timing === null);
      }
    } else {
      // In case the options query parameter is not an object literal expression, and
      // we want to set the query timing, we just preserve the existing query parameter.
      newOptionsNode = existingOptions;
      // We always want to add a TODO in case the query options cannot be updated.
      if (!hasTodoComment) {
        addQueryTimingTodoToNode(existingOptions, true);
      }
      // If there is a new explicit timing that has been determined for the given query,
      // we create a transformation failure message that shows developers that they need
      // to set the query timing manually to the determined query timing.
      if (timing !== null) {
        failureMessage = 'Cannot update query to set explicit timing. Please manually ' +
            `set the query timing to: "{static: ${(timing === QueryTiming.STATIC).toString()}}"`;
      }
    }

    return {
      failureMessage,
      node: ts.updateCall(
          queryExpr, queryExpr.expression, queryExpr.typeArguments,
          [queryArguments[0], newOptionsNode!])
    };
  }

  const optionsNode = ts.createObjectLiteral(queryPropertyAssignments);

  if (createTodo) {
    addQueryTimingTodoToNode(optionsNode, timing === null);
  }

  return {
    failureMessage: null,
    node: ts.updateCall(
        queryExpr, queryExpr.expression, queryExpr.typeArguments, [queryArguments[0], optionsNode])
  };
}

/**
 * Adds a to-do to the given TypeScript node which reminds developers to specify
 * an explicit query timing or to double-check the updated timing.
 */
function addQueryTimingTodoToNode(node: ts.Node, addSpecifyTimingTodo: boolean) {
  ts.setSyntheticLeadingComments(
      node, [{
        pos: -1,
        end: -1,
        hasTrailingNewLine: false,
        kind: ts.SyntaxKind.MultiLineCommentTrivia,
        text: ` ${addSpecifyTimingTodo ? TODO_SPECIFY_COMMENT : TODO_CHECK_COMMENT} `
      }]);
}
