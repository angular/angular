/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgQueryDefinition, QueryTiming} from './angular/query-definition';
import {getPropertyNameText} from './typescript/property_name';


/**
 * Transforms the given query decorator by explicitly specifying the timing based on the
 * determined timing. The updated decorator call expression node will be returned.
 */
export function getTransformedQueryCallExpr(
    query: NgQueryDefinition, timing: QueryTiming): ts.CallExpression|null {
  const queryExpr = query.decorator.node.expression as ts.CallExpression;
  const queryArguments = queryExpr.arguments;
  const timingPropertyAssignment = ts.createPropertyAssignment(
      'static', timing === QueryTiming.STATIC ? ts.createTrue() : ts.createFalse());

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
        existingOptions, existingOptions.properties.concat(timingPropertyAssignment));
    return ts.updateCall(
        queryExpr, queryExpr.expression, queryExpr.typeArguments,
        [queryArguments[0], updatedOptions]);
  }

  return ts.updateCall(
      queryExpr, queryExpr.expression, queryExpr.typeArguments,
      [queryArguments[0], ts.createObjectLiteral([timingPropertyAssignment])]);
}
