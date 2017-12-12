/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveDef} from '@angular/core/src/render3/public_interfaces';
import {Observable} from 'rxjs/Observable';

import * as viewEngine from '../core';

import {assertNotNull} from './assert';
import {injectElementRefForNode} from './di';
import {QueryState} from './interfaces';
import {LContainer, LElement, LNode, LNodeFlags, LView} from './l_node';



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
      queryList: viewEngine.QueryList<T>, predicate: viewEngine.Type<T>|string[],
      descend?: boolean): void {
    // TODO(misko): This is not right. In case of inherited state, a calling track will incorrectly
    // mutate parent.
    if (descend) {
      this.deep = createPredicate(this.deep, queryList, predicate);
    } else {
      this.shallow = createPredicate(this.shallow, queryList, predicate);
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
      if (staticData && staticData.localName) {
        const selector = predicate.selector !;
        for (let i = 0; i < selector.length; i++) {
          if (selector[i] === staticData.localName) {
            predicate.values.push(injectElementRefForNode(node as LElement | LContainer));
          }
        }
      }
    }
    predicate = predicate.next;
  }
}

function createPredicate<T>(
    previous: QueryPredicate<any>| null, queryList: QueryList<T>,
    predicate: viewEngine.Type<T>| string[]): QueryPredicate<T> {
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
