import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
    selector: 'my-component',
    template: `<svg><g *for="let item of items"><circle></circle></g></svg>`,
    standalone: false
})
export class MyComponent {
  items = [{data: 42}, {data: 42}];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
