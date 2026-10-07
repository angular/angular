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
    "not_provided_service.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /not_provided_service.ts
```ts
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class MyService {}
```
