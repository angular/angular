/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, PlatformNavigation} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout} from '@angular/private/testing';
import {provideRouter, Router} from '../index';

@Component({template: ''})
class Empty {}

describe('same-path navigation state writes', () => {
  it('uses `navigation.updateCurrentEntry` instead of `replaceState` when path is unchanged', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: Empty}])],
    });
    const navigation = TestBed.inject(PlatformNavigation);
    const updateSpy = spyOn(navigation, 'updateCurrentEntry').and.callThrough();
    const replaceSpy = spyOn(TestBed.inject(Location), 'replaceState').and.callThrough();

    await TestBed.inject(Router).navigateByUrl('/');

    expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({state: jasmine.any(Object)}));
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('writes `extras.state` into the new entry state via `updateCurrentEntry`', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: Empty}])],
    });
    const navigation = TestBed.inject(PlatformNavigation);
    const updateSpy = spyOn(navigation, 'updateCurrentEntry').and.callThrough();

    await TestBed.inject(Router).navigateByUrl('/', {state: {custom: 'value'}});

    expect(updateSpy).toHaveBeenCalledWith({
      state: jasmine.objectContaining({custom: 'value'}),
    });
  });

  it('uses the regular `Location.go` path for cross-path navigations', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: Empty},
          {path: 'next', component: Empty},
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const navigation = TestBed.inject(PlatformNavigation);
    const goSpy = spyOn(TestBed.inject(Location), 'go').and.callThrough();
    const updateSpy = spyOn(navigation, 'updateCurrentEntry').and.callThrough();

    await router.navigateByUrl('/');
    updateSpy.calls.reset();

    await router.navigateByUrl('/next');

    expect(goSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('preserves Router state across a back-traversal to a same-path entry', async () => {
    // Regression coverage: writes via `navigation.updateCurrentEntry` do not
    // populate `history.state`, so scroll restoration / `restoredState()` must
    // still recover Router state by reading from the navigation entry on
    // popstate. If this stops working, scroll restoration to the initial entry
    // breaks too.
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: Empty},
          {path: 'next', component: Empty},
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    const navigation = TestBed.inject(PlatformNavigation);

    // Initial nav: state written via updateCurrentEntry — only on the
    // navigation entry, not in `history.state`.
    await router.navigateByUrl('/');
    const initialNavState = navigation.currentEntry?.getState() as {
      navigationId: number;
    } | null;
    expect(initialNavState?.navigationId).toBeDefined();
    expect(location.getState()).toBeNull();

    // Cross-path nav populates the next entry (via pushState).
    await router.navigateByUrl('/next');

    // Back-traverse. Router's `restoredState()` should recover the original
    // Router state from the navigation entry, not from `history.state`.
    location.back();
    await timeout();

    const restored = navigation.currentEntry?.getState() as {
      navigationId: number;
    } | null;
    expect(restored?.navigationId).toBe(initialNavState!.navigationId);
  });
});
