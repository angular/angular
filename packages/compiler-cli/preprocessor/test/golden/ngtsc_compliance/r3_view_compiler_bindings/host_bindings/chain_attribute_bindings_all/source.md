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
    "chain_attribute_bindings_all.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_attribute_bindings_all.ts
```ts
import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[attr.tabindex]': '1' },
    standalone: false
})
export class MyDirective {
  @HostBinding('attr.title') myTitle = 'hello';

  @HostBinding('attr.id') myId = 'special-directive';
}
```
