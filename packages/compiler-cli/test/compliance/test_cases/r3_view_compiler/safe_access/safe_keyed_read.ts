import {Component, NgModule} from '@angular/core';

@Component({
  template: `
    <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
      Hello, {{ knownNames?.[0]?.[1] }}!
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
      You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
      You are an Orc: {{ speciesMap?.['key'] }}
    </span>
`
})
export class MyApp {
  unknownNames: string[]|null = null;
  knownNames: string[][] = [['Frodo', 'Bilbo']];
  species = null;
  keys = null;
  speciesMap: Record<string, string> = {key: 'unknown'};
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
