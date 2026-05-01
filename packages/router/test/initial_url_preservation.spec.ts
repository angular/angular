/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, withRouterConfig} from '../index';

@Component({template: '', standalone: true})
class Empty {}

describe('withRouterConfig({preserveInitialUrl})', () => {
  it('writes initial state by default (flag off)', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: Empty}])],
    });
    await TestBed.inject(Router).navigateByUrl('/');

    expect(TestBed.inject(Location).getState()).toEqual(
      jasmine.objectContaining({navigationId: jasmine.any(Number)}),
    );
  });

  it('skips the initial same-path replaceState when flag is on', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: '**', component: Empty}],
          withRouterConfig({preserveInitialUrl: true}),
        ),
      ],
    });
    await TestBed.inject(Router).navigateByUrl('/');

    // No state on the initial entry — Router's `setBrowserUrl` skipped the
    // `replaceState` so any browser-applied URL augmentation (e.g. a
    // `:~:text=` text fragment) is preserved in the address bar.
    expect(TestBed.inject(Location).getState()).toBeNull();
  });

  it('still writes state on subsequent navigations when flag is on', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: '', component: Empty},
            {path: 'next', component: Empty},
          ],
          withRouterConfig({preserveInitialUrl: true}),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    await router.navigateByUrl('/');
    expect(location.getState()).toBeNull();

    await router.navigateByUrl('/next');
    expect(location.getState()).toEqual(
      jasmine.objectContaining({navigationId: jasmine.any(Number)}),
    );
  });

  it('writes state when caller passes extras.state, even with flag on', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: '**', component: Empty}],
          withRouterConfig({preserveInitialUrl: true}),
        ),
      ],
    });
    await TestBed.inject(Router).navigateByUrl('/', {state: {custom: 'value'}});

    expect(TestBed.inject(Location).getState()).toEqual(
      jasmine.objectContaining({custom: 'value'}),
    );
  });

  it("works with 'computed' canceledNavigationResolution when flag is on", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: '', component: Empty},
            {path: 'next', component: Empty},
          ],
          withRouterConfig({
            preserveInitialUrl: true,
            canceledNavigationResolution: 'computed',
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    await router.navigateByUrl('/');
    expect(location.getState()).toBeNull();

    // Subsequent navigations advance page IDs starting from 0 (the fallback
    // value when the initial entry has no `ɵrouterPageId`).
    await router.navigateByUrl('/next');
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
  });
});
