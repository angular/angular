/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Observable} from 'rxjs/Observable';

import * as viewEngine from '../core';

import {assertNotNull} from './assert';
import {getOrCreateContainerRef, getOrCreateElementRef, getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from './di';
import {QueryReadType, QueryState} from './interfaces';
import {LContainer, LElement, LNode, LNodeFlags, LNodeInjector, LView} from './l_node';
import {assertNodeOfPossibleTypes} from './node_assert';
import {DirectiveDef} from './public_interfaces';



/**
 * A predicate which determines if a given element/directive should be included in the query
 */
export interface QueryPredicate<T> {
  /**
   * Next predicate
   */
  next: QueryPredicate<any>|null;

  /**
   * Destination to which the value should be added.
   */
  list: QueryList<T>;

  /**
   * If looking for directives than it contains the directive type.
   */
  type: viewEngine.Type<T>|null;

  /**
   * If selector then contains local names to query for.
   */
  selector: string[]|null;

  /**
   * Indicates which token should be read from DI for this query.
   */
  read: QueryReadType|null;

  /**
   * Values which have been located.
   *
   * this is what builds up the `QueryList._valuesTree`.
   */
  values: any[];
}

export class QueryState_ implements QueryState {
  shallow: QueryPredicate<any>|null = null;
  deep: QueryPredicate<any>|null = null;

  constructor(deep?: QueryPredicate<any>) { this.deep = deep == null ? null : deep; }

  track<T>(
      queryList: viewEngine.QueryList<T>, predicate: viewEngine.Type<T>|string[], descend?: boolean,
      read?: QueryReadType): void {
    // TODO(misko): This is not right. In case of inherited state, a calling track will incorrectly
    // mutate parent.
    if (descend) {
      this.deep = createPredicate(this.deep, queryList, predicate, read != null ? read : null);
    } else {
      this.shallow =
          createPredicate(this.shallow, queryList, predicate, read != null ? read : null);
    }
  }

  child(): QueryState|null {
    if (this.deep === null) {
      // if we don't have any deep queries than no need to track anything more.
      return null;
    }
    if (this.shallow === null) {
      // DeepQuery: We can reuse the current state if the child state would be same as current
      // state.
      return this;
    } else {
      // We need to create new state
      return new QueryState_(this.deep);
    }
  }

  addNode(node: LNode): void {
    add(this.shallow, node);
    add(this.deep, node);
  }

  insertView(container: LContainer, view: LView, index: number): void {
    throw new Error('Method not implemented.');
  }

  removeView(container: LContainer, view: LView, index: number): void {
    throw new Error('Method not implemented.');
  }
}

function readDefaultInjectable(nodeInjector: LNodeInjector, node: LNode):
    viewEngine.ElementRef|viewEngine.TemplateRef<any>|undefined {
  ngDevMode && assertNodeOfPossibleTypes(node, LNodeFlags.Container, LNodeFlags.Element);
  if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {
    return getOrCreateElementRef(nodeInjector);
  } else if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container) {
    return getOrCreateTemplateRef(nodeInjector);
  }
}

function readFromNodeInjector(nodeInjector: LNodeInjector, node: LNode, read: QueryReadType | null):
    viewEngine.ElementRef|viewEngine.ViewContainerRef|viewEngine.TemplateRef<any>|undefined {
  if (read === null) {
    return readDefaultInjectable(nodeInjector, node);
  } else if (read === QueryReadType.ElementRef) {
    return getOrCreateElementRef(nodeInjector);
  } else if (read === QueryReadType.ViewContainerRef) {
    return getOrCreateContainerRef(nodeInjector);
  } else if (read === QueryReadType.TemplateRef) {
    return getOrCreateTemplateRef(nodeInjector);
  }

  if (ngDevMode) {
    throw new Error(`Unrecognised read type for queries: ${read}`);
  }
}

