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
    "chain_multiple_attribute_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_attribute_bindings.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[attr.title]': 'myTitle', '[attr.tabindex]': '1', '[attr.id]': 'myId' },
    standalone: false
})
export class MyDirective {
  myTitle = 'hello';
  myId = 'special-directive';
}
```
