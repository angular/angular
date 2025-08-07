/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, effect, inject, Injectable, RendererFactory2, signal} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WINDOW} from '../application-providers/window_provider';
import {Settings} from './settings';
import {ThemeUi} from './theme_types';

// Keep class names in sync with _theme.scss
const CLASS_SUFFIX = 'theme';
const DARK_THEME_CLASS = `dark-${CLASS_SUFFIX}`;
const LIGHT_THEME_CLASS = `light-${CLASS_SUFFIX}`;

@Injectable({providedIn: 'root'})
export class ThemeService {
  private readonly win = inject(WINDOW);
  private readonly doc = inject(DOCUMENT);
  private readonly settings = inject(Settings);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);

  private readonly preferredTheme = signal<ThemeUi>(this.prefersDarkMode ? 'dark' : 'light');

  currentTheme = computed<ThemeUi>(() => {
    const theme = this.settings.theme();
    if (theme === 'system') {
      return this.preferredTheme();
    }
    return theme;
  });

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.updateThemeClass(theme);
    });
  }

  private get prefersDarkMode(): boolean {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode(isDark: boolean): void {
    const theme: ThemeUi = isDark ? 'dark' : 'light';
    this.settings.theme.set(theme);
  }

  initializeThemeWatcher(): void {
    this.win.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      // We don't need to keep track of the preferred theme if `theme` != 'system'.
      // On the contrary, we wouldn't like to trigger `currentTheme` recalc since it's redundant.
      if (this.settings.theme() === 'system') {
        const prefers: ThemeUi = this.prefersDarkMode ? 'dark' : 'light';
        this.preferredTheme.set(prefers);
      }
    });
  }

  private updateThemeClass(theme: ThemeUi) {
    this.removeThemeClass();

    const themeClass = theme === 'dark' ? DARK_THEME_CLASS : LIGHT_THEME_CLASS;
    this.renderer.addClass(this.doc.documentElement, themeClass);
  }

  private removeThemeClass() {
    const htmlEl = this.doc.documentElement;

    htmlEl.classList.forEach((className) => {
      if (className.endsWith(CLASS_SUFFIX)) {
        this.renderer.removeClass(htmlEl, className);
      }
    });
  }
}
