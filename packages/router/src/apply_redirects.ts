/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, runInInjectionContext, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from './errors';
import {NavigationCancellationCode} from './events';
import {RedirectFunction, Route} from './models';
import {navigationCancelingError} from './navigation_canceling_error';
import {ActivatedRouteSnapshot} from './router_state';
import {Params, PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {wrapIntoObservable} from './utils/collection';
import {firstValueFrom} from './utils/first_value_from';

export const NO_MATCH_ERROR_NAME = 'ɵNoMatch';
export class NoMatch extends Error {
  override readonly name: string = NO_MATCH_ERROR_NAME;
  public segmentGroup: UrlSegmentGroup | null;

  constructor(segmentGroup?: UrlSegmentGroup) {
    super();
    this.segmentGroup = segmentGroup || null;
  }
}

export const ABSOLUTE_REDIRECT_ERROR_NAME = 'ɵAbsoluteRedirect';
export class AbsoluteRedirect extends Error {
  override readonly name: string = ABSOLUTE_REDIRECT_ERROR_NAME;
  constructor(public urlTree: UrlTree) {
    super();
  }
}

export function namedOutletsRedirect(redirectTo: string): never {
  throw new RuntimeError(
    RuntimeErrorCode.NAMED_OUTLET_REDIRECT,
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      `Only absolute redirects can have named outlets. redirectTo: '${redirectTo}'`,
  );
}

export function canLoadFails(route: Route): never {
  throw navigationCancelingError(
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      `Cannot load children because the guard of the route "path: '${route.path}'" returned false`,
    NavigationCancellationCode.GuardRejected,
  );
}

export class ApplyRedirects {
  constructor(
    private urlSerializer: UrlSerializer,
    private urlTree: UrlTree,
  ) {}

  async lineralizeSegments(route: Route, urlTree: UrlTree): Promise<UrlSegment[]> {
    let res: UrlSegment[] = [];
    let c = urlTree.root;
    while (true) {
      res = res.concat(c.segments);
      if (c.numberOfChildren === 0) {
        return res;
      }

      if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
        throw namedOutletsRedirect(`${route.redirectTo!}`);
      }

      c = c.children[PRIMARY_OUTLET];
    }
  }

  async applyRedirectCommands(
    segments: UrlSegment[],
    redirectTo: string | RedirectFunction,
    posParams: {[k: string]: UrlSegment},
    currentSnapshot: ActivatedRouteSnapshot,
    injector: Injector,
  ): Promise<UrlTree> {
    const redirect = await getRedirectResult(redirectTo, currentSnapshot, injector);
    if (redirect instanceof UrlTree) {
      throw new AbsoluteRedirect(redirect);
    }

    const newTree = this.applyRedirectCreateUrlTree(
      redirect,
      this.urlSerializer.parse(redirect),
      segments,
      posParams,
    );

    if (redirect[0] === '/') {
      throw new AbsoluteRedirect(newTree);
    }
    return newTree;
  }

  applyRedirectCreateUrlTree(
    redirectTo: string,
    urlTree: UrlTree,
    segments: UrlSegment[],
    posParams: {[k: string]: UrlSegment},
  ): UrlTree {
    const newRoot = this.createSegmentGroup(redirectTo, urlTree.root, segments, posParams);
    return new UrlTree(
      newRoot,
      this.createQueryParams(urlTree.queryParams, this.urlTree.queryParams),
      urlTree.fragment,
    );
  }

  createQueryParams(redirectToParams: Params, actualParams: Params): Params {
    const res: Params = {};
    Object.entries(redirectToParams).forEach(([k, v]) => {
      const copySourceValue = typeof v === 'string' && v[0] === ':';
      if (copySourceValue) {
        const sourceName = v.substring(1);
        res[k] = actualParams[sourceName];
      } else {
        res[k] = v;
      }
    });
    return res;
  }

  createSegmentGroup(
    redirectTo: string,
    group: UrlSegmentGroup,
    segments: UrlSegment[],
    posParams: {[k: string]: UrlSegment},
  ): UrlSegmentGroup {
    const updatedSegments = this.createSegments(redirectTo, group.segments, segments, posParams);

    let children: {[n: string]: UrlSegmentGroup} = {};
    Object.entries(group.children).forEach(([name, child]) => {
      children[name] = this.createSegmentGroup(redirectTo, child, segments, posParams);
    });

    return new UrlSegmentGroup(updatedSegments, children);
  }

  createSegments(
    redirectTo: string,
    redirectToSegments: UrlSegment[],
    actualSegments: UrlSegment[],
    posParams: {[k: string]: UrlSegment},
  ): UrlSegment[] {
    return redirectToSegments.map((s) =>
      s.path[0] === ':'
        ? this.findPosParam(redirectTo, s, posParams)
        : this.findOrReturn(s, actualSegments),
    );
  }

  findPosParam(
    redirectTo: string,
    redirectToUrlSegment: UrlSegment,
    posParams: {[k: string]: UrlSegment},
  ): UrlSegment {
    const pos = posParams[redirectToUrlSegment.path.substring(1)];
    if (!pos)
      throw new RuntimeError(
        RuntimeErrorCode.MISSING_REDIRECT,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `Cannot redirect to '${redirectTo}'. Cannot find '${redirectToUrlSegment.path}'.`,
      );
    return pos;
  }

  findOrReturn(redirectToUrlSegment: UrlSegment, actualSegments: UrlSegment[]): UrlSegment {
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

function getRedirectResult(
  redirectTo: string | RedirectFunction,
  currentSnapshot: ActivatedRouteSnapshot,
  injector: Injector,
): Promise<string | UrlTree> {
  if (typeof redirectTo === 'string') {
    return Promise.resolve(redirectTo);
  }
  const redirectToFn = redirectTo;
  const {queryParams, fragment, routeConfig, url, outlet, params, data, title} = currentSnapshot;
  return firstValueFrom(
    wrapIntoObservable(
      runInInjectionContext(injector, () =>
        redirectToFn({params, data, queryParams, fragment, routeConfig, url, outlet, title}),
      ),
    ),
  );
}
