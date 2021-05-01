import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
      Hello, {{ knownNames?.[0]?.[1] }}!
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
    </span>
`
})
export class MyApp {
  unknownNames: string[]|null = null;
  knownNames: string[][] = [['Frodo', 'Bilbo']];
  species = null;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
