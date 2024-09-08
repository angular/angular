import {Component, HostListener} from '@angular/core';

@Component({
    selector: 'my-comp',
    template: '',
    host: {
        '(mousedown)': 'mousedown()',
        '(@animation.done)': 'done()',
        '(mouseup)': 'mouseup()',
    },
    standalone: false
})
export class MyComponent {
  @HostListener('@animation.start')
  start() {
  }

  @HostListener('click')
  click() {
  }
}
