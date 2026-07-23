import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<ng-container></ng-container>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
