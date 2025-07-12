import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
  slideFn(event: any) {
    event.target.classList.add('slide-in');
  }
}
