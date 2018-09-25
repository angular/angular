/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Observable} from 'rxjs';

import {EventEmitter} from '../event_emitter';
import {ElementRef as ViewEngine_ElementRef} from '../linker/element_ref';
import {QueryList as viewEngine_QueryList} from '../linker/query_list';
import {TemplateRef as ViewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as ViewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {Type} from '../type';
import {getSymbolIterator} from '../util';

import {assertDefined, assertEqual} from './assert';
import {_getViewData, assertPreviousIsParent, getOrCreateCurrentQueries, store, storeCleanupWithContext} from './instructions';
import {DirectiveDefInternal, unusedValueExportToPlacateAjd as unused1} from './interfaces/definition';
import {LInjector, unusedValueExportToPlacateAjd as unused2} from './interfaces/injector';
import {LContainerNode, LElementNode, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType, unusedValueExportToPlacateAjd as unused3} from './interfaces/node';
import {LQueries, QueryReadType, unusedValueExportToPlacateAjd as unused4} from './interfaces/query';
import {DIRECTIVES, LViewData, TVIEW} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';
import {flatten, getLNode, isContentQueryHost} from './util';
import {createContainerRef, createElementRef, createTemplateRef} from './view_engine_compatibility';

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

  /**
   * A pointer to an array that stores collected values from views. This is necessary so we know a
   * container into which to insert nodes collected from views.
   */
  containerValues: any[]|null;
}

export class LQueries_ implements LQueries {
  constructor(
      public parent: LQueries_|null, private shallow: LQuery<any>|null,
      private deep: LQuery<any>|null) {}

  track<T>(
      queryList: viewEngine_QueryList<T>, predicate: Type<T>|string[], descend?: boolean,
      read?: QueryReadType<T>|Type<T>): void {
    if (descend) {
      this.deep = createQuery(this.deep, queryList, predicate, read != null ? read : null);
    } else {
      this.shallow = createQuery(this.shallow, queryList, predicate, read != null ? read : null);
    }
  }

  clone(): LQueries { return new LQueries_(this, null, this.deep); }

  container(): LQueries|null {
    const shallowResults = copyQueriesToContainer(this.shallow);
    const deepResults = copyQueriesToContainer(this.deep);

    return shallowResults || deepResults ? new LQueries_(this, shallowResults, deepResults) : null;
  }

  createView(): LQueries|null {
    const shallowResults = copyQueriesToView(this.shallow);
    const deepResults = copyQueriesToView(this.deep);

    return shallowResults || deepResults ? new LQueries_(this, shallowResults, deepResults) : null;
  }

  insertView(index: number): void {
    insertView(index, this.shallow);
    insertView(index, this.deep);
  }

  addNode(tNode: TElementNode|TContainerNode|TElementContainerNode): LQueries|null {
    add(this.deep, tNode);

    if (isContentQueryHost(tNode)) {
      add(this.shallow, tNode);

      if (tNode.parent && isContentQueryHost(tNode.parent)) {
        // if node has a content query and parent also has a content query
        // both queries need to check this node for shallow matches
        add(this.parent !.shallow, tNode);
      }
      return this.parent;
    }

    isRootNodeOfQuery(tNode) && add(this.shallow, tNode);
    return this;
  }

  removeView(): void {
    removeView(this.shallow);
    removeView(this.deep);
  }
}

function isRootNodeOfQuery(tNode: TNode) {
  return tNode.parent === null || isContentQueryHost(tNode.parent);
}

function copyQueriesToContainer(query: LQuery<any>| null): LQuery<any>|null {
  let result: LQuery<any>|null = null;

  while (query) {
    const containerValues: any[] = [];  // prepare room for views
    query.values.push(containerValues);
    const clonedQuery: LQuery<any> = {
      next: result,
      list: query.list,
      predicate: query.predicate,
      values: containerValues,
      containerValues: null
    };
    result = clonedQuery;
    query = query.next;
  }

  return result;
}

function copyQueriesToView(query: LQuery<any>| null): LQuery<any>|null {
  let result: LQuery<any>|null = null;

  while (query) {
    const clonedQuery: LQuery<any> = {
      next: result,
      list: query.list,
      predicate: query.predicate,
      values: [],
      containerValues: query.values
    };
    result = clonedQuery;
    query = query.next;
  }

  return result;
}

function insertView(index: number, query: LQuery<any>| null) {
  while (query) {
    ngDevMode &&
        assertDefined(
            query.containerValues, 'View queries need to have a pointer to container values.');
    query.containerValues !.splice(index, 0, query.values);
    query = query.next;
  }
}

