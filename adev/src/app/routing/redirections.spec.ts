/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {REDIRECT_ROUTES} from './redirections';
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
});
