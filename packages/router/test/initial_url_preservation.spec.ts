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
import {timeout} from '@angular/private/testing';
import {provideRouter, Router} from '../index';

@Component({template: ''})
class Empty {}

describe('same-path navigation state writes', () => {
  it('uses `Location.updateCurrentEntry` instead of `replaceState` when path is unchanged', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: Empty}])],
    });
    const location = TestBed.inject(Location);
    const updateSpy = spyOn(location, 'updateCurrentEntry' as any).and.callThrough();
    const replaceSpy = spyOn(location, 'replaceState').and.callThrough();

    await TestBed.inject(Router).navigateByUrl('/');

    expect(updateSpy).toHaveBeenCalledWith(jasmine.any(Object));
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('writes `extras.state` into the entry state via `updateCurrentEntry`', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: Empty}])],
    });
    const location = TestBed.inject(Location);
    const updateSpy = spyOn(location, 'updateCurrentEntry' as any).and.callThrough();

    await TestBed.inject(Router).navigateByUrl('/', {state: {custom: 'value'}});

    expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({custom: 'value'}));
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
    const location = TestBed.inject(Location);
    const goSpy = spyOn(location, 'go').and.callThrough();
    const updateSpy = spyOn(location, 'updateCurrentEntry' as any).and.callThrough();

    await router.navigateByUrl('/');
    updateSpy.calls.reset();

    await router.navigateByUrl('/next');

    expect(goSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('preserves Router state across a back-traversal to a same-path entry', async () => {
    // Regression coverage: same-path writes go through `updateCurrentEntry` and
    // do not populate `history.state`, so `Location.getState()` must reconcile
    // the navigation entry. If this stops working, scroll restoration to the
    // initial entry breaks too.
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

    await router.navigateByUrl('/');
    const initialState = location.getState() as {navigationId: number} | null;
    expect(initialState?.navigationId).toBeDefined();

    await router.navigateByUrl('/next');

    location.back();
    await timeout();

    const restored = location.getState() as {navigationId: number} | null;
    expect(restored?.navigationId).toBe(initialState!.navigationId);
  });
});