function removeView(query: LQuery<any>| null) {
  while (query) {
    ngDevMode &&
        assertDefined(
            query.containerValues, 'View queries need to have a pointer to container values.');

    const containerValues = query.containerValues !;
    const viewValuesIdx = containerValues.indexOf(query.values);
    const removed = containerValues.splice(viewValuesIdx, 1);

    // mark a query as dirty only when removed view had matching modes
    ngDevMode && assertEqual(removed.length, 1, 'removed.length');
    if (removed[0].length) {
      query.list.setDirty();
    }

    query = query.next;
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
 * @param tNode TNode on which directives are present.
 * @param currentView The view we are currently processing
 * @param type Type of a directive to look for.
 * @returns Index of a found directive or null when none found.
 */
function getIdxOfMatchingDirective(tNode: TNode, currentView: LViewData, type: Type<any>): number|
    null {
  const defs = currentView[TVIEW].directives;
  if (defs) {
    const flags = tNode.flags;
    const count = flags & TNodeFlags.DirectiveCountMask;
    const start = flags >> TNodeFlags.DirectiveStartingIndexShift;
    const end = start + count;
    for (let i = start; i < end; i++) {
      const def = defs[i] as DirectiveDefInternal<any>;
      if (def.type === type && def.diPublic) {
        return i;
      }
    }
  }
  return null;
}

function readFromNodeInjector(
    tNode: TNode, currentView: LViewData, read: QueryReadType<any>| Type<any>,
    directiveIdx: number): any {
  if (read instanceof ReadFromInjectorFn) {
    return read.read(tNode, currentView, directiveIdx);
  } else {
    const matchingIdx = getIdxOfMatchingDirective(tNode, currentView, read as Type<any>);
    if (matchingIdx !== null) {
      return currentView[DIRECTIVES] ![matchingIdx];
    }
  }
  return null;
}

function add(
    query: LQuery<any>| null, tNode: TElementNode | TContainerNode | TElementContainerNode) {
  const currentView = _getViewData();

  while (query) {
    const predicate = query.predicate;
    const type = predicate.type;
    if (type) {
      const directiveIdx = getIdxOfMatchingDirective(tNode, currentView, type);
      if (directiveIdx !== null) {
        // a node is matching a predicate - determine what to read
        // if read token and / or strategy is not specified, use type as read token
        const result =
            readFromNodeInjector(tNode, currentView, predicate.read || type, directiveIdx);
        if (result !== null) {
          addMatch(query, result);
        }
      }
    } else {
      const selector = predicate.selector !;
      for (let i = 0; i < selector.length; i++) {
        const directiveIdx = getIdxOfMatchingSelector(tNode, selector[i]);
        if (directiveIdx !== null) {
          // a node is matching a predicate - determine what to read
          // note that queries using name selector must specify read strategy
          ngDevMode && assertDefined(predicate.read, 'the node should have a predicate');
          const result = readFromNodeInjector(tNode, currentView, predicate.read !, directiveIdx);
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
    values: (queryList as any as QueryList_<T>)._valuesTree,
    containerValues: null
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
  const queries = getOrCreateCurrentQueries(LQueries_);
  queries.track(queryList, predicate, descend, read);
  storeCleanupWithContext(null, queryList, queryList.destroy);
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

export class ReadFromInjectorFn<T> {
  constructor(readonly read: (tNode: TNode, view: LViewData, directiveIndex?: number) => T) {}
}

// TODO: Remove wrapper function with TemplateRef when we turn on Ivy
// Necessary for now to avoid a circular dependency
export const QUERY_READ_TEMPLATE_REF =
    (TemplateRefConstructor: typeof ViewEngine_TemplateRef,
     ElementRefConstructor: typeof ViewEngine_ElementRef) => {
      return new ReadFromInjectorFn<ViewEngine_TemplateRef<any>>(
          (tNode: TNode, view: LViewData) => {
            return createTemplateRef(TemplateRefConstructor, ElementRefConstructor, tNode, view);
          }) as any;
    };

// TODO: Remove wrapper function with ViewContainerRef when we turn on Ivy
// Necessary for now to avoid a circular dependency
export const QUERY_READ_CONTAINER_REF =
    (ViewContainerRefConstructor: typeof ViewEngine_ViewContainerRef,
     ElementRefConstructor: typeof ViewEngine_ElementRef) => {
      return <QueryReadType<ViewEngine_ViewContainerRef>>(
          new ReadFromInjectorFn<ViewEngine_ViewContainerRef>(
              (tNode: TNode, view: LViewData) => createContainerRef(
                  ViewContainerRefConstructor, ElementRefConstructor,
                  tNode as TElementNode | TContainerNode | TElementContainerNode, view)) as any);

    };

// TODO: Remove wrapper function with ElementRef when we turn on Ivy
// Necessary for now to avoid a circular dependency
export const QUERY_READ_ELEMENT_REF = (ElementRefConstructor: typeof ViewEngine_ElementRef) => {
  return <QueryReadType<ViewEngine_ElementRef>>(
      new ReadFromInjectorFn<ViewEngine_ElementRef>((tNode: TNode, view: LViewData) => {
        return createElementRef(ElementRefConstructor, tNode, view);
      }) as any);
};

// TODO: Remove wrapper function with TemplateRef when we turn on Ivy
export const QUERY_READ_FROM_NODE =
    (TemplateRefConstructor: typeof ViewEngine_TemplateRef,
     ElementRefConstructor: typeof ViewEngine_ElementRef) => {
      return new ReadFromInjectorFn<any>((tNode: TNode, view: LViewData, directiveIdx: number) => {
        ngDevMode && assertNodeOfPossibleTypes(
                         tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);
        if (directiveIdx > -1) {
          return view[DIRECTIVES] ![directiveIdx];
        }
        if (tNode.type === TNodeType.Element || tNode.type === TNodeType.ElementContainer) {
          return createElementRef(ElementRefConstructor, tNode, view);
        }
        if (tNode.type === TNodeType.Container) {
          return createTemplateRef(TemplateRefConstructor, ElementRefConstructor, tNode, view);
        }
        if (ngDevMode) {
          // should never happen
          throw new Error(`Unexpected node type: ${tNode.type}`);
        }
      }) as any as QueryReadType<any>;
    };
