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
    "non_literal_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /non_literal_template.ts
```ts
import {Component} from '@angular/core';

const myTemplate = `<div *ngIf="show">Hello</div>`;

@Component({
    selector: 'test-cmp', template: myTemplate,
    standalone: false
})
export class TestCmp {
}
```
