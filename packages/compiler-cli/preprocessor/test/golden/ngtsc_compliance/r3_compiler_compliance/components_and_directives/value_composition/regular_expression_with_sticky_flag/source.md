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
    "regular_expression_with_sticky_flag.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /regular_expression_with_sticky_flag.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `{{/^hello/y.test(value)}}`,
})
export class TestComp {
  value = '123';
}
```
