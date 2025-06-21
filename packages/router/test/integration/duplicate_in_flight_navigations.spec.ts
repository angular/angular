/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject} from '@angular/core';
import {Location} from '@angular/common';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {
  Router,
  provideRouter,
  withRouterConfig,
  NavigationStart,
  GuardsCheckEnd,
} from '../../index';
import {createRoot, SimpleCmp, advance, RootCmp, BlankCmp} from './integration_helpers';

export function duplicateInFlightNavigationsIntegrationSuite() {
  describe('duplicate in-flight navigations', () => {
    @Injectable()
    class RedirectingGuard {
      skipLocationChange = false;
      constructor(private router: Router) {}
      canActivate() {
        this.router.navigate(['/simple'], {skipLocationChange: this.skipLocationChange});
        return false;
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [RedirectingGuard],
      });
    });

    it('should reset location if a navigation by location is successful', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [() => new Promise((resolve) => setTimeout(resolve, 1000))],
          },
        ]);

        // Trigger two location changes to the same URL.
        // Because of the guard the order will look as follows:
        // - location change 'simple'
        // - start processing the change, start a guard
        // - location change 'simple'
        // - the first location change gets canceled, the URL gets reset to '/'
        // - the second location change gets finished, the URL should be reset to '/simple'
        location.go('/simple');
        location.historyGo(0);
        location.historyGo(0);

        tick(2000);
        advance(fixture);

        expect(location.path()).toEqual('/simple');
      }));

    it('should skip duplicate location events', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'blocked',
            component: BlankCmp,
            canActivate: [() => inject(RedirectingGuard).canActivate()],
          },
          {path: 'simple', component: SimpleCmp},
        ]);
        router.navigateByUrl('/simple');
        advance(fixture);

        location.go('/blocked');
        location.historyGo(0);

        advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));

    it('should not cause URL thrashing', async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
      });

      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      router.resetConfig([
        {path: 'home', component: SimpleCmp},
        {
          path: 'blocked',
          component: BlankCmp,
          canActivate: [() => inject(RedirectingGuard).canActivate()],
        },
        {path: 'simple', component: SimpleCmp},
      ]);

      await router.navigateByUrl('/home');
      const urlChanges: string[] = [];
      location.onUrlChange((change) => {
        urlChanges.push(change);
      });

      await router.navigateByUrl('/blocked');
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toContain('simple');
      // We do not want the URL to flicker to `/home` between the /blocked and /simple routes
      expect(urlChanges).toEqual(['/blocked', '/simple']);
    });

    it('can render a 404 page without changing the URL', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
        });
        const router = TestBed.inject(Router);
        TestBed.inject(RedirectingGuard).skipLocationChange = true;
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'home', component: SimpleCmp},
          {
            path: 'blocked',
            component: BlankCmp,
            canActivate: [() => inject(RedirectingGuard).canActivate()],
          },
          {path: 'simple', redirectTo: '404'},
          {path: '404', component: SimpleCmp},
        ]);
        router.navigateByUrl('/home');
        advance(fixture);

        location.go('/blocked');
        location.historyGo(0);
        advance(fixture);
        expect(location.path()).toEqual('/blocked');
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));

    it('should accurately track currentNavigation', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'one',
            component: SimpleCmp,
            canActivate: [() => new Promise((resolve) => setTimeout(resolve, 1000))],
          },
          {
            path: 'two',
            component: BlankCmp,
            canActivate: [() => new Promise((resolve) => setTimeout(resolve, 1000))],
          },
        ]);

        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            if (e.url === '/one') {
              router.navigateByUrl('two');
            }
            router.events.subscribe((e) => {
              if (e instanceof GuardsCheckEnd) {
                expect(router.getCurrentNavigation()?.extractedUrl.toString()).toEqual('/two');
                expect(router.getCurrentNavigation()?.extras).toBeDefined();
              }
            });
          }
        });

        router.navigateByUrl('one');
        tick(1000);
      }));
  });
}