function add(predicate: QueryPredicate<any>| null, node: LNode) {
  while (predicate) {
    const type = predicate.type;
    if (type) {
      const ngStaticData = node.view.ngStaticData;
      const flags = node.flags;
      for (let i = flags >> LNodeFlags.INDX_SHIFT,
               ii = i + ((flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT);
           i < ii; i++) {
        const def = ngStaticData[i] as DirectiveDef<any>;
        if (def.diPublic && def.type === type) {
          predicate.values.push(node.view.data[i]);
        }
      }
    } else {
      const staticData = node.staticData;
      const nodeInjector = getOrCreateNodeInjectorForNode(node as LElement | LContainer);
      if (staticData && staticData.localName) {
        const selector = predicate.selector !;
        for (let i = 0; i < selector.length; i++) {
          if (selector[i] === staticData.localName) {
            const injectable = readFromNodeInjector(nodeInjector, node, predicate.read);
            assertNotNull(injectable, 'injectable');
            predicate.values.push(injectable);
          }
        }
      }
    }
    predicate = predicate.next;
  }
}

function createPredicate<T>(
    previous: QueryPredicate<any>| null, queryList: QueryList<T>,
    predicate: viewEngine.Type<T>| string[], read: QueryReadType | null): QueryPredicate<T> {
  const isArray = Array.isArray(predicate);
  const values = <any>[];
  if ((queryList as any as QueryList_<T>)._valuesTree === null) {
    (queryList as any as QueryList_<T>)._valuesTree = values;
  }
  return {
    next: previous,
    list: queryList,
    type: isArray ? null : predicate as viewEngine.Type<T>,
    selector: isArray ? predicate as string[] : null,
    read: read,
    values: values
  };
}

class QueryList_<T>/* implements viewEngine.QueryList<T> */ {
  dirty: boolean = false;
  changes: Observable<T>;

  get length(): number {
    ngDevMode && assertNotNull(this._values, 'refreshed');
    return this._values !.length;
  }

  get first(): T|null {
    ngDevMode && assertNotNull(this._values, 'refreshed');
    let values = this._values !;
    return values.length ? values[0] : null;
  }

  get last(): T|null {
    ngDevMode && assertNotNull(this._values, 'refreshed');
    let values = this._values !;
    return values.length ? values[values.length - 1] : null;
  }

  /** @internal */
  _valuesTree: any[]|null = null;
  /** @internal */
  _values: T[]|null = null;

  /** @internal */
  _refresh(): boolean {
    // TODO(misko): needs more logic to flatten tree.
    if (this._values === null) {
      this._values = this._valuesTree;
      return true;
    }
    return false;
  }

  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] {
    throw new Error('Method not implemented.');
  }
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    throw new Error('Method not implemented.');
  }
  find(fn: (item: T, index: number, array: T[]) => boolean): T|undefined {
    throw new Error('Method not implemented.');
  }
  reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U {
    throw new Error('Method not implemented.');
  }
  forEach(fn: (item: T, index: number, array: T[]) => void): void {
    throw new Error('Method not implemented.');
  }
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean {
    throw new Error('Method not implemented.');
  }
  toArray(): T[] {
    ngDevMode && assertNotNull(this._values, 'refreshed');
    return this._values !;
  }
  toString(): string { throw new Error('Method not implemented.'); }
  reset(res: (any[]|T)[]): void { throw new Error('Method not implemented.'); }
  notifyOnChanges(): void { throw new Error('Method not implemented.'); }
  setDirty(): void { throw new Error('Method not implemented.'); }
  destroy(): void { throw new Error('Method not implemented.'); }
}

// NOTE: this hack is here because IQueryList has private members and therefore
// it can't be implemented only extended.
export type QueryList<T> = viewEngine.QueryList<T>;
export const QueryList: typeof viewEngine.QueryList = QueryList_ as any;

export function queryRefresh(query: QueryList<any>): boolean {
  return (query as any as QueryList_<any>)._refresh();
}
