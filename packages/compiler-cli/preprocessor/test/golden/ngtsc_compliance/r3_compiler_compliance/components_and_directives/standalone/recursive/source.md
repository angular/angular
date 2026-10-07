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
    "recursive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /recursive.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'recursive-cmp',
  // Simple recursion. Note: no `imports`.
  template: '<recursive-cmp></recursive-cmp>',
})
export class RecursiveComponent {
}
```
