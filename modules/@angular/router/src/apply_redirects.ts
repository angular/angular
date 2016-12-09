/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {from} from 'rxjs/observable/from';
import {of } from 'rxjs/observable/of';
import {_catch} from 'rxjs/operator/catch';
import {concatAll} from 'rxjs/operator/concatAll';
import {first} from 'rxjs/operator/first';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {EmptyError} from 'rxjs/util/EmptyError';

import {Route, Routes} from './config';
import {LoadedRouterConfig, RouterConfigLoader} from './router_config_loader';
import {NavigationCancelingError, PRIMARY_OUTLET, Params, defaultUrlMatcher} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {andObservables, forEach, merge, waitForMap, wrapIntoObservable} from './utils/collection';

class NoMatch {
  constructor(public segmentGroup: UrlSegmentGroup = null) {}
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
      (obs: Observer<LoadedRouterConfig>) => obs.error(new NavigationCancelingError(
          `Cannot load children because the guard of the route "path: '${route.path}'" returned false`)));
}

export function applyRedirects(
    injector: Injector, configLoader: RouterConfigLoader, urlSerializer: UrlSerializer,
    urlTree: UrlTree, config: Routes): Observable<UrlTree> {
  return new ApplyRedirects(injector, configLoader, urlSerializer, urlTree, config).apply();
}

class ApplyRedirects {
  private allowRedirects: boolean = true;

  constructor(
      private injector: Injector, private configLoader: RouterConfigLoader,
      private urlSerializer: UrlSerializer, private urlTree: UrlTree, private config: Routes) {}

