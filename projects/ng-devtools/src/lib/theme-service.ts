import { Subject } from 'rxjs';
import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';

export type Themes = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  currentTheme: Subject<Themes> = new Subject();

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(false);
  }

  toggleDarkMode(isDark: boolean) {
    const removeClass = isDark ? 'light' : 'dark';
    const addClass = !isDark ? 'light' : 'dark';
    this.renderer.removeClass(document.body, removeClass);
    this.renderer.addClass(document.body, addClass);
    this.currentTheme.next(addClass);
  }
}
