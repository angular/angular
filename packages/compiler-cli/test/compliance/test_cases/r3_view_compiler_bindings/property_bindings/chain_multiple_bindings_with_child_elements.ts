import {Component} from '@angular/core';

@Component({
  template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
      <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    </button>`
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
