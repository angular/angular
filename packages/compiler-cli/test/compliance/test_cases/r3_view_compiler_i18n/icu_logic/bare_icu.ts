import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div>{gender, select, male {male} female {female} other {other}}</div>
  <div *ngIf="visible" title="icu only">
    {age, select, 10 {ten} 20 {twenty} other {other}}
  </div>
  <div *ngIf="available" title="icu and text">
    You have {count, select, 0 {no emails} 1 {one email} other {{{count}} emails}}.
  </div>
`
})
export class MyComponent {
  gender = 'female';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
