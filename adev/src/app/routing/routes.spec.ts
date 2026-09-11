/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '@angular/router';
import {
  DOCS_ROUTES,
  REFERENCE_ROUTES,
  SUB_NAVIGATION_ROUTES,
  TUTORIALS_ROUTES,
  routes,
} from './routes';

describe('adev routing smoke tests', () => {
  function flattenRoutes(routeList: Route[]): Route[] {
    const result: Route[] = [];
    for (const route of routeList) {
      result.push(route);
      if (route.children) {
        result.push(...flattenRoutes(route.children));
      }
    }
    return result;
  }

  it('should not contain any external URLs in route paths', () => {
    const allRoutes = flattenRoutes(routes);
    const externalRoutes: string[] = [];

    for (const route of allRoutes) {
      if (route.path) {
        if (
          route.path.includes('://') ||
          route.path.startsWith('http:') ||
          route.path.startsWith('https:') ||
          route.path.startsWith('//') ||
          route.path.startsWith('mailto:')
        ) {
          externalRoutes.push(route.path);
        }
      }
    }

    expect(externalRoutes)
      .withContext(
        `Found external URLs in Angular Router route paths. External links should not be registered as routes because prerendering will attempt to render them as static pages:\n${externalRoutes.join('\n')}`,
      )
      .toEqual([]);
  });

  it('should not have invalid route path formats (leading slashes or backslashes)', () => {
    const allRoutes = flattenRoutes(routes);
    const invalidPaths: string[] = [];

    for (const route of allRoutes) {
      if (route.path) {
        if (route.path.startsWith('/') || route.path.includes('\\')) {
          invalidPaths.push(route.path);
        }
      }
    }

    expect(invalidPaths)
      .withContext(
        `Found invalid route paths (leading slash or backslashes):\n${invalidPaths.join('\n')}`,
      )
      .toEqual([]);
  });

  it('should have populated sub-navigation route collections', () => {
    expect(DOCS_ROUTES.length).toBeGreaterThan(0);
    expect(REFERENCE_ROUTES.length).toBeGreaterThan(0);
    expect(TUTORIALS_ROUTES.length).toBeGreaterThan(0);
    expect(SUB_NAVIGATION_ROUTES.length).toBeGreaterThan(0);
  });

  describe('representative route prerender smoke test', () => {
    const representativeRoutes: {path: string; description: string}[] = [
      {path: '', description: 'Home page'},
      {path: 'overview', description: 'Docs overview'},
      {path: 'essentials/signals', description: 'Docs essentials'},
      {path: 'guide/signals', description: 'In-depth guide'},
      {path: 'api', description: 'API reference list'},
      {path: 'cli', description: 'CLI reference list'},
      {path: 'tutorials', description: 'Tutorials list'},
      {path: 'tutorials/learn-angular', description: 'Interactive tutorial'},
      {path: 'playground', description: 'Playground'},
      {path: 'update', description: 'Update guide'},
      {path: '**', description: 'Not found page'},
    ];

    for (const {path, description} of representativeRoutes) {
      it(`should successfully resolve route and load component for ${description} ('${path}')`, async () => {
        const allRoutes = flattenRoutes(routes);
        const matchedRoute = allRoutes.find((r) => r.path === path);

        expect(matchedRoute)
          .withContext(`Representative route '${path}' (${description}) was not found in routes`)
          .toBeDefined();

        if (matchedRoute?.loadComponent) {
          const component = await matchedRoute.loadComponent();
          expect(component)
            .withContext(`loadComponent failed for route '${path}' (${description})`)
            .toBeTruthy();
        }
      });
    }
  });
});
