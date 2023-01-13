import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>{gender, select, single {'single quotes'} double {"double quotes"} other {other}}</div>
`
})
export class MyComponent {
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
