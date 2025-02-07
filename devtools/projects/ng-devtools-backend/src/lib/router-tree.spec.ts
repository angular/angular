/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseRoutes} from './router-tree';

describe('parseRoutes', () => {
  it('should work without any routes', () => {
    const routes: any[] = [];
    const parsedRoutes = parseRoutes(routes as any);
    expect(parsedRoutes).toEqual({
      component: 'no-name',
      path: '/',
      children: [],
      isAux: false,
      isLazy: false,
      isActive: false,
    });
  });

  it('should work with single route', () => {
    const nestedRouter = {
      rootComponentType: {
        name: 'homeComponent',
      },
      config: [],
    };
    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes).toEqual({
      'component': 'homeComponent',
      'path': '/',
      'children': [],
      'isAux': false,
      'isLazy': false,
      'isActive': false,
    });
  });

  it('should work with nested routes', () => {
    const nestedRouter = {
      rootComponentType: {
        name: 'homeComponent',
      },
      config: [
        {
          outlet: 'outlet',
          path: 'component-one',
          component: {
            name: 'component-one',
          },
        },
        {
          path: 'component-two',
          component: {
            name: 'component-two',
          },
          data: {
            name: 'component-two',
          },
          children: [
            {
              path: 'component-two-two',
              component: {
                name: 'component-two-two',
              },
              _loadedConfig: {
                routes: [
                  {
                    path: 'component-two-two-two',
                    component: {
                      name: 'component-two-two-two',
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          loadChildren: true,
          path: 'lazy',
        },
        {
          path: 'redirect',
          redirectTo: 'redirectTo',
        },
      ],
    };
    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes).toEqual({
      'component': 'homeComponent',
      'path': '/',
      'children': [
        {
          'component': 'component-one',
          'canActivateGuards': [],
          'providers': [],
          'path': '/(outlet:component-one)',
          'isAux': true,
          'isLazy': false,
          'isActive': false,
          pathMatch: undefined,
          title: undefined,
        },
        {
          'component': 'component-two',
          'canActivateGuards': [],
          'providers': [],
          'path': '/component-two',
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          pathMatch: undefined,
          title: undefined,
          'children': [
            {
              'component': 'component-two-two',
              'canActivateGuards': [],
              'providers': [],
              'path': '/component-two/component-two-two',
              'isAux': false,
              'isLazy': false,
              'isActive': false,
              pathMatch: undefined,
              title: undefined,
            },
          ],
        },
        {
          'component': 'lazy [Lazy]',
          'canActivateGuards': [],
          'providers': [],
          'path': '/lazy',
          'isAux': false,
          'isLazy': true,
          'isActive': false,
          pathMatch: undefined,
          title: undefined,
        },
        {
          'component': 'redirect -> redirecting to -> "redirectTo"',
          'canActivateGuards': [],
          'providers': [],
          'path': '/redirect',
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          pathMatch: undefined,
          title: undefined,
        },
      ],
      'isAux': false,
      'isLazy': false,
      'isActive': false,
    });
  });
});
