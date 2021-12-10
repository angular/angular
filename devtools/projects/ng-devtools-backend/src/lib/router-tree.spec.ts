/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseRoutes} from './router-tree';

describe('parseRoutes', () => {
  it('should work without any routes', () => {
    const routes = [];
    const parsedRoutes = parseRoutes(routes as any);
    expect(parsedRoutes).toEqual({
      handler: 'no-name',
      name: 'no-name',
      path: '/',
      children: [],
      isAux: false,
      specificity: null,
      data: null,
      hash: null,
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
      handler: 'homeComponent',
      name: 'homeComponent',
      path: '/',
      children: [],
      isAux: false,
      specificity: null,
      data: null,
      hash: null,
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
      handler: 'homeComponent',
      name: 'homeComponent',
      path: '/',
      children: [
        {
          handler: 'component-one',
          data: [],
          hash: null,
          specificity: null,
          name: 'component-one',
          path: '/(outlet:component-one)',
          isAux: true,
          children: [],
        },
        {
          handler: 'component-two',
          data: [Object({key: 'name', value: 'component-two'})],
          hash: null,
          specificity: null,
          name: 'component-two',
          path: '/component-two',
          isAux: false,
          children: [
            {
              handler: 'component-two-two',
              data: [],
              hash: null,
              specificity: null,
              name: 'component-two-two',
              path: '/component-two/component-two-two',
              isAux: false,
              children: [
                {
                  handler: 'component-two-two-two',
                  data: [],
                  hash: null,
                  specificity: null,
                  name: 'component-two-two-two',
                  path: '/component-two/component-two-two/component-two-two-two',
                  isAux: false,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          handler: 'lazy [Lazy]',
          data: [],
          hash: null,
          specificity: null,
          name: 'lazy [Lazy]',
          path: '/lazy',
          isAux: false,
          children: [],
        },
        {
          handler: 'redirect -> redirecting to -> "redirectTo"',
          data: [],
          hash: null,
          specificity: null,
          name: 'redirect -> redirecting to -> "redirectTo"',
          path: '/redirect',
          isAux: false,
          children: [],
        },
      ],
      isAux: false,
      specificity: null,
      data: null,
      hash: null,
    });
  });
});
