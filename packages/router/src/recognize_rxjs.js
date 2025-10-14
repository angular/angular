/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError} from '@angular/core';
import {from, of} from 'rxjs';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  first,
  last,
  map,
  mergeMap,
  scan,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  AbsoluteRedirect,
  ApplyRedirects,
  canLoadFails,
  noMatch,
  NoMatch,
} from './apply_redirects_rxjs';
import {createUrlTreeFromSnapshot} from './create_url_tree';
import {runCanLoadGuards} from './operators/check_guards';
import {ActivatedRouteSnapshot, getInherited, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {getOutlet, sortByMatchingOutlets} from './utils/config';
import {
  emptyPathMatch,
  match,
  matchWithChecks,
  noLeftoversInUrl,
  split,
} from './utils/config_matching';
import {TreeNode} from './utils/tree';
import {isEmptyError} from './utils/type_guards';
/**
 * Class used to indicate there were no additional route config matches but that all segments of
 * the URL were consumed during matching so the route was URL matched. When this happens, we still
 * try to match child configs in case there are empty path children.
 */
class NoLeftoversInUrl {}
export function recognize(
  injector,
  configLoader,
  rootComponentType,
  config,
  urlTree,
  urlSerializer,
  paramsInheritanceStrategy = 'emptyOnly',
  abortSignal,
) {
  return new Recognizer(
    injector,
    configLoader,
    rootComponentType,
    config,
    urlTree,
    paramsInheritanceStrategy,
    urlSerializer,
  ).recognize();
}
const MAX_ALLOWED_REDIRECTS = 31;
export class Recognizer {
  constructor(
    injector,
    configLoader,
    rootComponentType,
    config,
    urlTree,
    paramsInheritanceStrategy,
    urlSerializer,
  ) {
    this.injector = injector;
    this.configLoader = configLoader;
    this.rootComponentType = rootComponentType;
    this.config = config;
    this.urlTree = urlTree;
    this.paramsInheritanceStrategy = paramsInheritanceStrategy;
    this.urlSerializer = urlSerializer;
    this.absoluteRedirectCount = 0;
    this.allowRedirects = true;
    this.applyRedirects = new ApplyRedirects(this.urlSerializer, this.urlTree);
  }
  noMatchError(e) {
    return new RuntimeError(
      4002 /* RuntimeErrorCode.NO_MATCH */,
      typeof ngDevMode === 'undefined' || ngDevMode
        ? `Cannot match any routes. URL Segment: '${e.segmentGroup}'`
        : `'${e.segmentGroup}'`,
    );
  }
  recognize() {
    const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
    return this.match(rootSegmentGroup).pipe(
      map(({children, rootSnapshot}) => {
        const rootNode = new TreeNode(rootSnapshot, children);
        const routeState = new RouterStateSnapshot('', rootNode);
        const tree = createUrlTreeFromSnapshot(
          rootSnapshot,
          [],
          this.urlTree.queryParams,
          this.urlTree.fragment,
        );
        // https://github.com/angular/angular/issues/47307
        // Creating the tree stringifies the query params
        // We don't want to do this here so reassign them to the original.
        tree.queryParams = this.urlTree.queryParams;
        routeState.url = this.urlSerializer.serialize(tree);
        return {state: routeState, tree};
      }),
    );
  }
  match(rootSegmentGroup) {
    // Use Object.freeze to prevent readers of the Router state from modifying it outside
    // of a navigation, resulting in the router being out of sync with the browser.
    const rootSnapshot = new ActivatedRouteSnapshot(
      [],
      Object.freeze({}),
      Object.freeze({...this.urlTree.queryParams}),
      this.urlTree.fragment,
      Object.freeze({}),
      PRIMARY_OUTLET,
      this.rootComponentType,
      null,
      {},
    );
    return this.processSegmentGroup(
      this.injector,
      this.config,
      rootSegmentGroup,
      PRIMARY_OUTLET,
      rootSnapshot,
    ).pipe(
      map((children) => {
        return {children, rootSnapshot};
      }),
      catchError((e) => {
        if (e instanceof AbsoluteRedirect) {
          this.urlTree = e.urlTree;
          return this.match(e.urlTree.root);
        }
        if (e instanceof NoMatch) {
          throw this.noMatchError(e);
        }
        throw e;
      }),
    );
  }
  processSegmentGroup(injector, config, segmentGroup, outlet, parentRoute) {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(injector, config, segmentGroup, parentRoute);
    }
    return this.processSegment(
      injector,
      config,
      segmentGroup,
      segmentGroup.segments,
      outlet,
      true,
      parentRoute,
    ).pipe(map((child) => (child instanceof TreeNode ? [child] : [])));
  }
  /**
   * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
   * we cannot find a match for _any_ of the children.
   *
   * @param config - The `Routes` to match against
   * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
   *     config.
   */
  processChildren(injector, config, segmentGroup, parentRoute) {
    // Expand outlets one at a time, starting with the primary outlet. We need to do it this way
    // because an absolute redirect from the primary outlet takes precedence.
    const childOutlets = [];
    for (const child of Object.keys(segmentGroup.children)) {
      if (child === 'primary') {
        childOutlets.unshift(child);
      } else {
        childOutlets.push(child);
      }
    }
    return from(childOutlets).pipe(
      concatMap((childOutlet) => {
        const child = segmentGroup.children[childOutlet];
        // Sort the config so that routes with outlets that match the one being activated
        // appear first, followed by routes for other outlets, which might match if they have
        // an empty path.
        const sortedConfig = sortByMatchingOutlets(config, childOutlet);
        return this.processSegmentGroup(injector, sortedConfig, child, childOutlet, parentRoute);
      }),
      scan((children, outletChildren) => {
        children.push(...outletChildren);
        return children;
      }),
      defaultIfEmpty(null),
      last(),
      mergeMap((children) => {
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
  processSegment(injector, routes, segmentGroup, segments, outlet, allowRedirects, parentRoute) {
    return from(routes).pipe(
      concatMap((r) => {
        return this.processSegmentAgainstRoute(
          r._injector ?? injector,
          routes,
          r,
          segmentGroup,
          segments,
          outlet,
          allowRedirects,
          parentRoute,
        ).pipe(
          catchError((e) => {
            if (e instanceof NoMatch) {
              return of(null);
            }
            throw e;
          }),
        );
      }),
      first((x) => !!x),
      catchError((e) => {
        if (isEmptyError(e)) {
          if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
            return of(new NoLeftoversInUrl());
          }
          return noMatch(segmentGroup);
        }
        throw e;
      }),
    );
  }
  processSegmentAgainstRoute(
    injector,
    routes,
    route,
    rawSegment,
    segments,
    outlet,
    allowRedirects,
    parentRoute,
  ) {
    // We allow matches to empty paths when the outlets differ so we can match a url like `/(b:b)` to
    // a config like
    // * `{path: '', children: [{path: 'b', outlet: 'b'}]}`
    // or even
    // * `{path: '', outlet: 'a', children: [{path: 'b', outlet: 'b'}]`
    //
    // The exception here is when the segment outlet is for the primary outlet. This would
    // result in a match inside the named outlet because all children there are written as primary
    // outlets. So we need to prevent child named outlet matches in a url like `/b` in a config like
    // * `{path: '', outlet: 'x' children: [{path: 'b'}]}`
    // This should only match if the url is `/(x:b)`.
    if (
      getOutlet(route) !== outlet &&
      (outlet === PRIMARY_OUTLET || !emptyPathMatch(rawSegment, segments, route))
    ) {
      return noMatch(rawSegment);
    }
    if (route.redirectTo === undefined) {
      return this.matchSegmentAgainstRoute(
        injector,
        rawSegment,
        route,
        segments,
        outlet,
        parentRoute,
      );
    }
    if (this.allowRedirects && allowRedirects) {
      return this.expandSegmentAgainstRouteUsingRedirect(
        injector,
        rawSegment,
        routes,
        route,
        segments,
        outlet,
        parentRoute,
      );
    }
    return noMatch(rawSegment);
  }
  expandSegmentAgainstRouteUsingRedirect(
    injector,
    segmentGroup,
    routes,
    route,
    segments,
    outlet,
    parentRoute,
  ) {
    const {matched, parameters, consumedSegments, positionalParamSegments, remainingSegments} =
      match(segmentGroup, route, segments);
    if (!matched) return noMatch(segmentGroup);
    // TODO(atscott): Move all of this under an if(ngDevMode) as a breaking change and allow stack
    // size exceeded in production
    if (typeof route.redirectTo === 'string' && route.redirectTo[0] === '/') {
      this.absoluteRedirectCount++;
      if (this.absoluteRedirectCount > MAX_ALLOWED_REDIRECTS) {
        if (ngDevMode) {
          throw new RuntimeError(
            4016 /* RuntimeErrorCode.INFINITE_REDIRECT */,
            `Detected possible infinite redirect when redirecting from '${this.urlTree}' to '${route.redirectTo}'.\n` +
              `This is currently a dev mode only error but will become a` +
              ` call stack size exceeded error in production in a future major version.`,
          );
        }
        this.allowRedirects = false;
      }
    }
    const currentSnapshot = new ActivatedRouteSnapshot(
      segments,
      parameters,
      Object.freeze({...this.urlTree.queryParams}),
      this.urlTree.fragment,
      getData(route),
      getOutlet(route),
      route.component ?? route._loadedComponent ?? null,
      route,
      getResolve(route),
    );
    const inherited = getInherited(currentSnapshot, parentRoute, this.paramsInheritanceStrategy);
    currentSnapshot.params = Object.freeze(inherited.params);
    currentSnapshot.data = Object.freeze(inherited.data);
    const newTree$ = this.applyRedirects.applyRedirectCommands(
      consumedSegments,
      route.redirectTo,
      positionalParamSegments,
      currentSnapshot,
      injector,
    );
    return newTree$.pipe(
      switchMap((newTree) => this.applyRedirects.lineralizeSegments(route, newTree)),
      mergeMap((newSegments) => {
        return this.processSegment(
          injector,
          routes,
          segmentGroup,
          newSegments.concat(remainingSegments),
          outlet,
          false,
          parentRoute,
        );
      }),
    );
  }
  matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute) {
    const matchResult = matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer);
    if (route.path === '**') {
      // Prior versions of the route matching algorithm would stop matching at the wildcard route.
      // We should investigate a better strategy for any existing children. Otherwise, these
      // child segments are silently dropped from the navigation.
      // https://github.com/angular/angular/issues/40089
      rawSegment.children = {};
    }
    return matchResult.pipe(
      switchMap((result) => {
        if (!result.matched) {
          return noMatch(rawSegment);
        }
        // If the route has an injector created from providers, we should start using that.
        injector = route._injector ?? injector;
        return this.getChildConfig(injector, route, segments).pipe(
          switchMap(({routes: childConfig}) => {
            const childInjector = route._loadedInjector ?? injector;
            const {parameters, consumedSegments, remainingSegments} = result;
            const snapshot = new ActivatedRouteSnapshot(
              consumedSegments,
              parameters,
              Object.freeze({...this.urlTree.queryParams}),
              this.urlTree.fragment,
              getData(route),
              getOutlet(route),
              route.component ?? route._loadedComponent ?? null,
              route,
              getResolve(route),
            );
            const inherited = getInherited(snapshot, parentRoute, this.paramsInheritanceStrategy);
            snapshot.params = Object.freeze(inherited.params);
            snapshot.data = Object.freeze(inherited.data);
            const {segmentGroup, slicedSegments} = split(
              rawSegment,
              consumedSegments,
              remainingSegments,
              childConfig,
            );
            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
              return this.processChildren(childInjector, childConfig, segmentGroup, snapshot).pipe(
                map((children) => {
                  return new TreeNode(snapshot, children);
                }),
              );
            }
            if (childConfig.length === 0 && slicedSegments.length === 0) {
              return of(new TreeNode(snapshot, []));
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
            return this.processSegment(
              childInjector,
              childConfig,
              segmentGroup,
              slicedSegments,
              matchedOnOutlet ? PRIMARY_OUTLET : outlet,
              true,
              snapshot,
            ).pipe(
              map((child) => {
                return new TreeNode(snapshot, child instanceof TreeNode ? [child] : []);
              }),
            );
          }),
        );
      }),
    );
  }
  getChildConfig(injector, route, segments) {
    if (route.children) {
      // The children belong to the same module
      return of({routes: route.children, injector});
    }
    if (route.loadChildren) {
      // lazy children belong to the loaded module
      if (route._loadedRoutes !== undefined) {
        return of({routes: route._loadedRoutes, injector: route._loadedInjector});
      }
      return runCanLoadGuards(injector, route, segments, this.urlSerializer).pipe(
        mergeMap((shouldLoadResult) => {
          if (shouldLoadResult) {
            return this.configLoader.loadChildren(injector, route).pipe(
              tap((cfg) => {
                route._loadedRoutes = cfg.routes;
                route._loadedInjector = cfg.injector;
              }),
            );
          }
          return canLoadFails(route);
        }),
      );
    }
    return of({routes: [], injector});
  }
}
function sortActivatedRouteSnapshots(nodes) {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}
function hasEmptyPathConfig(node) {
  const config = node.value.routeConfig;
  return config && config.path === '';
}
/**
 * Finds `TreeNode`s with matching empty path route configs and merges them into `TreeNode` with
 * the children from each duplicate. This is necessary because different outlets can match a
 * single empty path route config and the results need to then be merged.
 */
function mergeEmptyPathMatches(nodes) {
  const result = [];
  // The set of nodes which contain children that were merged from two duplicate empty path nodes.
  const mergedNodes = new Set();
  for (const node of nodes) {
    if (!hasEmptyPathConfig(node)) {
      result.push(node);
      continue;
    }
    const duplicateEmptyPathNode = result.find(
      (resultNode) => node.value.routeConfig === resultNode.value.routeConfig,
    );
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
  return result.filter((n) => !mergedNodes.has(n));
}
function checkOutletNameUniqueness(nodes) {
  const names = {};
  nodes.forEach((n) => {
    const routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.url.map((s) => s.toString()).join('/');
      const c = n.value.url.map((s) => s.toString()).join('/');
      throw new RuntimeError(
        4006 /* RuntimeErrorCode.TWO_SEGMENTS_WITH_SAME_OUTLET */,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `Two segments cannot have the same outlet name: '${p}' and '${c}'.`,
      );
    }
    names[n.value.outlet] = n.value;
  });
}
function getData(route) {
  return route.data || {};
}
function getResolve(route) {
  return route.resolve || {};
}
//# sourceMappingURL=recognize_rxjs.js.map
