import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>before {gender, select, male {male} female {female} other {other}} after</div>
`
})
export class MyComponent {
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
