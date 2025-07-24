/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../../../protocol';
import {
  getRouteLabel,
  mapRoute,
  RouterTreeNode,
  transformRoutesIntoVisTree,
} from './router-tree-fns';

describe('router-tree-fns', () => {
  describe('getRouteLabel', () => {
    it('should return route label', () => {
      const route = {
        path: '/foo/bar',
      } as Route;
      const parent = {
        path: '/foo',
      } as Route;

      expect(getRouteLabel(route, parent, false)).toEqual('/bar');
    });

    it('should return full route label', () => {
      const route = {
        path: '/foo/bar',
      } as Route;
      const parent = {
        path: '/foo',
      } as Route;

      expect(getRouteLabel(route, parent, true)).toEqual('/foo/bar');
    });
  });

  describe('mapRoute', () => {
    it('should map route', () => {
      const route = {
        isActive: true,
        path: '/foo/bar',
      } as Route;
      const parent = {
        path: '/foo',
      } as Route;

      const treeNode = mapRoute(route, parent, false);
      expect(treeNode).toEqual({
        isActive: true,
        path: '/foo/bar',
        label: '/bar',
        children: [] as RouterTreeNode[],
      } as RouterTreeNode);
    });
  });

  describe('transformRoutesIntoVisTree', () => {
    it('should transform routes to visualizer tree', () => {
      const rootRoute = {
        path: '',
        children: [
          {
            path: '/home',
          },
          {
            path: '/list',
            children: [{path: '/list/foo'}, {path: '/list/bar'}],
          },
        ],
      } as Route;

      const rootNode = transformRoutesIntoVisTree(rootRoute, false);

      expect(rootNode).toEqual({
        label: '',
        path: '',
        children: [
          {
            path: '/home',
            label: '/home',
            children: [] as RouterTreeNode[],
          },
          {
            path: '/list',
            label: '/list',
            children: [
              {path: '/list/foo', label: '/foo', children: []},
              {path: '/list/bar', label: '/bar', children: []},
            ],
          },
        ],
      } as RouterTreeNode);
    });
  });
});
