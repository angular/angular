import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<div class="my-app" title="Hello">Hello <b>World</b>!</div>'
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
