# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "number_separator.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /number_separator.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div>Total: \${{ 1_000_000 * multiplier }}</div>
    <span>Remaining: \${{ 123_456.78_9 / 2 }}</span>
  `,
    standalone: false
})
export class MyApp {
  multiplier = 5;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
