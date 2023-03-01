import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    {gender, select, male {male} female {female} other {other}}
    <div>
      {gender, select, male {male} female {female} other {other}}
    </div>
    <div *ngIf="visible">
      {gender, select, male {male} female {female} other {other}}
    </div>
  </div>
`
})
export class MyComponent {
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
