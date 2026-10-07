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
    "ng_if_templated.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_if_templated.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `
    <ng-template [ngIf]="showMessage()">
      <div>{{ name }}</div>
      <hr>
    </ng-template>`,
    standalone: false
})
export class TestCmp {
}
```
