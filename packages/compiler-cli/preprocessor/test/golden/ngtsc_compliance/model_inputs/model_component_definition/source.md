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
    "model_component_definition.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /model_component_definition.ts
```ts
import {Component, model} from '@angular/core';

@Component({
  template: 'Works',
})
export class TestComp {
  counter = model(0);
  name = model.required<string>();
}
```
