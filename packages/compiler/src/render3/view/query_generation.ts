/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '../../constant_pool';
import * as core from '../../core';
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {ForwardRefHandling} from '../util';

import {R3QueryMetadata} from './api';
import {CONTEXT_NAME, RENDER_FLAGS, TEMPORARY_NAME, temporaryAllocator} from './util';

//  if (rf & flags) { .. }
function renderFlagCheckIfStmt(flags: core.RenderFlags, statements: o.Statement[]): o.IfStmt {
  return o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(flags), null), statements);
}

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
    (query.emitDistinctChangesOnly ? QueryFlags.emitDistinctChangesOnly : QueryFlags.none)
  );
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

const queryAdvancePlaceholder = Symbol('queryAdvancePlaceholder');

/**
 * Collapses query advance placeholders in a list of statements.
 *
 * This allows for less generated code because multiple sibling query advance
 * statements can be collapsed into a single call with the count as argument.
 *
 * e.g.
 *
 * ```ts
 *   bla();
 *   queryAdvance();
 *   queryAdvance();
 *   bla();
 * ```
 *
 *   --> will turn into
 *
 * ```ts
 *   bla();
 *   queryAdvance(2);
 *   bla();
 * ```
 */
function collapseAdvanceStatements(
  statements: (o.Statement | typeof queryAdvancePlaceholder)[],
): o.Statement[] {
  const result: o.Statement[] = [];
  let advanceCollapseCount = 0;
  const flushAdvanceCount = () => {
    if (advanceCollapseCount > 0) {
      result.unshift(
        o
          .importExpr(R3.queryAdvance)
          .callFn(advanceCollapseCount === 1 ? [] : [o.literal(advanceCollapseCount)])
          .toStmt(),
      );
      advanceCollapseCount = 0;
    }
  };

  // Iterate through statements in reverse and collapse advance placeholders.
  for (let i = statements.length - 1; i >= 0; i--) {
    const st = statements[i];
    if (st === queryAdvancePlaceholder) {
      advanceCollapseCount++;
    } else {
      flushAdvanceCount();
      result.unshift(st);
    }
  }
  flushAdvanceCount();
  return result;
}

// Define and update any view queries
export function createViewQueriesFunction(
  viewQueries: R3QueryMetadata[],
  constantPool: ConstantPool,
  name?: string,
): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: (o.Statement | typeof queryAdvancePlaceholder)[] = [];
  const tempAllocator = temporaryAllocator((st) => updateStatements.push(st), TEMPORARY_NAME);

  viewQueries.forEach((query: R3QueryMetadata) => {
    // creation call, e.g. r3.viewQuery(somePredicate, true) or
    //                r3.viewQuerySignal(ctx.prop, somePredicate, true);
    const queryDefinitionCall = createQueryCreateCall(query, constantPool, {
      signalBased: R3.viewQuerySignal,
      nonSignal: R3.viewQuery,
    });
    createStatements.push(queryDefinitionCall.toStmt());

    // Signal queries update lazily and we just advance the index.
    if (query.isSignal) {
      updateStatements.push(queryAdvancePlaceholder);
      return;
    }

    // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadQuery).callFn([]);
    const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
    const updateDirective = o
      .variable(CONTEXT_NAME)
      .prop(query.propertyName)
      .set(query.first ? temporary.prop('first') : temporary);
    updateStatements.push(refresh.and(updateDirective).toStmt());
  });

  const viewQueryFnName = name ? `${name}_Query` : null;
  return o.fn(
    [new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)],
    [
      renderFlagCheckIfStmt(core.RenderFlags.Create, createStatements),
      renderFlagCheckIfStmt(core.RenderFlags.Update, collapseAdvanceStatements(updateStatements)),
    ],
    o.INFERRED_TYPE,
    null,
    viewQueryFnName,
  );
}

// Define and update any content queries
export function createContentQueriesFunction(
  queries: R3QueryMetadata[],
  constantPool: ConstantPool,
  name?: string,
): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: (o.Statement | typeof queryAdvancePlaceholder)[] = [];
  const tempAllocator = temporaryAllocator((st) => updateStatements.push(st), TEMPORARY_NAME);

  for (const query of queries) {
    // creation, e.g. r3.contentQuery(dirIndex, somePredicate, true, null) or
    //                r3.contentQuerySignal(dirIndex, propName, somePredicate, <flags>, <read>).
    createStatements.push(
      createQueryCreateCall(
        query,
        constantPool,
        {nonSignal: R3.contentQuery, signalBased: R3.contentQuerySignal},
        /* prependParams */ [o.variable('dirIndex')],
      ).toStmt(),
    );

    // Signal queries update lazily and we just advance the index.
    if (query.isSignal) {
      updateStatements.push(queryAdvancePlaceholder);
      continue;
    }

    // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadQuery).callFn([]);
    const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
    const updateDirective = o
      .variable(CONTEXT_NAME)
      .prop(query.propertyName)
      .set(query.first ? temporary.prop('first') : temporary);
    updateStatements.push(refresh.and(updateDirective).toStmt());
  }

  const contentQueriesFnName = name ? `${name}_ContentQueries` : null;
  return o.fn(
    [
      new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE),
      new o.FnParam(CONTEXT_NAME, null),
      new o.FnParam('dirIndex', null),
    ],
    [
      renderFlagCheckIfStmt(core.RenderFlags.Create, createStatements),
      renderFlagCheckIfStmt(core.RenderFlags.Update, collapseAdvanceStatements(updateStatements)),
    ],
    o.INFERRED_TYPE,
    null,
    contentQueriesFnName,
  );
}
