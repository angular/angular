/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModuleRef} from '@angular/core';
import {EmptyError, from, Observable, Observer, of} from 'rxjs';
import {catchError, concatMap, first, last, map, mergeMap, scan, tap} from 'rxjs/operators';

import {LoadedRouterConfig, Route, Routes} from './config';
import {CanLoadFn} from './interfaces';
import {prioritizedGuardValue} from './operators/prioritized_guard_value';
import {RouterConfigLoader} from './router_config_loader';
import {navigationCancelingError, Params, PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {forEach, wrapIntoObservable} from './utils/collection';
import {getOutlet, sortByMatchingOutlets} from './utils/config';
import {isImmediateMatch, match, noLeftoversInUrl, split} from './utils/config_matching';
import {isCanLoad, isFunction, isUrlTree} from './utils/type_guards';

class NoMatch {
  public segmentGroup: UrlSegmentGroup|null;

  constructor(segmentGroup?: UrlSegmentGroup) {
    this.segmentGroup = segmentGroup || null;
  }
}

class AbsoluteRedirect {
  constructor(public urlTree: UrlTree) {}
}

function noMatch(segmentGroup: UrlSegmentGroup): Observable<UrlSegmentGroup> {
  return new Observable<UrlSegmentGroup>(
      (obs: Observer<UrlSegmentGroup>) => obs.error(new NoMatch(segmentGroup)));
}

function absoluteRedirect(newTree: UrlTree): Observable<any> {
  return new Observable<UrlSegmentGroup>(
      (obs: Observer<UrlSegmentGroup>) => obs.error(new AbsoluteRedirect(newTree)));
}

function namedOutletsRedirect(redirectTo: string): Observable<any> {
  return new Observable<UrlSegmentGroup>(
      (obs: Observer<UrlSegmentGroup>) => obs.error(new Error(
          `Only absolute redirects can have named outlets. redirectTo: '${redirectTo}'`)));
}

function canLoadFails(route: Route): Observable<LoadedRouterConfig> {
  return new Observable<LoadedRouterConfig>(
      (obs: Observer<LoadedRouterConfig>) => obs.error(
          navigationCancelingError(`Cannot load children because the guard of the route "path: '${
              route.path}'" returned false`)));
}

/**
 * Returns the `UrlTree` with the redirection applied.
 *
 * Lazy modules are loaded along the way.
 */
export function applyRedirects(
    moduleInjector: Injector, configLoader: RouterConfigLoader, urlSerializer: UrlSerializer,
    urlTree: UrlTree, config: Routes): Observable<UrlTree> {
  return new ApplyRedirects(moduleInjector, configLoader, urlSerializer, urlTree, config).apply();
}

class ApplyRedirects {
  private allowRedirects: boolean = true;
  private ngModule: NgModuleRef<any>;

  constructor(
      moduleInjector: Injector, private configLoader: RouterConfigLoader,
      private urlSerializer: UrlSerializer, private urlTree: UrlTree, private config: Routes) {
    this.ngModule = moduleInjector.get(NgModuleRef);
  }

  apply(): Observable<UrlTree> {
    const splitGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
    // TODO(atscott): creating a new segment removes the _sourceSegment _segmentIndexShift, which is
    // only necessary to prevent failures in tests which assert exact object matches. The `split` is
    // now shared between `applyRedirects` and `recognize` but only the `recognize` step needs these
    // properties. Before the implementations were merged, the `applyRedirects` would not assign
    // them. We should be able to remove this logic as a "breaking change" but should do some more
    // investigation into the failures first.
    const rootSegmentGroup = new UrlSegmentGroup(splitGroup.segments, splitGroup.children);

    const expanded$ =
        this.expandSegmentGroup(this.ngModule, this.config, rootSegmentGroup, PRIMARY_OUTLET);
    const urlTrees$ = expanded$.pipe(map((rootSegmentGroup: UrlSegmentGroup) => {
      return this.createUrlTree(
          squashSegmentGroup(rootSegmentGroup), this.urlTree.queryParams, this.urlTree.fragment);
    }));
    return urlTrees$.pipe(catchError((e: any) => {
      if (e instanceof AbsoluteRedirect) {
        // After an absolute redirect we do not apply any more redirects!
        // If this implementation changes, update the documentation note in `redirectTo`.
        this.allowRedirects = false;
        // we need to run matching, so we can fetch all lazy-loaded modules
        return this.match(e.urlTree);
      }

      if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      }

      throw e;
    }));
  }

  private match(tree: UrlTree): Observable<UrlTree> {
    const expanded$ =
        this.expandSegmentGroup(this.ngModule, this.config, tree.root, PRIMARY_OUTLET);
    const mapped$ = expanded$.pipe(map((rootSegmentGroup: UrlSegmentGroup) => {
      return this.createUrlTree(
          squashSegmentGroup(rootSegmentGroup), tree.queryParams, tree.fragment);
    }));
    return mapped$.pipe(catchError((e: any): Observable<UrlTree> => {
      if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      }

      throw e;
    }));
  }

  private noMatchError(e: NoMatch): any {
    return new Error(`Cannot match any routes. URL Segment: '${e.segmentGroup}'`);
  }

  private createUrlTree(rootCandidate: UrlSegmentGroup, queryParams: Params, fragment: string|null):
      UrlTree {
    const root = rootCandidate.segments.length > 0 ?
        new UrlSegmentGroup([], {[PRIMARY_OUTLET]: rootCandidate}) :
        rootCandidate;
    return new UrlTree(root, queryParams, fragment);
  }

  private expandSegmentGroup(
      ngModule: NgModuleRef<any>, routes: Route[], segmentGroup: UrlSegmentGroup,
      outlet: string): Observable<UrlSegmentGroup> {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.expandChildren(ngModule, routes, segmentGroup)
          .pipe(map((children: any) => new UrlSegmentGroup([], children)));
    }

    return this.expandSegment(ngModule, segmentGroup, routes, segmentGroup.segments, outlet, true);
  }

  // Recursively expand segment groups for all the child outlets
  private expandChildren(
      ngModule: NgModuleRef<any>, routes: Route[],
      segmentGroup: UrlSegmentGroup): Observable<{[name: string]: UrlSegmentGroup}> {
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
              // Sort the routes so routes with outlets that match the segment appear
              // first, followed by routes for other outlets, which might match if they have an
              // empty path.
              const sortedRoutes = sortByMatchingOutlets(routes, childOutlet);
              return this.expandSegmentGroup(ngModule, sortedRoutes, child, childOutlet)
                  .pipe(map(s => ({segment: s, outlet: childOutlet})));
            }),
            scan(
                (children, expandedChild) => {
                  children[expandedChild.outlet] = expandedChild.segment;
                  return children;
                },
                {} as {[outlet: string]: UrlSegmentGroup}),
            last(),
        );
  }

  private expandSegment(
      ngModule: NgModuleRef<any>, segmentGroup: UrlSegmentGroup, routes: Route[],
      segments: UrlSegment[], outlet: string,
      allowRedirects: boolean): Observable<UrlSegmentGroup> {
    return from(routes).pipe(
        concatMap((r: any) => {
          const expanded$ = this.expandSegmentAgainstRoute(
              ngModule, segmentGroup, routes, r, segments, outlet, allowRedirects);
          return expanded$.pipe(catchError((e: any) => {
            if (e instanceof NoMatch) {
              return of(null);
            }
            throw e;
          }));
        }),
        first((s): s is UrlSegmentGroup => !!s), catchError((e: any, _: any) => {
          if (e instanceof EmptyError || e.name === 'EmptyError') {
            if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
              return of(new UrlSegmentGroup([], {}));
            }
            throw new NoMatch(segmentGroup);
          }
          throw e;
        }));
  }

  private expandSegmentAgainstRoute(
      ngModule: NgModuleRef<any>, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      paths: UrlSegment[], outlet: string, allowRedirects: boolean): Observable<UrlSegmentGroup> {
    if (!isImmediateMatch(route, segmentGroup, paths, outlet)) {
      return noMatch(segmentGroup);
    }

    if (route.redirectTo === undefined) {
      return this.matchSegmentAgainstRoute(ngModule, segmentGroup, route, paths, outlet);
    }

    if (allowRedirects && this.allowRedirects) {
      return this.expandSegmentAgainstRouteUsingRedirect(
          ngModule, segmentGroup, routes, route, paths, outlet);
    }

    return noMatch(segmentGroup);
  }

  private expandSegmentAgainstRouteUsingRedirect(
      ngModule: NgModuleRef<any>, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      return this.expandWildCardWithParamsAgainstRouteUsingRedirect(
          ngModule, routes, route, outlet);
    }

    return this.expandRegularSegmentAgainstRouteUsingRedirect(
        ngModule, segmentGroup, routes, route, segments, outlet);
  }

  private expandWildCardWithParamsAgainstRouteUsingRedirect(
      ngModule: NgModuleRef<any>, routes: Route[], route: Route,
      outlet: string): Observable<UrlSegmentGroup> {
    const newTree = this.applyRedirectCommands([], route.redirectTo!, {});
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments: UrlSegment[]) => {
      const group = new UrlSegmentGroup(newSegments, {});
      return this.expandSegment(ngModule, group, routes, newSegments, outlet, false);
    }));
  }

  private expandRegularSegmentAgainstRouteUsingRedirect(
      ngModule: NgModuleRef<any>, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    const {matched, consumedSegments, lastChild, positionalParamSegments} =
        match(segmentGroup, route, segments);
    if (!matched) return noMatch(segmentGroup);

    const newTree =
        this.applyRedirectCommands(consumedSegments, route.redirectTo!, positionalParamSegments);
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments: UrlSegment[]) => {
      return this.expandSegment(
          ngModule, segmentGroup, routes, newSegments.concat(segments.slice(lastChild)), outlet,
          false);
    }));
  }

  private matchSegmentAgainstRoute(
      ngModule: NgModuleRef<any>, rawSegmentGroup: UrlSegmentGroup, route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      if (route.loadChildren) {
        const loaded$ = route._loadedConfig ? of(route._loadedConfig) :
                                              this.configLoader.load(ngModule.injector, route);
        return loaded$.pipe(map((cfg: LoadedRouterConfig) => {
          route._loadedConfig = cfg;
          return new UrlSegmentGroup(segments, {});
        }));
      }

      return of(new UrlSegmentGroup(segments, {}));
    }

    const {matched, consumedSegments, lastChild} = match(rawSegmentGroup, route, segments);
    if (!matched) return noMatch(rawSegmentGroup);

    const rawSlicedSegments = segments.slice(lastChild);
    const childConfig$ = this.getChildConfig(ngModule, route, segments);

    return childConfig$.pipe(mergeMap((routerConfig: LoadedRouterConfig) => {
      const childModule = routerConfig.module;
      const childConfig = routerConfig.routes;

      const {segmentGroup: splitSegmentGroup, slicedSegments} =
          split(rawSegmentGroup, consumedSegments, rawSlicedSegments, childConfig);
      // See comment on the other call to `split` about why this is necessary.
      const segmentGroup =
          new UrlSegmentGroup(splitSegmentGroup.segments, splitSegmentGroup.children);

      if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
        const expanded$ = this.expandChildren(childModule, childConfig, segmentGroup);
        return expanded$.pipe(
            map((children: any) => new UrlSegmentGroup(consumedSegments, children)));
      }

      if (childConfig.length === 0 && slicedSegments.length === 0) {
        return of(new UrlSegmentGroup(consumedSegments, {}));
      }

      const matchedOnOutlet = getOutlet(route) === outlet;
      const expanded$ = this.expandSegment(
          childModule, segmentGroup, childConfig, slicedSegments,
          matchedOnOutlet ? PRIMARY_OUTLET : outlet, true);
      return expanded$.pipe(
          map((cs: UrlSegmentGroup) =>
                  new UrlSegmentGroup(consumedSegments.concat(cs.segments), cs.children)));
    }));
  }

  private getChildConfig(ngModule: NgModuleRef<any>, route: Route, segments: UrlSegment[]):
      Observable<LoadedRouterConfig> {
    if (route.children) {
      // The children belong to the same module
      return of(new LoadedRouterConfig(route.children, ngModule));
    }

    if (route.loadChildren) {
      // lazy children belong to the loaded module
      if (route._loadedConfig !== undefined) {
        return of(route._loadedConfig);
      }

      return this.runCanLoadGuards(ngModule.injector, route, segments)
          .pipe(mergeMap((shouldLoadResult: boolean) => {
            if (shouldLoadResult) {
              return this.configLoader.load(ngModule.injector, route)
                  .pipe(map((cfg: LoadedRouterConfig) => {
                    route._loadedConfig = cfg;
                    return cfg;
                  }));
            }
            return canLoadFails(route);
          }));
    }

    return of(new LoadedRouterConfig([], ngModule));
  }

  private runCanLoadGuards(moduleInjector: Injector, route: Route, segments: UrlSegment[]):
      Observable<boolean> {
    const canLoad = route.canLoad;
    if (!canLoad || canLoad.length === 0) return of(true);

    const canLoadObservables = canLoad.map((injectionToken: any) => {
      const guard = moduleInjector.get(injectionToken);
      let guardVal;
      if (isCanLoad(guard)) {
        guardVal = guard.canLoad(route, segments);
      } else if (isFunction<CanLoadFn>(guard)) {
        guardVal = guard(route, segments);
      } else {
        throw new Error('Invalid CanLoad guard');
      }
      return wrapIntoObservable(guardVal);
    });

    return of(canLoadObservables)
        .pipe(
            prioritizedGuardValue(),
            tap((result: UrlTree|boolean) => {
              if (!isUrlTree(result)) return;

              const error: Error&{url?: UrlTree} = navigationCancelingError(
                  `Redirecting to "${this.urlSerializer.serialize(result)}"`);
              error.url = result;
              throw error;
            }),
            map(result => result === true),
        );
  }

  private lineralizeSegments(route: Route, urlTree: UrlTree): Observable<UrlSegment[]> {
    let res: UrlSegment[] = [];
    let c = urlTree.root;
    while (true) {
      res = res.concat(c.segments);
      if (c.numberOfChildren === 0) {
        return of(res);
      }

      if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
        return namedOutletsRedirect(route.redirectTo!);
      }

      c = c.children[PRIMARY_OUTLET];
    }
  }

  private applyRedirectCommands(
      segments: UrlSegment[], redirectTo: string, posParams: {[k: string]: UrlSegment}): UrlTree {
    return this.applyRedirectCreatreUrlTree(
        redirectTo, this.urlSerializer.parse(redirectTo), segments, posParams);
  }

  private applyRedirectCreatreUrlTree(
      redirectTo: string, urlTree: UrlTree, segments: UrlSegment[],
      posParams: {[k: string]: UrlSegment}): UrlTree {
    const newRoot = this.createSegmentGroup(redirectTo, urlTree.root, segments, posParams);
    return new UrlTree(
        newRoot, this.createQueryParams(urlTree.queryParams, this.urlTree.queryParams),
        urlTree.fragment);
  }

  private createQueryParams(redirectToParams: Params, actualParams: Params): Params {
    const res: Params = {};
    forEach(redirectToParams, (v: any, k: string) => {
      const copySourceValue = typeof v === 'string' && v.startsWith(':');
      if (copySourceValue) {
        const sourceName = v.substring(1);
        res[k] = actualParams[sourceName];
      } else {
        res[k] = v;
      }
    });
    return res;
  }

  private createSegmentGroup(
      redirectTo: string, group: UrlSegmentGroup, segments: UrlSegment[],
      posParams: {[k: string]: UrlSegment}): UrlSegmentGroup {
    const updatedSegments = this.createSegments(redirectTo, group.segments, segments, posParams);

    let children: {[n: string]: UrlSegmentGroup} = {};
    forEach(group.children, (child: UrlSegmentGroup, name: string) => {
      children[name] = this.createSegmentGroup(redirectTo, child, segments, posParams);
    });

    return new UrlSegmentGroup(updatedSegments, children);
  }

  private createSegments(
      redirectTo: string, redirectToSegments: UrlSegment[], actualSegments: UrlSegment[],
      posParams: {[k: string]: UrlSegment}): UrlSegment[] {
    return redirectToSegments.map(
        s => s.path.startsWith(':') ? this.findPosParam(redirectTo, s, posParams) :
                                      this.findOrReturn(s, actualSegments));
  }

  private findPosParam(
      redirectTo: string, redirectToUrlSegment: UrlSegment,
      posParams: {[k: string]: UrlSegment}): UrlSegment {
    const pos = posParams[redirectToUrlSegment.path.substring(1)];
    if (!pos)
      throw new Error(
          `Cannot redirect to '${redirectTo}'. Cannot find '${redirectToUrlSegment.path}'.`);
    return pos;
  }

  private findOrReturn(redirectToUrlSegment: UrlSegment, actualSegments: UrlSegment[]): UrlSegment {
    let idx = 0;
    for (const s of actualSegments) {
      if (s.path === redirectToUrlSegment.path) {
        actualSegments.splice(idx);
        return s;
      }
      idx++;
    }
    return redirectToUrlSegment;
  }
}

