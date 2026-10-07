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
    "service_with_factory.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /service_with_factory.ts
```ts
import {Service} from '@angular/core';

class Alternate {}

@Service({factory: () => new Alternate()})
export class MyService {}
```
