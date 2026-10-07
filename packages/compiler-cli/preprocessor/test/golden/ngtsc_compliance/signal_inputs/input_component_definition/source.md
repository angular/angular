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
    "input_component_definition.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_component_definition.ts
```ts
import {Component, input} from '@angular/core';

@Component({
  template: 'Works',
})
export class TestComp {
  counter = input(0);
  name = input.required<string>();
}
```
