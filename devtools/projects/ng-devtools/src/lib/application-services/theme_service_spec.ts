/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DOCUMENT} from '@angular/common';
import {ThemeService} from './theme_service';
import {WINDOW} from '../application-providers/window_provider';
import {SETTINGS_MOCK} from './test-utils/settings_mock';

function configureTestingModuleWithWindowMock(mock: Partial<Window>) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: WINDOW,
        useValue: mock,
      },
      SETTINGS_MOCK,
      ThemeService,
    ],
  });
}

function mockSystemTheme(initialTheme: 'light' | 'dark' = 'light') {
  // Set the initial theme.
  let currMediaString = `(prefers-color-scheme: ${initialTheme})`;
  let matchMediaListener: (() => void) | null = null;

  return {
    /** Alter the system theme */
    switchTheme: (theme: 'light' | 'dark') => {
      currMediaString = `(prefers-color-scheme: ${theme})`;
      if (matchMediaListener) {
        matchMediaListener();
      }
    },
    /** matchMedia mock  */
    matchMedia: (mediaString: string): MediaQueryList =>
      ({
        matches: mediaString === currMediaString,
        addEventListener: (e: string, cb: () => void) => {
          matchMediaListener = cb;
        },
        removeEventListener: (e: string, cb: () => void) => {},
      }) as MediaQueryList,
  };
}

describe('ThemeService', () => {
  it(`should enable light mode, if it's the preferred/system one`, () => {
    configureTestingModuleWithWindowMock({
      matchMedia: mockSystemTheme('light').matchMedia,
    });

    const service = TestBed.inject(ThemeService);
    const doc = TestBed.inject(DOCUMENT);

    expect(service.currentTheme()).toEqual('light');

    TestBed.tick();

    expect(doc.documentElement.classList.contains('light-theme')).toBeTrue();
  });

  it(`should enable dark mode, if it's the preferred/system one`, () => {
    configureTestingModuleWithWindowMock({
      matchMedia: mockSystemTheme('dark').matchMedia,
    });

    const service = TestBed.inject(ThemeService);
    const doc = TestBed.inject(DOCUMENT);

    expect(service.currentTheme()).toEqual('dark');

    TestBed.tick();

    expect(doc.documentElement.classList.contains('dark-theme')).toBeTrue();
  });

  it('should toggle dark mode', () => {
    configureTestingModuleWithWindowMock({
      matchMedia: mockSystemTheme('light').matchMedia,
    });

    const service = TestBed.inject(ThemeService);
    // Toggle dark mode.
    service.toggleDarkMode(true);

    const doc = TestBed.inject(DOCUMENT);

    expect(service.currentTheme()).toEqual('dark');

    TestBed.tick();

    expect(doc.documentElement.classList.contains('dark-theme')).toBeTrue();
  });

  it('should update the theme automatically, if the system one changes', () => {
    const {switchTheme, matchMedia} = mockSystemTheme('light');
    configureTestingModuleWithWindowMock({matchMedia});

    const service = TestBed.inject(ThemeService);
    // Initialize the watcher.
    service.initializeThemeWatcher();

    const docClassList = TestBed.inject(DOCUMENT).documentElement.classList;

    expect(service.currentTheme()).toEqual('light');

    TestBed.tick();
    expect(docClassList.contains('light-theme')).toBeTrue();

    // This should simulate a system theme change, as if the user did it on OS level.
    switchTheme('dark');

    expect(service.currentTheme()).toEqual('dark');

    TestBed.tick();
    expect(docClassList.contains('dark-theme')).toBeTrue();
  });
});
