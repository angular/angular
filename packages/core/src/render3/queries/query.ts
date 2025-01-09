/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.

import {ProviderToken} from '../../di/provider_token';
import {createElementRef, ElementRef as ViewEngine_ElementRef} from '../../linker/element_ref';
import {QueryList} from '../../linker/query_list';
import {createTemplateRef, TemplateRef as ViewEngine_TemplateRef} from '../../linker/template_ref';
import {createContainerRef, ViewContainerRef} from '../../linker/view_container_ref';
import {assertDefined, assertIndexInRange, assertNumber, throwError} from '../../util/assert';
import {stringify} from '../../util/stringify';

import {assertFirstCreatePass, assertLContainer} from '../assert';
import {getNodeInjectable, locateDirectiveOrProvider} from '../di';
import {CONTAINER_HEADER_OFFSET, LContainer, MOVED_VIEWS} from '../interfaces/container';
import {
  TContainerNode,
  TElementContainerNode,
  TElementNode,
  TNode,
  TNodeType,
} from '../interfaces/node';
import {LQueries, LQuery, QueryFlags, TQueries, TQuery, TQueryMetadata} from '../interfaces/query';
import {DECLARATION_LCONTAINER, LView, PARENT, QUERIES, TVIEW, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {getCurrentTNode, getLView, getTView} from '../state';
import {storeCleanupWithContext} from '../util/view_utils';

class LQuery_<T> implements LQuery<T> {
  matches: (T | null)[] | null = null;
  constructor(public queryList: QueryList<T>) {}
  clone(): LQuery<T> {
    return new LQuery_(this.queryList);
  }
  setDirty(): void {
    this.queryList.setDirty();
  }
}

class LQueries_ implements LQueries {
  constructor(public queries: LQuery<any>[] = []) {}

  createEmbeddedView(tView: TView): LQueries | null {
    const tQueries = tView.queries;
    if (tQueries !== null) {
      const noOfInheritedQueries =
        tView.contentQueries !== null ? tView.contentQueries[0] : tQueries.length;
      const viewLQueries: LQuery<any>[] = [];

      // An embedded view has queries propagated from a declaration view at the beginning of the
      // TQueries collection and up until a first content query declared in the embedded view. Only
      // propagated LQueries are created at this point (LQuery corresponding to declared content
      // queries will be instantiated from the content query instructions for each directive).
      for (let i = 0; i < noOfInheritedQueries; i++) {
        const tQuery = tQueries.getByIndex(i);
        const parentLQuery = this.queries[tQuery.indexInDeclarationView];
        viewLQueries.push(parentLQuery.clone());
      }

      return new LQueries_(viewLQueries);
    }

    return null;
  }

  insertView(tView: TView): void {
    this.dirtyQueriesWithMatches(tView);
  }

  detachView(tView: TView): void {
    this.dirtyQueriesWithMatches(tView);
  }

  finishViewCreation(tView: TView): void {
    this.dirtyQueriesWithMatches(tView);
  }

  private dirtyQueriesWithMatches(tView: TView) {
    for (let i = 0; i < this.queries.length; i++) {
      if (getTQuery(tView, i).matches !== null) {
        this.queries[i].setDirty();
      }
    }
  }
}

export class TQueryMetadata_ implements TQueryMetadata {
  public predicate: ProviderToken<unknown> | string[];
  constructor(
    predicate: ProviderToken<unknown> | string[] | string,
    public flags: QueryFlags,
    public read: any = null,
  ) {
    // Compiler might not be able to pre-optimize and split multiple selectors.
    if (typeof predicate === 'string') {
      this.predicate = splitQueryMultiSelectors(predicate);
    } else {
      this.predicate = predicate;
    }
  }
}

class TQueries_ implements TQueries {
  constructor(private queries: TQuery[] = []) {}

  elementStart(tView: TView, tNode: TNode): void {
    ngDevMode &&
      assertFirstCreatePass(
        tView,
        'Queries should collect results on the first template pass only',
      );
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementStart(tView, tNode);
    }
  }
  elementEnd(tNode: TNode): void {
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementEnd(tNode);
    }
  }
  embeddedTView(tNode: TNode): TQueries | null {
    let queriesForTemplateRef: TQuery[] | null = null;

    for (let i = 0; i < this.length; i++) {
      const childQueryIndex = queriesForTemplateRef !== null ? queriesForTemplateRef.length : 0;
      const tqueryClone = this.getByIndex(i).embeddedTView(tNode, childQueryIndex);

      if (tqueryClone) {
        tqueryClone.indexInDeclarationView = i;
        if (queriesForTemplateRef !== null) {
          queriesForTemplateRef.push(tqueryClone);
        } else {
          queriesForTemplateRef = [tqueryClone];
        }
      }
    }

    return queriesForTemplateRef !== null ? new TQueries_(queriesForTemplateRef) : null;
  }

  template(tView: TView, tNode: TNode): void {
    ngDevMode &&
      assertFirstCreatePass(
        tView,
        'Queries should collect results on the first template pass only',
      );
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].template(tView, tNode);
    }
  }

  getByIndex(index: number): TQuery {
    ngDevMode && assertIndexInRange(this.queries, index);
    return this.queries[index];
  }

  get length(): number {
    return this.queries.length;
  }

  track(tquery: TQuery): void {
    this.queries.push(tquery);
  }
}

