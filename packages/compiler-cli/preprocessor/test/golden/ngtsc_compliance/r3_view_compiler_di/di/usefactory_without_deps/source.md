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
    "usefactory_without_deps.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /usefactory_without_deps.ts
```ts
import {Injectable} from '@angular/core';

class MyAlternateService {}

function alternateFactory() {
  return new MyAlternateService();
}

@Injectable({providedIn: 'root', useFactory: alternateFactory})
export class MyService {
}
```
