/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy} from '@angular/common/testing';
import {TestBed} from '@angular/core/testing';
import {currentTextFragmentUrl, hasTextFragment, WINDOW} from '@angular/docs';
import {TextFragmentPreservingLocation} from './text-fragment-preserving-location';

describe('TextFragmentPreservingLocation', () => {
  function setup({
    currentPath = '/guide/signals',
    navigationUrl,
    performanceUrl = navigationUrl,
    locationHref = `http://localhost:4201${currentPath}`,
  }: {
    currentPath?: string;
    navigationUrl?: string;
    performanceUrl?: string;
    locationHref?: string;
  }) {
    const locationStrategy = new MockLocationStrategy();
    locationStrategy.internalPath = currentPath;
    let historyState: unknown = null;
    const historyReplaceState = jasmine
      .createSpy('history.replaceState')
      .and.callFake((state: unknown) => {
        historyState = state;
      });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: WINDOW,
          useValue: {
            navigation: {
              currentEntry: {
                url: navigationUrl,
              },
            },
            performance: {
              getEntriesByType: () => (performanceUrl ? [{name: performanceUrl}] : []),
            },
            history: {
              get state() {
                return historyState;
              },
              replaceState: historyReplaceState,
            },
            location: {
              href: locationHref,
            },
          } as unknown as Window,
        },
        {
          provide: LocationStrategy,
          useValue: locationStrategy,
        },
        {
          provide: Location,
          useClass: TextFragmentPreservingLocation,
        },
      ],
    });

    return {
      location: TestBed.inject(Location),
      locationStrategy,
      historyReplaceState,
      getHistoryState: () => historyState,
    };
  }

  it('detects text fragments in URL directives', () => {
    expect(hasTextFragment('/guide/signals#:~:text=signal%20is%20a')).toBeTrue();
    expect(hasTextFragment('/guide/signals#some-heading:~:text=signal%20is%20a')).toBeTrue();
    expect(hasTextFragment('/guide/signals#some-heading')).toBeFalse();
    expect(hasTextFragment('/guide/signals?redirect=:~:text=signal%20is%20a')).toBeFalse();
  });

  it('uses the navigation performance entry for matching current URLs', () => {
    const performanceUrl =
      'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value';
    const window = {
      navigation: {
        currentEntry: {
          url: 'http://localhost:4201/guide/signals',
        },
      },
      performance: {
        getEntriesByType: () => [
          {
            name: performanceUrl,
          },
        ],
      },
      location: {
        href: 'http://localhost:4201/guide/signals',
      },
    } as unknown as Window;

    expect(currentTextFragmentUrl(window)).toBe(performanceUrl);
  });

  it('does not use a stale navigation performance entry after Navigation API URL changes', () => {
    const window = {
      navigation: {
        currentEntry: {
          url: 'http://localhost:4201/guide/templates',
        },
      },
      performance: {
        getEntriesByType: () => [
          {
            name: 'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value',
          },
        ],
      },
      location: {
        href: 'http://localhost:4201/guide/templates',
      },
    } as unknown as Window;

    expect(currentTextFragmentUrl(window)).toBeUndefined();
  });

  it('does not use stale performance text fragment when current URL has a regular fragment', () => {
    const window = {
      navigation: {
        currentEntry: {
          url: 'http://localhost:4201/guide/signals#some-heading',
        },
      },
      performance: {
        getEntriesByType: () => [
          {
            name: 'http://localhost:4201/guide/signals#:~:text=signal%20is%20a',
          },
        ],
      },
      location: {
        href: 'http://localhost:4201/guide/signals#some-heading',
      },
    } as unknown as Window;

    expect(currentTextFragmentUrl(window)).toBeUndefined();
  });

  it('uses the navigation performance entry when current URL keeps the element fragment prefix', () => {
    const performanceUrl =
      'http://localhost:4201/guide/signals#some-heading:~:text=signal%20is%20a';
    const window = {
      navigation: {
        currentEntry: {
          url: 'http://localhost:4201/guide/signals#some-heading',
        },
      },
      performance: {
        getEntriesByType: () => [
          {
            name: performanceUrl,
          },
        ],
      },
      location: {
        href: 'http://localhost:4201/guide/signals#some-heading',
      },
    } as unknown as Window;

    expect(currentTextFragmentUrl(window)).toBe(performanceUrl);
  });

  it('preserves text fragment URLs when replacing the current path', () => {
    const {location, locationStrategy} = setup({
      navigationUrl:
        'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value',
    });

    location.replaceState('/guide/signals');

    expect(locationStrategy.urlChanges).toEqual([]);
  });

  it('preserves text fragment URLs combined with element fragments', () => {
    const {location, locationStrategy} = setup({
      currentPath: '/guide/signals',
      navigationUrl: 'http://localhost:4201/guide/signals#some-heading:~:text=signal%20is%20a',
    });

    location.replaceState('/guide/signals');

    expect(locationStrategy.urlChanges).toEqual([]);
  });

  it('preserves text fragment URLs with query params', () => {
    const {location, locationStrategy} = setup({
      currentPath: '/guide/signals?tab=api',
      navigationUrl: 'http://localhost:4201/guide/signals?tab=api#:~:text=signal%20is%20a',
    });

    location.replaceState('/guide/signals', 'tab=api');

    expect(locationStrategy.urlChanges).toEqual([]);
  });

  it('updates history state and notifies URL change listeners when preserving text fragments', () => {
    const navigationUrl =
      'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value';
    const {location, locationStrategy, historyReplaceState, getHistoryState} = setup({
      navigationUrl,
    });
    const state = {navigationId: 1};
    const urlChangeListener = jasmine.createSpy('urlChangeListener');

    location.onUrlChange(urlChangeListener);
    location.replaceState('/guide/signals', '', state);

    expect(locationStrategy.urlChanges).toEqual([]);
    expect(historyReplaceState).toHaveBeenCalledOnceWith(state, '');
    expect(getHistoryState()).toBe(state);
    expect(urlChangeListener).toHaveBeenCalledOnceWith('/guide/signals', state);
  });

  it('preserves text fragment only for the first matching replacement', () => {
    const {location, locationStrategy, historyReplaceState} = setup({
      navigationUrl: 'http://localhost:4201/guide/signals#:~:text=signal%20is%20a',
    });
    const firstState = {navigationId: 1};
    const secondState = {navigationId: 2};

    location.replaceState('/guide/signals', '', firstState);
    location.replaceState('/guide/signals', '', secondState);

    expect(historyReplaceState).toHaveBeenCalledOnceWith(firstState, '');
    expect(locationStrategy.urlChanges).toEqual(['replace: /guide/signals']);
  });

  it('preserves text fragment URLs detected from the navigation performance entry', () => {
    const {location, locationStrategy} = setup({
      performanceUrl:
        'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value',
    });

    location.replaceState('/guide/signals');

    expect(locationStrategy.urlChanges).toEqual([]);
  });

  it('keeps normal anchor URL replacement behavior', () => {
    const {location, locationStrategy} = setup({
      navigationUrl: 'http://localhost:4201/guide/signals#some-heading',
    });

    location.replaceState('/guide/signals#some-heading');

    expect(locationStrategy.urlChanges).toEqual(['replace: /guide/signals#some-heading']);
  });

  it('keeps regular replacement behavior for different paths', () => {
    const {location, locationStrategy} = setup({
      navigationUrl:
        'http://localhost:4201/guide/signals#:~:text=signal%20is%20a-,wrapper,-around%20a%20value',
    });

    location.replaceState('/guide/templates');

    expect(locationStrategy.urlChanges).toEqual(['replace: /guide/templates']);
  });
});
