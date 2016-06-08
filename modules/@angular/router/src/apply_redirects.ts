import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {Route, RouterConfig} from './config';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlTree} from './url_tree';
import {first} from './utils/collection';
import {TreeNode} from './utils/tree';

class NoMatch {}
class GlobalRedirect {
  constructor(public segments: UrlSegment[]) {}
}

export function applyRedirects(urlTree: UrlTree, config: RouterConfig): Observable<UrlTree> {
  try {
    const transformedChildren = urlTree._root.children.map(c => applyNode(config, c));
    return createUrlTree(urlTree, transformedChildren);
  } catch (e) {
    if (e instanceof GlobalRedirect) {
      return createUrlTree(urlTree, [constructNodes(e.segments, [], [])]);
    } else if (e instanceof NoMatch) {
      return new Observable<UrlTree>(obs => obs.error(new Error('Cannot match any routes')));
    } else {
      return new Observable<UrlTree>(obs => obs.error(e));
    }
  }
}

function createUrlTree(urlTree: UrlTree, children: TreeNode<UrlSegment>[]): Observable<UrlTree> {
  const transformedRoot = new TreeNode<UrlSegment>(urlTree.root, children);
  return of (new UrlTree(transformedRoot, urlTree.queryParams, urlTree.fragment));
}

function applyNode(config: Route[], url: TreeNode<UrlSegment>): TreeNode<UrlSegment> {
  for (let r of config) {
    try {
      return matchNode(config, r, url);
    } catch (e) {
      if (!(e instanceof NoMatch)) throw e;
    }
  }
  throw new NoMatch();
}

function matchNode(config: Route[], route: Route, url: TreeNode<UrlSegment>): TreeNode<UrlSegment> {
  if (!route.path) throw new NoMatch();
  if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== url.value.outlet) {
    throw new NoMatch();
  }

  if (route.path === '**') {
    const newSegments = applyRedirectCommands([], route.redirectTo, {});
    return constructNodes(newSegments, [], []);
  }

  const m = match(route, url);
  if (!m) throw new NoMatch();
  const {consumedUrlSegments, lastSegment, lastParent, positionalParamSegments} = m;

  const newSegments =
      applyRedirectCommands(consumedUrlSegments, route.redirectTo, positionalParamSegments);

  const childConfig = route.children ? route.children : [];
  const transformedChildren = lastSegment.children.map(c => applyNode(childConfig, c));

  const secondarySubtrees = lastParent ? lastParent.children.slice(1) : [];
  const transformedSecondarySubtrees = secondarySubtrees.map(c => applyNode(config, c));

  return constructNodes(newSegments, transformedChildren, transformedSecondarySubtrees);
}

export function match(route: Route, url: TreeNode<UrlSegment>) {
  const path = route.path.startsWith('/') ? route.path.substring(1) : route.path;
  const parts = path.split('/');
  const positionalParamSegments = {};
  const consumedUrlSegments = [];

  let lastParent: TreeNode<UrlSegment>|null = null;
  let lastSegment: TreeNode<UrlSegment>|null = null;

  let current: TreeNode<UrlSegment>|null = url;
  for (let i = 0; i < parts.length; ++i) {
    if (!current) return null;

    const p = parts[i];
    const isLastSegment = i === parts.length - 1;
    const isLastParent = i === parts.length - 2;
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p != current.value.path) return null;
    if (isLastSegment) {
      lastSegment = current;
    }
    if (isLastParent) {
      lastParent = current;
    }
    if (isPosParam) {
      positionalParamSegments[p.substring(1)] = current.value;
    }
    consumedUrlSegments.push(current.value);
    current = first(current.children);
  }
  if (!lastSegment) throw 'Cannot be reached';
  return {consumedUrlSegments, lastSegment, lastParent, positionalParamSegments};
}

function constructNodes(
    segments: UrlSegment[], children: TreeNode<UrlSegment>[],
    secondary: TreeNode<UrlSegment>[]): TreeNode<UrlSegment> {
  let prevChildren = children;
  for (let i = segments.length - 1; i >= 0; --i) {
    if (i === segments.length - 2) {
      prevChildren = [new TreeNode<UrlSegment>(segments[i], prevChildren.concat(secondary))];
    } else {
      prevChildren = [new TreeNode<UrlSegment>(segments[i], prevChildren)];
    }
  }
  return prevChildren[0];
}

function applyRedirectCommands(
    segments: UrlSegment[], redirectTo: string,
    posParams: {[k: string]: UrlSegment}): UrlSegment[] {
  if (!redirectTo) return segments;

  if (redirectTo.startsWith('/')) {
    const parts = redirectTo.substring(1).split('/');
    throw new GlobalRedirect(createSegments(redirectTo, parts, segments, posParams));
  } else {
    return createSegments(redirectTo, redirectTo.split('/'), segments, posParams);
  }
}

function createSegments(
    redirectTo: string, parts: string[], segments: UrlSegment[],
    posParams: {[k: string]: UrlSegment}): UrlSegment[] {
  return parts.map(
      p => p.startsWith(':') ? findPosParamSegment(p, posParams, redirectTo) :
                               findOrCreateSegment(p, segments));
}

function findPosParamSegment(
    part: string, posParams: {[k: string]: UrlSegment}, redirectTo: string): UrlSegment {
  const paramName = part.substring(1);
  const pos = posParams[paramName];
  if (!pos) throw new Error(`Cannot redirect to '${redirectTo}'. Cannot find '${part}'.`);
  return pos;
}

function findOrCreateSegment(part: string, segments: UrlSegment[]): UrlSegment {
  const matchingIndex = segments.findIndex(s => s.path === part);
  if (matchingIndex > -1) {
    const r = segments[matchingIndex];
    segments.splice(matchingIndex);
    return r;
  } else {
    return new UrlSegment(part, {}, PRIMARY_OUTLET);
  }
}
