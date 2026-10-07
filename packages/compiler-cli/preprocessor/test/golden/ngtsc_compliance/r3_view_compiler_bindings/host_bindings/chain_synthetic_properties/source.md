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
    "chain_synthetic_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_synthetic_properties.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[@expand]': 'expandedState', '[@fadeOut]': 'true', '[@shrink]': 'isSmall' },
    standalone: false
})
export class MyDirective {
  expandedState = 'collapsed';
  isSmall = true;
}
```
