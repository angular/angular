/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  LocationStrategy,
  NoTrailingSlashPathLocationStrategy,
  PlatformLocation,
  TrailingSlashPathLocationStrategy,
} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, RouterLink} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

@Component({
  template: 'home',
  standalone: true,
})
class HomeCmp {}

@Component({
  template: 'child',
  standalone: true,
})
class ChildCmp {}

describe('Trailing Slash Integration', () => {
  describe('NoTrailingSlashPathLocationStrategy', () => {
    it('should strip trailing slashes and match full path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: 'a', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      // Navigate to /a
      await harness.navigateByUrl('/a');
      expect(location.pathname).toBe('/a');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });
  });

  describe('TrailingSlashPathLocationStrategy', () => {
    it('should add trailing slashes and match full path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: 'a', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      // Navigate to /a
      await harness.navigateByUrl('/a');
      expect(location.pathname).toBe('/a/');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });

    it('should handle root path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: '', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      await harness.navigateByUrl('/');
      expect(location.pathname).toBe('/');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });

    it('should generate correct href in RouterLink', async () => {
      @Component({
        template: '<a routerLink="/a">link</a>',
        imports: [RouterLink],
        standalone: true,
      })
      class LinkCmp {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {path: 'a', pathMatch: 'full', component: HomeCmp},
            {path: 'link', component: LinkCmp},
          ]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/link');
      const link = harness.fixture.nativeElement.querySelector('a');
      expect(link.getAttribute('href')).toBe('/a/');
    });

    it('should handle query params with trailing slash', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: 'a', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      await harness.navigateByUrl('/a?q=val');
      expect(location.pathname).toBe('/a/');
      expect(location.search).toBe('?q=val');
    });

    it('should handle hash with trailing slash', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: 'a', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      await harness.navigateByUrl('/a#frag');
      expect(location.pathname).toBe('/a/');
      expect(location.hash).toBe('#frag');
    });

    it('should handle both query params and hash with trailing slash', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: 'a', pathMatch: 'full', component: HomeCmp}]),
          {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(PlatformLocation);

      await harness.navigateByUrl('/a?q=val#frag');
      expect(location.pathname).toBe('/a/');
      expect(location.search).toBe('?q=val');
      expect(location.hash).toBe('#frag');
    });
  });

  it('should handle auxiliary routes with trailing slash', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: 'a', component: HomeCmp},
          {path: 'b', outlet: 'aux', component: ChildCmp},
        ]),
        {provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy},
      ],
    });

    const harness = await RouterTestingHarness.create();
    const location = TestBed.inject(PlatformLocation);

    // /a(aux:b)
    await harness.navigateByUrl('/a(aux:b)');
    expect(location.pathname).toBe('/a(aux:b)/');
  });
});
