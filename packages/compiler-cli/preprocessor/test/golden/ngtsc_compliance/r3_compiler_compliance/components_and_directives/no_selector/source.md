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
    "no_selector.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_selector.ts
```ts
import {Directive} from '@angular/core';

@Directive()
export class AbstractDirective {
}
```
