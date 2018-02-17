/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Observable} from 'rxjs/Observable';

import {EventEmitter} from '../event_emitter';
import {QueryList as viewEngine_QueryList} from '../linker/query_list';
import {Type} from '../type';
import {getSymbolIterator} from '../util';

import {assertEqual, assertNotNull} from './assert';
import {ReadFromInjectorFn, getOrCreateNodeInjectorForNode} from './di';
import {assertPreviousIsParent, getCurrentQueries, store} from './instructions';
import {DirectiveDef, unusedValueExportToPlacateAjd as unused1} from './interfaces/definition';
import {LInjector, unusedValueExportToPlacateAjd as unused2} from './interfaces/injector';
import {LContainerNode, LElementNode, LNode, LNodeFlags, TNode, unusedValueExportToPlacateAjd as unused3} from './interfaces/node';
import {LQueries, QueryReadType, unusedValueExportToPlacateAjd as unused4} from './interfaces/query';
import {flatten} from './util';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4;

/**
 * A predicate which determines if a given element/directive should be included in the query
 * results.
 */
export interface QueryPredicate<T> {
  /**
   * If looking for directives then it contains the directive type.
   */
  type: Type<T>|null;

  /**
   * If selector then contains local names to query for.
   */
  selector: string[]|null;

  /**
   * Indicates which token should be read from DI for this query.
   */
  read: QueryReadType<T>|Type<T>|null;
}

/**
 * An object representing a query, which is a combination of:
 * - query predicate to determines if a given element/directive should be included in the query
 * - values collected based on a predicate
 * - `QueryList` to which collected values should be reported
 */
export interface LQuery<T> {
  /**
   * Next query. Used when queries are stored as a linked list in `LQueries`.
   */
  next: LQuery<any>|null;

  /**
   * Destination to which the value should be added.
   */
  list: QueryList<T>;

  /**
   * A predicate which determines if a given element/directive should be included in the query
   * results.
   */
  predicate: QueryPredicate<T>;

  /**
   * Values which have been located.
   *
   * This is what builds up the `QueryList._valuesTree`.
   */
  values: any[];
}

export class LQueries_ implements LQueries {
  shallow: LQuery<any>|null = null;
  deep: LQuery<any>|null = null;

  constructor(deep?: LQuery<any>) { this.deep = deep == null ? null : deep; }

  track<T>(
      queryList: viewEngine_QueryList<T>, predicate: Type<T>|string[], descend?: boolean,
      read?: QueryReadType<T>|Type<T>): void {
    // TODO(misko): This is not right. In case of inherited state, a calling track will incorrectly
    // mutate parent.
    if (descend) {
      this.deep = createQuery(this.deep, queryList, predicate, read != null ? read : null);
    } else {
      this.shallow = createQuery(this.shallow, queryList, predicate, read != null ? read : null);
    }
  }

  child(): LQueries|null {
    if (this.deep === null) {
      // if we don't have any deep queries then no need to track anything more.
      return null;
    }
    if (this.shallow === null) {
      // DeepQuery: We can reuse the current state if the child state would be same as current
      // state.
      return this;
    } else {
      // We need to create new state
      return new LQueries_(this.deep);
    }
  }

  container(): LQueries|null {
    let result: LQuery<any>|null = null;
    let query = this.deep;

    while (query) {
      const containerValues: any[] = [];  // prepare room for views
      query.values.push(containerValues);
      const clonedQuery: LQuery<any> =
          {next: null, list: query.list, predicate: query.predicate, values: containerValues};
      clonedQuery.next = result;
      result = clonedQuery;
      query = query.next;
    }

    return result ? new LQueries_(result) : null;
  }

