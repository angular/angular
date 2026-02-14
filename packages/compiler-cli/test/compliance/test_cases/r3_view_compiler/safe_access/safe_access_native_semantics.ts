import {Component, NgModule} from '@angular/core';

@Component({
    template: `
  <span>Safe Property: {{ p?.a?.b }}</span>
  <span>Safe Keyed: {{ p?.['a']?.['b'] }}</span>
`,
    standalone: false
})
export class MyApp {
  p: any = null;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
