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
    "arrow_function_safe_access_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /arrow_function_safe_access_use_null.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
  `
})
export class TestComp {
  componentProp: {a?: {b?: {c?: () => () => () => () => string}}} = {};
}
```
