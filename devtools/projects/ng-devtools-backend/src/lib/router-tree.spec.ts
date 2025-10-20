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
      component: 'App Root',
      path: 'App Root',
      children: [],
      data: [],
      isAux: false,
      isLazy: false,
      isActive: true,
      isRedirect: false,
    });
  });

  it('should work with single route', () => {
    const nestedRouter = {
      config: [],
    };
    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes).toEqual({
      'component': 'App Root',
      'path': 'App Root',
      'data': [],
      'children': [],
      'isAux': false,
      'isLazy': false,
      'isActive': true,
      isRedirect: false,
    });
  });

  it('should work with nested routes', () => {
    const nestedRouter = {
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
      'component': 'App Root',
      'path': 'App Root',
      'children': [
        {
          'component': 'component-one',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/(outlet:component-one)',
          'title': '[Function]',
          'pathMatch': undefined,
          'data': [],
          'isAux': true,
          'isLazy': false,
          'isActive': undefined,
          'isRedirect': false,
        },
        {
          'component': 'component-two',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/component-two',
          'title': '[Function]',
          'pathMatch': undefined,
          'data': [{'key': 'name', 'value': 'component-two'}],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'isRedirect': false,
          'children': [
            {
              'component': 'component-two-two',
              'canActivateGuards': [],
              'canActivateChildGuards': [],
              'canMatchGuards': [],
              'canDeactivateGuards': [],
              'providers': [],
              'path': '/component-two/component-two-two',
              'title': '[Function]',
              'pathMatch': undefined,
              'data': [],
              'isAux': false,
              'isLazy': false,
              'isActive': undefined,
              'isRedirect': false,
            },
          ],
        },
        {
          'component': 'lazy [Lazy]',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/lazy',
          'title': '[Function]',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': true,
          'isActive': undefined,
          'isRedirect': false,
        },
        {
          'component': 'redirect -> redirecting to -> "redirectTo"',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/redirect',
          'title': '[Function]',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'isRedirect': true,
        },
      ],
      'isAux': false,
      'isLazy': false,
      'isRedirect': false,
      'data': [],
      'isActive': true,
    } as any);
  });
});
