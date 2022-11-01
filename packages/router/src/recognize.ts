/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Type, ɵRuntimeError as RuntimeError} from '@angular/core';
import {EmptyError, from, Observable, Observer, of} from 'rxjs';
import {catchError, concatMap, defaultIfEmpty, first, last as rxjsLast, map, scan, switchMap, takeWhile} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {Data, ResolveData, Route, Routes} from './models';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, ParamsInheritanceStrategy, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {last} from './utils/collection';
import {getOutlet, sortByMatchingOutlets} from './utils/config';
import {isImmediateMatch, matchWithChecks, noLeftoversInUrl, split} from './utils/config_matching';
import {TreeNode} from './utils/tree';
import {isEmptyError} from './utils/type_guards';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

class NoMatch {}

function newObservableError(e: unknown): Observable<RouterStateSnapshot> {
  // TODO(atscott): This pattern is used throughout the router code and can be `throwError` instead.
  return new Observable<RouterStateSnapshot>((obs: Observer<RouterStateSnapshot>) => obs.error(e));
}

export function recognize(
    injector: EnvironmentInjector, rootComponentType: Type<any>|null, config: Routes,
    urlTree: UrlTree, url: string, urlSerializer: UrlSerializer,
    paramsInheritanceStrategy: ParamsInheritanceStrategy =
        'emptyOnly'): Observable<RouterStateSnapshot> {
  return new Recognizer(
             injector, rootComponentType, config, urlTree, url, paramsInheritanceStrategy,
             urlSerializer)
      .recognize()
      .pipe(switchMap(result => {
        if (result === null) {
          return newObservableError(new NoMatch());
        } else {
          return of(result);
        }
      }));
}

export class Recognizer {
  constructor(
      private injector: EnvironmentInjector, private rootComponentType: Type<any>|null,
      private config: Routes, private urlTree: UrlTree, private url: string,
      private paramsInheritanceStrategy: ParamsInheritanceStrategy,
      private readonly urlSerializer: UrlSerializer) {}

