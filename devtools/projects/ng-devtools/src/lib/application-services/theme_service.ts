/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {effect, inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WINDOW} from '../application-providers/window_provider';
import {Settings} from './settings';

// Keep class names in sync with _theme.scss and _global.scss
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private readonly win = inject(WINDOW);
  private readonly doc = inject(DOCUMENT);
  private readonly settings = inject(Settings);
  private readonly renderer: Renderer2;
  readonly currentTheme = this.settings.currentTheme;

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(this.prefersDarkMode);

    effect(() => {
      const isDark = this.currentTheme() === 'dark-theme';
      const removeClass = isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
      const addClass = !isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
      this.renderer.removeClass(this.doc.documentElement, removeClass);
      this.renderer.addClass(this.doc.documentElement, addClass);
    });
  }

  private get prefersDarkMode(): boolean {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode(isDark: boolean): void {
    this.currentTheme.set(isDark ? 'dark-theme' : 'light-theme');
  }

  initializeThemeWatcher(): void {
    this.win.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.toggleDarkMode(this.prefersDarkMode);
    });
  }
}
