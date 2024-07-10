import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>My i18n block #1</div>
  `,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}