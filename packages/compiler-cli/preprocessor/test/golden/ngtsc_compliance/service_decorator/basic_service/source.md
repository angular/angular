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
    "basic_service.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_service.ts
```ts
import {Service} from '@angular/core';

@Service()
export class MyService {}
```
