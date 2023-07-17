import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-component', template: '<input #user>Hello {{user.value}}!'})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
