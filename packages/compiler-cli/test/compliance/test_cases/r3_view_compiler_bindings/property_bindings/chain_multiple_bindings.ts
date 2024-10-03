import {Component} from '@angular/core';

@Component({
    template: '<button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>',
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
