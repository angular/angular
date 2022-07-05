/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, ɵRuntimeError as RuntimeError} from '@angular/core';
import {EmptyError, from, Observable, of, throwError} from 'rxjs';
import {catchError, concatMap, first, last, map, mergeMap, scan, switchMap, tap} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {LoadedRouterConfig, Route, Routes} from './models';
import {runCanLoadGuards} from './operators/check_guards';
import {RouterConfigLoader} from './router_config_loader';
import {navigationCancelingError, Params, PRIMARY_OUTLET} from './shared';
import {createRoot, squashSegmentGroup, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {forEach} from './utils/collection';
import {getOrCreateRouteInjectorIfNeeded, getOutlet, sortByMatchingOutlets} from './utils/config';
import {isImmediateMatch, match, matchWithChecks, noLeftoversInUrl, split} from './utils/config_matching';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

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
  return throwError(new NoMatch(segmentGroup));
}

function absoluteRedirect(newTree: UrlTree): Observable<any> {
  return throwError(new AbsoluteRedirect(newTree));
}

function namedOutletsRedirect(redirectTo: string): Observable<any> {
  return throwError(new RuntimeError(
      RuntimeErrorCode.NAMED_OUTLET_REDIRECT,
      NG_DEV_MODE &&
          `Only absolute redirects can have named outlets. redirectTo: '${redirectTo}'`));
}

function canLoadFails(route: Route): Observable<LoadedRouterConfig> {
  return throwError(navigationCancelingError(
      NG_DEV_MODE &&
      `Cannot load children because the guard of the route "path: '${
          route.path}'" returned false`));
}

/**
 * Returns the `UrlTree` with the redirection applied.
 *
 * Lazy modules are loaded along the way.
 */
export function applyRedirects(
    injector: EnvironmentInjector, configLoader: RouterConfigLoader, urlSerializer: UrlSerializer,
    urlTree: UrlTree, config: Routes): Observable<UrlTree> {
  return new ApplyRedirects(injector, configLoader, urlSerializer, urlTree, config).apply();
}

class ApplyRedirects {
  private allowRedirects: boolean = true;

