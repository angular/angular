/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {LocationStrategy, Location, HashLocationStrategy} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {Router, NavigationStart, RoutesRecognized} from '../../src';
import {createRoot, RootCmp, BlankCmp, TeamCmp, advance} from './integration_helpers';
import {childNodesAsList} from '@angular/private/testing';

export function redirectsIntegrationSuite() {
  describe('redirects', () => {
    it('should work', async () => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'old/team/:id', redirectTo: 'team/:id'},
        {path: 'team/:id', component: TeamCmp},
      ]);

      await router.navigateByUrl('old/team/22');

      expect(location.path()).toEqual('/team/22');
    });

    it('empty path child redirecting to no match', async () => {
      const router = TestBed.inject(Router);
      router.resetConfig([
        {
          path: 'test',
          children: [
            // Redirect will fail to match but does not cause navigation to fail.
            // Either outcome could really be defended as correct, but this is what we have
            // so this test ensures we don't unintentionally change it.
            {path: '', redirectTo: 'no-match', pathMatch: 'full'},
          ],
        },
      ]);

      await router.navigateByUrl('/test');
      expect(router.url).toEqual('/test');
    });

    it('can redirect from componentless named outlets', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'main', outlet: 'aux', component: BlankCmp},
        {path: '', pathMatch: 'full', outlet: 'aux', redirectTo: 'main'},
      ]);

      await router.navigateByUrl('');

      expect(TestBed.inject(Location).path()).toEqual('/(aux:main)');
    });

    it('should update Navigation object after redirects are applied', async () => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);
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

      await router.navigateByUrl('old/team/22');

      expect(initialUrl).toBeUndefined();
      expect(router.serializeUrl(afterRedirectUrl as any)).toBe('/team/22');
    });

    it('should not break the back button when trigger by location change', async () => {
      TestBed.configureTestingModule({
        providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(RootCmp);
      await advance(fixture);
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
      await advance(fixture);
      expect(location.path()).toEqual('/team/22');

      location.back();
      await advance(fixture);
      expect(location.path()).toEqual('/initial');

      // location change
      location.go('/old/team/33');
      location.historyGo(0);

      await advance(fixture);
      expect(location.path()).toEqual('/team/33');

      location.back();
      await advance(fixture);
      expect(location.path()).toEqual('/initial');
    });
  });
}
