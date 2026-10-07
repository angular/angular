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
    "let_optimization_child_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_optimization_child_view.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let one = value + 1;
    @let two = one + 1;
    @let three = two + 1;
    @let four = three + 1;
    {{value}}
    @if (true) {
      {{three}}
    }
  `,
})
export class MyApp {
  value = 0;
}
```
