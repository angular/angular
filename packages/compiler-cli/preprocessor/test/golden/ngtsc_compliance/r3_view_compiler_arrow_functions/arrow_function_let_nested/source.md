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
    "arrow_function_let_nested.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_let_nested.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let a = 1;

    @if (true) {
      @let b = 2;

      @if (true) {
        @let c = 3;
        {{(() => a + b + c)()}}
      }
    }
  `
})
export class TestComp {}
```
