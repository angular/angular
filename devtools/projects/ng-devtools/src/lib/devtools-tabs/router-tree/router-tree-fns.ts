/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TreeD3Node,
  TreeNode,
  TreeVisualizer,
} from '../../shared/tree-visualizer-host/tree-visualizer';
import {Route} from '../../../../../protocol';

export interface RouterTreeNode extends TreeNode, Route {
  children: RouterTreeNode[];
}

export type RouterTreeVisualizer = TreeVisualizer<RouterTreeNode>;
export type RouterTreeD3Node = TreeD3Node<RouterTreeNode>;

export function getRouteLabel(
  route: Route | RouterTreeNode,
  parent: Route | RouterTreeNode | undefined,
  showFullPath: boolean,
): string {
  return (showFullPath ? route.path : route.path.replace(parent?.path || '', '')) || '';
}

export function mapRoute(
  route: Route,
  parent: Route | undefined,
  showFullPath: boolean,
): RouterTreeNode {
  return {
    ...route,
    label: getRouteLabel(route, parent, showFullPath),
    children: [],
  };
}

export function transformRoutesIntoVisTree(root: Route, showFullPath: boolean): RouterTreeNode {
  let rootNode: RouterTreeNode | undefined;
  const routesQueue: {route: Route; parent?: RouterTreeNode}[] = [{route: root}];

  while (routesQueue.length) {
    const {route, parent} = routesQueue.shift()!;
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

  return rootNode!;
}
