import {AnimationCallbackEvent, Component} from '@angular/core';

@Component({
    selector: 'child-component',
    template: `<p>Fading Content</p>`,
    host: {'(animate.leave)': 'fadeFn($event)'},
})
export class ChildComponent {
  fadeFn(event: AnimationCallbackEvent) {
    event.target.classList.add('fade');
    event.animationComplete();
  }
}

@Component({
    selector: 'my-component',
    imports: [ChildComponent],
    template: `
      <child-component animate.leave="slide"></child-component>
  `,
})
export class MyComponent {
}
