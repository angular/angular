import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div
  title="title {{name}}" i18n-title
  attr.label="label {{name}}" i18n-label="@@id1"
  attr.lang="lang {{name}}" i18n-attr.lang="@@id2"
  attr.dir="dir {{name}}" i18n-attr.dir="@@id3" i18n-dir="@@id4"
  attr.draggable="draggable {{name}}" i18n-draggable="@@id5" i18n-attr.draggable="@@id6">
  </div>
  `
})
export class MyComponent {
  name = 'Angular';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