  constructor(
      private injector: EnvironmentInjector, private configLoader: RouterConfigLoader,
      private urlSerializer: UrlSerializer, private urlTree: UrlTree, private config: Routes) {}

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
        this.expandSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET);
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
        this.expandSegmentGroup(this.injector, this.config, tree.root, PRIMARY_OUTLET);
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
    return new RuntimeError(
        RuntimeErrorCode.NO_MATCH,
        NG_DEV_MODE && `Cannot match any routes. URL Segment: '${e.segmentGroup}'`);
  }

  private createUrlTree(rootCandidate: UrlSegmentGroup, queryParams: Params, fragment: string|null):
      UrlTree {
    const root = createRoot(rootCandidate);
    return new UrlTree(root, queryParams, fragment);
  }

  private expandSegmentGroup(
      injector: EnvironmentInjector, routes: Route[], segmentGroup: UrlSegmentGroup,
      outlet: string): Observable<UrlSegmentGroup> {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.expandChildren(injector, routes, segmentGroup)
          .pipe(map((children: any) => new UrlSegmentGroup([], children)));
    }

    return this.expandSegment(injector, segmentGroup, routes, segmentGroup.segments, outlet, true);
  }

  // Recursively expand segment groups for all the child outlets
  private expandChildren(
      injector: EnvironmentInjector, routes: Route[],
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
              return this.expandSegmentGroup(injector, sortedRoutes, child, childOutlet)
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
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[],
      segments: UrlSegment[], outlet: string,
      allowRedirects: boolean): Observable<UrlSegmentGroup> {
    return from(routes).pipe(
        concatMap(r => {
          const expanded$ = this.expandSegmentAgainstRoute(
              injector, segmentGroup, routes, r, segments, outlet, allowRedirects);
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
            return noMatch(segmentGroup);
          }
          throw e;
        }));
  }

  private expandSegmentAgainstRoute(
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      paths: UrlSegment[], outlet: string, allowRedirects: boolean): Observable<UrlSegmentGroup> {
    if (!isImmediateMatch(route, segmentGroup, paths, outlet)) {
      return noMatch(segmentGroup);
    }

    if (route.redirectTo === undefined) {
      return this.matchSegmentAgainstRoute(injector, segmentGroup, route, paths, outlet);
    }

    if (allowRedirects && this.allowRedirects) {
      return this.expandSegmentAgainstRouteUsingRedirect(
          injector, segmentGroup, routes, route, paths, outlet);
    }

    return noMatch(segmentGroup);
  }

  private expandSegmentAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      return this.expandWildCardWithParamsAgainstRouteUsingRedirect(
          injector, routes, route, outlet);
    }

    return this.expandRegularSegmentAgainstRouteUsingRedirect(
        injector, segmentGroup, routes, route, segments, outlet);
  }

  private expandWildCardWithParamsAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, routes: Route[], route: Route,
      outlet: string): Observable<UrlSegmentGroup> {
    const newTree = this.applyRedirectCommands([], route.redirectTo!, {});
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments: UrlSegment[]) => {
      const group = new UrlSegmentGroup(newSegments, {});
      return this.expandSegment(injector, group, routes, newSegments, outlet, false);
    }));
  }

  private expandRegularSegmentAgainstRouteUsingRedirect(
      injector: EnvironmentInjector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    const {matched, consumedSegments, remainingSegments, positionalParamSegments} =
        match(segmentGroup, route, segments);
    if (!matched) return noMatch(segmentGroup);

    const newTree =
        this.applyRedirectCommands(consumedSegments, route.redirectTo!, positionalParamSegments);
    if (route.redirectTo!.startsWith('/')) {
      return absoluteRedirect(newTree);
    }

    return this.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments: UrlSegment[]) => {
      return this.expandSegment(
          injector, segmentGroup, routes, newSegments.concat(remainingSegments), outlet, false);
    }));
  }

  private matchSegmentAgainstRoute(
      injector: EnvironmentInjector, rawSegmentGroup: UrlSegmentGroup, route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      // Only create the Route's `EnvironmentInjector` if it matches the attempted navigation
      injector = getOrCreateRouteInjectorIfNeeded(route, injector);
      if (route.loadChildren) {
        const loaded$ = route._loadedRoutes ?
            of({routes: route._loadedRoutes, injector: route._loadedInjector}) :
            this.configLoader.loadChildren(injector, route);
        return loaded$.pipe(map((cfg: LoadedRouterConfig) => {
          route._loadedRoutes = cfg.routes;
          route._loadedInjector = cfg.injector;
          return new UrlSegmentGroup(segments, {});
        }));
      }

      return of(new UrlSegmentGroup(segments, {}));
    }

    return matchWithChecks(rawSegmentGroup, route, segments, injector, this.urlSerializer)
        .pipe(
            switchMap(({matched, consumedSegments, remainingSegments}) => {
              if (!matched) return noMatch(rawSegmentGroup);

              // If the route has an injector created from providers, we should start using that.
              injector = route._injector ?? injector;
              const childConfig$ = this.getChildConfig(injector, route, segments);

              return childConfig$.pipe(mergeMap((routerConfig: LoadedRouterConfig) => {
                const childInjector = routerConfig.injector ?? injector;
                const childConfig = routerConfig.routes;

                const {segmentGroup: splitSegmentGroup, slicedSegments} =
                    split(rawSegmentGroup, consumedSegments, remainingSegments, childConfig);
                // See comment on the other call to `split` about why this is necessary.
                const segmentGroup =
                    new UrlSegmentGroup(splitSegmentGroup.segments, splitSegmentGroup.children);

                if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                  const expanded$ = this.expandChildren(childInjector, childConfig, segmentGroup);
                  return expanded$.pipe(
                      map((children: any) => new UrlSegmentGroup(consumedSegments, children)));
                }

                if (childConfig.length === 0 && slicedSegments.length === 0) {
                  return of(new UrlSegmentGroup(consumedSegments, {}));
                }

                const matchedOnOutlet = getOutlet(route) === outlet;
                const expanded$ = this.expandSegment(
                    childInjector, segmentGroup, childConfig, slicedSegments,
                    matchedOnOutlet ? PRIMARY_OUTLET : outlet, true);
                return expanded$.pipe(
                    map((cs: UrlSegmentGroup) => new UrlSegmentGroup(
                            consumedSegments.concat(cs.segments), cs.children)));
              }));
            }),
        );
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
    return this.applyRedirectCreateUrlTree(
        redirectTo, this.urlSerializer.parse(redirectTo), segments, posParams);
  }

  private applyRedirectCreateUrlTree(
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
      throw new RuntimeError(
          RuntimeErrorCode.MISSING_REDIRECT,
          NG_DEV_MODE &&
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
