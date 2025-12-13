// #docplaster
import {AnimationCallbackEvent, Component, computed, inject, signal} from '@angular/core';
import {
  PREFERS_COLOR_SCHEME_DARK,
  ThemeManager,
} from '../../../../../../app/core/services/theme-manager.service';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-event.html',
  styleUrls: ['leave-event.css'],
})
export class LeaveEvent {
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

  leavingFn(event: AnimationCallbackEvent) {
    // Example of calling GSAP
    // gsap.to(event.target, {
    //   duration: 1,
    //   x: 100,
    //   // arrow functions are handy for concise callbacks
    //   onComplete: () => event.animationComplete()
    // });
    event.animationComplete();
  }
}
