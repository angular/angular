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
import {Type} from '../type';

import {assertNotNull} from './assert';
import {getOrCreateContainerRef, getOrCreateElementRef, getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from './di';
import {DirectiveDef, TypedDirectiveDef, unusedValueExportToPlacateAjd as unused1} from './interfaces/definition';
import {LInjector, unusedValueExportToPlacateAjd as unused2} from './interfaces/injector';
import {LContainerNode, LElementNode, LNode, LNodeFlags, LViewNode, TNode, unusedValueExportToPlacateAjd as unused3} from './interfaces/node';
import {LQuery, QueryReadType, unusedValueExportToPlacateAjd as unused4} from './interfaces/query';
import {assertNodeOfPossibleTypes} from './node_assert';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4;


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
  read: QueryReadType|null;

  /**
   * Values which have been located.
   *
   * this is what builds up the `QueryList._valuesTree`.
   */
  values: any[];
}

export class LQuery_ implements LQuery {
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

  child(): LQuery|null {
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
      return new LQuery_(this.deep);
    }
  }

  addNode(node: LNode): void {
    add(this.shallow, node);
    add(this.deep, node);
  }

  insertView(container: LContainerNode, view: LViewNode, index: number): void {
    throw new Error('Method not implemented.');
  }

  removeView(container: LContainerNode, view: LViewNode, index: number): void {
    throw new Error('Method not implemented.');
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
    const def = tData[i] as TypedDirectiveDef<any>;
    if (def.diPublic && def.type === type) {
      return i;
    }
  }
  return null;
}

function readDefaultInjectable(nodeInjector: LInjector, node: LNode): viewEngine_ElementRef|
    viewEngine_TemplateRef<any>|undefined {
  ngDevMode && assertNodeOfPossibleTypes(node, LNodeFlags.Container, LNodeFlags.Element);
  if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {
    return getOrCreateElementRef(nodeInjector);
  } else if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container) {
    return getOrCreateTemplateRef(nodeInjector);
  }
}

function readFromNodeInjector(
    nodeInjector: LInjector, node: LNode, read: QueryReadType | Type<any>): any {
  if (read === QueryReadType.ElementRef) {
    return getOrCreateElementRef(nodeInjector);
  } else if (read === QueryReadType.ViewContainerRef) {
    return getOrCreateContainerRef(nodeInjector);
  } else if (read === QueryReadType.TemplateRef) {
    return getOrCreateTemplateRef(nodeInjector);
  } else {
    const matchingIdx = geIdxOfMatchingDirective(node, read);
    if (matchingIdx !== null) {
      return node.view.data[matchingIdx];
    }
  }
  return null;
}

function add(predicate: QueryPredicate<any>| null, node: LNode) {
  const nodeInjector = getOrCreateNodeInjectorForNode(node as LElementNode | LContainerNode);
  while (predicate) {
    const type = predicate.type;
    if (type) {
      const directiveIdx = geIdxOfMatchingDirective(node, type);
      if (directiveIdx !== null) {
        if (predicate.read !== null) {
          const requestedRead = readFromNodeInjector(nodeInjector, node, predicate.read);
          if (requestedRead !== null) {
            predicate.values.push(requestedRead);
          }
        } else {
          predicate.values.push(node.view.data[directiveIdx]);
        }
      }
    } else {
      const selector = predicate.selector !;
      for (let i = 0; i < selector.length; i++) {
        ngDevMode && assertNotNull(node.tNode, 'node.tNode');
        const directiveIdx = getIdxOfMatchingSelector(node.tNode !, selector[i]);
        // is anything on a node matching a selector?
        if (directiveIdx !== null) {
          if (predicate.read !== null) {
            const requestedRead = readFromNodeInjector(nodeInjector, node, predicate.read);
            if (requestedRead !== null) {
              predicate.values.push(requestedRead);
            }
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
