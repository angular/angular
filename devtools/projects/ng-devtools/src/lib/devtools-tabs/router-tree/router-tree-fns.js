/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function getRouteLabel(route, parent, showFullPath) {
  return (showFullPath ? route.path : route.path.replace(parent?.path || '', '')) || '';
}
export function mapRoute(route, parent, showFullPath) {
  return {
    ...route,
    label: getRouteLabel(route, parent, showFullPath),
    children: [],
  };
}
export function transformRoutesIntoVisTree(root, showFullPath) {
  let rootNode;
  const routesQueue = [{route: root}];
  while (routesQueue.length) {
    const {route, parent} = routesQueue.shift();
    const routeNode = mapRoute(route, parent, showFullPath);
    if (!rootNode) {
      rootNode = routeNode;
    }
    if (parent) {
      parent.children.push(routeNode);
    }
    if (route.children) {
      for (const child of route.children) {
        routesQueue.push({route: child, parent: routeNode});
      }
    }
  }
  return rootNode;
}
export function findNodesByLabel(root, searchString) {
  let matches = new Set();
  if (!searchString) {
    return matches;
  }
  const traverse = (node) => {
    if (node.label.toLowerCase().includes(searchString)) {
      matches.add(node);
    }
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  };
  traverse(root);
  return matches;
}
//# sourceMappingURL=router-tree-fns.js.map
