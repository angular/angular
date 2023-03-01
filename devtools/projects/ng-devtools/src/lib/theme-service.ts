/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';

export type Theme = 'dark-theme'|'light-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  currentTheme: Subject<Theme> = new ReplaySubject();

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(this._prefersDarkMode);
  }

  toggleDarkMode(isDark: boolean): void {
    const removeClass = isDark ? 'light-theme' : 'dark-theme';
    const addClass = !isDark ? 'light-theme' : 'dark-theme';
    this.renderer.removeClass(document.body, removeClass);
    this.renderer.addClass(document.body, addClass);
    this.currentTheme.next(addClass);
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
