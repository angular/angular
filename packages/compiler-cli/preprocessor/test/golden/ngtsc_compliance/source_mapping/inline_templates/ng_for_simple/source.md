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
    "ng_for_simple.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_for_simple.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div *ngFor="let item of items; index as i; trackBy: trackByFn">{{ item }}</div>',
    standalone: false
})
export class TestCmp {
}
```
