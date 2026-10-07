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
    "model_directive_definition.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /model_directive_definition.ts
```ts
import {Directive, model} from '@angular/core';

@Directive({
})
export class TestDir {
  counter = model(0);
  name = model.required<string>();
}
```
