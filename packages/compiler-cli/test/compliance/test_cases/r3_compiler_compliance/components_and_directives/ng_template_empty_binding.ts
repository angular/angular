import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-app', template: '<ng-template [id]=""></ng-template>'})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
