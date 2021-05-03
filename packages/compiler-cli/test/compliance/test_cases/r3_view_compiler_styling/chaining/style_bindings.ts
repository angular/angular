import {Component} from '@angular/core';

@Component({
  template: `<div
    [style.color]="color"
    [style.border]="border"
    [style.transition]="transition"></div>`
})
export class MyComponent {
  color = 'red';
  border = '1px solid purple';
  transition = 'all 1337ms ease';
}
