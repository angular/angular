/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NavigationItem} from '../interfaces/index';
import {isExternalLink, mapNavigationItemsToRoutes} from './navigation.utils';

describe('navigation.utils', () => {
  describe('isExternalLink', () => {
    it('should return true for http and https links', () => {
      expect(isExternalLink('http://example.com')).toBeTrue();
      expect(isExternalLink('https://example.com')).toBeTrue();
      expect(isExternalLink('https://github.com/angular/angularfire#readme')).toBeTrue();
    });

    it('should return false for internal relative or absolute paths', () => {
      expect(isExternalLink('guide/signals')).toBeFalse();
      expect(isExternalLink('/guide/signals')).toBeFalse();
      expect(isExternalLink('overview')).toBeFalse();
    });
  });

  describe('mapNavigationItemsToRoutes', () => {
    it('should map internal navigation items to routes and ignore external links', () => {
      const items: NavigationItem[] = [
        {
          label: 'Overview',
          path: 'overview',
        },
        {
          label: 'AngularFire',
          path: 'https://github.com/angular/angularfire#readme',
        },
        {
          label: 'Google Maps',
          path: 'https://github.com/angular/components/tree/main/src/google-maps#readme',
        },
        {
          label: 'Guide',
          path: 'guide/components',
        },
      ];

      const routes = mapNavigationItemsToRoutes(items, {});

      expect(routes.length).toBe(2);
      expect(routes.map((r) => r.path)).toEqual(['overview', 'guide/components']);
    });
  });
});
