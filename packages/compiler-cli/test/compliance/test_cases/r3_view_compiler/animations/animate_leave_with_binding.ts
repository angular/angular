import {Component, signal} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p [animate.leave]="leaveClass()">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  leaveClass = signal('fade');
}
