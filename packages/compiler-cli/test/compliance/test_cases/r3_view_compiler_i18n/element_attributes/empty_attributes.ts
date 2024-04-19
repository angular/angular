import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div id="static" i18n-title="m|d" title></div>
`
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}