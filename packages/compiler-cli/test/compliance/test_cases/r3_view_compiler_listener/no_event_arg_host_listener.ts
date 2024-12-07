import {Component, HostListener} from '@angular/core';

@Component({
    template: '',
    host: {
        '(mousedown)': 'mousedown()',
    },
    standalone: false
})
export class MyComponent {
  mousedown() {}

  @HostListener('click')
  click() {
  }
}
