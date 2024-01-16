/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../constant_pool';
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {ForwardRefHandling} from '../util';

import {R3QueryMetadata} from './api';
import {CONTEXT_NAME} from './util';

/**
 * A set of flags to be used with Queries.
 *
 * NOTE: Ensure changes here are in sync with `packages/core/src/render3/interfaces/query.ts`
 */
export const enum QueryFlags {
  /**
   * No flags
   */
  none = 0b0000,

  /**
   * Whether or not the query should descend into children.
   */
  descendants = 0b0001,

  /**
   * The query can be computed statically and hence can be assigned eagerly.
   *
   * NOTE: Backwards compatibility with ViewEngine.
   */
  isStatic = 0b0010,

  /**
   * If the `QueryList` should fire change event only if actual change to query was computed (vs old
   * behavior where the change was fired whenever the query was recomputed, even if the recomputed
   * query resulted in the same list.)
   */
  emitDistinctChangesOnly = 0b0100,
}

/**
 * Translates query flags into `TQueryFlags` type in
 * packages/core/src/render3/interfaces/query.ts
 * @param query
 */
function toQueryFlags(query: R3QueryMetadata): number {
  return (
      (query.descendants ? QueryFlags.descendants : QueryFlags.none) |
      (query.static ? QueryFlags.isStatic : QueryFlags.none) |
      (query.emitDistinctChangesOnly ? QueryFlags.emitDistinctChangesOnly : QueryFlags.none));
}

export function getQueryPredicate(
    query: R3QueryMetadata,
    constantPool: ConstantPool,
    ): o.Expression {
  if (Array.isArray(query.predicate)) {
    let predicate: o.Expression[] = [];
    query.predicate.forEach((selector: string): void => {
      // Each item in predicates array may contain strings with comma-separated refs
      // (for ex. 'ref, ref1, ..., refN'), thus we extract individual refs and store them
      // as separate array entities
      const selectors = selector.split(',').map((token) => o.literal(token.trim()));
      predicate.push(...selectors);
    });
    return constantPool.getConstLiteral(o.literalArr(predicate), true);
  } else {
    // The original predicate may have been wrapped in a `forwardRef()` call.
    switch (query.predicate.forwardRef) {
      case ForwardRefHandling.None:
      case ForwardRefHandling.Unwrapped:
        return query.predicate.expression;
      case ForwardRefHandling.Wrapped:
        return o.importExpr(R3.resolveForwardRef).callFn([query.predicate.expression]);
    }
  }
}

export function createQueryCreateCall(
    query: R3QueryMetadata,
    constantPool: ConstantPool,
    queryTypeFns: {signalBased: o.ExternalReference; nonSignal: o.ExternalReference},
    prependParams?: o.Expression[],
    ): o.InvokeFunctionExpr {
  const parameters: o.Expression[] = [];
  if (prependParams !== undefined) {
    parameters.push(...prependParams);
  }
  if (query.isSignal) {
    parameters.push(new o.ReadPropExpr(o.variable(CONTEXT_NAME), query.propertyName));
  }
  parameters.push(getQueryPredicate(query, constantPool), o.literal(toQueryFlags(query)));
  if (query.read) {
    parameters.push(query.read);
  }

  const queryCreateFn = query.isSignal ? queryTypeFns.signalBased : queryTypeFns.nonSignal;
  return o.importExpr(queryCreateFn).callFn(parameters);
}