class TQuery_ implements TQuery {
  matches: number[] | null = null;
  indexInDeclarationView = -1;
  crossesNgTemplate = false;

  /**
   * A node index on which a query was declared (-1 for view queries and ones inherited from the
   * declaration template). We use this index (alongside with _appliesToNextNode flag) to know
   * when to apply content queries to elements in a template.
   */
  private _declarationNodeIndex: number;

  /**
   * A flag indicating if a given query still applies to nodes it is crossing. We use this flag
   * (alongside with _declarationNodeIndex) to know when to stop applying content queries to
   * elements in a template.
   */
  private _appliesToNextNode = true;

  constructor(
    public metadata: TQueryMetadata,
    nodeIndex: number = -1,
  ) {
    this._declarationNodeIndex = nodeIndex;
  }

  elementStart(tView: TView, tNode: TNode): void {
    if (this.isApplyingToNode(tNode)) {
      this.matchTNode(tView, tNode);
    }
  }

  elementEnd(tNode: TNode): void {
    if (this._declarationNodeIndex === tNode.index) {
      this._appliesToNextNode = false;
    }
  }

  template(tView: TView, tNode: TNode): void {
    this.elementStart(tView, tNode);
  }

  embeddedTView(tNode: TNode, childQueryIndex: number): TQuery | null {
    if (this.isApplyingToNode(tNode)) {
      this.crossesNgTemplate = true;
      // A marker indicating a `<ng-template>` element (a placeholder for query results from
      // embedded views created based on this `<ng-template>`).
      this.addMatch(-tNode.index, childQueryIndex);
      return new TQuery_(this.metadata);
    }
    return null;
  }

  private isApplyingToNode(tNode: TNode): boolean {
    if (
      this._appliesToNextNode &&
      (this.metadata.flags & QueryFlags.descendants) !== QueryFlags.descendants
    ) {
      const declarationNodeIdx = this._declarationNodeIndex;
      let parent = tNode.parent;
      // Determine if a given TNode is a "direct" child of a node on which a content query was
      // declared (only direct children of query's host node can match with the descendants: false
      // option). There are 3 main use-case / conditions to consider here:
      // - <needs-target><i #target></i></needs-target>: here <i #target> parent node is a query
      // host node;
      // - <needs-target><ng-template [ngIf]="true"><i #target></i></ng-template></needs-target>:
      // here <i #target> parent node is null;
      // - <needs-target><ng-container><i #target></i></ng-container></needs-target>: here we need
      // to go past `<ng-container>` to determine <i #target> parent node (but we shouldn't traverse
      // up past the query's host node!).
      while (
        parent !== null &&
        parent.type & TNodeType.ElementContainer &&
        parent.index !== declarationNodeIdx
      ) {
        parent = parent.parent;
      }
      return declarationNodeIdx === (parent !== null ? parent.index : -1);
    }
    return this._appliesToNextNode;
  }

  private matchTNode(tView: TView, tNode: TNode): void {
    const predicate = this.metadata.predicate;
    if (Array.isArray(predicate)) {
      for (let i = 0; i < predicate.length; i++) {
        const name = predicate[i];
        this.matchTNodeWithReadOption(tView, tNode, getIdxOfMatchingSelector(tNode, name));
        // Also try matching the name to a provider since strings can be used as DI tokens too.
        this.matchTNodeWithReadOption(
          tView,
          tNode,
          locateDirectiveOrProvider(tNode, tView, name, false, false),
        );
      }
    } else {
      if ((predicate as any) === ViewEngine_TemplateRef) {
        if (tNode.type & TNodeType.Container) {
          this.matchTNodeWithReadOption(tView, tNode, -1);
        }
      } else {
        this.matchTNodeWithReadOption(
          tView,
          tNode,
          locateDirectiveOrProvider(tNode, tView, predicate, false, false),
        );
      }
    }
  }

