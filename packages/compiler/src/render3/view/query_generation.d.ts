/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ConstantPool } from '../../constant_pool';
import * as o from '../../output/output_ast';
import { R3QueryMetadata } from './api';
/**
 * A set of flags to be used with Queries.
 *
 * NOTE: Ensure changes here are in sync with `packages/core/src/render3/interfaces/query.ts`
 */
export declare const enum QueryFlags {
    /**
     * No flags
     */
    none = 0,
    /**
     * Whether or not the query should descend into children.
     */
    descendants = 1,
    /**
     * The query can be computed statically and hence can be assigned eagerly.
     *
     * NOTE: Backwards compatibility with ViewEngine.
     */
    isStatic = 2,
    /**
     * If the `QueryList` should fire change event only if actual change to query was computed (vs old
     * behavior where the change was fired whenever the query was recomputed, even if the recomputed
     * query resulted in the same list.)
     */
    emitDistinctChangesOnly = 4
}
export declare function getQueryPredicate(query: R3QueryMetadata, constantPool: ConstantPool): o.Expression;
export declare function createQueryCreateCall(query: R3QueryMetadata, constantPool: ConstantPool, queryTypeFns: {
    signalBased: o.ExternalReference;
    nonSignal: o.ExternalReference;
}, prependParams?: o.Expression[]): o.InvokeFunctionExpr;
export declare function createViewQueriesFunction(viewQueries: R3QueryMetadata[], constantPool: ConstantPool, name?: string): o.Expression;
export declare function createContentQueriesFunction(queries: R3QueryMetadata[], constantPool: ConstantPool, name?: string): o.Expression;
