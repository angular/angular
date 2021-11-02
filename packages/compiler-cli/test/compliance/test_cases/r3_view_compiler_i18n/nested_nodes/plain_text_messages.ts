import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>My i18n block #1</div>
  <div>My non-i18n block #1</div>
  <div i18n>My i18n block #2</div>
  <div>My non-i18n block #2</div>
  <div i18n>My i18n block #3</div>
  `,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}