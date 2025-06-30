import {Component} from '@angular/core';

@Component({
    selector: 'child-component',
    template: `<p>Fading Content</p>`,
    host: {'animate.leave': 'fade'},
})
export class ChildComponent {
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
