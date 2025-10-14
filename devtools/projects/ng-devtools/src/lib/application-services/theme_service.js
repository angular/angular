/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ApplicationRef,
  computed,
  effect,
  inject,
  Injectable,
  RendererFactory2,
  signal,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WINDOW} from '../application-providers/window_provider';
import {Settings} from './settings';
// Keep class names in sync with _theme.scss
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';
let ThemeService = class ThemeService {
  constructor() {
    this.win = inject(WINDOW);
    this.doc = inject(DOCUMENT);
    this.settings = inject(Settings);
    this.appRef = inject(ApplicationRef);
    this.rendererFactory = inject(RendererFactory2);
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.systemTheme = signal(this.systemPrefersDarkMode ? 'dark' : 'light');
    this.currentTheme = computed(() => {
      const theme = this.settings.theme();
      if (theme === 'system') {
        return this.systemTheme();
      }
      return theme;
    });
    effect(() => {
      const theme = this.currentTheme();
      this.updateThemeClass(theme);
    });
  }
  get systemPrefersDarkMode() {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  toggleDarkMode(isDark) {
    const theme = isDark ? 'dark' : 'light';
    this.settings.theme.set(theme);
  }
  initializeThemeWatcher() {
    this.matchMediaUnlisten?.();
    const matchMedia = this.win.matchMedia('(prefers-color-scheme: dark)');
    const matchMediaCb = () => {
      // We don't need to keep track of the preferred theme if `theme` != 'system'.
      // On the contrary, we wouldn't like to trigger `currentTheme` recalc since it's redundant.
      if (this.settings.theme() === 'system') {
        const prefers = this.systemPrefersDarkMode ? 'dark' : 'light';
        this.systemTheme.set(prefers);
      }
    };
    matchMedia.addEventListener('change', matchMediaCb);
    this.matchMediaUnlisten = () => matchMedia.removeEventListener('change', matchMediaCb);
    this.appRef.onDestroy(() => this.matchMediaUnlisten?.());
  }
  updateThemeClass(theme) {
    const htmlEl = this.doc.documentElement;
    this.renderer.removeClass(htmlEl, DARK_THEME_CLASS);
    this.renderer.removeClass(htmlEl, LIGHT_THEME_CLASS);
    const themeClass = theme === 'dark' ? DARK_THEME_CLASS : LIGHT_THEME_CLASS;
    this.renderer.addClass(this.doc.documentElement, themeClass);
  }
};
ThemeService = __decorate([Injectable({providedIn: 'root'})], ThemeService);
export {ThemeService};
//# sourceMappingURL=theme_service.js.map
