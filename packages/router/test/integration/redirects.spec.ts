/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {LocationStrategy, Location, HashLocationStrategy} from '@angular/common';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {Router, NavigationStart, RoutesRecognized} from '../../src';
import {createRoot, RootCmp, BlankCmp, TeamCmp, advance} from './integration_helpers';

export function redirectsIntegrationSuite() {
  describe('redirects', () => {
    it('should work', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'old/team/:id', redirectTo: 'team/:id'},
          {path: 'team/:id', component: TeamCmp},
        ]);

        router.navigateByUrl('old/team/22');
        advance(fixture);

        expect(location.path()).toEqual('/team/22');
      }));

    it('can redirect from componentless named outlets', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'main', outlet: 'aux', component: BlankCmp},
          {path: '', pathMatch: 'full', outlet: 'aux', redirectTo: 'main'},
        ]);

        router.navigateByUrl('');
        advance(fixture);

        expect(TestBed.inject(Location).path()).toEqual('/(aux:main)');
      }));

    it('should update Navigation object after redirects are applied', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);
        let initialUrl, afterRedirectUrl;

        router.resetConfig([
          {path: 'old/team/:id', redirectTo: 'team/:id'},
          {path: 'team/:id', component: TeamCmp},
        ]);

        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            const navigation = router.getCurrentNavigation();
            initialUrl = navigation && navigation.finalUrl;
          }
          if (e instanceof RoutesRecognized) {
            const navigation = router.getCurrentNavigation();
            afterRedirectUrl = navigation && navigation.finalUrl;
          }
        });

        router.navigateByUrl('old/team/22');
        advance(fixture);

        expect(initialUrl).toBeUndefined();
        expect(router.serializeUrl(afterRedirectUrl as any)).toBe('/team/22');
      }));

    it('should not break the back button when trigger by location change', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
        });
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);
        router.resetConfig([
          {path: 'initial', component: BlankCmp},
          {path: 'old/team/:id', redirectTo: 'team/:id'},
          {path: 'team/:id', component: TeamCmp},
        ]);

        location.go('initial');
        location.historyGo(0);
        location.go('old/team/22');
        location.historyGo(0);

        // initial navigation
        router.initialNavigation();
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/initial');

        // location change
        location.go('/old/team/33');
        location.historyGo(0);

        advance(fixture);
        expect(location.path()).toEqual('/team/33');

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/initial');
      }));
  });
}
