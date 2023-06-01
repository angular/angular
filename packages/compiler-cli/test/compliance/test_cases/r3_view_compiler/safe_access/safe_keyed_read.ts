import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    <span>
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
    </span>
`
})
export class MyApp {
  species = null;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
