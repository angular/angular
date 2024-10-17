import {Component} from '@angular/core';

@Component({
  selector: 'other-component',
  template: '',
})
export class OtherComponent {}

@Component({
  selector: 'my-component',
  imports: [OtherComponent],
  template: `
  <div i18n>
    <img *ngIf="flag" />
    <other-component *ngIf="flag" />
    <ng-template *ngIf="flag" />
    <ng-container *ngIf="flag" />
    <ng-content *ngIf="flag" />
  </div>
`,
})
export class MyComponent {}
