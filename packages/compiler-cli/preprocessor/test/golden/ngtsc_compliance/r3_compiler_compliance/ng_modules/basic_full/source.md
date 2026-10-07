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
    "basic_full.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_full.ts
```ts
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

@NgModule({id: 'BasicModuleId', schemas: [NO_ERRORS_SCHEMA]})
export class BasicModule {
}
```
