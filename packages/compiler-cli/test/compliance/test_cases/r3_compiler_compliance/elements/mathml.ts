import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>'
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