  recognize(): Observable<RouterStateSnapshot|null> {
    const rootSegmentGroup =
        split(this.urlTree.root, [], [], this.config.filter(c => c.redirectTo === undefined))
            .segmentGroup;

    return this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET)
        .pipe(map(children => {
          if (children === null) {
            return null;
          }

          // Use Object.freeze to prevent readers of the Router state from modifying it outside of a
          // navigation, resulting in the router being out of sync with the browser.
          const root = new ActivatedRouteSnapshot(
              [], Object.freeze({}), Object.freeze({...this.urlTree.queryParams}),
              this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null,
              this.urlTree.root, -1, {});

          const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);
          const routeState = new RouterStateSnapshot(this.url, rootNode);
          this.inheritParamsAndData(routeState._root);
          return routeState;
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
      outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]|null> {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(injector, config, segmentGroup);
    }

    return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet);
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
      Observable<TreeNode<ActivatedRouteSnapshot>[]|null> {
    return from(Object.keys(segmentGroup.children))
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
              if (!children || !outletChildren) return null;
              children.push(...outletChildren);
              return children;
            }),
            takeWhile(children => children !== null),
            defaultIfEmpty(null as TreeNode<ActivatedRouteSnapshot>[] | null),
            rxjsLast(),
            map(children => {
              if (children === null) return null;
              // Because we may have matched two outlets to the same empty path segment, we can have
              // multiple activated results for the same outlet. We should merge the children of
              // these results so the final return value is only one `TreeNode` per outlet.
              const mergedChildren = mergeEmptyPathMatches(children);
              if (NG_DEV_MODE) {
                // This should really never happen - we are only taking the first match for each
                // outlet and merge the empty path matches.
                checkOutletNameUniqueness(mergedChildren);
              }
              sortActivatedRouteSnapshots(mergedChildren);
              return mergedChildren;
            }),
        );
  }

  processSegment(
      injector: EnvironmentInjector, routes: Route[], segmentGroup: UrlSegmentGroup,
      segments: UrlSegment[], outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]|null> {
    return from(routes).pipe(
        concatMap(r => {
          return this.processSegmentAgainstRoute(
              r._injector ?? injector, r, segmentGroup, segments, outlet);
        }),
        first((x): x is TreeNode<ActivatedRouteSnapshot>[] => !!x), catchError(e => {
          if (isEmptyError(e)) {
            if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
              return of([]);
            }
            return of(null);
          }
          throw e;
        }));
  }

  processSegmentAgainstRoute(
      injector: EnvironmentInjector, route: Route, rawSegment: UrlSegmentGroup,
      segments: UrlSegment[], outlet: string): Observable<TreeNode<ActivatedRouteSnapshot>[]|null> {
    if (route.redirectTo || !isImmediateMatch(route, rawSegment, segments, outlet)) return of(null);

    let matchResult: Observable<{
      snapshot: ActivatedRouteSnapshot,
      consumedSegments: UrlSegment[],
      remainingSegments: UrlSegment[],
    }|null>;

    if (route.path === '**') {
      const params = segments.length > 0 ? last(segments)!.parameters : {};
      const pathIndexShift = getPathIndexShift(rawSegment) + segments.length;
      const snapshot = new ActivatedRouteSnapshot(
          segments, params, Object.freeze({...this.urlTree.queryParams}), this.urlTree.fragment,
          getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null,
          route, getSourceSegmentGroup(rawSegment), pathIndexShift, getResolve(route));
      matchResult = of({
        snapshot,
        consumedSegments: [],
        remainingSegments: [],
      });
    } else {
      matchResult =
          matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer)
              .pipe(map(({matched, consumedSegments, remainingSegments, parameters}) => {
                if (!matched) {
                  return null;
                }
                const pathIndexShift = getPathIndexShift(rawSegment) + consumedSegments.length;

                const snapshot = new ActivatedRouteSnapshot(
                    consumedSegments, parameters, Object.freeze({...this.urlTree.queryParams}),
                    this.urlTree.fragment, getData(route), getOutlet(route),
                    route.component ?? route._loadedComponent ?? null, route,
                    getSourceSegmentGroup(rawSegment), pathIndexShift, getResolve(route));
                return {snapshot, consumedSegments, remainingSegments};
              }));
    }

    return matchResult.pipe(switchMap((result) => {
      if (result === null) {
        return of(null);
      }
      const {snapshot, consumedSegments, remainingSegments} = result;
      // If the route has an injector created from providers, we should start using that.
      injector = route._injector ?? injector;
      const childInjector = route._loadedInjector ?? injector;
      const childConfig: Route[] = getChildConfig(route);

      const {segmentGroup, slicedSegments} = split(
          rawSegment, consumedSegments, remainingSegments,
          // Filter out routes with redirectTo because we are trying to create activated route
          // snapshots and don't handle redirects here. That should have been done in
          // `applyRedirects`.
          childConfig.filter(c => c.redirectTo === undefined));

      if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
        return this.processChildren(childInjector, childConfig, segmentGroup).pipe(map(children => {
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
              matchedOnOutlet ? PRIMARY_OUTLET : outlet)
          .pipe(map(children => {
            if (children === null) {
              return null;
            }
            return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
          }));
    }));
  }
}

function sortActivatedRouteSnapshots(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}

function getChildConfig(route: Route): Route[] {
  if (route.children) {
    return route.children;
  }

  if (route.loadChildren) {
    return route._loadedRoutes!;
  }

  return [];
}

function hasEmptyPathConfig(node: TreeNode<ActivatedRouteSnapshot>) {
  const config = node.value.routeConfig;
  return config && config.path === '' && config.redirectTo === undefined;
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
          NG_DEV_MODE && `Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
}

function getSourceSegmentGroup(segmentGroup: UrlSegmentGroup): UrlSegmentGroup {
  let s = segmentGroup;
  while (s._sourceSegment) {
    s = s._sourceSegment;
  }
  return s;
}

function getPathIndexShift(segmentGroup: UrlSegmentGroup): number {
  let s = segmentGroup;
  let res = s._segmentIndexShift ?? 0;
  while (s._sourceSegment) {
    s = s._sourceSegment;
    res += s._segmentIndexShift ?? 0;
  }
  return res - 1;
}

function getCorrectedPathIndexShift(segmentGroup: UrlSegmentGroup): number {
  let s = segmentGroup;
  let res = s._segmentIndexShiftCorrected ?? s._segmentIndexShift ?? 0;
  while (s._sourceSegment) {
    s = s._sourceSegment;
    res += s._segmentIndexShiftCorrected ?? s._segmentIndexShift ?? 0;
  }
  return res - 1;
}

function getData(route: Route): Data {
  return route.data || {};
}

function getResolve(route: Route): ResolveData {
  return route.resolve || {};
}
