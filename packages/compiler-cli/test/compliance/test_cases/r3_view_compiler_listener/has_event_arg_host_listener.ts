import {Directive, HostListener} from '@angular/core';

@Directive()
export class MyComponent {
  @HostListener('click', ['$event.target'])
  click(target: any) {
  }
}
