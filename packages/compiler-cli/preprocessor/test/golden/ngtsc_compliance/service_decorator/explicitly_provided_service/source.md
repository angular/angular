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
    "explicitly_provided_service.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /explicitly_provided_service.ts
```ts
import {Service} from '@angular/core';

@Service({autoProvided: true})
export class MyService {}
```
