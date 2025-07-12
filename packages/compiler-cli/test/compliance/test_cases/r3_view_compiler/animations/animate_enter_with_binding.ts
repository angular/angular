import {Component, signal} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p [animate.enter]="enterClass()">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
  enterClass = signal('slide');
}
