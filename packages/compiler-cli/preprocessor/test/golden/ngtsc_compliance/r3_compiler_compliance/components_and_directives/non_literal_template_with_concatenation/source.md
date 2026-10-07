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
    "non_literal_template_with_concatenation.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /non_literal_template_with_concatenation.ts
```ts
import {Component} from '@angular/core';

const greeting = 'Hello!';
const myTemplate = '<div *ngIf="show">' + greeting + '</div>';

@Component({
    selector: 'test-cmp', template: myTemplate,
    standalone: false
})
export class TestCmp {
}
```
