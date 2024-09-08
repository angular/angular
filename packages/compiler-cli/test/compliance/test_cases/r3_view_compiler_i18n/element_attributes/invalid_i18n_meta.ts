import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n="@@ID.WITH.INVALID.CHARS.2" i18n-title="@@ID.WITH.INVALID.CHARS" title="Element title">
    Some content
  </div>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}