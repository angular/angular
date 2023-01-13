import {Component} from '@angular/core';

@Component({
  template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
      <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    </button>`
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
