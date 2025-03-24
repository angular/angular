import {Component} from '@angular/core';

@Component({
    template: `<div
   [class.apple]="yesToApple"
   [class.orange]="yesToOrange"
   [class.tomato]="yesToTomato"></div>`,
    standalone: false
})
export class MyComponent {
  yesToApple = true;
  yesToOrange = true;
  yesToTomato = false;
}
