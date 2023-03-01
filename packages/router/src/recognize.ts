/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Type, ɵRuntimeError as RuntimeError} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {catchError, concatMap, defaultIfEmpty, first, last as rxjsLast, map, mergeMap, scan, switchMap, tap} from 'rxjs/operators';

import {absoluteRedirect, AbsoluteRedirect, ApplyRedirects, canLoadFails, noMatch, NoMatch} from './apply_redirects';
import {createUrlTreeFromSnapshot} from './create_url_tree';
import {RuntimeErrorCode} from './errors';
import {Data, LoadedRouterConfig, ResolveData, Route, Routes} from './models';
import {runCanLoadGuards} from './operators/check_guards';
import {RouterConfigLoader} from './router_config_loader';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, ParamsInheritanceStrategy, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {last} from './utils/collection';
import {getOutlet, sortByMatchingOutlets} from './utils/config';
import {isImmediateMatch, match, matchWithChecks, noLeftoversInUrl, split} from './utils/config_matching';
import {TreeNode} from './utils/tree';
import {isEmptyError} from './utils/type_guards';


export function recognize(
    injector: EnvironmentInjector, configLoader: RouterConfigLoader,
    rootComponentType: Type<any>|null, config: Routes, urlTree: UrlTree,
    urlSerializer: UrlSerializer,
    paramsInheritanceStrategy: ParamsInheritanceStrategy =
        'emptyOnly'): Observable<{state: RouterStateSnapshot, tree: UrlTree}> {
  return new Recognizer(
             injector, configLoader, rootComponentType, config, urlTree, paramsInheritanceStrategy,
             urlSerializer)
      .recognize();
}

export class Recognizer {
  allowRedirects = true;
  private applyRedirects = new ApplyRedirects(this.urlSerializer, this.urlTree);

  constructor(
      private injector: EnvironmentInjector, private configLoader: RouterConfigLoader,
      private rootComponentType: Type<any>|null, private config: Routes, private urlTree: UrlTree,
      private paramsInheritanceStrategy: ParamsInheritanceStrategy,
      private readonly urlSerializer: UrlSerializer) {}

  private noMatchError(e: NoMatch): any {
    return new RuntimeError(
        RuntimeErrorCode.NO_MATCH,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
            `Cannot match any routes. URL Segment: '${e.segmentGroup}'`);
  }

