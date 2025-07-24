import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <a title="Hello {{name}}"></a>`,
    standalone: false
})
export class MyComponent {
  name = 'World';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
