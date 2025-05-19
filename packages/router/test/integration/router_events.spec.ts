/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {filter, tap, first} from 'rxjs/operators';
import {Event} from '../../index';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  Router,
  ChildActivationStart,
  ChildActivationEnd,
  ActivationStart,
  ActivationEnd,
  NavigationStart,
  RoutesRecognized,
  GuardsCheckStart,
  GuardsCheckEnd,
  ResolveStart,
  ResolveEnd,
  NavigationEnd,
  NavigationError,
} from '../../src';
import {createRoot, RootCmp, BlankCmp, UserCmp, advance, expectEvents} from './integration_helpers';

export function routerEventsIntegrationSuite() {
  describe('route events', () => {
    it('should fire matching (Child)ActivationStart/End events', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([{path: 'user/:name', component: UserCmp}]);

      const recordedEvents: Event[] = [];
      router.events.forEach((e) => recordedEvents.push(e));

      router.navigateByUrl('/user/fedor');
      advance(fixture);

      const event3 = recordedEvents[3] as ChildActivationStart;
      const event9 = recordedEvents[9] as ChildActivationEnd;

      expect(fixture.nativeElement).toHaveText('user fedor');
      expect(event3 instanceof ChildActivationStart).toBe(true);
      expect(event3.snapshot).toBe(event9.snapshot.root);
      expect(event9 instanceof ChildActivationEnd).toBe(true);
      expect(event9.snapshot).toBe(event9.snapshot.root);

      const event4 = recordedEvents[4] as ActivationStart;
      const event8 = recordedEvents[8] as ActivationEnd;

      expect(event4 instanceof ActivationStart).toBe(true);
      expect(event4.snapshot.routeConfig?.path).toBe('user/:name');
      expect(event8 instanceof ActivationEnd).toBe(true);
      expect(event8.snapshot.routeConfig?.path).toBe('user/:name');

      expectEvents(recordedEvents, [
        [NavigationStart, '/user/fedor'],
        [RoutesRecognized, '/user/fedor'],
        [GuardsCheckStart, '/user/fedor'],
        [ChildActivationStart],
        [ActivationStart],
        [GuardsCheckEnd, '/user/fedor'],
        [ResolveStart, '/user/fedor'],
        [ResolveEnd, '/user/fedor'],
        [ActivationEnd],
        [ChildActivationEnd],
        [NavigationEnd, '/user/fedor'],
      ]);
    }));

    it('should allow redirection in NavigationStart', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'blank', component: UserCmp},
        {path: 'user/:name', component: BlankCmp},
      ]);

      const navigateSpy = spyOn(router, 'navigate').and.callThrough();
      const recordedEvents: Event[] = [];

      const navStart$ = router.events.pipe(
        tap((e) => recordedEvents.push(e)),
        filter((e): e is NavigationStart => e instanceof NavigationStart),
        first(),
      );

      navStart$.subscribe((e: NavigationStart | NavigationError) => {
        router.navigate(['/blank'], {
          queryParams: {state: 'redirected'},
          queryParamsHandling: 'merge',
        });
        advance(fixture);
      });

      router.navigate(['/user/:fedor']);
      advance(fixture);

      expect(navigateSpy.calls.mostRecent().args[1]!.queryParams);
    }));

    it('should stop emitting events after the router is destroyed', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);
      router.resetConfig([{path: 'user/:name', component: UserCmp}]);

      let events = 0;
      const subscription = router.events.subscribe(() => events++);

      router.navigateByUrl('/user/frodo');
      advance(fixture);
      expect(events).toBeGreaterThan(0);

      const previousCount = events;
      router.dispose();
      router.navigateByUrl('/user/bilbo');
      advance(fixture);

      expect(events).toBe(previousCount);
      subscription.unsubscribe();
    }));

    it('should resolve navigation promise with false after the router is destroyed', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);
      let result = null as boolean | null;
      const callback = (r: boolean) => (result = r);
      router.resetConfig([{path: 'user/:name', component: UserCmp}]);

      router.navigateByUrl('/user/frodo').then(callback);
      advance(fixture);
      expect(result).toBe(true);
      result = null as boolean | null;

      router.dispose();

      router.navigateByUrl('/user/bilbo').then(callback);
      advance(fixture);
      expect(result).toBe(false);
      result = null as boolean | null;

      router.navigate(['/user/bilbo']).then(callback);
      advance(fixture);
      expect(result).toBe(false);
    }));
  });
}
