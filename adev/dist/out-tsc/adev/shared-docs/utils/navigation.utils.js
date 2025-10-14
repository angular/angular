/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '@angular/core';
import {DOCS_CONTENT_LOADER} from '../providers/index';
export const flatNavigationData = (tree) => {
  const result = [];
  const traverse = (node, level) => {
    node.level = level;
    if (node.path) {
      result.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        child.parent = node;
        traverse(child, level + 1);
      }
    }
  };
  for (const node of tree) {
    traverse(node, 1);
  }
  return result;
};
export const getNavigationItemsTree = (tree, mapFn) => {
  const traverse = (node) => {
    mapFn(node);
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  };
  for (const node of tree) {
    traverse(node);
  }
  return tree;
};
export const findNavigationItem = (items, predicate) => {
  let result = null;
  const traverse = (node) => {
    if (predicate(node)) {
      result = node;
    }
    if (node.children && !result) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  };
  for (const node of items) {
    traverse(node);
  }
  return result;
};
/**
 * For perf reasons, we only don't rely on creating a new Url object and comparing the origins
 */
export function isExternalLink(link) {
  return link.startsWith('http://') || link.startsWith('https://');
}
export function markExternalLinks(item) {
  if (item.path) {
    item.isExternal = isExternalLink(item.path);
  }
}
export const mapNavigationItemsToRoutes = (navigationItems, additionalRouteProperties) =>
  navigationItems
    .filter((route) => Boolean(route.path))
    .map((navigationItem) => {
      const route = {
        path: navigationItem.path,
        ...additionalRouteProperties,
      };
      route.data = {
        ...navigationItem,
        ...route.data,
      };
      route.resolve = {
        'docContent': (snapshot) => {
          return snapshot.data['contentPath'] !== undefined
            ? inject(DOCS_CONTENT_LOADER).getContent(snapshot.data['contentPath'])
            : undefined;
        },
        ...route.resolve,
      };
      return route;
    });
export const normalizePath = (path) => {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
};
export const getBaseUrlAfterRedirects = (url, router) => {
  const route = router.parseUrl(url);
  route.fragment = null;
  route.queryParams = {};
  return normalizePath(route.toString());
};
export function handleHrefClickEventWithRouter(e, router, relativeUrl) {
  const pointerEvent = e;
  if (
    pointerEvent.ctrlKey ||
    pointerEvent.shiftKey ||
    pointerEvent.altKey ||
    pointerEvent.metaKey
  ) {
    return;
  }
  e.preventDefault();
  router.navigateByUrl(relativeUrl);
}
export function getActivatedRouteSnapshotFromRouter(router) {
  let route = router.routerState.root.snapshot;
  while (route.firstChild) {
    route = route.firstChild;
  }
  return route;
}
//# sourceMappingURL=navigation.utils.js.map
