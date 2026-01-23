import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p animate.leave="fade">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
}
