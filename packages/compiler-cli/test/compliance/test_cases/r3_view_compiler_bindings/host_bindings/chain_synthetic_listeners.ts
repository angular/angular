import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '',
  host: {
    '(@animation.done)': 'done()',
  }
})
export class MyComponent {
  @HostListener('@animation.start')
  start() {
  }
}
