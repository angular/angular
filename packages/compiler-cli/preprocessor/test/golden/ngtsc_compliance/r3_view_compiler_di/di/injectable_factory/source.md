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
    "injectable_factory.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /injectable_factory.ts
```ts
import {Injectable} from '@angular/core';

class MyDependency {}

@Injectable()
export class MyService {
  constructor(dep: MyDependency) {}
}
```
