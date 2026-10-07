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
    "interpolations_different_arity.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /interpolations_different_arity.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c"
    style.height="a{{one}}b{{two}}c{{three}}d"
    style.top="a{{one}}b{{two}}c{{three}}d"></div>`,
    standalone: false
})
export class MyComponent {
  one = '';
  two = '';
  three = '';
}
```
