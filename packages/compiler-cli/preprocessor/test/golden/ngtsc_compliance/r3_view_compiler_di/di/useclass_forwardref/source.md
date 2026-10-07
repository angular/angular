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
    "useclass_forwardref.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /useclass_forwardref.ts
```ts
import {forwardRef, Injectable} from '@angular/core';

@Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
abstract class SomeProvider {
}

@Injectable()
class SomeProviderImpl extends SomeProvider {
}
```
