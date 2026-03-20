import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animateABC)="doSomething()">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  doSomething() {}
}