  recognize(): Observable<{state: RouterStateSnapshot, tree: UrlTree}> {
    const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;

    return this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET)
        .pipe(
            catchError((e: any) => {
              if (e instanceof AbsoluteRedirect) {
                // After an absolute redirect we do not apply any more redirects!
                // If this implementation changes, update the documentation note in `redirectTo`.
                this.allowRedirects = false;
                this.urlTree = e.urlTree;
                return this.match(e.urlTree);
              }

              if (e instanceof NoMatch) {
                throw this.noMatchError(e);
              }

              throw e;
            }),
            map(children => {
              // Use Object.freeze to prevent readers of the Router state from modifying it outside
              // of a navigation, resulting in the router being out of sync with the browser.
              const root = new ActivatedRouteSnapshot(
                  [], Object.freeze({}), Object.freeze({...this.urlTree.queryParams}),
                  this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null, {});

              const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);
              const routeState = new RouterStateSnapshot('', rootNode);
              const tree = createUrlTreeFromSnapshot(
                  root, [], this.urlTree.queryParams, this.urlTree.fragment);
              // https://github.com/angular/angular/issues/47307
              // Creating the tree stringifies the query params
              // We don't want to do this here so reassign them to the original.
              tree.queryParams = this.urlTree.queryParams;
              routeState.url = this.urlSerializer.serialize(tree);
              this.inheritParamsAndData(routeState._root);
              return {state: routeState, tree};
            }));
  }


  private match(tree: UrlTree) {
    const expanded$ =
        this.processSegmentGroup(this.injector, this.config, tree.root, PRIMARY_OUTLET);
    return expanded$.pipe(catchError((e: any) => {
      if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      }

      throw e;
    }));
  }

  inheritParamsAndData(routeNode: TreeNode<ActivatedRouteSnapshot>): void {
    const route = routeNode.value;

    const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
    route.params = Object.freeze(i.params);
    route.data = Object.freeze(i.data);

    routeNode.children.forEach(n => this.inheritParamsAndData(n));
  }

  processSegmentGroup(
      injector: EnvironmentInjector, config: Route[], segmentGroup: UrlSegmentGroup,
      outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(injector, config, segmentGroup);
    }

    return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet, true);
  }

  /**
   * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
   * we cannot find a match for _any_ of the children.
   *
   * @param config - The `Routes` to match against
   * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
   *     config.
   */
  processChildren(injector: EnvironmentInjector, config: Route[], segmentGroup: UrlSegmentGroup):
      Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    // Expand outlets one at a time, starting with the primary outlet. We need to do it this way
    // because an absolute redirect from the primary outlet takes precedence.
    const childOutlets: string[] = [];
    for (const child of Object.keys(segmentGroup.children)) {
      if (child === 'primary') {
        childOutlets.unshift(child);
      } else {
        childOutlets.push(child);
      }
    }
    return from(childOutlets)
        .pipe(
            concatMap(childOutlet => {
              const child = segmentGroup.children[childOutlet];
              // Sort the config so that routes with outlets that match the one being activated
              // appear first, followed by routes for other outlets, which might match if they have
              // an empty path.
              const sortedConfig = sortByMatchingOutlets(config, childOutlet);
              return this.processSegmentGroup(injector, sortedConfig, child, childOutlet);
            }),
            scan((children, outletChildren) => {
              children.push(...outletChildren);
              return children;
            }),
            defaultIfEmpty(null as TreeNode<ActivatedRouteSnapshot>[] | null),
            rxjsLast(),
            mergeMap(children => {
              if (children === null) return noMatch(segmentGroup);
              // Because we may have matched two outlets to the same empty path segment, we can have
              // multiple activated results for the same outlet. We should merge the children of
              // these results so the final return value is only one `TreeNode` per outlet.
              const mergedChildren = mergeEmptyPathMatches(children);
              if (typeof ngDevMode === 'undefined' || ngDevMode) {
                // This should really never happen - we are only taking the first match for each
                // outlet and merge the empty path matches.
                checkOutletNameUniqueness(mergedChildren);
              }
              sortActivatedRouteSnapshots(mergedChildren);
              return of(mergedChildren);
            }),
        );
  }

  processSegment(
      injector: EnvironmentInjector, routes: Route[], segmentGroup: UrlSegmentGroup,
      segments: UrlSegment[], outlet: string,
      allowRedirects: boolean): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    return from(routes).pipe(
        concatMap(r => {
          return this
              .processSegmentAgainstRoute(
                  r._injector ?? injector, routes, r, segmentGroup, segments, outlet,
                  allowRedirects)
              .pipe(catchError((e: any) => {
                if (e instanceof NoMatch) {
                  return of(null);
                }
                throw e;
              }));
        }),
        first((x): x is TreeNode<ActivatedRouteSnapshot>[] => !!x), catchError(e => {
          if (isEmptyError(e)) {
            if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
              return of([]);
            }
            return noMatch(segmentGroup);
          }
          throw e;
        }));
  }

  processSegmentAgainstRoute(
      injector: EnvironmentInjector, routes: Route[], route: Route, rawSegment: UrlSegmentGroup,
      segments: UrlSegment[], outlet: string,
      allowRedirects: boolean): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    if (!isImmediateMatch(route, rawSegment, segments, outlet)) return noMatch(rawSegment);

    if (route.redirectTo === undefined) {
      return this.matchSegmentAgainstRoute(
          injector, rawSegment, route, segments, outlet, allowRedirects);
    }

    if (allowRedirects && this.allowRedirects) {
      return this.expandSegmentAgainstRouteUsingRedirect(
          injector, rawSegment, routes, route, segments, outlet);
    }

    return noMatch(rawSegment);
  }

  private expandSegmentAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    if (route.path === '**') {
      return this.expandWildCardWithParamsAgainstRouteUsingRedirect(
          injector, routes, route, outlet);
    }

    return this.expandRegularSegmentAgainstRouteUsingRedirect(
        injector, segmentGroup, routes, route, segments, outlet);
  }

  private expandWildCardWithParamsAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, routes: Route[], route: Route,
      outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    const newTree = this.applyRedirects.applyRedirectCommands([], route.redirectTo!, {});
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.applyRedirects.lineralizeSegments(route, newTree)
        .pipe(mergeMap((newSegments: UrlSegment[]) => {
          const group = new UrlSegmentGroup(newSegments, {});
          return this.processSegment(injector, routes, group, newSegments, outlet, false);
        }));
  }

  private expandRegularSegmentAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    const {matched, consumedSegments, remainingSegments, positionalParamSegments} =
        match(segmentGroup, route, segments);
    if (!matched) return noMatch(segmentGroup);

    const newTree = this.applyRedirects.applyRedirectCommands(
        consumedSegments, route.redirectTo!, positionalParamSegments);
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.applyRedirects.lineralizeSegments(route, newTree)
        .pipe(mergeMap((newSegments: UrlSegment[]) => {
          return this.processSegment(
              injector, routes, segmentGroup, newSegments.concat(remainingSegments), outlet, false);
        }));
  }

  matchSegmentAgainstRoute(
      injector: EnvironmentInjector, rawSegment: UrlSegmentGroup, route: Route,
      segments: UrlSegment[], outlet: string,
      allowRedirects: boolean): Observable<TreeNode<ActivatedRouteSnapshot>[]> {
    let matchResult: Observable<{
      snapshot: ActivatedRouteSnapshot,
      consumedSegments: UrlSegment[],
      remainingSegments: UrlSegment[],
    }|null>;

    if (route.path === '**') {
      const params = segments.length > 0 ? last(segments)!.parameters : {};
      const snapshot = new ActivatedRouteSnapshot(
          segments, params, Object.freeze({...this.urlTree.queryParams}), this.urlTree.fragment,
          getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null,
          route, getResolve(route));
      matchResult = of({
        snapshot,
        consumedSegments: [],
        remainingSegments: [],
      });
      // Prior versions of the route matching algorithm would stop matching at the wildcard route.
      // We should investigate a better strategy for any existing children. Otherwise, these
      // child segments are silently dropped from the navigation.
      // https://github.com/angular/angular/issues/40089
      rawSegment.children = {};
    } else {
      matchResult =
          matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer)
              .pipe(map(({matched, consumedSegments, remainingSegments, parameters}) => {
                if (!matched) {
                  return null;
                }

                const snapshot = new ActivatedRouteSnapshot(
                    consumedSegments, parameters, Object.freeze({...this.urlTree.queryParams}),
                    this.urlTree.fragment, getData(route), getOutlet(route),
                    route.component ?? route._loadedComponent ?? null, route, getResolve(route));
                return {snapshot, consumedSegments, remainingSegments};
              }));
    }

    return matchResult.pipe(switchMap((result) => {
      if (result === null) {
        return noMatch(rawSegment);
      }

      // If the route has an injector created from providers, we should start using that.
      injector = route._injector ?? injector;
      return this.getChildConfig(injector, route, segments)
          .pipe(switchMap(({routes: childConfig}) => {
            const childInjector = route._loadedInjector ?? injector;

            const {snapshot, consumedSegments, remainingSegments} = result;

            const {segmentGroup, slicedSegments} =
                split(rawSegment, consumedSegments, remainingSegments, childConfig);

            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
              return this.processChildren(childInjector, childConfig, segmentGroup)
                  .pipe(map(children => {
                    if (children === null) {
                      return null;
                    }
                    return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
                  }));
            }

            if (childConfig.length === 0 && slicedSegments.length === 0) {
              return of([new TreeNode<ActivatedRouteSnapshot>(snapshot, [])]);
            }

            const matchedOnOutlet = getOutlet(route) === outlet;
            // If we matched a config due to empty path match on a different outlet, we need to
            // continue passing the current outlet for the segment rather than switch to PRIMARY.
            // Note that we switch to primary when we have a match because outlet configs look like
            // this: {path: 'a', outlet: 'a', children: [
            //  {path: 'b', component: B},
            //  {path: 'c', component: C},
            // ]}
            // Notice that the children of the named outlet are configured with the primary outlet
            return this
                .processSegment(
                    childInjector, childConfig, segmentGroup, slicedSegments,
                    matchedOnOutlet ? PRIMARY_OUTLET : outlet, true)
                .pipe(map(children => {
                  return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
                }));
          }));
    }));
  }
  private getChildConfig(injector: EnvironmentInjector, route: Route, segments: UrlSegment[]):
      Observable<LoadedRouterConfig> {
    if (route.children) {
      // The children belong to the same module
      return of({routes: route.children, injector});
    }

    if (route.loadChildren) {
      // lazy children belong to the loaded module
      if (route._loadedRoutes !== undefined) {
        return of({routes: route._loadedRoutes, injector: route._loadedInjector});
      }

      return runCanLoadGuards(injector, route, segments, this.urlSerializer)
          .pipe(mergeMap((shouldLoadResult: boolean) => {
            if (shouldLoadResult) {
              return this.configLoader.loadChildren(injector, route)
                  .pipe(tap((cfg: LoadedRouterConfig) => {
                    route._loadedRoutes = cfg.routes;
                    route._loadedInjector = cfg.injector;
                  }));
            }
            return canLoadFails(route);
          }));
    }

    return of({routes: [], injector});
  }
}

