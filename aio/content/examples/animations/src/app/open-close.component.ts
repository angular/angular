// #docplaster
import { Component, Input } from '@angular/core';
import { trigger, transition, state, animate, style, AnimationEvent } from '@angular/animations';

// #docregion component, events1
@Component({
  selector: 'app-open-close',
// #docregion trigger-wildcard1, trigger-transition
  animations: [
    trigger('openClose', [
// #docregion state1
      // ...
// #enddocregion events1
      state('open', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
// #enddocregion state1
// #docregion state2
      state('closed', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
// #enddocregion state2, trigger-wildcard1
// #docregion transition1
      transition('open => closed', [
        animate('1s')
      ]),
// #enddocregion transition1
// #docregion transition2
      transition('closed => open', [
        animate('0.5s')
      ]),
// #enddocregion transition2, component
// #docregion trigger-wildcard1
      transition('* => closed', [
        animate('1s')
      ]),
      transition('* => open', [
        animate('0.5s')
      ]),
// #enddocregion trigger-wildcard1
// #docregion trigger-wildcard2
      transition('open <=> closed', [
        animate('0.5s')
      ]),
// #enddocregion trigger-wildcard2
// #docregion transition4
      transition ('* => open', [
        animate ('1s',
          style ({ opacity: '*' }),
        ),
      ]),
// #enddocregion transition4
      transition('* => *', [
        animate('1s')
      ]),
// #enddocregion trigger-transition
// #docregion component, trigger-wildcard1, events1
    ]),
  ],
// #enddocregion trigger-wildcard1
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css']
})
// #docregion events
export class OpenCloseComponent {
// #enddocregion events1, events, component
  @Input() logging = false;
// #docregion component
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

// #enddocregion component
// #docregion events1, events
  onAnimationEvent( event: AnimationEvent ) {
// #enddocregion events1, events
    if (!this.logging) {
      return;
    }
// #docregion events
    // openClose is trigger name in this example
    console.warn(`Animation Trigger: ${event.triggerName}`);

    // phaseName is start or done
    console.warn(`Phase: ${event.phaseName}`);

    // in our example, totalTime is 1000 or 1 second
    console.warn(`Total time: ${event.totalTime}`);

    // in our example, fromState is either open or closed
    console.warn(`From: ${event.fromState}`);

    // in our example, toState either open or closed
    console.warn(`To: ${event.toState}`);

    // the HTML element itself, the button in this case
    console.warn(`Element: ${event.element}`);
// #docregion events1
  }
// #docregion component
}
// #enddocregion component
