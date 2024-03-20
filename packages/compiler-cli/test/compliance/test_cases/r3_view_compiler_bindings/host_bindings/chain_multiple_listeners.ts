import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[my-dir]',
  host: {
    '(mousedown)': 'mousedown()',
    '(mouseup)': 'mouseup()',
  }
})
export class MyDirective {
  mousedown() {}
  mouseup() {}

  @HostListener('click')
  click() {
  }
}
