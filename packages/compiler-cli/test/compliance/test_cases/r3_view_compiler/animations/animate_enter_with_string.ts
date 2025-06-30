import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p animate.enter="slide">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
}
