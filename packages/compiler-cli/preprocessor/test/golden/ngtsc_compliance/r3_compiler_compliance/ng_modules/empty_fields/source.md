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
    "empty_fields.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /empty_fields.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({
  providers: [],
  declarations: [],
  imports: [],
})
export class FooModule {
}
```
