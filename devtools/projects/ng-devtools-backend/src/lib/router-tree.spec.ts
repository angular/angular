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
        {
          path: 'redirect-fn',
          redirectTo: () => '/target',
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
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': true,
          'isActive': undefined,
          'isRedirect': false,
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
          'isRedirect': true,
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
          'isRedirect': true,
          'redirectTo': '[Function]',
        },
      ],
      'isAux': false,
      'isLazy': false,
      'isRedirect': false,
      'data': [],
      'isActive': true,
    } as any);
  });

  it('should handle guards with named functions', () => {
    function canActivateGuard() {
      return true;
    }

    const nestedRouter = {
      config: [
        {
          path: 'protected',
          component: 'ProtectedComponent',
          canActivate: [canActivateGuard],
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].canActivateGuards).toEqual(['canActivateGuard()']);
  });

  it('should handle guards with arrow functions', () => {
    const arrowGuard = () => true;

    const nestedRouter = {
      config: [
        {
          path: 'protected',
          component: 'ProtectedComponent',
          canActivate: [arrowGuard],
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].canActivateGuards).toEqual(['arrowGuard()']);
  });

  it('should handle guards with class instances', () => {
    class AuthGuard {
      canActivate() {
        return true;
      }
    }

    const nestedRouter = {
      config: [
        {
          path: 'protected',
          component: 'ProtectedComponent',
          canActivate: [AuthGuard],
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].canActivateGuards).toEqual(['AuthGuard']);
  });

  it('should handle multiple guard types', () => {
    function canActivateGuard() {
      return true;
    }
    const canMatchGuard = () => true;
    class CanDeactivateGuard {
      canDeactivate() {
        return true;
      }
    }

    const nestedRouter = {
      config: [
        {
          path: 'multi-guard',
          component: 'MultiGuardComponent',
          canActivate: [
            canActivateGuard,
            function () {
              return true;
            },
            () => true,
          ],
          canMatch: [canMatchGuard],
          canDeactivate: [CanDeactivateGuard],
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].canActivateGuards).toEqual([
      'canActivateGuard()',
      '[Function]',
      '[Function]',
    ]);
    expect(parsedRoutes.children![0].canMatchGuards).toEqual(['canMatchGuard()']);
    expect(parsedRoutes.children![0].canDeactivateGuards).toEqual(['CanDeactivateGuard']);
  });
});
