import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<div [id]="id"></div>',
    standalone: false
})
export class MyComponent {
  id = 'one';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
