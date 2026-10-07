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
    "arrow_function_loop_variables.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_loop_variables.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track $index; let outerEven = $even) {
      @for (subitem of item.subItems; track $index) {
        {{(() => outerEven || $even || $index)()}}
      }
    }
  `
})
export class TestComp {
  items = [
    {name: 'one', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'two', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'three', subItems: ['sub one', 'sub two', 'sub three']},
  ];
}
```
