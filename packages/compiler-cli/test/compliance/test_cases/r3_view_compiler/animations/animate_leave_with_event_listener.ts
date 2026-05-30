import {Component, AnimationCallbackEvent} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animate.leave)="fadeFn($event)">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  fadeFn(event: AnimationCallbackEvent) {
    event.target.classList.add('fade-out');
  }
}
