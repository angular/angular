import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <span i18n class="myClass">Text #1</span>
  <span i18n style="padding: 10px;">Text #2</span>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}