import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>',
    standalone: false
})
export class SimpleComponent {
}

@Component(
    {
    selector: 'my-app', template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>',
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [SimpleComponent, MyApp]})
export class MyModule {
}
