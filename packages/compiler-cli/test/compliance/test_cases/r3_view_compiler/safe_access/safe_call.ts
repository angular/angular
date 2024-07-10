import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
      Hello, {{ person.getName?.() }}!
      You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
    </span>
`
})
export class MyApp {
  person: {
    getName: () => string,
    getLastName?: () => string,
    getSpecies?: () => () => () => () => () => string,
  } = {getName: () => 'Bilbo'};
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
