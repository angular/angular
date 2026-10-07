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
    "arrow_function_top_level_context.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_top_level_context.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `{{(param => param + value + 1)('param')}}`
})
export class TestComp {
  value = 0;
}
```
