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
    "useclass_without_deps.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /useclass_without_deps.ts
```ts
import {Injectable} from '@angular/core';

@Injectable()
class MyAlternateService {
}

@Injectable({providedIn: 'root', useClass: MyAlternateService})
export class MyService {
}
```