  enterView(index: number): LQueries|null {
    let result: LQuery<any>|null = null;
    let query = this.deep;

    while (query) {
      const viewValues: any[] = [];  // prepare room for view nodes
      query.values.splice(index, 0, viewValues);
      const clonedQuery: LQuery<any> =
          {next: null, list: query.list, predicate: query.predicate, values: viewValues};
      clonedQuery.next = result;
      result = clonedQuery;
      query = query.next;
    }

    return result ? new LQueries_(result) : null;
  }

  addNode(node: LNode): void {
    add(this.shallow, node);
    add(this.deep, node);
  }

  removeView(index: number): void {
    let query = this.deep;
    while (query) {
      const removed = query.values.splice(index, 1);

      // mark a query as dirty only when removed view had matching modes
      ngDevMode && assertEqual(removed.length, 1, 'removed.length');
      if (removed[0].length) {
        query.list.setDirty();
      }

      query = query.next;
    }
  }
}

/**
 * Iterates over local names for a given node and returns directive index
 * (or -1 if a local name points to an element).
 *
 * @param tNode static data of a node to check
 * @param selector selector to match
 * @returns directive index, -1 or null if a selector didn't match any of the local names
 */
function getIdxOfMatchingSelector(tNode: TNode, selector: string): number|null {
  const localNames = tNode.localNames;
  if (localNames) {
    for (let i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1] as number;
      }
    }
  }
  return null;
}

/**
 * Iterates over all the directives for a node and returns index of a directive for a given type.
 *
 * @param node Node on which directives are present.
 * @param type Type of a directive to look for.
 * @returns Index of a found directive or null when none found.
 */
function geIdxOfMatchingDirective(node: LNode, type: Type<any>): number|null {
  const tData = node.view.tView.data;
  const flags = node.flags;
  for (let i = flags >> LNodeFlags.INDX_SHIFT,
           ii = i + ((flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT);
       i < ii; i++) {
    const def = tData[i] as DirectiveDef<any>;
    if (def.diPublic && def.type === type) {
      return i;
    }
  }
  return null;
}

function readFromNodeInjector(
    nodeInjector: LInjector, node: LNode, read: QueryReadType<any>| Type<any>,
    directiveIdx: number): any {
  if (read instanceof ReadFromInjectorFn) {
    return read.read(nodeInjector, node, directiveIdx);
  } else {
    const matchingIdx = geIdxOfMatchingDirective(node, read as Type<any>);
    if (matchingIdx !== null) {
      return node.view.data[matchingIdx];
    }
  }
  return null;
}

function add(query: LQuery<any>| null, node: LNode) {
  const nodeInjector = getOrCreateNodeInjectorForNode(node as LElementNode | LContainerNode);
  while (query) {
    const predicate = query.predicate;
    const type = predicate.type;
    if (type) {
      const directiveIdx = geIdxOfMatchingDirective(node, type);
      if (directiveIdx !== null) {
        // a node is matching a predicate - determine what to read
        // if read token and / or strategy is not specified, use type as read token
        const result =
            readFromNodeInjector(nodeInjector, node, predicate.read || type, directiveIdx);
        if (result !== null) {
          addMatch(query, result);
        }
      }
    } else {
      const selector = predicate.selector !;
      for (let i = 0; i < selector.length; i++) {
        ngDevMode && assertNotNull(node.tNode, 'node.tNode');
        const directiveIdx = getIdxOfMatchingSelector(node.tNode !, selector[i]);
        if (directiveIdx !== null) {
          // a node is matching a predicate - determine what to read
          // note that queries using name selector must specify read strategy
          ngDevMode && assertNotNull(predicate.read, 'the node should have a predicate');
          const result = readFromNodeInjector(nodeInjector, node, predicate.read !, directiveIdx);
          if (result !== null) {
            addMatch(query, result);
          }
        }
      }
    }
    query = query.next;
  }
}

function addMatch(query: LQuery<any>, matchingValue: any): void {
  query.values.push(matchingValue);
  query.list.setDirty();
}

function createPredicate<T>(
    predicate: Type<T>| string[], read: QueryReadType<T>| Type<T>| null): QueryPredicate<T> {
  const isArray = Array.isArray(predicate);
  return {
    type: isArray ? null : predicate as Type<T>,
    selector: isArray ? predicate as string[] : null,
    read: read
  };
}

function createQuery<T>(
    previous: LQuery<any>| null, queryList: QueryList<T>, predicate: Type<T>| string[],
    read: QueryReadType<T>| Type<T>| null): LQuery<T> {
  return {
    next: previous,
    list: queryList,
    predicate: createPredicate(predicate, read),
    values: (queryList as any as QueryList_<T>)._valuesTree
  };
}

class QueryList_<T>/* implements viewEngine_QueryList<T> */ {
  readonly dirty = true;
  readonly changes: Observable<T> = new EventEmitter();
  private _values: T[] = [];
  /** @internal */
  _valuesTree: any[] = [];

  get length(): number { return this._values.length; }

  get first(): T|null {
    let values = this._values;
    return values.length ? values[0] : null;
  }

  get last(): T|null {
    let values = this._values;
    return values.length ? values[values.length - 1] : null;
  }

  /**
   * See
   * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   */
  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] { return this._values.map(fn); }

  /**
   * See
   * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   */
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    return this._values.filter(fn);
  }

  /**
   * See
   * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   */
  find(fn: (item: T, index: number, array: T[]) => boolean): T|undefined {
    return this._values.find(fn);
  }

  /**
   * See
   * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
   */
  reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U {
    return this._values.reduce(fn, init);
  }

  /**
   * See
   * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
   */
  forEach(fn: (item: T, index: number, array: T[]) => void): void { this._values.forEach(fn); }

  /**
   * See
   * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   */
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean {
    return this._values.some(fn);
  }

  toArray(): T[] { return this._values.slice(0); }

  [getSymbolIterator()](): Iterator<T> { return (this._values as any)[getSymbolIterator()](); }

  toString(): string { return this._values.toString(); }

  reset(res: (any[]|T)[]): void {
    this._values = flatten(res);
    (this as{dirty: boolean}).dirty = false;
  }

  notifyOnChanges(): void { (this.changes as EventEmitter<any>).emit(this); }
  setDirty(): void { (this as{dirty: boolean}).dirty = true; }
  destroy(): void {
    (this.changes as EventEmitter<any>).complete();
    (this.changes as EventEmitter<any>).unsubscribe();
  }
}

