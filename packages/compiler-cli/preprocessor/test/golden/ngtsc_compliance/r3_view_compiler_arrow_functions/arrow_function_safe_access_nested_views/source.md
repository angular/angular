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
    "arrow_function_safe_access_nested_views.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_safe_access_nested_views.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @if (true) {
      @if (true) {
        @if (true) {
          {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
        }
      }
    }
  `,
})
export class TestComp {
  componentProp: {a?: {b?: {c?: () => () => () => () => string}}} = {};
}
```
