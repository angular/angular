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
    "usefactory_with_deps.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /usefactory_with_deps.ts
```ts
import {Injectable, Optional} from '@angular/core';

class SomeDep {}
class MyAlternateService {
  constructor(dep: SomeDep, optional: SomeDep|null) {}
}

@Injectable({
  providedIn: 'root',
  useFactory: (dep: SomeDep, optional: SomeDep|null) => new MyAlternateService(dep, optional),
  deps: [SomeDep, [new Optional(), SomeDep]]
})
export class MyService {
}
```
