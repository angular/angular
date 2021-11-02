import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-app', template: '<div @attr [@binding]="exp"></div>'})
export class MyApp {
  exp!: any;
  any!: any;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
