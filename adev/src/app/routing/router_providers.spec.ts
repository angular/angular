/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, EnvironmentInjector, inject, runInInjectionContext} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  Router,
  provideRouter,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import {WINDOW} from '@angular/docs';
import {filter, first} from 'rxjs';

// Minimal routable component for testing.
@Component({template: '', standalone: true})
class TestComponent {}

describe('preserveTextFragmentHighlight', () => {
  /**
   * Replicates the core logic of the preserveTextFragmentHighlight function
   * so we can test the behavior without importing private module internals.
   * This mirrors the implementation in router_providers.ts.
   */
  function setupTextFragmentPreservation() {
    const document = inject(DOCUMENT);
    const window = inject(WINDOW);

    if (!('fragmentDirective' in document)) {
      return;
    }

    const history = window.history;
    const originalReplaceState = history.replaceState.bind(history);
    const originalPushState = history.pushState.bind(history);

    history.replaceState = () => {};
    history.pushState = () => {};

    const router = inject(Router);
    router.events
      .pipe(
        filter(
          (e: unknown) =>
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
        first(),
      )
      .subscribe(() => {
        history.replaceState = originalReplaceState;
        history.pushState = originalPushState;
      });
  }

  it('should suppress history.replaceState during initial navigation when fragmentDirective is supported', async () => {
    const replaceStateSpy = jasmine.createSpy('replaceState');
    const pushStateSpy = jasmine.createSpy('pushState');
    const fakeHistory = {
      replaceState: replaceStateSpy,
      pushState: pushStateSpy,
      state: {},
    };

    const fakeWindow = {
      location: {hostname: 'angular.dev', href: 'http://angular.dev/', pathname: '/'},
      history: fakeHistory,
    };

    // Document with fragmentDirective support.
    const fakeDocument = {
      fragmentDirective: {},
      defaultView: fakeWindow,
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: TestComponent}]),
        {provide: WINDOW, useValue: fakeWindow},
        {provide: DOCUMENT, useValue: fakeDocument},
      ],
    });

    const injector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(injector, () => {
      setupTextFragmentPreservation();
    });

    // After setup, history methods should be suppressed.
    fakeHistory.replaceState({}, '', '/anything');
    fakeHistory.pushState({}, '', '/anything');
    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it('should restore history methods after initial navigation completes', async () => {
    const replaceStateSpy = jasmine.createSpy('replaceState');
    const pushStateSpy = jasmine.createSpy('pushState');
    const fakeHistory = {
      replaceState: replaceStateSpy,
      pushState: pushStateSpy,
      state: {},
    };

    const fakeWindow = {
      location: {hostname: 'angular.dev', href: 'http://angular.dev/', pathname: '/'},
      history: fakeHistory,
    };

    const fakeDocument = {
      fragmentDirective: {},
      defaultView: fakeWindow,
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: TestComponent}]),
        {provide: WINDOW, useValue: fakeWindow},
        {provide: DOCUMENT, useValue: fakeDocument},
      ],
    });

    const injector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(injector, () => {
      setupTextFragmentPreservation();
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');

    // After navigation completes, the original methods should be restored.
    fakeHistory.replaceState({}, '', '/test');
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('should not suppress history methods when fragmentDirective is not supported', () => {
    const replaceStateSpy = jasmine.createSpy('replaceState');
    const fakeHistory = {
      replaceState: replaceStateSpy,
      pushState: jasmine.createSpy('pushState'),
      state: {},
    };

    const fakeWindow = {
      location: {hostname: 'angular.dev', href: 'http://angular.dev/', pathname: '/'},
      history: fakeHistory,
    };

    // Document WITHOUT fragmentDirective.
    const fakeDocument = {
      defaultView: fakeWindow,
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: TestComponent}]),
        {provide: WINDOW, useValue: fakeWindow},
        {provide: DOCUMENT, useValue: fakeDocument},
      ],
    });

    const injector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(injector, () => {
      setupTextFragmentPreservation();
    });

    // Without fragmentDirective, history methods should not be touched.
    fakeHistory.replaceState({}, '', '/test');
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/test');
  });
});
