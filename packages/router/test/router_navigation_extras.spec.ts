/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {Component, inject} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, withRouterConfig} from '../index';

import {provideRouter} from '../src/provide_router';

describe('`navigationExtras handling with redirects`', () => {
  describe(`eager url updates with navigationExtra.replaceUrl`, () => {
    it('should preserve `NavigationExtras.replaceUrl` when redirecting from guard using urlTree', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [
              {
                path: 'first',
                component: SimpleCmp,
              },
              {
                path: 'second',
                component: SimpleCmp,
                canActivate: [() => inject(Router).createUrlTree(['unguarded'])],
              },
              {
                path: 'unguarded',
                component: SimpleCmp,
              },
            ],
            withRouterConfig({
              urlUpdateStrategy: 'eager',
              canceledNavigationResolution: 'computed',
            }),
          ),
        ],
      });
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);
      await router.navigateByUrl('first');

      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

      const navPromise = router.navigateByUrl('/second', {replaceUrl: true});
      expect(router.getCurrentNavigation()?.extras.replaceUrl).toEqual(true);
      await navPromise;
      expect(location.path()).toEqual('/unguarded');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });
  });

  describe(`deferred url updates function correctly when navigationExtras.replaceUrl false`, () => {
    it('should work when CanActivate redirects', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [
              {
                path: 'first',
                component: SimpleCmp,
              },
              {
                path: 'second',
                component: SimpleCmp,
                canActivate: [() => inject(Router).createUrlTree(['unguarded'])],
              },
              {
                path: 'unguarded',
                component: SimpleCmp,
              },
            ],
            withRouterConfig({
              urlUpdateStrategy: 'deferred',
              canceledNavigationResolution: 'computed',
            }),
          ),
        ],
      });
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/first');
      const location = TestBed.inject(Location);

      await router.navigateByUrl('/second');
      expect(location.path()).toEqual('/unguarded');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await Promise.resolve();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });
  });
});

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {}
