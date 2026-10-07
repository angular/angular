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
    "generic_service.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /generic_service.ts
```ts
import {Service} from '@angular/core';

@Service()
export class MyService<T extends number, V = T> {
  getOne(): T {
    return null!;
  }

  getTwo(): V {
    return null!;
  }
}
```
