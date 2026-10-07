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
    "regular_expression_without_global_flag.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /regular_expression_without_global_flag.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `{{/^hello/i.test(value)}}`,
})
export class TestComp {
  value = '123';
}
```
