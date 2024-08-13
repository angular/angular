import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    {{ 1 + 2 }}
	{{ (1 % 2) + 3 / 4 * 5 }}
	{{ +1 }}
`
})
export class MyApp {
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
