import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>Hello {{ name }}</div>`,
    standalone: false
})
export class MyComponent {
  name = 'World';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
