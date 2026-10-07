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
    "arrow_function_returning_arrow_function_no_context.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_returning_arrow_function_no_context.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `{{(a => b => c => d => a + b + c + d)(1)(2)(3)(4)}}`,
})
export class TestComp {}
```
