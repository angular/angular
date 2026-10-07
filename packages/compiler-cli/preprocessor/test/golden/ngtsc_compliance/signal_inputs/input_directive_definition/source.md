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
    "input_directive_definition.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_directive_definition.ts
```ts
import {Directive, input} from '@angular/core';

@Directive({
})
export class TestDir {
  counter = input(0);
  name = input.required<string>();
}
```
