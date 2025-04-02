/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, Renderer2, RendererFactory2, signal} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WINDOW} from '../application-providers/window_provider';

export type Theme = 'dark-theme' | 'light-theme';

// Keep class names in sync with _theme.scss and _global.scss
const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

@Injectable()
export class ThemeService {
  private win = inject(WINDOW);
  private doc = inject(DOCUMENT);
  private renderer: Renderer2;
  readonly currentTheme = signal<Theme>(LIGHT_THEME_CLASS);

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(this.prefersDarkMode);
  }

  private get prefersDarkMode(): boolean {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode(isDark: boolean): void {
    const removeClass = isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
    const addClass = !isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
    this.renderer.removeClass(this.doc.documentElement, removeClass);
    this.renderer.addClass(this.doc.documentElement, addClass);
    this.currentTheme.set(addClass);
  }

  initializeThemeWatcher(): void {
    this.win.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.toggleDarkMode(this.prefersDarkMode);
    });
  }
}
