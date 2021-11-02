import {Component, NgModule} from '@angular/core';

@Component({selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>'})
export class SimpleComponent {
}

@Component(
    {selector: 'my-app', template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>'})
export class MyApp {
}

@NgModule({declarations: [SimpleComponent, MyApp]})
export class MyModule {
}
