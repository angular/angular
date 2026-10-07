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
    "input_binding_class.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_binding_class.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div [class.initial]="isInitial">Message</div>',
    standalone: false
})
export class TestCmp {
  isInitial: boolean = true;
}
```