// NOTE: this hack is here because IQueryList has private members and therefore
// it can't be implemented only extended.
export type QueryList<T> = viewEngine_QueryList<T>;
export const QueryList: typeof viewEngine_QueryList = QueryList_ as any;

/**
 * Creates and returns a QueryList.
 *
 * @param memoryIndex The index in memory where the QueryList should be saved. If null,
 * this is is a content query and the QueryList will be saved later through directiveCreate.
 * @param predicate The type for which the query will search
 * @param descend Whether or not to descend into children
 * @param read What to save in the query
 * @returns QueryList<T>
 */
export function query<T>(
    memoryIndex: number | null, predicate: Type<any>| string[], descend?: boolean,
    read?: QueryReadType<T>| Type<T>): QueryList<T> {
  ngDevMode && assertPreviousIsParent();
  const queryList = new QueryList<T>();
  const queries = getCurrentQueries(LQueries_);
  queries.track(queryList, predicate, descend, read);

  if (memoryIndex != null) {
    store(memoryIndex, queryList);
  }
  return queryList;
}

/**
 * Refreshes a query by combining matches from all active views and removing matches from deleted
 * views.
 * Returns true if a query got dirty during change detection, false otherwise.
 */
export function queryRefresh(queryList: QueryList<any>): boolean {
  const queryListImpl = (queryList as any as QueryList_<any>);
  if (queryList.dirty) {
    queryList.reset(queryListImpl._valuesTree);
    queryList.notifyOnChanges();
    return true;
  }
  return false;
}
