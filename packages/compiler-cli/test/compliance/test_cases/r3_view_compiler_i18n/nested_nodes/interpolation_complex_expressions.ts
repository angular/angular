import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    {{ valueA | async }}
    {{ valueA?.a?.b }}
    {{ valueA.getRawValue()?.getTitle() }}
  </div>
  `
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}