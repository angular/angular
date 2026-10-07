# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "safe_call_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /safe_call_use_null.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
      Hello, {{ person.getName?.() }}!
      You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
    </span>
`,
    standalone: false
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
```
