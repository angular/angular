import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template:
      '<div xmlns:foo="http://someuri/foo" class="my-app" foo:bar="baz" title="Hello" foo:qux="quacks">Hello <b>World</b>!</div>'
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
