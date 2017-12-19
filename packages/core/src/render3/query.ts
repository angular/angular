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

import {ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {QueryList as viewEngine_QueryList} from '../linker/query_list';
import {TemplateRef as viewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as viewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {Type} from '../type';

import {assertNotNull} from './assert';
import {DirectiveDef} from './definition_interfaces';
import {getOrCreateContainerRef, getOrCreateElementRef, getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from './di';
import {LContainer, LElement, LNode, LNodeFlags, LNodeInjector, LView, QueryReadType, QueryState} from './interfaces';
import {LNodeStatic} from './l_node_static';
import {assertNodeOfPossibleTypes} from './node_assert';

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
  type: Type<T>|null;

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
      queryList: viewEngine_QueryList<T>, predicate: Type<T>|string[], descend?: boolean,
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

function readDefaultInjectable(nodeInjector: LNodeInjector, node: LNode): viewEngine_ElementRef|
    viewEngine_TemplateRef<any>|undefined {
  ngDevMode && assertNodeOfPossibleTypes(node, LNodeFlags.Container, LNodeFlags.Element);
  if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {
    return getOrCreateElementRef(nodeInjector);
  } else if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container) {
    return getOrCreateTemplateRef(nodeInjector);
  }
}

function readFromNodeInjector(nodeInjector: LNodeInjector, node: LNode, read: QueryReadType | null):
    viewEngine_ElementRef|viewEngine_ViewContainerRef|viewEngine_TemplateRef<any>|undefined {
  if (read === QueryReadType.ElementRef) {
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

/**
 * Goes over local names for a given node and returns directive index
 * (or -1 if a local name points to an element).
 *
 * @param staticData static data of a node to check
 * @param selector selector to match
 * @returns directive index, -1 or null if a selector didn't match any of the local names
 */
function getIdxOfMatchingSelector(staticData: LNodeStatic, selector: string): number|null {
  const localNames = staticData.localNames;
  if (localNames) {
    for (let i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1] as number;
      }
    }
  }
  return null;
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
      const nodeInjector = getOrCreateNodeInjectorForNode(node as LElement | LContainer);
      const selector = predicate.selector !;
      for (let i = 0; i < selector.length; i++) {
        ngDevMode && assertNotNull(node.staticData, 'node.staticData');
        const directiveIdx = getIdxOfMatchingSelector(node.staticData !, selector[i]);
        // is anything on a node matching a selector?
        if (directiveIdx !== null) {
          if (predicate.read != null) {
            predicate.values.push(readFromNodeInjector(nodeInjector, node, predicate.read));
          } else {
            // is local name pointing to a directive?
            if (directiveIdx > -1) {
              predicate.values.push(node.view.data[directiveIdx]);
            } else {
              predicate.values.push(readDefaultInjectable(nodeInjector, node));
            }
          }
        }
      }
    }
    predicate = predicate.next;
  }
}

function createPredicate<T>(
    previous: QueryPredicate<any>| null, queryList: QueryList<T>, predicate: Type<T>| string[],
    read: QueryReadType | null): QueryPredicate<T> {
  const isArray = Array.isArray(predicate);
  const values = <any>[];
  if ((queryList as any as QueryList_<T>)._valuesTree === null) {
    (queryList as any as QueryList_<T>)._valuesTree = values;
  }
  return {
    next: previous,
    list: queryList,
    type: isArray ? null : predicate as Type<T>,
    selector: isArray ? predicate as string[] : null,
    read: read,
    values: values
  };
}

class QueryList_<T>/* implements viewEngine_QueryList<T> */ {
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
export type QueryList<T> = viewEngine_QueryList<T>;
export const QueryList: typeof viewEngine_QueryList = QueryList_ as any;

export function queryRefresh(query: QueryList<any>): boolean {
  return (query as any as QueryList_<any>)._refresh();
}
