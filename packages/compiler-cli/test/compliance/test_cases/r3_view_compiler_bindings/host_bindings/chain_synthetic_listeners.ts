import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '',
  host: {
    '(@animation.done)': 'done()',
  },
  standalone: false,
})
export class MyComponent {
  @HostListener('@animation.start')
  start() {}

  done() {}
}
