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
    "arrow_function_inside_pure_value.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_inside_pure_value.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{[(a) => a + 1][0](1000)}}
    {{[(a) => a + 1 + componentProp][0](1000)}}
  `
})
export class TestComp {
  componentProp = 0;
}
```
