import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>{gender, select, male {male of age: {{ ageA + ageB + ageC }}} female {female} other {other}}</div>
`
})
export class MyComponent {
  gender = 'female';
  ageA = 1;
  ageB = 2;
  ageC = 3;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
