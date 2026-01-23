import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app', template: '<a [title]="title"></a>',
    standalone: false
})
export class MyComponent {
  title = 'Hello World';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
