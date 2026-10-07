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
    "no_aot.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_aot.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({jit: true})
export class NoAotModule {
}
```
