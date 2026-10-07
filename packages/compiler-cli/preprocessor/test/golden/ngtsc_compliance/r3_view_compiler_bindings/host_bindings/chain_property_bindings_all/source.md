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
    "chain_property_bindings_all.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_property_bindings_all.ts
```ts
import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[tabindex]': '1' },
    standalone: false
})
export class MyDirective {
  @HostBinding('title') myTitle = 'hello';

  @HostBinding('id') myId = 'special-directive';
}
```
