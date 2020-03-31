// #docplaster
import { Component, Input } from '@angular/core';
import { trigger, transition, state, animate, style, AnimationEvent } from '@angular/animations';

// #docregion component, events1
@Component({
  selector: 'app-open-close',
// #docregion trigger, trigger-wildcard1, trigger-transition
  animations: [
    trigger('openClose', [
// #enddocregion events1
// #docregion state1, events1
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
// #enddocregion trigger, component
// #enddocregion transition2
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
// #docregion transition3
      transition('* => *', [
        animate('1s')
      ]),
// #enddocregion transition3, trigger-transition
// #docregion trigger, component, trigger-wildcard1, events1
    ]),
  ],
// #enddocregion trigger, trigger-wildcard1
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css']
})
// #docregion events
export class OpenCloseComponent {
// #enddocregion events1, events
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

// #enddocregion component
  @Input() logging = false;
// #docregion events1, events
  onAnimationEvent ( event: AnimationEvent ) {
// #enddocregion events1, events
    if (!this.logging) {
      return;
    }
// #docregion events
    // 이 예제에서 트리거 이름은 openClose입니다.
    console.warn(`Animation Trigger: ${event.triggerName}`);

    // phaseName은 start나 done 문자열입니다.
    console.warn(`Phase: ${event.phaseName}`);

    // 이 예제에서 totalTime은 1초이거나 0.5초입니다.
    console.warn(`Total time: ${event.totalTime}`);

    // 이 예제에서 fromState는 open이거나 closed입니다.
    console.warn(`From: ${event.fromState}`);

    // 이 예제에서 toState는 open이거나 closed입니다.
    console.warn(`To: ${event.toState}`);

    // 이 예제에서 이벤트가 발생한 HTML 엘리먼트는 버튼입니다.
    console.warn(`Element: ${event.element}`);
// #docregion events1
  }
// #docregion component
}
// #enddocregion component
