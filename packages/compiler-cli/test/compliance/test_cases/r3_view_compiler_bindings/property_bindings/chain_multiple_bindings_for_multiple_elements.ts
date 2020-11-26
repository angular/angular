import {Component} from '@angular/core';

@Component({
  template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
    <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
  `
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
