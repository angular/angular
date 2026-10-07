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
    "input_binding_complex.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_binding_complex.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div [title]="greeting + name"></div>',
    standalone: false
})
export class TestCmp {
  greeting: string = '';
  name: string = '';
}
```
