import {Component, HostListener} from '@angular/core';

@Component({
  template: '',
  host: {
    '(mousedown)': 'mousedown()',
  }
})
export class MyComponent {
  mousedown() {}

  @HostListener('click')
  click() {
  }
}