  private matchTNodeWithReadOption(tView: TView, tNode: TNode, nodeMatchIdx: number | null): void {
    if (nodeMatchIdx !== null) {
      const read = this.metadata.read;
      if (read !== null) {
        if (
          read === ViewEngine_ElementRef ||
          read === ViewContainerRef ||
          (read === ViewEngine_TemplateRef && tNode.type & TNodeType.Container)
        ) {
          this.addMatch(tNode.index, -2);
        } else {
          const directiveOrProviderIdx = locateDirectiveOrProvider(
            tNode,
            tView,
            read,
            false,
            false,
          );
          if (directiveOrProviderIdx !== null) {
            this.addMatch(tNode.index, directiveOrProviderIdx);
          }
        }
      } else {
        this.addMatch(tNode.index, nodeMatchIdx);
      }
    }
  }

  private addMatch(tNodeIdx: number, matchIdx: number) {
    if (this.matches === null) {
      this.matches = [tNodeIdx, matchIdx];
    } else {
      this.matches.push(tNodeIdx, matchIdx);
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
function getIdxOfMatchingSelector(tNode: TNode, selector: string): number | null {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    for (let i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1] as number;
      }
    }
  }
  return null;
}

function createResultByTNodeType(tNode: TNode, currentView: LView): any {
  if (tNode.type & (TNodeType.AnyRNode | TNodeType.ElementContainer)) {
    return createElementRef(tNode, currentView);
  } else if (tNode.type & TNodeType.Container) {
    return createTemplateRef(tNode, currentView);
  }
  return null;
}

function createResultForNode(lView: LView, tNode: TNode, matchingIdx: number, read: any): any {
  if (matchingIdx === -1) {
    // if read token and / or strategy is not specified, detect it using appropriate tNode type
    return createResultByTNodeType(tNode, lView);
  } else if (matchingIdx === -2) {
    // read a special token from a node injector
    return createSpecialToken(lView, tNode, read);
  } else {
    // read a token
    return getNodeInjectable(lView, lView[TVIEW], matchingIdx, tNode as TElementNode);
  }
}

function createSpecialToken(lView: LView, tNode: TNode, read: any): any {
  if (read === ViewEngine_ElementRef) {
    return createElementRef(tNode, lView);
  } else if (read === ViewEngine_TemplateRef) {
    return createTemplateRef(tNode, lView);
  } else if (read === ViewContainerRef) {
    ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.AnyContainer);
    return createContainerRef(
      tNode as TElementNode | TContainerNode | TElementContainerNode,
      lView,
    );
  } else {
    ngDevMode &&
      throwError(
        `Special token to read should be one of ElementRef, TemplateRef or ViewContainerRef but got ${stringify(
          read,
        )}.`,
      );
  }
}

/**
 * A helper function that creates query results for a given view. This function is meant to do the
 * processing once and only once for a given view instance (a set of results for a given view
 * doesn't change).
 */
function materializeViewResults<T>(
  tView: TView,
  lView: LView,
  tQuery: TQuery,
  queryIndex: number,
): T[] {
  const lQuery = lView[QUERIES]!.queries![queryIndex];
  if (lQuery.matches === null) {
    const tViewData = tView.data;
    const tQueryMatches = tQuery.matches;
    const result: Array<T | null> = [];
    for (let i = 0; tQueryMatches !== null && i < tQueryMatches.length; i += 2) {
      const matchedNodeIdx = tQueryMatches[i];
      if (matchedNodeIdx < 0) {
        // we at the <ng-template> marker which might have results in views created based on this
        // <ng-template> - those results will be in separate views though, so here we just leave
        // null as a placeholder
        result.push(null);
      } else {
        ngDevMode && assertIndexInRange(tViewData, matchedNodeIdx);
        const tNode = tViewData[matchedNodeIdx] as TNode;
        result.push(createResultForNode(lView, tNode, tQueryMatches[i + 1], tQuery.metadata.read));
      }
    }
    lQuery.matches = result;
  }

  return lQuery.matches;
}

/**
 * A helper function that collects (already materialized) query results from a tree of views,
 * starting with a provided LView.
 */
