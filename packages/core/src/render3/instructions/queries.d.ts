/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProviderToken } from '../../di';
import { QueryList } from '../../linker/query_list';
import { QueryFlags } from '../interfaces/query';
/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 *
 * @param directiveIndex Current directive index
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 * @returns QueryList<T>
 *
 * @codeGenApi
 */
export declare function ɵɵcontentQuery<T>(directiveIndex: number, predicate: ProviderToken<unknown> | string | string[], flags: QueryFlags, read?: any): void;
/**
 * Creates a new view query by initializing internal data structures.
 *
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export declare function ɵɵviewQuery<T>(predicate: ProviderToken<unknown> | string | string[], flags: QueryFlags, read?: any): void;
/**
 * Refreshes a query by combining matches from all active views and removing matches from deleted
 * views.
 *
 * @returns `true` if a query got dirty during change detection or if this is a static query
 * resolving in creation mode, `false` otherwise.
 *
 * @codeGenApi
 */
export declare function ɵɵqueryRefresh(queryList: QueryList<any>): boolean;
/**
 * Loads a QueryList corresponding to the current view or content query.
 *
 * @codeGenApi
 */
export declare function ɵɵloadQuery<T>(): QueryList<T>;
