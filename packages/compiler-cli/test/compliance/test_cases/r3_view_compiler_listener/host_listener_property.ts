import {Directive, HostListener} from '@angular/core';

@Directive()
export class MyComponent {
  @HostListener('click', ['$event'])
  handleClick = ($event: any) => {};

  @HostListener('window:beforeunload', ['$event'])
  private handleBeforeUnload = ($event: any) => {};
}