function collectQueryResults<T>(tView: TView, lView: LView, queryIndex: number, result: T[]): T[] {
  const tQuery = tView.queries!.getByIndex(queryIndex);
  const tQueryMatches = tQuery.matches;
  if (tQueryMatches !== null) {
    const lViewResults = materializeViewResults<T>(tView, lView, tQuery, queryIndex);

    for (let i = 0; i < tQueryMatches.length; i += 2) {
      const tNodeIdx = tQueryMatches[i];
      if (tNodeIdx > 0) {
        result.push(lViewResults[i / 2] as T);
      } else {
        const childQueryIndex = tQueryMatches[i + 1];

        const declarationLContainer = lView[-tNodeIdx] as LContainer;
        ngDevMode && assertLContainer(declarationLContainer);

        // collect matches for views inserted in this container
        for (let i = CONTAINER_HEADER_OFFSET; i < declarationLContainer.length; i++) {
          const embeddedLView = declarationLContainer[i];
          if (embeddedLView[DECLARATION_LCONTAINER] === embeddedLView[PARENT]) {
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }

        // collect matches for views created from this declaration container and inserted into
        // different containers
        if (declarationLContainer[MOVED_VIEWS] !== null) {
          const embeddedLViews = declarationLContainer[MOVED_VIEWS]!;
          for (let i = 0; i < embeddedLViews.length; i++) {
            const embeddedLView = embeddedLViews[i];
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }
      }
    }
  }
  return result;
}

export function loadQueryInternal<T>(lView: LView, queryIndex: number): QueryList<T> {
  ngDevMode &&
    assertDefined(lView[QUERIES], 'LQueries should be defined when trying to load a query');
  ngDevMode && assertIndexInRange(lView[QUERIES]!.queries, queryIndex);
  return lView[QUERIES]!.queries[queryIndex].queryList;
}

/**
 * Creates a new instance of LQuery and returns its index in the collection of LQuery objects.
 *
 * @returns index in the collection of LQuery objects
 */
function createLQuery<T>(tView: TView, lView: LView, flags: QueryFlags): number {
  const queryList = new QueryList<T>(
    (flags & QueryFlags.emitDistinctChangesOnly) === QueryFlags.emitDistinctChangesOnly,
  );

  storeCleanupWithContext(tView, lView, queryList, queryList.destroy);

  const lQueries = (lView[QUERIES] ??= new LQueries_()).queries;
  return lQueries.push(new LQuery_(queryList)) - 1;
}

export function createViewQuery<T>(
  predicate: ProviderToken<unknown> | string[] | string,
  flags: QueryFlags,
  read?: any,
): number {
  ngDevMode && assertNumber(flags, 'Expecting flags');
  const tView = getTView();
  if (tView.firstCreatePass) {
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), -1);
    if ((flags & QueryFlags.isStatic) === QueryFlags.isStatic) {
      tView.staticViewQueries = true;
    }
  }

  return createLQuery<T>(tView, getLView(), flags);
}

export function createContentQuery<T>(
  directiveIndex: number,
  predicate: ProviderToken<unknown> | string[] | string,
  flags: QueryFlags,
  read?: ProviderToken<T>,
): number {
  ngDevMode && assertNumber(flags, 'Expecting flags');
  const tView = getTView();
  if (tView.firstCreatePass) {
    const tNode = getCurrentTNode()!;
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), tNode.index);
    saveContentQueryAndDirectiveIndex(tView, directiveIndex);
    if ((flags & QueryFlags.isStatic) === QueryFlags.isStatic) {
      tView.staticContentQueries = true;
    }
  }

  return createLQuery<T>(tView, getLView(), flags);
}

/** Splits multiple selectors in the locator. */
function splitQueryMultiSelectors(locator: string): string[] {
  return locator.split(',').map((s) => s.trim());
}

export function createTQuery(tView: TView, metadata: TQueryMetadata, nodeIndex: number): void {
  if (tView.queries === null) tView.queries = new TQueries_();
  tView.queries.track(new TQuery_(metadata, nodeIndex));
}

export function saveContentQueryAndDirectiveIndex(tView: TView, directiveIndex: number) {
  const tViewContentQueries = tView.contentQueries || (tView.contentQueries = []);
  const lastSavedDirectiveIndex = tViewContentQueries.length
    ? tViewContentQueries[tViewContentQueries.length - 1]
    : -1;
  if (directiveIndex !== lastSavedDirectiveIndex) {
    tViewContentQueries.push(tView.queries!.length - 1, directiveIndex);
  }
}

export function getTQuery(tView: TView, index: number): TQuery {
  ngDevMode && assertDefined(tView.queries, 'TQueries must be defined to retrieve a TQuery');
  return tView.queries!.getByIndex(index);
}

/**
 * A helper function collecting results from all the views where a given query was active.
 * @param lView
 * @param queryIndex
 */
export function getQueryResults<V>(lView: LView, queryIndex: number): V[] {
  const tView = lView[TVIEW];
  const tQuery = getTQuery(tView, queryIndex);
  return tQuery.crossesNgTemplate
    ? collectQueryResults<V>(tView, lView, queryIndex, [])
    : materializeViewResults<V>(tView, lView, tQuery, queryIndex);
}
