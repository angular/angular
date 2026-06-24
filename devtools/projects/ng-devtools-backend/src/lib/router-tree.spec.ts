/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getRouterCallableConstructRef, parseRoutes} from './router-tree';

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
          'resolvers': [],
          'path': '/(outlet:component-one)',
          'pathMatch': undefined,
          'data': [],
          'isAux': true,
          'isLazy': false,
          'isActive': false,
        },
        {
          'component': 'component-two',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'resolvers': [],
          'path': '/component-two',
          'pathMatch': undefined,
          'title': 'Component Two',
          'data': [{'key': 'name', 'value': 'component-two'}],
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          'children': [
            {
              'component': 'component-two-one',
              'canActivateGuards': [],
              'canActivateChildGuards': [],
              'canMatchGuards': [],
              'canDeactivateGuards': [],
              'providers': [],
              'resolvers': [],
              'path': '/component-two/component-two-one',
              'pathMatch': undefined,
              'title': '[Function]',
              'data': [],
              'isAux': false,
              'isLazy': false,
              'isActive': false,
            },
            {
              'component': 'component-two-two',
              'canActivateGuards': [],
              'canActivateChildGuards': [],
              'canMatchGuards': [],
              'canDeactivateGuards': [],
              'providers': [],
              'resolvers': [],
              'path': '/component-two/component-two-two',
              'pathMatch': undefined,
              'title': 'titleResolver',
              'data': [],
              'isAux': false,
              'isLazy': false,
              'isActive': false,
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
          'resolvers': [],
          'path': '/lazy',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': true,
          'isActive': false,
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'resolvers': [],
          'path': '/redirect',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          'redirectTo': 'redirectTo',
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'resolvers': [],
          'path': '/redirect-fn',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          'redirectTo': '[Function]',
        },
        {
          'component': 'no-name-route',
          'canActivateGuards': [],
          'canActivateChildGuards': [],
          'canMatchGuards': [],
          'canDeactivateGuards': [],
          'providers': [],
          'resolvers': [],
          'path': '/redirect-named-fn',
          'pathMatch': undefined,
          'data': [],
          'isAux': false,
          'isLazy': false,
          'isActive': false,
          'redirectTo': 'redirectResolver',
        },
      ],
      'isAux': false,
      'isLazy': false,
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

    expect(parsedRoutes.children![0].canActivateGuards).toEqual(['canActivateGuard']);
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

    expect(parsedRoutes.children![0].canActivateGuards).toEqual(['arrowGuard']);
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
      'canActivateGuard',
      '[Function]',
      '[Function]',
    ]);
    expect(parsedRoutes.children![0].canMatchGuards).toEqual(['canMatchGuard']);
    expect(parsedRoutes.children![0].canDeactivateGuards).toEqual(['CanDeactivateGuard']);
  });

  it('should handle matcher function', () => {
    function customMatcher() {
      return null;
    }

    const nestedRouter = {
      config: [
        {
          matcher: customMatcher,
          component: {name: 'MatcherComponent'},
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes.children![0].matcher).toEqual('customMatcher');
    expect(parsedRoutes.children![0].path).toEqual('[Matcher]');
  });

  it('should handle runGuardsAndResolvers with string values', () => {
    const nestedRouter = {
      config: [
        {
          path: 'always',
          component: {name: 'Component'},
          runGuardsAndResolvers: 'always',
        },
        {
          path: 'params',
          component: {name: 'Component2'},
          runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes.children![0].runGuardsAndResolvers).toEqual('always');
    expect(parsedRoutes.children![1].runGuardsAndResolvers).toEqual('paramsOrQueryParamsChange');
  });

  it('should handle runGuardsAndResolvers with function', () => {
    function customRerunLogic() {
      return true;
    }

    const nestedRouter = {
      config: [
        {
          path: 'custom',
          component: {name: 'Component'},
          runGuardsAndResolvers: customRerunLogic,
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);
    expect(parsedRoutes.children![0].runGuardsAndResolvers).toEqual('customRerunLogic');
  });

  it('should handle resolvers with named functions', () => {
    function userResolver() {
      return {id: 1, name: 'User'};
    }

    const nestedRouter = {
      config: [
        {
          path: 'user',
          component: 'UserComponent',
          resolve: {
            user: userResolver,
          },
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].resolvers).toEqual([{key: 'user', value: 'userResolver'}]);
  });

  it('should handle resolvers with arrow functions', () => {
    const dataResolver = () => ({data: 'value'});

    const nestedRouter = {
      config: [
        {
          path: 'data',
          component: 'DataComponent',
          resolve: {
            data: dataResolver,
          },
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].resolvers).toEqual([{key: 'data', value: 'dataResolver'}]);
  });

  it('should handle multiple resolvers on a single route', () => {
    function userResolver() {
      return {id: 1};
    }
    const settingsResolver = () => ({theme: 'dark'});
    class PermissionsResolver {
      resolve() {
        return ['read', 'write'];
      }
    }

    const nestedRouter = {
      config: [
        {
          path: 'dashboard',
          component: 'DashboardComponent',
          resolve: {
            user: userResolver,
            settings: settingsResolver,
            permissions: PermissionsResolver,
          },
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].resolvers).toEqual([
      {key: 'user', value: 'userResolver'},
      {key: 'settings', value: 'settingsResolver'},
      {key: 'permissions', value: 'PermissionsResolver'},
    ]);
  });

  it('should handle nested routes with resolvers', () => {
    function parentResolver() {
      return {parent: 'data'};
    }
    function childResolver() {
      return {child: 'data'};
    }

    const nestedRouter = {
      config: [
        {
          path: 'parent',
          component: 'ParentComponent',
          resolve: {
            parentData: parentResolver,
          },
          children: [
            {
              path: 'child',
              component: 'ChildComponent',
              resolve: {
                childData: childResolver,
              },
            },
          ],
        },
      ],
    };

    const parsedRoutes = parseRoutes(nestedRouter as any);

    expect(parsedRoutes.children![0].resolvers).toEqual([
      {key: 'parentData', value: 'parentResolver'},
    ]);
    expect(parsedRoutes.children![0].children![0].resolvers).toEqual([
      {key: 'childData', value: 'childResolver'},
    ]);
  });
});

describe('getRouterCallableConstructRef', () => {
  class MockComponent {}
  class MockService {}
  function mockResolver() {}
  function mockTitle() {}
  function mockRedirectTo() {}
  function mockMatcher() {}
  function mockRunGuardsAndResolvers() {}
  function mockCanActivate() {}
  function mockCanDeactivate() {}
  class MockCanActivateChild {}
  class MockCanMatch {}

  const MOCK_ROUTES = [
    {
      path: '',
      providers: [MockService],
      _loadedRoutes: [
        {
          path: 'foo',
          component: MockComponent,
          children: [
            {
              path: 'foo',
              resolve: {
                auth: mockResolver,
              },
            },
            {
              path: 'bar',
              redirectTo: mockRedirectTo as any,
              _loadedRoutes: [
                {
                  path: 'foo',
                  title: mockTitle as any,
                },
                {
                  path: 'bar',
                  runGuardsAndResolvers: mockRunGuardsAndResolvers as any,
                },
                {
                  path: 'baz',
                  canActivate: [mockCanActivate],
                  canActivateChild: [MockCanActivateChild],
                  canDeactivate: [mockCanDeactivate],
                },
                {
                  path: 'qux',
                  canMatch: [MockCanMatch],
                },
              ],
            },
            {
              path: 'baz',
              matcher: mockMatcher as any,
            },
          ],
        },
        {
          path: 'bar',
        },
      ],
    },
  ];

  it(`should return null if the callable doesn't exist`, () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'component', 'NonExistent');
    expect(ref).toEqual(null);
  });

  it('should return null if there is a callable with the provided name but wrongly typed', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'providers', 'MockComponent');
    expect(ref).toEqual(null);
  });

  it('should find a component class', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'component', 'MockComponent');
    expect(ref).toEqual(MockComponent);
  });

  it('should find a resolver function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'resolvers', 'mockResolver');
    expect(ref).toEqual(mockResolver);
  });

  it('should find a title function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'title', 'mockTitle');
    expect(ref).toEqual(mockTitle);
  });

  it('should find a redirectTo function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'redirectTo', 'mockRedirectTo');
    expect(ref).toEqual(mockRedirectTo);
  });

  it('should find a matcher function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'matcher', 'mockMatcher');
    expect(ref).toEqual(mockMatcher);
  });

  it('should find a runGuardsAndResolvers function', () => {
    const ref = getRouterCallableConstructRef(
      MOCK_ROUTES,
      'runGuardsAndResolvers',
      'mockRunGuardsAndResolvers',
    );
    expect(ref).toEqual(mockRunGuardsAndResolvers);
  });

  it('should find a canActivate function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'canActivate', 'mockCanActivate');
    expect(ref).toEqual(mockCanActivate);
  });

  it('should find a canDeactivate function', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'canDeactivate', 'mockCanDeactivate');
    expect(ref).toEqual(mockCanDeactivate);
  });

  it('should find a canActivateChild class', () => {
    const ref = getRouterCallableConstructRef(
      MOCK_ROUTES,
      'canActivateChild',
      'MockCanActivateChild',
    );
    expect(ref).toEqual(MockCanActivateChild);
  });

  it('should find a canMatch class', () => {
    const ref = getRouterCallableConstructRef(MOCK_ROUTES, 'canMatch', 'MockCanMatch');
    expect(ref).toEqual(MockCanMatch);
  });
});