  apply(): Observable<UrlTree> {
    const expanded$ =
        this.expandSegmentGroup(this.injector, this.config, this.urlTree.root, PRIMARY_OUTLET);
    const urlTrees$ = map.call(
        expanded$, (rootSegmentGroup: UrlSegmentGroup) => this.createUrlTree(
                       rootSegmentGroup, this.urlTree.queryParams, this.urlTree.fragment));
    return _catch.call(urlTrees$, (e: any) => {
      if (e instanceof AbsoluteRedirect) {
        // after an absolute redirect we do not apply any more redirects!
        this.allowRedirects = false;
        // we need to run matching, so we can fetch all lazy-loaded modules
        return this.match(e.urlTree);
      } else if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      } else {
        throw e;
      }
    });
  }

  private match(tree: UrlTree): Observable<UrlTree> {
    const expanded$ =
        this.expandSegmentGroup(this.injector, this.config, tree.root, PRIMARY_OUTLET);
    const mapped$ = map.call(
        expanded$, (rootSegmentGroup: UrlSegmentGroup) =>
                       this.createUrlTree(rootSegmentGroup, tree.queryParams, tree.fragment));
    return _catch.call(mapped$, (e: any): Observable<UrlTree> => {
      if (e instanceof NoMatch) {
        throw this.noMatchError(e);
      } else {
        throw e;
      }
    });
  }

  private noMatchError(e: NoMatch): any {
    return new Error(`Cannot match any routes. URL Segment: '${e.segmentGroup}'`);
  }

  private createUrlTree(rootCandidate: UrlSegmentGroup, queryParams: Params, fragment: string):
      UrlTree {
    const root = rootCandidate.segments.length > 0 ?
        new UrlSegmentGroup([], {[PRIMARY_OUTLET]: rootCandidate}) :
        rootCandidate;
    return new UrlTree(root, queryParams, fragment);
  }

  private expandSegmentGroup(
      injector: Injector, routes: Route[], segmentGroup: UrlSegmentGroup,
      outlet: string): Observable<UrlSegmentGroup> {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return map.call(
          this.expandChildren(injector, routes, segmentGroup),
          (children: any) => new UrlSegmentGroup([], children));
    } else {
      return this.expandSegment(
          injector, segmentGroup, routes, segmentGroup.segments, outlet, true);
    }
  }

  private expandChildren(injector: Injector, routes: Route[], segmentGroup: UrlSegmentGroup):
      Observable<{[name: string]: UrlSegmentGroup}> {
    return waitForMap(
        segmentGroup.children,
        (childOutlet, child) => this.expandSegmentGroup(injector, routes, child, childOutlet));
  }

  private expandSegment(
      injector: Injector, segmentGroup: UrlSegmentGroup, routes: Route[], segments: UrlSegment[],
      outlet: string, allowRedirects: boolean): Observable<UrlSegmentGroup> {
    const routes$ = of (...routes);
    const processedRoutes$ = map.call(routes$, (r: any) => {
      const expanded$ = this.expandSegmentAgainstRoute(
          injector, segmentGroup, routes, r, segments, outlet, allowRedirects);
      return _catch.call(expanded$, (e: any) => {
        if (e instanceof NoMatch)
          return of (null);
        else
          throw e;
      });
    });
    const concattedProcessedRoutes$ = concatAll.call(processedRoutes$);
    const first$ = first.call(concattedProcessedRoutes$, (s: any) => !!s);
    return _catch.call(first$, (e: any, _: any): Observable<UrlSegmentGroup> => {
      if (e instanceof EmptyError) {
        if (this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
          return of (new UrlSegmentGroup([], {}));
        } else {
          throw new NoMatch(segmentGroup);
        }
      } else {
        throw e;
      }
    });
  }

  private noLeftoversInUrl(segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string):
      boolean {
    return segments.length === 0 && !segmentGroup.children[outlet];
  }

  private expandSegmentAgainstRoute(
      injector: Injector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      paths: UrlSegment[], outlet: string, allowRedirects: boolean): Observable<UrlSegmentGroup> {
    if (getOutlet(route) !== outlet) return noMatch(segmentGroup);
    if (route.redirectTo !== undefined && !(allowRedirects && this.allowRedirects))
      return noMatch(segmentGroup);
    if (route.redirectTo === undefined) {
      return this.matchSegmentAgainstRoute(injector, segmentGroup, route, paths);
    } else {
      return this.expandSegmentAgainstRouteUsingRedirect(
          injector, segmentGroup, routes, route, paths, outlet);
    }
  }

  private expandSegmentAgainstRouteUsingRedirect(
      injector: Injector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      return this.expandWildCardWithParamsAgainstRouteUsingRedirect(
          injector, routes, route, outlet);
    } else {
      return this.expandRegularSegmentAgainstRouteUsingRedirect(
          injector, segmentGroup, routes, route, segments, outlet);
    }
  }

  private expandWildCardWithParamsAgainstRouteUsingRedirect(
      injector: Injector, routes: Route[], route: Route,
      outlet: string): Observable<UrlSegmentGroup> {
    const newTree = this.applyRedirectCommands([], route.redirectTo, {});
    if (route.redirectTo.startsWith('/')) {
      return absoluteRedirect(newTree);
    } else {
      return mergeMap.call(this.lineralizeSegments(route, newTree), (newSegments: UrlSegment[]) => {
        const group = new UrlSegmentGroup(newSegments, {});
        return this.expandSegment(injector, group, routes, newSegments, outlet, false);
      });
    }
  }

  private expandRegularSegmentAgainstRouteUsingRedirect(
      injector: Injector, segmentGroup: UrlSegmentGroup, routes: Route[], route: Route,
      segments: UrlSegment[], outlet: string): Observable<UrlSegmentGroup> {
    const {matched, consumedSegments, lastChild, positionalParamSegments} =
        match(segmentGroup, route, segments);
    if (!matched) return noMatch(segmentGroup);

    const newTree = this.applyRedirectCommands(
        consumedSegments, route.redirectTo, <any>positionalParamSegments);
    if (route.redirectTo.startsWith('/')) {
      return absoluteRedirect(newTree);
    } else {
      return mergeMap.call(this.lineralizeSegments(route, newTree), (newSegments: UrlSegment[]) => {
        return this.expandSegment(
            injector, segmentGroup, routes, newSegments.concat(segments.slice(lastChild)), outlet,
            false);
      });
    }
  }

  private matchSegmentAgainstRoute(
      injector: Injector, rawSegmentGroup: UrlSegmentGroup, route: Route,
      segments: UrlSegment[]): Observable<UrlSegmentGroup> {
    if (route.path === '**') {
      if (route.loadChildren) {
        return map.call(this.configLoader.load(injector, route.loadChildren), (r: any) => {
          (<any>route)._loadedConfig = r;
          return of (new UrlSegmentGroup(segments, {}));
        });
      } else {
        return of (new UrlSegmentGroup(segments, {}));
      }

    } else {
      const {matched, consumedSegments, lastChild} = match(rawSegmentGroup, route, segments);
      if (!matched) return noMatch(rawSegmentGroup);

      const rawSlicedSegments = segments.slice(lastChild);
      const childConfig$ = this.getChildConfig(injector, route);
      return mergeMap.call(childConfig$, (routerConfig: any) => {
        const childInjector = routerConfig.injector;
        const childConfig = routerConfig.routes;
        const {segmentGroup, slicedSegments} =
            split(rawSegmentGroup, consumedSegments, rawSlicedSegments, childConfig);

        if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
          const expanded$ = this.expandChildren(childInjector, childConfig, segmentGroup);
          return map.call(
              expanded$, (children: any) => new UrlSegmentGroup(consumedSegments, children));

        } else if (childConfig.length === 0 && slicedSegments.length === 0) {
          return of (new UrlSegmentGroup(consumedSegments, {}));

        } else {
          const expanded$ = this.expandSegment(
              childInjector, segmentGroup, childConfig, slicedSegments, PRIMARY_OUTLET, true);
          return map.call(
              expanded$,
              (cs: any) => new UrlSegmentGroup(consumedSegments.concat(cs.segments), cs.children));
        }
      });
    }
  }

  private getChildConfig(injector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (route.children) {
      return of (new LoadedRouterConfig(route.children, injector, null, null));
    } else if (route.loadChildren) {
      return mergeMap.call(runGuards(injector, route), (shouldLoad: any) => {
        if (shouldLoad) {
          if ((<any>route)._loadedConfig) {
            return of ((<any>route)._loadedConfig);
          } else {
            return map.call(this.configLoader.load(injector, route.loadChildren), (r: any) => {
              (<any>route)._loadedConfig = r;
              return r;
            });
          }
        } else {
          return canLoadFails(route);
        }
      });
    } else {
      return of (new LoadedRouterConfig([], injector, null, null));
    }
  }

  private lineralizeSegments(route: Route, urlTree: UrlTree): Observable<UrlSegment[]> {
    let res: UrlSegment[] = [];
    let c = urlTree.root;
    while (true) {
      res = res.concat(c.segments);
      if (c.numberOfChildren === 0) {
        return of (res);
      } else if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
        return namedOutletsRedirect(route.redirectTo);
      } else {
        c = c.children[PRIMARY_OUTLET];
      }
    }
  }

  private applyRedirectCommands(
      segments: UrlSegment[], redirectTo: string, posParams: {[k: string]: UrlSegment}): UrlTree {
    const t = this.urlSerializer.parse(redirectTo);
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
      if (v.startsWith(':')) {
        res[k] = actualParams[v.substring(1)];
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

function runGuards(injector: Injector, route: Route): Observable<boolean> {
  const canLoad = route.canLoad;
  if (!canLoad || canLoad.length === 0) return of (true);
  const obs = map.call(from(canLoad), (c: any) => {
    const guard = injector.get(c);
    if (guard.canLoad) {
      return wrapIntoObservable(guard.canLoad(route));
    } else {
      return wrapIntoObservable(guard(route));
    }
  });
  return andObservables(obs);
}

function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): {
  matched: boolean,
  consumedSegments: UrlSegment[],
  lastChild: number,
  positionalParamSegments: {[k: string]: UrlSegment}
} {
  const noMatch =
      {matched: false, consumedSegments: <any[]>[], lastChild: 0, positionalParamSegments: {}};
  if (route.path === '') {
    if ((route.pathMatch === 'full') && (segmentGroup.hasChildren() || segments.length > 0)) {
      return {matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {}};
    } else {
      return {matched: true, consumedSegments: [], lastChild: 0, positionalParamSegments: {}};
    }
  }

  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) return noMatch;

  return {
    matched: true,
    consumedSegments: res.consumed,
    lastChild: res.consumed.length,
    positionalParamSegments: res.posParams
  };
}

