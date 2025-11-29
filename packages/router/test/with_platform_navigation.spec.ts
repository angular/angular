/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '../src';
import {withPlatformNavigation, withRouterConfig} from '../src/provide_router';
import {withBody} from '@angular/private/testing';
import {
  PlatformLocation,
  Location,
  PlatformNavigation,
  BrowserPlatformLocation,
} from '@angular/common';
import {
  ɵFakeNavigation as FakeNavigation,
  ɵFakeNavigationPlatformLocation as FakeNavigationPlatformLocation,
  provideLocationMocks,
} from '@angular/common/testing';
import {timeout, useAutoTick} from './helpers';

/// <reference types="dom-navigation" />

describe('withPlatformNavigation feature', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideRouter([], withPlatformNavigation())]});
  });

  it('provides FakeNavigation by default', () => {
    expect(TestBed.inject(PlatformNavigation)).toBeInstanceOf(FakeNavigation);
  });

  it('provides FakeNavigationPlatformLocation by default', () => {
    expect(TestBed.inject(PlatformLocation)).toBeInstanceOf(FakeNavigationPlatformLocation);
  });

  describe('ensures location information is synced with navigation', () => {
    let location: Location;
    let navigation: PlatformNavigation;
    beforeEach(() => {
      location = TestBed.inject(Location);
      navigation = TestBed.inject(PlatformNavigation);
    });

    it('state changes via location are reflected in navigation', () => {
      location.go('/a', undefined, {someState: 'someValue'});
      expect(navigation.currentEntry!.getState()).toEqual(
        jasmine.objectContaining({someState: 'someValue'}),
      );
    });

    it('state changes via navigation are reflected in location', () => {
      navigation.navigate('/b', {state: {otherState: 'otherValue'}});
      expect(location.getState()).toEqual(jasmine.objectContaining({otherState: 'otherValue'}));
    });

    it('onurlchange tracks changes from navigation API', async () => {
      let changed = false;
      location.onUrlChange(() => {
        changed = true;
      });

      navigation.navigate('/c');
      expect(changed).toBeTrue();
    });

    it('onurlchange is not synchronous if navigation commit is delayed', async () => {
      let changed = false;
      location.onUrlChange(() => {
        changed = true;
      });

      navigation.addEventListener('navigate', (e: any) => {
        e.intercept({
          precommitHandler: () => new Promise((resolve) => setTimeout(resolve)),
        });
      });

      location.go('/c');
      expect(changed).toBeFalse();
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(changed).toBeTrue();
    });
  });

  describe('NavigateEvent and NavigationTransition', () => {
    useAutoTick();
    let router: Router;
    let navigation: PlatformNavigation;
    beforeEach(async () => {
      router = TestBed.inject(Router);
      router.initialNavigation();
      navigation = TestBed.inject(PlatformNavigation);
      await navigation.transition?.finished;
    });

    it('should keep non-router triggered navigation unfinished while waiting for guards', async () => {
      router.resetConfig([
        {
          path: '**',
          canActivate: [
            () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 10)),
          ],
          children: [],
        },
      ]);
      const {finished} = navigation.navigate('/somepath');
      await timeout(5);
      // note that this finished promise will be rejected because the Router will create a separate 'replace' navigate
      // since we cannot redirect the original navigation without precommit handler support
      await expectAsync(finished).not.toBeResolved();
      expect(navigation.transition).not.toBeNull();
      await timeout(10);
      expect(navigation.transition).toBeNull();
    });

    // Needs update to FakeNavigation to match recent spec changes
    it('aborts ongoing router transition if navigation is aborted', async () => {
      router.resetConfig([
        {
          path: 'blocked',
          children: [],
          canActivate: [() => new Promise((r) => setTimeout(() => r(true), 50))],
        },
        {path: '**', children: []},
      ]);
      // set up navigation
      navigation.addEventListener(
        'navigate',
        (e: any) => e.intercept({handler: () => new Promise((_, reject) => setTimeout(reject, 5))}),
        {once: true},
      );

      navigation.navigate('/blocked');
      await timeout();
      expect(navigation.transition).not.toBeNull();
      expect(router.currentNavigation()).not.toBeNull();

      // wait for the rejection of the one-off handler, which will cancel the router transition
      await timeout(10);
      expect(router.currentNavigation()).toBeNull();
      // wait for "rollback" navigation which is resetting the state
      await timeout();
      expect(navigation.transition).toBeNull();
    });

    it('retains the original traversal NavigateEvent', async () => {
      router.resetConfig([{path: '**', children: []}]);
      await router.navigateByUrl('/first');
      await timeout();

      const navigateEvents: NavigateEvent[] = [];
      navigation.addEventListener('navigate', (e: NavigateEvent) => navigateEvents.push(e));
      await navigation.back().finished;
      expect(navigateEvents.length).toBe(1);
      expect(navigateEvents[0].navigationType).toBe('traverse');
    });
  });

  describe('eager url update', () => {
    useAutoTick();
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [{path: '**', children: []}],
            withPlatformNavigation(),
            withRouterConfig({urlUpdateStrategy: 'eager'}),
          ),
        ],
      });
      router = TestBed.inject(Router);
    });

    it('should keep router triggered navigation unfinished while waiting for guards', async () => {
      router.resetConfig([
        {
          path: '**',
          canActivate: [
            () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 10)),
          ],
          children: [],
        },
      ]);
      router.navigateByUrl('/somepath');
      await timeout(5);
      const navigation = TestBed.inject(PlatformNavigation);
      const {finished} = navigation.transition!;
      expect(navigation.transition).not.toBeNull();
      await timeout(10);
      expect(navigation.transition).toBeNull();
      await expectAsync(finished).toBeResolved();
    });
  });
});

describe('configuration error', () => {
  it('throws an error mentioning SpyLocation and the location mocks', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([], withPlatformNavigation()), provideLocationMocks()],
    });
    expect(() => TestBed.inject(Location)).toThrowError(/SpyLocation.*provideLocationMocks/);
  });
});

if (typeof window !== 'undefined' && 'navigation' in window) {
  describe('real platform navigation', () => {
    const navigation = window.navigation as Navigation;
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{path: '**', children: []}], withPlatformNavigation()),
          {provide: PlatformLocation, useClass: BrowserPlatformLocation},
          {provide: PlatformNavigation, useFactory: () => navigation},
        ],
      });
    });

    let router: Router;
    beforeEach(async () => {
      router = TestBed.inject(Router);
      router.initialNavigation();
      await new Promise((r) => setTimeout(r));
    });

    // This would cause tests to fail without the navigation API support with an error like:
    // "Tests were interrupted because the page navigated to <localhost>/somewhere. This can happen when clicking a link, submitting a form or interacting with window.location."
    it(
      'should convert navigations from regular anchors to same-document router navigations',
      withBody('<a href="/somewhere">link</a>', async () => {
        document.querySelector('a')!.click();
        await new Promise((r) => setTimeout(r));
        expect(router.url).toBe('/somewhere');
      }),
    );
  });
}
