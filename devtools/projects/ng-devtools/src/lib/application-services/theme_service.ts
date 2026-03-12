/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
import {ThemeUi} from './theme_types';

// Keep class names in sync with _theme.scss
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private readonly win = inject(WINDOW);
  private readonly doc = inject(DOCUMENT);
  private readonly settings = inject(Settings);
  private readonly appRef = inject(ApplicationRef);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);

  private readonly systemTheme = signal<ThemeUi>(this.systemPrefersDarkMode ? 'dark' : 'light');

  private matchMediaUnlisten?: () => void;

  currentTheme = computed<ThemeUi>(() => {
    const theme = this.settings.theme();
    if (theme === 'system') {
      return this.systemTheme();
    }
    return theme;
  });

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.updateThemeClass(theme);
    });
  }

  private get systemPrefersDarkMode(): boolean {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode(isDark: boolean): void {
    const theme: ThemeUi = isDark ? 'dark' : 'light';
    this.settings.theme.set(theme);
  }

  initializeThemeWatcher(): void {
    this.matchMediaUnlisten?.();

    const matchMedia = this.win.matchMedia('(prefers-color-scheme: dark)');
    const matchMediaCb = () => {
      // We don't need to keep track of the preferred theme if `theme` != 'system'.
      // On the contrary, we wouldn't like to trigger `currentTheme` recalc since it's redundant.
      if (this.settings.theme() === 'system') {
        const prefers: ThemeUi = this.systemPrefersDarkMode ? 'dark' : 'light';
        this.systemTheme.set(prefers);
      }
    };

    matchMedia.addEventListener('change', matchMediaCb);
    this.matchMediaUnlisten = () => matchMedia.removeEventListener('change', matchMediaCb);

    this.appRef.onDestroy(() => this.matchMediaUnlisten?.());
  }

  private updateThemeClass(theme: ThemeUi) {
    const htmlEl = this.doc.documentElement;
    this.renderer.removeClass(htmlEl, DARK_THEME_CLASS);
    this.renderer.removeClass(htmlEl, LIGHT_THEME_CLASS);

    const themeClass = theme === 'dark' ? DARK_THEME_CLASS : LIGHT_THEME_CLASS;
    this.renderer.addClass(this.doc.documentElement, themeClass);
  }
}
