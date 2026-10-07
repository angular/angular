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
    "for_variables_expression.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_variables_expression.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`,
    standalone: false
})
export class MyApp {
  items = [];
}
```
