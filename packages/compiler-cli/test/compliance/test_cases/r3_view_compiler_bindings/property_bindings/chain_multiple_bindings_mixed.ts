import {Component} from '@angular/core';

@Component(
    {template: '<button [title]="1" [attr.id]="2" [tabindex]="3" aria-label="{{1 + 3}}"></button>'})
export class MyComponent {
}