function split(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[],
    config: Route[]) {
  if (slicedSegments.length > 0 &&
      containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        consumedSegments, createChildrenForEmptySegments(
                              config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
    return {segmentGroup: mergeTrivialChildren(s), slicedSegments: []};

  } else if (
      slicedSegments.length === 0 &&
      containsEmptyPathRedirects(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        segmentGroup.segments, addEmptySegmentsToChildrenIfNeeded(
                                   segmentGroup, slicedSegments, config, segmentGroup.children));
    return {segmentGroup: mergeTrivialChildren(s), slicedSegments};

  } else {
    return {segmentGroup, slicedSegments};
  }
}

function mergeTrivialChildren(s: UrlSegmentGroup): UrlSegmentGroup {
  if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
    const c = s.children[PRIMARY_OUTLET];
    return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
  } else {
    return s;
  }
}

function addEmptySegmentsToChildrenIfNeeded(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[],
    children: {[name: string]: UrlSegmentGroup}): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (const r of routes) {
    if (emptyPathRedirect(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      res[getOutlet(r)] = new UrlSegmentGroup([], {});
    }
  }
  return merge(children, res);
}

function createChildrenForEmptySegments(
    routes: Route[], primarySegmentGroup: UrlSegmentGroup): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  res[PRIMARY_OUTLET] = primarySegmentGroup;
  for (const r of routes) {
    if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
      res[getOutlet(r)] = new UrlSegmentGroup([], {});
    }
  }
  return res;
}

function containsEmptyPathRedirectsWithNamedOutlets(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes
             .filter(
                 r => emptyPathRedirect(segmentGroup, slicedSegments, r) &&
                     getOutlet(r) !== PRIMARY_OUTLET)
             .length > 0;
}

function containsEmptyPathRedirects(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes.filter(r => emptyPathRedirect(segmentGroup, slicedSegments, r)).length > 0;
}

function emptyPathRedirect(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], r: Route): boolean {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full')
    return false;
  return r.path === '' && r.redirectTo !== undefined;
}

function getOutlet(route: Route): string {
  return route.outlet ? route.outlet : PRIMARY_OUTLET;
}