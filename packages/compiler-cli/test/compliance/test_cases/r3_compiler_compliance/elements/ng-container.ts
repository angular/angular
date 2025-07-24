import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<ng-container><span>in a </span>container</ng-container>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
