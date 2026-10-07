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
    "chain_multiple_property_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_property_bindings.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[title]': 'myTitle', '[tabindex]': '1', '[id]': 'myId' },
    standalone: false
})
export class MyDirective {
  myTitle = 'hello';
  myId = 'special-directive';
}
```
