import {Component} from '@angular/core';

@Component({
  selector: 'child-component',
  host: {'animate.enter': 'fade'},
  template: `<p>Sliding Content</p>`,
})
export class ChildComponent {
}

@Component({
  selector: 'my-component',
  imports: [ChildComponent],
  template: `
    <child-component animate.enter="slide"></child-component>
  `,
})
export class MyComponent {
}
