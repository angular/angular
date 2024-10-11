import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
    selector: 'my-component',
    template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`,
    standalone: false
})
export class MyComponent {
  items = [{name: 'one'}, {name: 'two'}];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
