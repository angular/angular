/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {REDIRECT_ROUTES} from './redirections';
import {ALL_ITEMS} from './navigation-entries';
import {NavigationItem} from '@angular/docs';
import {DEFAULT_PAGES} from '../core/constants/pages';
import {Route} from '@angular/router';

describe('REDIRECT_ROUTES', () => {
  it('should have all redirectTo values starting with a "/"', () => {
    const checkRoutes = (routes: Route[]) => {
      for (const route of routes) {
        if (route.redirectTo) {
          if (typeof route.redirectTo === 'string') {
            expect(route.redirectTo.startsWith('/'))
              .withContext(`Invalid redirectTo: ${route.redirectTo}`)
              .toBe(true);
          }
        }
        if (route.children) {
          checkRoutes(route.children);
        }
      }
    };

    checkRoutes(REDIRECT_ROUTES);
  });

  it('should only redirect to paths that exist', () => {
    const knownPaths = new Set<string>();
    const collectPaths = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.path) {
          knownPaths.add(item.path);
        }
        if (item.children) {
          collectPaths(item.children);
        }
      }
    };
    collectPaths(ALL_ITEMS);
    // Landing pages such as the playground are routed directly, not through the navigation.
    for (const page of Object.values(DEFAULT_PAGES)) {
      knownPaths.add(page);
    }

    const checkRoutes = (routes: Route[]) => {
      for (const route of routes) {
        if (typeof route.redirectTo === 'string') {
          const target = route.redirectTo.replace(/^\//, '').split(/[#?]/)[0];
          expect(knownPaths.has(target))
            .withContext(`"${route.path}" redirects to "${route.redirectTo}", which is not a page`)
            .toBe(true);
        }
        if (route.children) {
          checkRoutes(route.children);
        }
      }
    };

    checkRoutes(REDIRECT_ROUTES);
  });

  it('should not redirect to another redirect', () => {
    const redirectedPaths = new Set(REDIRECT_ROUTES.map((route) => route.path));

    for (const route of REDIRECT_ROUTES) {
      if (typeof route.redirectTo === 'string') {
        const target = route.redirectTo.replace(/^\//, '').split(/[#?]/)[0];
        expect(redirectedPaths.has(target))
          .withContext(`"${route.path}" redirects to "${target}", which is itself a redirect`)
          .toBe(false);
      }
    }
  });
});
