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
    "nullish_coalescing_property.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nullish_coalescing_property.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div [title]="'Hello, ' + (firstName ?? 'Frodo') + '!'"></div>
    <span [title]="'Your last name is ' + (lastName ?? lastNameFallback ?? 'unknown')"></span>
  `,
    standalone: false
})
export class MyApp {
  firstName: string|null = null;
  lastName: string|null = null;
  lastNameFallback = 'Baggins';
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
