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
    "directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /directive.ts
```ts
import {Directive} from '@angular/core';

@Directive({})
export class StandaloneDir {
}
```
