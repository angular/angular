import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-app', template: '<div @attr [@binding]="exp"></div>'})
export class MyApp {
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
