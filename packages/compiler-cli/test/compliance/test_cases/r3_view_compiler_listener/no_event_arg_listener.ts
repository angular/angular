import {Component} from '@angular/core';

@Component({template: `<div (click)="onClick();"></div>`})
export class MyComponent {
  onClick() {}
}
