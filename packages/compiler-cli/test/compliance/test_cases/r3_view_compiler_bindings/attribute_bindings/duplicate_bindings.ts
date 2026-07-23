import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div aria-label="hello" aria-label="hi"></div>
    <div style="width: 0" style="height: 0">
    <div class="cls1" class="cls2"></div>
    <div [attr.aria-label]="value1" [attr.aria-label]="value2"></div>
    <div [tabindex]="value1" [tabindex]="value2"></div>
    <div [class]="value1" [class]="value2"></div>
    <div [style]="value1" [style]="value2"></div>
    <div (click)="$event.stopPropagation()" (click)="$event.preventDefault()"></div>
  `,
})
export class MyComponent {
  value1: any;
  value2: any;
}
