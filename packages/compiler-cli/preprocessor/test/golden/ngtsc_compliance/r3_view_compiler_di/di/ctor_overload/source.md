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
    "ctor_overload.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ctor_overload.ts
```ts
import {Injectable, Optional} from '@angular/core';

class MyDependency {}
class MyOptionalDependency {}

@Injectable()
export class MyService {
  constructor(dep: MyDependency);
  constructor(dep: MyDependency, @Optional() optionalDep?: MyOptionalDependency) {}
}
```
