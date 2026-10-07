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
    "ng_for_templated.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_for_templated.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`,
    standalone: false
})
export class TestCmp {
}
```
