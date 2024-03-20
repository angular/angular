import {Component} from '@angular/core';

@Component({
  template: `<div
    [class.apple]="yesToApple"
    [style.color]="color"
    [class.orange]="yesToOrange"
    [style.border]="border"
    [class.tomato]="yesToTomato"
    [style.transition]="transition"></div>`
})
export class MyComponent {
  color = 'red';
  border = '1px solid purple';
  transition = 'all 1337ms ease';
  yesToApple = true;
  yesToOrange = true;
  yesToTomato = false;
}
