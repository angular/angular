import {Component} from '@angular/core';

@Component({
  selector: 'other-component',
  template: '',
  standalone: true,
})
export class OtherComponent {}

@Component({
  selector: 'my-component',
  imports: [OtherComponent],
  standalone: true,
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
