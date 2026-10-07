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
    "chain_attribute_bindings_mixed.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_attribute_bindings_mixed.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[attr.title]': '"my title"', '[tabindex]': '1', '[attr.id]': '"my-id"' },
    standalone: false
})
export class MyDirective {
}
```
