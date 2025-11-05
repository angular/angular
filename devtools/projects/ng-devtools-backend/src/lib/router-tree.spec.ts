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
    });
  });

  it('should work with nested routes', () => {
    function titleResolver() {
      return 'title';
    }

    const redirectResolver = () => 'redirect';

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
          title: 'Component Two',
          children: [
            {
              path: 'component-two-one',
              component: {
                name: 'component-two-one',
              },
              title: () => 'Component Two One',
              _loadedConfig: {
                routes: [
                  {
                    path: 'component-two-one-one',
                    component: {
                      name: 'component-two-one-one',
                    },
                  },
                ],
              },
            },
            {
              path: 'component-two-two',
              component: {
                name: 'component-two-two',
              },
              title: titleResolver,
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
        {
          path: 'redirect-fn',
          redirectTo: () => '/target',
        },
        {
          path: 'redirect-named-fn',
          redirectTo: redirectResolver,
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
          'pathMatch': undefined,
          'data': [],
          'isAux': true,
          'isLazy': false,
          'isActive': undefined,
        },
        {
          'component': 'component-two',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/component-two',
          'pathMatch': undefined,
          'title': 'Component Two',
          'data': [{'key': 'name', 'value': 'component-two'}],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'children': [
            {
              'component': 'component-two-one',
              'canActivateGuards': [],
              'canActivateChildGuards': [],
              'canMatchGuards': [],
              'canDeactivateGuards': [],
              'providers': [],
              'path': '/component-two/component-two-one',
              'pathMatch': undefined,
              'title': '[Function]',
              'data': [],
              'isAux': false,
              'isLazy': false,
              'isActive': undefined,
            },
            {
              'component': 'component-two-two',
              'canActivateGuards': [],
              'canActivateChildGuards': [],
              'canMatchGuards': [],
              'canDeactivateGuards': [],
              'providers': [],
              'path': '/component-two/component-two-two',
              'pathMatch': undefined,
              'title': 'titleResolver()',
              'data': [],
              'isAux': false,
              'isLazy': false,
              'isActive': undefined,
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
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': true,
          'isActive': undefined,
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/redirect',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'redirectTo': 'redirectTo',
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/redirect-fn',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'redirectTo': '[Function]',
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'path': '/redirect-named-fn',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': undefined,
          'redirectTo': 'redirectResolver()',
        },
      ],
      'isAux': false,
      'isLazy': false,
      'data': [],
      'isActive': true,
    } as any);
  });
});
