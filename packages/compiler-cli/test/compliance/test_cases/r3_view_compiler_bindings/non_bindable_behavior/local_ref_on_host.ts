import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <b ngNonBindable #myRef id="my-id">
    <i>Hello {{ name }}!</i>
    </b>
    {{ myRef.id }}
  `,
    standalone: false
})
export class MyComponent {
  name = 'John Doe';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
