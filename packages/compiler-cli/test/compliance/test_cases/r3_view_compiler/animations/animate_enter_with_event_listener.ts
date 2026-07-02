import {Component, AnimationCallbackEvent} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
  slideFn(event: AnimationCallbackEvent) {
    event.target.classList.add('slide-in');
  }
}
