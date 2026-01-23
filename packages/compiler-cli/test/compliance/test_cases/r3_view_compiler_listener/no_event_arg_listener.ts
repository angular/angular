import {Component} from '@angular/core';

@Component({
    template: `<div (click)="onClick();"></div>`,
    standalone: false
})
export class MyComponent {
  onClick() {}
}
