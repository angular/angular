import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<div (@mySelector.start)="false" (@mySelector.done)="false" [@mySelector]="0"></div>'
})
export class MyApp {
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
