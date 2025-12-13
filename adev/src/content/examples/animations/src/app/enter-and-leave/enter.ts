// #docplaster
import {Component, computed, effect, inject, signal} from '@angular/core';
import {
  PREFERS_COLOR_SCHEME_DARK,
  THEME_PREFERENCE_LOCAL_STORAGE_KEY,
  ThemeManager,
} from '../../../../../../app/core/services/theme-manager.service';

@Component({
  selector: 'app-enter',
  templateUrl: 'enter.html',
  styleUrls: ['enter.css'],
})
export class Enter {
  private readonly themeManager = inject(ThemeManager);

  public isDarkMode = computed(() => {
    if (this.themeManager.theme() === 'auto') {
      return window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches;
    } else {
      return this.themeManager.theme() === 'dark';
    }
  });

  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
