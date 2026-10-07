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
    "arrow_function_host_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_host_binding.ts
```ts
import {Directive} from '@angular/core';

@Directive({
  host: {
    '[attr.no-context]': '((a, b) => a / b)(5, 10)',
    '[attr.with-context]': '((a, b) => a / b + componentProp)(6, 12)',
  }
})
export class TestDir {
  componentProp = 1;
}
```
