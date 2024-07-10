import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template:
      '<div class="my-app" title="Hello"><svg><circle cx="20" cy="30" r="50"/></svg><p>test</p></div>'
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
