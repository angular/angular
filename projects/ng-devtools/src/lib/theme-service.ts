import { Subject } from 'rxjs';
import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';

export type Themes = 'dark-theme' | 'light-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  currentTheme: Subject<Themes> = new Subject();

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(this._prefersDarkMode);
    this._initializeThemeWatcher();
  }

  toggleDarkMode(isDark: boolean): void {
    const removeClass = isDark ? 'light-theme' : 'dark-theme';
    const addClass = !isDark ? 'light-theme' : 'dark-theme';
    this.renderer.removeClass(document.body, removeClass);
    this.renderer.addClass(document.body, addClass);
    this.currentTheme.next(addClass);
  }

  private _initializeThemeWatcher(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.toggleDarkMode(this._prefersDarkMode);
    });
  }

  private get _prefersDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
