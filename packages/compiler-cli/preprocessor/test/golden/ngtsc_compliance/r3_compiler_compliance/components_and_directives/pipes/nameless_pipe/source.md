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
    "nameless_pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nameless_pipe.ts
```ts
import {Pipe, PipeTransform} from '@angular/core';

// TODO(crisbeto): remove `null!` from the pipes when public API is updated.
@Pipe(null!)
export class PipeWithoutName implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
}
```
