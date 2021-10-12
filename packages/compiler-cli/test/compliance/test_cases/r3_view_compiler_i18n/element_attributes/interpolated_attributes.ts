import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div
  title="title {{name}}" i18n-title
  attr.label="label {{name}}" i18n-label
  attr.lang="lang {{name}}" i18n-attr.lang>
  </div>
  `
})
export class MyComponent {
  name = 'Angular';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
