import {Component} from '@angular/core';

@Component({
  template: `
    <button [attr.title]="myTitle" attr.id="{{buttonId}}" [attr.tabindex]="1"></button>
  `
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
