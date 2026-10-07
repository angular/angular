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
    "nullish_coalescing_host.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nullish_coalescing_host.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    host: {
        '[attr.first-name]': `'Hello, ' + (firstName ?? 'Frodo') + '!'`,
        '(click)': `logLastName(lastName ?? lastNameFallback ?? 'unknown')`
    },
    template: ``,
    standalone: false
})
export class MyApp {
  firstName: string|null = null;
  lastName: string|null = null;
  lastNameFallback = 'Baggins';

  logLastName(name: string) {
    console.log(name);
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
