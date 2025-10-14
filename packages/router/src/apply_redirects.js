/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {runInInjectionContext, ɵRuntimeError as RuntimeError} from '@angular/core';
import {NavigationCancellationCode} from './events';
import {navigationCancelingError} from './navigation_canceling_error';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegmentGroup, UrlTree} from './url_tree';
import {wrapIntoObservable} from './utils/collection';
import {firstValueFrom} from './utils/first_value_from';
export class NoMatch extends Error {
  constructor(segmentGroup) {
    super();
    this.segmentGroup = segmentGroup || null;
    // Extending `Error` ends up breaking some internal tests. This appears to be a known issue
    // when extending errors in TS and the workaround is to explicitly set the prototype.
    // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    Object.setPrototypeOf(this, NoMatch.prototype);
  }
}
export class AbsoluteRedirect extends Error {
  constructor(urlTree) {
    super();
    this.urlTree = urlTree;
    // Extending `Error` ends up breaking some internal tests. This appears to be a known issue
    // when extending errors in TS and the workaround is to explicitly set the prototype.
    // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    Object.setPrototypeOf(this, AbsoluteRedirect.prototype);
  }
}
export function namedOutletsRedirect(redirectTo) {
  throw new RuntimeError(
    4000 /* RuntimeErrorCode.NAMED_OUTLET_REDIRECT */,
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      `Only absolute redirects can have named outlets. redirectTo: '${redirectTo}'`,
  );
}
export function canLoadFails(route) {
  throw navigationCancelingError(
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      `Cannot load children because the guard of the route "path: '${route.path}'" returned false`,
    NavigationCancellationCode.GuardRejected,
  );
}
export class ApplyRedirects {
  constructor(urlSerializer, urlTree) {
    this.urlSerializer = urlSerializer;
    this.urlTree = urlTree;
  }
  async lineralizeSegments(route, urlTree) {
    let res = [];
    let c = urlTree.root;
    while (true) {
      res = res.concat(c.segments);
      if (c.numberOfChildren === 0) {
        return res;
      }
      if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
        throw namedOutletsRedirect(`${route.redirectTo}`);
      }
      c = c.children[PRIMARY_OUTLET];
    }
  }
  async applyRedirectCommands(segments, redirectTo, posParams, currentSnapshot, injector) {
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
  applyRedirectCreateUrlTree(redirectTo, urlTree, segments, posParams) {
    const newRoot = this.createSegmentGroup(redirectTo, urlTree.root, segments, posParams);
    return new UrlTree(
      newRoot,
      this.createQueryParams(urlTree.queryParams, this.urlTree.queryParams),
      urlTree.fragment,
    );
  }
  createQueryParams(redirectToParams, actualParams) {
    const res = {};
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
  createSegmentGroup(redirectTo, group, segments, posParams) {
    const updatedSegments = this.createSegments(redirectTo, group.segments, segments, posParams);
    let children = {};
    Object.entries(group.children).forEach(([name, child]) => {
      children[name] = this.createSegmentGroup(redirectTo, child, segments, posParams);
    });
    return new UrlSegmentGroup(updatedSegments, children);
  }
  createSegments(redirectTo, redirectToSegments, actualSegments, posParams) {
    return redirectToSegments.map((s) =>
      s.path[0] === ':'
        ? this.findPosParam(redirectTo, s, posParams)
        : this.findOrReturn(s, actualSegments),
    );
  }
  findPosParam(redirectTo, redirectToUrlSegment, posParams) {
    const pos = posParams[redirectToUrlSegment.path.substring(1)];
    if (!pos)
      throw new RuntimeError(
        4001 /* RuntimeErrorCode.MISSING_REDIRECT */,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `Cannot redirect to '${redirectTo}'. Cannot find '${redirectToUrlSegment.path}'.`,
      );
    return pos;
  }
  findOrReturn(redirectToUrlSegment, actualSegments) {
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
function getRedirectResult(redirectTo, currentSnapshot, injector) {
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
//# sourceMappingURL=apply_redirects.js.map
