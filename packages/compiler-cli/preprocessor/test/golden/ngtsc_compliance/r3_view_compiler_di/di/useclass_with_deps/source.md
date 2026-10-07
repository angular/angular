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
    "useclass_with_deps.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /useclass_with_deps.ts
```ts
import {Injectable} from '@angular/core';

class SomeDep {}

@Injectable()
class MyAlternateService {
  constructor(dep: SomeDep) {}
}

@Injectable({providedIn: 'root', useClass: MyAlternateService, deps: [SomeDep]})
export class MyService {
}
```
