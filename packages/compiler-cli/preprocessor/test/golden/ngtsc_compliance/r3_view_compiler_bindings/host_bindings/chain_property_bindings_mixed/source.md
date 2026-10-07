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
    "chain_property_bindings_mixed.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_property_bindings_mixed.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[title]': '"my title"', '[attr.tabindex]': '1', '[id]': '"my-id"' },
    standalone: false
})
export class MyDirective {
}
```
