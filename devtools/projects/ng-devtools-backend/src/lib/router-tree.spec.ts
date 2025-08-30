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
      data: [],
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
      'data': [],
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
        },
      ],
      'isAux': false,
      'isLazy': false,
      'data': [],
      'isActive': false,
    } as any);
  });

  it('should correctly mark root route as active only when at root', () => {
    const router = {
      rootComponentType: {name: 'homeComponent'},
      config: [
        {path: 'posts', component: {name: 'PostsComponent'}},
        {path: 'about', component: {name: 'AboutComponent'}},
      ],
      stateManager: {
        routerState: {
          snapshot: {url: '/posts/1'}, // Navigate to nested route
        },
      },
    };

    const parsedRoutes = parseRoutes(router as any);

    // Root route should NOT be active when at /posts/1
    expect(parsedRoutes.isActive).toBe(false);

    // Child routes should be active
    expect(parsedRoutes.children![0].isActive).toBe(true); // /posts should be active
    expect(parsedRoutes.children![1].isActive).toBe(false); // /about should not be active
  });

  it('should mark root route as active when exactly at root', () => {
    const router = {
      rootComponentType: {name: 'homeComponent'},
      config: [],
      stateManager: {
        routerState: {
          snapshot: {url: '/'}, // Exactly at root
        },
      },
    };

    const parsedRoutes = parseRoutes(router as any);

    // Root route should be active when at /
    expect(parsedRoutes.isActive).toBe(true);
  });

  it('should handle route parameter matching correctly', () => {
    const router = {
      rootComponentType: {name: 'homeComponent'},
      config: [{path: 'posts/:id', component: {name: 'PostDetailComponent'}}],
      stateManager: {
        routerState: {
          snapshot: {url: '/posts/123'},
        },
      },
    };

    const parsedRoutes = parseRoutes(router as any);

    // Root route should NOT be active
    expect(parsedRoutes.isActive).toBe(false);

    // Posts route should be active (ignoring parameters)
    expect(parsedRoutes.children![0].isActive).toBe(true);
  });
});