function sortActivatedRouteSnapshots(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}

function hasEmptyPathConfig(node: TreeNode<ActivatedRouteSnapshot>) {
  const config = node.value.routeConfig;
  return config && config.path === '';
}

/**
 * Finds `TreeNode`s with matching empty path route configs and merges them into `TreeNode` with
 * the children from each duplicate. This is necessary because different outlets can match a
 * single empty path route config and the results need to then be merged.
 */
function mergeEmptyPathMatches(nodes: Array<TreeNode<ActivatedRouteSnapshot>>):
    Array<TreeNode<ActivatedRouteSnapshot>> {
  const result: Array<TreeNode<ActivatedRouteSnapshot>> = [];
  // The set of nodes which contain children that were merged from two duplicate empty path nodes.
  const mergedNodes: Set<TreeNode<ActivatedRouteSnapshot>> = new Set();

  for (const node of nodes) {
    if (!hasEmptyPathConfig(node)) {
      result.push(node);
      continue;
    }

    const duplicateEmptyPathNode =
        result.find(resultNode => node.value.routeConfig === resultNode.value.routeConfig);
    if (duplicateEmptyPathNode !== undefined) {
      duplicateEmptyPathNode.children.push(...node.children);
      mergedNodes.add(duplicateEmptyPathNode);
    } else {
      result.push(node);
    }
  }
  // For each node which has children from multiple sources, we need to recompute a new `TreeNode`
  // by also merging those children. This is necessary when there are multiple empty path configs
  // in a row. Put another way: whenever we combine children of two nodes, we need to also check
  // if any of those children can be combined into a single node as well.
  for (const mergedNode of mergedNodes) {
    const mergedChildren = mergeEmptyPathMatches(mergedNode.children);
    result.push(new TreeNode(mergedNode.value, mergedChildren));
  }
  return result.filter(n => !mergedNodes.has(n));
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  const names: {[k: string]: ActivatedRouteSnapshot} = {};
  nodes.forEach(n => {
    const routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.url.map(s => s.toString()).join('/');
      const c = n.value.url.map(s => s.toString()).join('/');
      throw new RuntimeError(
          RuntimeErrorCode.TWO_SEGMENTS_WITH_SAME_OUTLET,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
              `Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
}

function getData(route: Route): Data {
  return route.data || {};
}

function getResolve(route: Route): ResolveData {
  return route.resolve || {};
}
