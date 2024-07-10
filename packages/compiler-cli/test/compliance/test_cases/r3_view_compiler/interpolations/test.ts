import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-app',
  template:
      ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} '
})
export class MyApp {
  list: any[] = [];
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}