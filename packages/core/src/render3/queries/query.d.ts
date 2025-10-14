/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProviderToken } from '../../di/provider_token';
import { QueryList } from '../../linker/query_list';
import { QueryFlags, TQuery, TQueryMetadata } from '../interfaces/query';
import { LView, TView } from '../interfaces/view';
export declare class TQueryMetadata_ implements TQueryMetadata {
    flags: QueryFlags;
    read: any;
    predicate: ProviderToken<unknown> | string[];
    constructor(predicate: ProviderToken<unknown> | string[] | string, flags: QueryFlags, read?: any);
}
export declare function loadQueryInternal<T>(lView: LView, queryIndex: number): QueryList<T>;
export declare function createViewQuery<T>(predicate: ProviderToken<unknown> | string[] | string, flags: QueryFlags, read?: any): number;
export declare function createContentQuery<T>(directiveIndex: number, predicate: ProviderToken<unknown> | string[] | string, flags: QueryFlags, read?: ProviderToken<T>): number;
export declare function createTQuery(tView: TView, metadata: TQueryMetadata, nodeIndex: number): void;
export declare function saveContentQueryAndDirectiveIndex(tView: TView, directiveIndex: number): void;
export declare function getTQuery(tView: TView, index: number): TQuery;
/**
 * A helper function collecting results from all the views where a given query was active.
 * @param lView
 * @param queryIndex
 */
export declare function getQueryResults<V>(lView: LView, queryIndex: number): V[];
