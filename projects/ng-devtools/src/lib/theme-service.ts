import { Subject } from 'rxjs';
import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  currentTheme: Subject<string> = new Subject();

  constructor(private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
    this.toggleDarkMode(false);
  }

  toggleDarkMode(isDark: boolean) {
    const removeClass = isDark ? 'color-scheme-light' : 'color-scheme-dark';
    const addClass = !isDark ? 'color-scheme-light' : 'color-scheme-dark';
    this.renderer.removeClass(document.body, removeClass);
    this.renderer.addClass(document.body, addClass);
    this.currentTheme.next(addClass);
  }
}