/**
 * When possible, merges the primary outlet child into the parent `UrlSegmentGroup`.
 *
 * When a segment group has only one child which is a primary outlet, merges that child into the
 * parent. That is, the child segment group's segments are merged into the `s` and the child's
 * children become the children of `s`. Think of this like a 'squash', merging the child segment
 * group into the parent.
 */
function mergeTrivialChildren(s: UrlSegmentGroup): UrlSegmentGroup {
  if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
    const c = s.children[PRIMARY_OUTLET];
    return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
  }

  return s;
}

/**
 * Recursively merges primary segment children into their parents and also drops empty children
 * (those which have no segments and no children themselves). The latter prevents serializing a
 * group into something like `/a(aux:)`, where `aux` is an empty child segment.
 */
function squashSegmentGroup(segmentGroup: UrlSegmentGroup): UrlSegmentGroup {
  const newChildren = {} as any;
  for (const childOutlet of Object.keys(segmentGroup.children)) {
    const child = segmentGroup.children[childOutlet];
    const childCandidate = squashSegmentGroup(child);
    // don't add empty children
    if (childCandidate.segments.length > 0 || childCandidate.hasChildren()) {
      newChildren[childOutlet] = childCandidate;
    }
  }
  const s = new UrlSegmentGroup(segmentGroup.segments, newChildren);
  return mergeTrivialChildren(s);
}
