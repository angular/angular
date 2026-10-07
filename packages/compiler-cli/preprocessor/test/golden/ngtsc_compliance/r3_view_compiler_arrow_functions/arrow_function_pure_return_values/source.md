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
    "arrow_function_pure_return_values.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_pure_return_values.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{(a => ({foo: a, bar: componentProp}))(1).foo}}
  `
})
export class TestComp {
  componentProp = 0;
}
```
