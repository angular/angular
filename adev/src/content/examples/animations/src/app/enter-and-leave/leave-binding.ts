// #docplaster
import {Component, computed, inject, signal} from '@angular/core';
import {
  PREFERS_COLOR_SCHEME_DARK,
  ThemeManager,
} from '../../../../../../app/core/services/theme-manager.service';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-binding.html',
  styleUrls: ['leave-binding.css'],
})
export class LeaveBinding {
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

  farewell = signal('leaving');
}
