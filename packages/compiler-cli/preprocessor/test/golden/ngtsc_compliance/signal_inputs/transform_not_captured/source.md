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
    "transform_not_captured.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /transform_not_captured.ts
```ts
import {Directive, input} from '@angular/core';

function convertToBoolean(value: string|boolean) {
  return value === true || value !== '';
}

@Directive({
})
export class TestDir {
  name = input.required<boolean, string|boolean>({
    transform: convertToBoolean,
  });
}
```
