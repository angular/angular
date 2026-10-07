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
    "input_binding_simple.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_binding_simple.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div [title]="name"></div>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}
```
