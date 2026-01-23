import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{{ text }}<h1 i18n-title title="{{ attr }}"></h1></div>
  `,
    standalone: false
})
export class MyComponent {
  attr: any;
  text: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
