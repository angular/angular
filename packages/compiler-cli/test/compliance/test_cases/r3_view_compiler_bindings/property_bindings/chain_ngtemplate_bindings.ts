import {Component} from '@angular/core';

@Component(
    {
    template: '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>',
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'custom-id';
}
