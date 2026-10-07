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
    "arrow_function_this_access.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_this_access.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `{{((a, b) => a + this.a + b + this.b)(1, 3)}}`
})
export class TestComp {
  a = 2;
  b = 4;
}
```
