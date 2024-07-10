import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
  `
})
export class MyComponent {
  valueA!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
