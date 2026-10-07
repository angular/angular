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
    "interpolations_equal_arity.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /interpolations_equal_arity.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `<div
   style.color="a{{one}}b"
   style.border="a{{one}}b"
   style.transition="a{{one}}b"></div>`,
    standalone: false
})
export class MyComponent {
  one = '';
}
```
