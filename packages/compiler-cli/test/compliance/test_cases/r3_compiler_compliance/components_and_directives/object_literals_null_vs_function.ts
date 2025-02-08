import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `,
    standalone: false
})
export class MyApp {
  getFoo() {
    return 'foo!';
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
