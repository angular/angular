import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `,
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
