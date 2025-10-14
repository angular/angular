/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError} from '@angular/core';
import {AbsoluteRedirect, ApplyRedirects, canLoadFails, NoMatch} from './apply_redirects';
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
import {firstValueFrom} from './utils/first_value_from';
import {isEmptyError} from './utils/type_guards';
/**
 * Class used to indicate there were no additional route config matches but that all segments of
 * the URL were consumed during matching so the route was URL matched. When this happens, we still
 * try to match child configs in case there are empty path children.
 */
class NoLeftoversInUrl {}
export async function recognize(
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
    abortSignal,
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
    abortSignal,
  ) {
    this.injector = injector;
    this.configLoader = configLoader;
    this.rootComponentType = rootComponentType;
    this.config = config;
    this.urlTree = urlTree;
    this.paramsInheritanceStrategy = paramsInheritanceStrategy;
    this.urlSerializer = urlSerializer;
    this.abortSignal = abortSignal;
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
  async recognize() {
    const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
    const {children, rootSnapshot} = await this.match(rootSegmentGroup);
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
  }
  async match(rootSegmentGroup) {
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
    try {
      const children = await this.processSegmentGroup(
        this.injector,
        this.config,
        rootSegmentGroup,
        PRIMARY_OUTLET,
        rootSnapshot,
      );
      return {children, rootSnapshot};
    } catch (e) {
      if (e instanceof AbsoluteRedirect) {
        this.urlTree = e.urlTree;
        return this.match(e.urlTree.root);
      }
      if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      }
      throw e;
    }
  }
  async processSegmentGroup(injector, config, segmentGroup, outlet, parentRoute) {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(injector, config, segmentGroup, parentRoute);
    }
    const child = await this.processSegment(
      injector,
      config,
      segmentGroup,
      segmentGroup.segments,
      outlet,
      true,
      parentRoute,
    );
    return child instanceof TreeNode ? [child] : [];
  }
  /**
   * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
   * we cannot find a match for _any_ of the children.
   *
   * @param config - The `Routes` to match against
   * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
   *     config.
   */
  async processChildren(injector, config, segmentGroup, parentRoute) {
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
    let children = [];
    for (const childOutlet of childOutlets) {
      const child = segmentGroup.children[childOutlet];
      // Sort the config so that routes with outlets that match the one being activated
      // appear first, followed by routes for other outlets, which might match if they have
      // an empty path.
      const sortedConfig = sortByMatchingOutlets(config, childOutlet);
      const outletChildren = await this.processSegmentGroup(
        injector,
        sortedConfig,
        child,
        childOutlet,
        parentRoute,
      );
      children.push(...outletChildren);
    }
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
    return mergedChildren;
  }
  async processSegment(
    injector,
    routes,
    segmentGroup,
    segments,
    outlet,
    allowRedirects,
    parentRoute,
  ) {
    for (const r of routes) {
      try {
        return await this.processSegmentAgainstRoute(
          r._injector ?? injector,
          routes,
          r,
          segmentGroup,
          segments,
          outlet,
          allowRedirects,
          parentRoute,
        );
      } catch (e) {
        if (e instanceof NoMatch || isEmptyError(e)) {
          continue;
        }
        throw e;
      }
    }
    if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
      return new NoLeftoversInUrl();
    }
    throw new NoMatch(segmentGroup);
  }
  async processSegmentAgainstRoute(
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
      throw new NoMatch(rawSegment);
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
    throw new NoMatch(rawSegment);
  }
  async expandSegmentAgainstRouteUsingRedirect(
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
    if (!matched) throw new NoMatch(segmentGroup);
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
    if (this.abortSignal.aborted) {
      throw new Error(this.abortSignal.reason);
    }
    const newTree = await this.applyRedirects.applyRedirectCommands(
      consumedSegments,
      route.redirectTo,
      positionalParamSegments,
      currentSnapshot,
      injector,
    );
    const newSegments = await this.applyRedirects.lineralizeSegments(route, newTree);
    return this.processSegment(
      injector,
      routes,
      segmentGroup,
      newSegments.concat(remainingSegments),
      outlet,
      false,
      parentRoute,
    );
  }
  async matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute) {
    if (this.abortSignal.aborted) {
      throw new Error(this.abortSignal.reason);
    }
    const result = await firstValueFrom(
      matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer, this.abortSignal),
    );
    if (route.path === '**') {
      // Prior versions of the route matching algorithm would stop matching at the wildcard route.
      // We should investigate a better strategy for any existing children. Otherwise, these
      // child segments are silently dropped from the navigation.
      // https://github.com/angular/angular/issues/40089
      rawSegment.children = {};
    }
    if (!result?.matched) {
      throw new NoMatch(rawSegment);
    }
    // If the route has an injector created from providers, we should start using that.
    injector = route._injector ?? injector;
    const {routes: childConfig} = await this.getChildConfig(injector, route, segments);
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
      const children = await this.processChildren(
        childInjector,
        childConfig,
        segmentGroup,
        snapshot,
      );
      return new TreeNode(snapshot, children);
    }
    if (childConfig.length === 0 && slicedSegments.length === 0) {
      return new TreeNode(snapshot, []);
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
    const child = await this.processSegment(
      childInjector,
      childConfig,
      segmentGroup,
      slicedSegments,
      matchedOnOutlet ? PRIMARY_OUTLET : outlet,
      true,
      snapshot,
    );
    return new TreeNode(snapshot, child instanceof TreeNode ? [child] : []);
  }
  async getChildConfig(injector, route, segments) {
    if (route.children) {
      // The children belong to the same module
      return {routes: route.children, injector};
    }
    if (route.loadChildren) {
      // lazy children belong to the loaded module
      if (route._loadedRoutes !== undefined) {
        return {routes: route._loadedRoutes, injector: route._loadedInjector};
      }
      if (this.abortSignal.aborted) {
        throw new Error(this.abortSignal.reason);
      }
      const shouldLoadResult = await firstValueFrom(
        runCanLoadGuards(injector, route, segments, this.urlSerializer, this.abortSignal),
      );
      if (shouldLoadResult) {
        const cfg = await firstValueFrom(this.configLoader.loadChildren(injector, route));
        if (!cfg) {
          throw canLoadFails(route);
        }
        route._loadedRoutes = cfg.routes;
        route._loadedInjector = cfg.injector;
        return cfg;
      }
      throw canLoadFails(route);
    }
    return {routes: [], injector};
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
//# sourceMappingURL=recognize.js.map
