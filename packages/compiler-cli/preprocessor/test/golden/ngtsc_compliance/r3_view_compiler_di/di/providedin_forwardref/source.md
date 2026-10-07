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
    "providedin_forwardref.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /providedin_forwardref.ts
```ts
import {forwardRef, Injectable, NgModule} from '@angular/core';

@Injectable()
export class Dep {
}
@Injectable({providedIn: forwardRef(() => Mod)})
export class Service {
  constructor(dep: Dep) {}
}
@NgModule()
export class Mod {
}
```
