# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "files": [
    "ng_if_simple.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_if_simple.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div *ngIf="showMessage()">{{ name }}</div>',
    standalone: false
})
export class TestCmp {
}
```
