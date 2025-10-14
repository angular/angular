/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Injectable, PLATFORM_ID, inject, signal} from '@angular/core';
import {LOCAL_STORAGE} from '@angular/docs';
import {Subject} from 'rxjs';
// Keep these constants in sync with the code in index.html
export const THEME_PREFERENCE_LOCAL_STORAGE_KEY = 'themePreference';
export const DARK_MODE_CLASS_NAME = 'docs-dark-mode';
export const LIGHT_MODE_CLASS_NAME = 'docs-light-mode';
export const PREFERS_COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';
let ThemeManager = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ThemeManager = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ThemeManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    document = inject(DOCUMENT);
    localStorage = inject(LOCAL_STORAGE);
    platformId = inject(PLATFORM_ID);
    theme = signal(this.getThemeFromLocalStorageValue());
    // Zoneless - it's required to notify that theme was changed. It could be removed when signal-based components will be available.
    themeChanged$ = new Subject();
    constructor() {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.loadThemePreference();
      this.watchPreferredColorScheme();
    }
    setTheme(theme) {
      this.theme.set(theme);
      this.setThemeInLocalStorage();
      this.setThemeBodyClasses(theme === 'auto' ? preferredScheme() : theme);
    }
    // 1. Read theme preferences stored in localStorage
    // 2. In case when there are no stored user preferences, then read them from device preferences.
    loadThemePreference() {
      const savedUserPreference = this.getThemeFromLocalStorageValue();
      const useTheme = savedUserPreference ?? 'auto';
      this.theme.set(useTheme);
      this.setThemeBodyClasses(useTheme === 'auto' ? preferredScheme() : useTheme);
    }
    // Set theme classes on the body element
    setThemeBodyClasses(theme) {
      const documentClassList = this.document.documentElement.classList;
      if (theme === 'dark') {
        documentClassList.add(DARK_MODE_CLASS_NAME);
        documentClassList.remove(LIGHT_MODE_CLASS_NAME);
      } else {
        documentClassList.add(LIGHT_MODE_CLASS_NAME);
        documentClassList.remove(DARK_MODE_CLASS_NAME);
      }
      this.themeChanged$.next();
    }
    getThemeFromLocalStorageValue() {
      const theme = this.localStorage?.getItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY);
      return theme ?? null;
    }
    setThemeInLocalStorage() {
      if (this.theme()) {
        this.localStorage?.setItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY, this.theme());
      }
    }
    watchPreferredColorScheme() {
      window.matchMedia(PREFERS_COLOR_SCHEME_DARK).addEventListener('change', (event) => {
        const preferredScheme = event.matches ? 'dark' : 'light';
        this.setThemeBodyClasses(preferredScheme);
      });
    }
  };
  return (ThemeManager = _classThis);
})();
export {ThemeManager};
function preferredScheme() {
  return window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches ? 'dark' : 'light';
}
//# sourceMappingURL=theme-manager.service.js.map
