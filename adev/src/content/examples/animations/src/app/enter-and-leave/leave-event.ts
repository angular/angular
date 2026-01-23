// #docplaster
import {AnimationCallbackEvent, Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-event.html',
  styleUrls: ['leave-event.css'],
})
export class LeaveEvent {
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
