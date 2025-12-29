/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, withRouterConfig, RouterModule} from '@angular/router';
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
  describe('trailingSlash: "never" (default)', () => {
    it('should strip trailing slashes and match full path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: 'a', pathMatch: 'full', component: HomeCmp}],
            withRouterConfig({trailingSlash: 'never'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      // Navigate to /a/
      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a');
      expect(harness.routeNativeElement?.textContent).toBe('home');

      // Navigate to /a
      await harness.navigateByUrl('/a');
      expect(location.path()).toBe('/a');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });

    it('should handle nested routes', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [
              {
                path: 'a',
                children: [{path: 'b', component: ChildCmp}],
              },
            ],
            withRouterConfig({trailingSlash: 'never'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a/b/');
      expect(location.path()).toBe('/a/b');
      expect(harness.routeNativeElement?.textContent).toBe('child');
    });
  });

  describe('trailingSlash: "always"', () => {
    it('should add trailing slashes and match full path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: 'a', pathMatch: 'full', component: HomeCmp}],
            withRouterConfig({trailingSlash: 'always'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      // Navigate to /a
      await harness.navigateByUrl('/a');
      expect(location.path()).toBe('/a/');
      expect(harness.routeNativeElement?.textContent).toBe('home');

      // Navigate to /a/
      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a/');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });

    it('should handle root path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: '', pathMatch: 'full', component: HomeCmp}],
            withRouterConfig({trailingSlash: 'always'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/');
      expect(location.path()).toBe('/');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });
  });

  describe('trailingSlash: "preserve"', () => {
    it('should keep trailing slash if present and match full path', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: 'a', pathMatch: 'full', component: HomeCmp}],
            withRouterConfig({trailingSlash: 'preserve'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      // Navigate to /a/
      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a/');
      expect(harness.routeNativeElement?.textContent).toBe('home');

      // Navigate to /a
      await harness.navigateByUrl('/a');
      expect(location.path()).toBe('/a');
      expect(harness.routeNativeElement?.textContent).toBe('home');
    });

    it('should support mix of trailing slash and no trailing slash in history', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: 'a', pathMatch: 'full', component: HomeCmp}],
            withRouterConfig({trailingSlash: 'preserve'}),
          ),
        ],
      });

      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a');
      expect(location.path()).toBe('/a');

      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a/');

      location.back();
      await harness.fixture.whenStable();
      expect(location.path()).toBe('/a');
    });
  });

  describe('RouterModule.forRoot (Compatibility)', () => {
    it('should strip trailing slash when configured with "never"', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([{path: '**', component: HomeCmp}], {trailingSlash: 'never'}),
        ],
      });
      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a');
    });

    it('should NOT strip trailing slash when configured with "preserve"', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([{path: '**', component: HomeCmp}], {trailingSlash: 'preserve'}),
        ],
      });
      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a/');
    });

    it('should NOT strip trailing slash when configured with "always"', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([{path: '**', component: HomeCmp}], {trailingSlash: 'always'}),
        ],
      });
      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a');
      expect(location.path()).toBe('/a/');
    });

    it('Should strip trailing slash by default (undefined config) due to Location behavior', async () => {
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([{path: '**', component: HomeCmp}])],
      });
      const harness = await RouterTestingHarness.create();
      const location = TestBed.inject(Location);

      await harness.navigateByUrl('/a/');
      expect(location.path()).toBe('/a');
    });
  });
});
