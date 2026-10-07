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
    "let_single_optimization.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_single_optimization.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let result = value * 2;
    {{value}}
  `,
})
export class MyApp {
  value = 0;
}
```
