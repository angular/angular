/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, Renderer2, RendererFactory2, signal} from '@angular/core';
import {DOCUMENT} from '@angular/common';

export type Theme = 'dark-theme' | 'light-theme';

// Keep class names in sync with _theme.scss and _global.scss
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _doc = inject(DOCUMENT);
  private _renderer: Renderer2;
  readonly currentTheme = signal<Theme>('light-theme');

  constructor(private _rendererFactory: RendererFactory2) {
    this._renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(this._prefersDarkMode);
  }

  toggleDarkMode(isDark: boolean): void {
    const removeClass = isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
    const addClass = !isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
    this._renderer.removeClass(this._doc.body, removeClass);
    this._renderer.addClass(this._doc.body, addClass);
    this.currentTheme.set(addClass);
  }

  initializeThemeWatcher(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.toggleDarkMode(this._prefersDarkMode);
    });
  }

  private get _prefersDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
