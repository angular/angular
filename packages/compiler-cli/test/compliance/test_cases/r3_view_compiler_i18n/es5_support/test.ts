import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<div i18n="meaning:A|descA@@idA">Content A</div>',
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}